'use client'

import { useState, useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { createCheckoutSession, getPaymentStatus } from "@/api/subscriptions";
import { useSocket } from "@/hooks/useSocket";

function PaymentSection({ onBack, onPaymentComplete, renterPlan }) {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const { isConnected, on: socketOn, off: socketOff } = useSocket();
  const paymentCheckIntervalRef = useRef(null);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!renterPlan) {
      toast.error('Plan information not available');
      return;
    }

    try {
      setLoading(true);

      // Get current URL for redirects
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      // Create Stripe checkout session
      const result = await createCheckoutSession(
        renterPlan.planKey || 'basic',
        renterPlan.userType || 'renter',
        successUrl,
        cancelUrl
      );

      // Store session ID for status checking (in both state and localStorage)
      // This ensures we can check payment status when user returns from Stripe
      // even if the socket hasn't reconnected yet
      if (result?.sessionId) {
        setSessionId(result.sessionId);
        // Store in localStorage so we can check payment status when user returns
        if (typeof window !== 'undefined') {
          localStorage.setItem('pending_payment_session_id', result.sessionId);
          localStorage.setItem('pending_payment_timestamp', Date.now().toString());
        }
      }

      // Redirect to Stripe Checkout
      // NOTE: This will cause the socket to disconnect (transport close) - this is NORMAL
      // The socket will automatically reconnect when the user returns from Stripe
      if (result?.url) {
        window.location.href = result.url;
      } else if (result?.sessionId) {
        // Fallback: construct Stripe checkout URL
        window.location.href = `https://checkout.stripe.com/c/pay/${result.sessionId}`;
      } else {
        console.error('Checkout session response:', result);
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to initiate payment';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  // Listen for payment status updates via socket
  useEffect(() => {
    if (!isConnected || !socketOn) return;

    const handlePaymentUpdate = (data) => {
      if (data?.success && data?.data?.status === 'succeeded') {
        toast.success(data.data.message || 'Payment completed successfully!');
        if (onPaymentComplete) {
          onPaymentComplete(data.data);
        }
        // Clear interval if payment succeeded
        if (paymentCheckIntervalRef.current) {
          clearInterval(paymentCheckIntervalRef.current);
          paymentCheckIntervalRef.current = null;
        }
      } else if (!data?.success || data?.data?.status === 'failed') {
        toast.error(data.data?.error || data.data?.message || 'Payment failed');
      }
    };

    socketOn('payment_status_update', handlePaymentUpdate);

    return () => {
      if (socketOff) {
        socketOff('payment_status_update', handlePaymentUpdate);
      }
    };
  }, [isConnected, socketOn, socketOff, onPaymentComplete]);

  // Check for pending payment session when component mounts (user returns from Stripe)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if there's a pending payment session from localStorage
    const pendingSessionId = localStorage.getItem('pending_payment_session_id');
    const pendingTimestamp = localStorage.getItem('pending_payment_timestamp');
    
    if (pendingSessionId) {
      // Check if it's been less than 10 minutes (payment sessions expire)
      const timestamp = parseInt(pendingTimestamp || '0', 10);
      const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
      
      if (timestamp > tenMinutesAgo) {
        // Set session ID to trigger payment status checking
        setSessionId(pendingSessionId);
        console.log('Found pending payment session, checking status...');
      } else {
        // Session is too old, remove it
        localStorage.removeItem('pending_payment_session_id');
        localStorage.removeItem('pending_payment_timestamp');
      }
    }
  }, []);

  // Poll for payment status as fallback (when user returns from Stripe)
  useEffect(() => {
    if (!sessionId) return;

    // Check payment status every 3 seconds for up to 2 minutes
    let attempts = 0;
    const maxAttempts = 40; // 40 * 3 seconds = 2 minutes

    paymentCheckIntervalRef.current = setInterval(async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        clearInterval(paymentCheckIntervalRef.current);
        paymentCheckIntervalRef.current = null;
        return;
      }

      try {
        const payment = await getPaymentStatus(sessionId);
        
        if (payment?.status === 'succeeded') {
          toast.success('Payment completed successfully!');
          if (onPaymentComplete) {
            onPaymentComplete({ payment, status: 'succeeded' });
          }
          clearInterval(paymentCheckIntervalRef.current);
          paymentCheckIntervalRef.current = null;
          setSessionId(null);
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pending_payment_session_id');
            localStorage.removeItem('pending_payment_timestamp');
          }
        } else if (payment?.status === 'failed' || payment?.status === 'cancelled') {
          toast.error(payment?.status === 'cancelled' 
            ? 'Payment was cancelled. You can try again anytime.'
            : 'Payment failed. Please try again.');
          clearInterval(paymentCheckIntervalRef.current);
          paymentCheckIntervalRef.current = null;
          setSessionId(null);
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pending_payment_session_id');
            localStorage.removeItem('pending_payment_timestamp');
          }
        }
      } catch (error) {
        // Silently fail - payment might not be processed yet
        console.debug('Payment status check:', error.message);
      }
    }, 3000);

    return () => {
      if (paymentCheckIntervalRef.current) {
        clearInterval(paymentCheckIntervalRef.current);
        paymentCheckIntervalRef.current = null;
      }
    };
  }, [sessionId, onPaymentComplete]);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiArrowLeft className="text-lg" />
        <span className="font-medium">Back to Verification</span>
      </button>

      {/* Payment Form */}
      <div className="bg-white rounded-[20px] border border-lightGray p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary mb-2">
            Complete Payment
          </h2>
          <p className="text-darkGray">
            Complete your payment to proceed with verification
          </p>
        </div>

        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {/* Payment Summary */}
          <div className="p-4 bg-gray-50 rounded-lg border border-lightGray">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-darkGray">Plan:</p>
              <p className="text-base font-semibold text-secondary">
                {renterPlan?.name || 'Verification Plan'}
              </p>
            </div>
            {renterPlan?.description && (
              <p className="text-xs text-darkGray mb-2">{renterPlan.description}</p>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-lightGray">
              <p className="text-sm font-medium text-darkGray">Amount:</p>
              <p className="text-lg font-bold text-mainBlue">
                £{renterPlan?.monthlyPrice?.toFixed(2) || '0.00'}
              </p>
            </div>
            <p className="text-xs text-darkGray mt-2">
              {renterPlan?.userType === 'renter' ? 'One-time payment' : 'Monthly subscription'}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-[10px] font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !renterPlan}
              className="flex-1 px-6 py-3 bg-blueGradient text-white rounded-[10px] font-bold shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentSection;
