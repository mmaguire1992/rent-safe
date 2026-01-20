'use client'

import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import { dateOptions } from "@/constant";
import ButtonDropdown from "@/components/adminDashboard/common/buttonDropdown";
import { downloadInvoice } from "@/api/subscriptions";

// Payment status options
const paymentStatusOptions = [
  { value: "all", label: "All Status" },
  { value: "succeeded", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

function BillingHistory({ billingHistory, dateFilter, setDateFilter, statusFilter, setStatusFilter, loading }) {
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const handleDownloadInvoice = async (payment) => {
    toast.success('Upcoming feature');
    // const paymentId = payment._id || payment.id;
    // if (!paymentId) {
    //   toast.error('Payment ID not found');
    //   return;
    // }

    // // Check if already downloading
    // if (downloadingIds.has(paymentId)) {
    //   return;
    // }

    // try {
    //   setDownloadingIds(prev => new Set(prev).add(paymentId));
    //   await downloadInvoice(paymentId);
    //   toast.success('Invoice downloaded successfully');
    // } catch (error) {
    //   console.error('Error downloading invoice:', error);
    //   const errorMessage = error.response?.data?.message || 
    //                       error.response?.data?.error || 
    //                       error.message || 
    //                       'Failed to download invoice. Please try again.';
    //   toast.error(errorMessage);
    // } finally {
    //   setDownloadingIds(prev => {
    //     const newSet = new Set(prev);
    //     newSet.delete(paymentId);
    //     return newSet;
    //   });
    // }
  };
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "succeeded":
      case "success":
        return "bg-[#DFFFE6] text-[#00893A]";
      case "failed":
        return "bg-[#FFEAEA] text-[#D24343]";
      case "pending":
      case "processing":
        return "bg-[#FFF5CC] text-[#D19600]";
      case "cancelled":
      case "refunded":
        return "bg-[#E6E8EC] text-[#5A5E67]";
      default:
        return "bg-[#E6E8EC] text-[#5A5E67]";
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    const statusMap = {
      'succeeded': 'Success',
      'failed': 'Failed',
      'pending': 'Pending',
      'processing': 'Processing',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount, currency = 'GBP') => {
    if (amount === undefined || amount === null) return 'N/A';
    const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '';
    return `${currencySymbol}${parseFloat(amount).toFixed(2)}`;
  };

  const getDescription = (payment) => {
    if (payment.paymentType === 'plan_payment') {
      const planKey = payment.metadata?.planKey || 'Plan';
      return `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan - One-time Payment`;
    } else if (payment.paymentType === 'verification_fee') {
      return 'Verification Fee';
    } else if (payment.paymentType === 'subscription') {
      return 'Subscription Payment';
    }
    return payment.paymentType || 'Payment';
  };

  const getDateDisplayText = (value) => {
    if (!value || value === "") return "Date";
    const option = dateOptions.find((opt) => opt.value === value);
    return option ? option.label : "Date";
  };

  const getStatusDisplayText = (value) => {
    if (!value || value === "all") return "Status";
    const option = paymentStatusOptions.find((opt) => opt.value === value);
    return option ? option.label : "Status";
  };

  const handleExportCSV = () => {
    if (!billingHistory || billingHistory.length === 0) {
      toast.error('No payment history to export');
      return;
    }

    try {
      // Define CSV headers
      const headers = [
        'Date',
        'Description',
        'Payment Type',
        'Amount',
        'Currency',
        'Status',
        'Payment ID',
        'Created At',
        'Paid At'
      ];

      // Convert billing history to CSV rows
      const csvRows = billingHistory.map((item) => {
        const date = formatDate(item.createdAt || item.paidAt || item.date);
        const description = getDescription(item);
        const paymentType = item.paymentType || '';
        const amount = item.amount || 0;
        const currency = item.currency || 'GBP';
        const status = formatStatus(item.status);
        const paymentId = item._id || item.id || '';
        const createdAt = item.createdAt ? new Date(item.createdAt).toISOString() : '';
        const paidAt = item.paidAt ? new Date(item.paidAt).toISOString() : '';

        // Escape quotes and wrap in quotes for CSV
        const escapeCSV = (value) => {
          if (value === null || value === undefined) return '""';
          const stringValue = String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        };

        return [
          escapeCSV(date),
          escapeCSV(description),
          escapeCSV(paymentType),
          amount,
          escapeCSV(currency),
          escapeCSV(status),
          escapeCSV(paymentId),
          escapeCSV(createdAt),
          escapeCSV(paidAt)
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Generate filename with current date
      const filename = `billing_history_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success('Billing history exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export billing history');
    }
  };

  const hasData = billingHistory && billingHistory.length > 0;

  return (
    <div className="block">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="lg:text-2xl text-xl font-bold font-nunito text-secondary mb-0">
          Billing History
        </h2>
        <div className="flex gap-3">
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <ButtonDropdown
              options={dateOptions}
              value={dateFilter}
              onChange={setDateFilter}
              placeholder={getDateDisplayText(dateFilter)}
              className="h-[40px]"
              showFilterIcon={true}
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <ButtonDropdown
              options={paymentStatusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={getStatusDisplayText(statusFilter)}
              className="h-[40px]"
              showFilterIcon={true}
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-[#4A2FCC] h-[38px] text-[#4A2FCC] px-3 md:px-6 py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-2 md:gap-3 text-sm md:text-base"
            title="Export to CSV"
          >
            <span className="hidden sm:inline">Export</span>
            <FiDownload className="text-sm md:text-base" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 border border-lightGray rounded-[20px]">
          <p className="text-darkGray font-nunito">Loading payment history...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border border-lightGray rounded-[20px] overflow-x-auto overflow-y-visible">
            <div className="min-w-[800px]">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-lightGray">
                    <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hasData ? (
                    billingHistory.map((item, index) => (
                      <tr
                        key={item._id || item.id || index}
                        className="border-b border-lightGray hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-nunito text-secondary text-base">
                          <span className="text-midGray text-base mr-2">
                            {index + 1}.
                          </span>
                          <span className="text-secondary text-base font-nunito font-bold">
                            {formatDate(item.createdAt || item.paidAt || item.date)}
                          </span>
                        </td>
                        <td className="text-secondary py-4 px-4 text-base font-nunito font-normal">
                          {getDescription(item)}
                        </td>
                        <td className="font-bold py-4 px-4 text-secondary text-base font-nunito">
                          {formatAmount(item.amount, item.currency)}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-nunito ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleDownloadInvoice(item)}
                            disabled={downloadingIds.has(item._id || item.id)}
                            className="p-2 hover:bg-gray-100 text-[#4A2FCC] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download Invoice"
                          >
                            <FiDownload className={`text-sm md:text-base text-[#4A2FCC] ${downloadingIds.has(item._id || item.id) ? 'animate-pulse' : ''}`} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 px-4 text-center">
                        <p className="text-darkGray font-nunito">No payment history found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 border border-lightGray rounded-[20px]">
            {hasData ? (
              billingHistory.map((item, index) => (
                <div
                  key={item._id || item.id || index}
                  className="bg-white rounded-t-[20px] rounded-tr-[20px] last-of-type:rounded-b-[20px] last-of-type:rounded-br-[20px] last-of-type:border-b-0 border-b border-lightGray"
                >
                  <div className="p-4">
                    <div className="flex items-end justify-between mb-2">
                      <div className="block">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-midGray text-sm font-nunito">
                            #{index + 1}
                          </span>
                          <span className="text-secondary text-base font-nunito font-bold">
                            {formatDate(item.createdAt || item.paidAt || item.date)}
                          </span>
                        </div>
                        <div className="mb-2">
                          <p className="text-secondary text-sm font-nunito font-normal">
                            {getDescription(item)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadInvoice(item)}
                        disabled={downloadingIds.has(item._id || item.id)}
                        className="p-2 hover:bg-gray-100 text-[#4A2FCC] rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download Invoice"
                      >
                        <FiDownload className={`text-base text-[#4A2FCC] ${downloadingIds.has(item._id || item.id) ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-start gap-2">
                      <span className="font-bold text-secondary text-base font-nunito">
                        {formatAmount(item.amount, item.currency)}
                      </span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-nunito ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-darkGray font-nunito">No payment history found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BillingHistory;
