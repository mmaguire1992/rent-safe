'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { findRenterByEmail, createRentalHistory } from '@/api/rentalHistory';

function RentOutModal({ isOpen, onClose, propertyId, onSuccess }) {
  const [rentedFrom, setRentedFrom] = useState('');
  const [renterEmail, setRenterEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [renterDetails, setRenterDetails] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get today's date in YYYY-MM-DD format for date input
  const today = new Date().toISOString().split('T')[0];

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRentedFrom('');
      setRenterEmail('');
      setEmailError('');
      setRenterDetails(null);
      setIsSearching(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change - just update the value, no validation
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setRenterEmail(email);
    // Clear error and renter details when user starts typing
    if (emailError) {
      setEmailError('');
    }
    if (renterDetails) {
      setRenterDetails(null);
    }
  };

  // Handle Enter key press in email field
  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchRenter();
    }
  };

  // Fetch renter details when email is valid
  const handleSearchRenter = async () => {
    const email = renterEmail.trim();

    // Clear previous error
    setEmailError('');

    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setIsSearching(true);
      const renter = await findRenterByEmail(email);
      setRenterDetails(renter);
    } catch (error) {
      console.error('Error finding renter:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to find renter';
      
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        toast.error('No user found for the entered email');
      } else {
        toast.error(errorMessage);
      }
      setRenterDetails(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle save button click
  const handleSave = async () => {
    // Validate inputs
    if (!rentedFrom) {
      toast.error('Please select a rental start date');
      return;
    }

    if (!renterEmail.trim()) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!validateEmail(renterEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!renterDetails) {
      toast.error('Please search and verify the renter email first');
      return;
    }

    try {
      setIsSaving(true);
      
      // Convert date to ISO string format
      const rentedFromDate = new Date(rentedFrom).toISOString();

      await createRentalHistory({
        propertyId,
        renterEmail: renterEmail.trim(),
        rentedFrom: rentedFromDate,
      });

      toast.success('Rental history created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating rental history:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create rental history';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="md:text-xl text-base font-bold font-nunito text-secondary">
            Rent Out Property
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <FiX className="w-5 h-5 text-darkGray" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Date Field */}
          <div>
            <label className="block text-base font-semibold text-secondary mb-2">
              Rental Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={rentedFrom}
              onChange={(e) => setRentedFrom(e.target.value)}
              min={today}
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
            <p className="text-sm text-darkGray mt-1">
              Previous dates are disabled
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-base font-semibold text-secondary mb-2">
              Renter's Email Address <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={renterEmail}
                  onChange={handleEmailChange}
                  onKeyPress={handleEmailKeyPress}
                  placeholder="Enter renter's email address"
                  className={`w-full px-4 py-3 border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 ${
                    emailError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-lightGray focus:ring-blue-500'
                  }`}
                  disabled={isSaving || isSearching}
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>
              <button
                onClick={handleSearchRenter}
                disabled={isSaving || isSearching || !renterEmail.trim() || !!emailError}
                className="px-6 py-3 bg-blueGradient text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Renter Details */}
          {renterDetails && (
            <div className="bg-gray-50 border border-lightGray rounded-xl p-4">
              <h3 className="text-base font-semibold text-secondary mb-3">
                Renter Details
              </h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-sm font-semibold text-darkGray w-24">Name:</span>
                  <span className="text-sm text-secondary flex-1">
                    {renterDetails.firstName} {renterDetails.lastName || ''}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm font-semibold text-darkGray w-24">Email:</span>
                  <span className="text-sm text-secondary flex-1">
                    {renterDetails.email}
                  </span>
                </div>
                {renterDetails.phone && (
                  <div className="flex items-start">
                    <span className="text-sm font-semibold text-darkGray w-24">Phone:</span>
                    <span className="text-sm text-secondary flex-1">
                      {renterDetails.phone}
                    </span>
                  </div>
                )}
                {renterDetails.userInfo?.address && (
                  <div className="flex items-start">
                    <span className="text-sm font-semibold text-darkGray w-24">Address:</span>
                    <div className="text-sm text-secondary flex-1">
                      {renterDetails.userInfo.address.street && (
                        <div>{renterDetails.userInfo.address.street}</div>
                      )}
                      {(renterDetails.userInfo.address.city || renterDetails.userInfo.address.county || renterDetails.userInfo.address.postcode) && (
                        <div>
                          {[
                            renterDetails.userInfo.address.city,
                            renterDetails.userInfo.address.county,
                            renterDetails.userInfo.address.postcode
                          ].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {renterDetails.userInfo.address.country && (
                        <div>{renterDetails.userInfo.address.country}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-lightGray">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 text-darkGray bg-gray-100 rounded-[10px] font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !rentedFrom || !renterDetails}
              className="px-6 py-2 bg-blueGradient text-white rounded-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RentOutModal;
