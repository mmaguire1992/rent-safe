'use client'

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import FileUpload from "@/components/FileUpload";
import SupportSuccessModal from "@/components/adminDashboard/Support/SupportSuccessModal";
import { createSupportTicket, getSupportTicketById, uploadSupportTicketMedia } from "@/api/supportTickets";
import { FiPlus, FiDownload, FiX } from "react-icons/fi";
import Pagination from "@/components/adminDashboard/common/Pagination";

function Support() {
  const [showForm, setShowForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading immediately
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    notes: "",
    priority: "medium", // Priority: low, medium, high, urgent
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState(""); // For subject and description
  const [statusFilter, setStatusFilter] = useState(""); // For status dropdown
  const [priorityFilter, setPriorityFilter] = useState(""); // For priority dropdown
  const [dateFilter, setDateFilter] = useState("");

  // Load tickets: Since backend doesn't have a user-specific list endpoint,
  // we store ticket IDs in localStorage when created, then fetch each ticket individually
  useEffect(() => {
    // Set loading immediately when component mounts
    setIsLoading(true);
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      // Get ticket IDs from localStorage (stored when tickets are created)
      const ticketIds = JSON.parse(localStorage.getItem('supportTicketIds') || '[]');
      const ticketsData = [];
      
      // Fetch each ticket individually using GET /api/support-tickets/:id
      // The backend response includes the 'media' array with all uploaded files
      for (const ticketId of ticketIds) {
        try {
          const response = await getSupportTicketById(ticketId);
          let ticketData = null;
          
          if (response?.data) {
            ticketData = response.data;
          } else if (response?._id || response?.id) {
            ticketData = response;
          } else if (response?.ticket) {
            ticketData = response.ticket;
          }
          
          // Ensure media array exists (backend should include it, but ensure it's an array)
          if (ticketData) {
            if (!ticketData.media || !Array.isArray(ticketData.media)) {
              ticketData.media = [];
            }
            ticketsData.push(ticketData);
          }
        } catch (error) {
          console.error(`Error loading ticket ${ticketId}:`, error);
          // Remove invalid ticket ID from localStorage
          const updatedIds = ticketIds.filter(id => id !== ticketId);
          localStorage.setItem('supportTicketIds', JSON.stringify(updatedIds));
        }
      }
      
      // Sort by createdAt descending
      ticketsData.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      setTickets(ticketsData);
      setCurrentPage(1); // Reset to first page when tickets are loaded
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Limit subject to 50 characters
    if (name === 'subject' && value.length > 50) {
      return;
    }
    // Limit description/notes to 200 characters
    if (name === 'notes' && value.length > 200) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!formData.notes.trim()) {
      toast.error('Please enter your notes');
      return;
    }

    if (formData.notes.length > 200) {
      toast.error('Description cannot exceed 200 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Limit subject to 50 characters
      const subject = formData.subject.trim().substring(0, 50);

      // Create ticket with user-selected priority
      const ticketResponse = await createSupportTicket({
        subject: subject,
        description: formData.notes,
        priority: formData.priority || 'medium' // Use selected priority or default to medium
      });

      const ticketId = ticketResponse?.data?._id || ticketResponse?.data?.id || ticketResponse?._id || ticketResponse?.data?.ticket?._id;
      
      if (!ticketId) {
        throw new Error('Failed to create ticket');
      }

      // Upload files if any
      if (uploadedFiles.length > 0) {
        try {
          await uploadSupportTicketMedia(ticketId, uploadedFiles);
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          // Continue even if file upload fails
        }
      }

      // Save ticket ID to localStorage
      const ticketIds = JSON.parse(localStorage.getItem('supportTicketIds') || '[]');
      if (!ticketIds.includes(ticketId)) {
        ticketIds.push(ticketId);
        localStorage.setItem('supportTicketIds', JSON.stringify(ticketIds));
      }

      // Reset form
      setFormData({
        subject: "",
        notes: "",
        priority: "medium",
      });
      setUploadedFiles([]);
      setIsLoading(true);
      setShowForm(false);

      // Reload tickets
      await loadTickets();
      // Show success modal on listing page (not on form page)
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Priority Management:
  // - Priority is set by USER when creating the ticket (low, medium, high, urgent)
  // - Users can SELECT priority in the form dropdown
  // - Priority is sent to backend when creating ticket
  // - Admin can view priority but users set it initially
  // - Possible priorities: low, medium, high, urgent (default: medium)

  // Status Management: 
  // - Status is managed by admin only (via PATCH /api/support-tickets/:id/status)
  // - Users can only VIEW the status, not change it
  // - Status comes from backend when fetching ticket data
  // - Possible statuses: open, in_progress, waiting_customer, resolved, closed, cancelled
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { label: 'Open', class: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'In Progress', class: 'bg-yellow-100 text-yellow-800' },
      waiting_customer: { label: 'Waiting', class: 'bg-orange-100 text-orange-800' },
      resolved: { label: 'Resolved', class: 'bg-green-100 text-green-800' },
      closed: { label: 'Closed', class: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const truncateSubject = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filter tickets based on search query, status, priority, and date
  const filteredTickets = tickets.filter((ticket) => {
    // Date filter - filter by createdAt date
    if (dateFilter) {
      const ticketDate = new Date(ticket.createdAt || ticket.created_at);
      const filterDate = new Date(dateFilter);
      const ticketDateStr = ticketDate.toISOString().split('T')[0];
      const filterDateStr = filterDate.toISOString().split('T')[0];
      if (ticketDateStr !== filterDateStr) {
        return false;
      }
    }

    // Search filter - search in subject and description only
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const subjectMatch = (ticket.subject || '').toLowerCase().includes(query);
      const descriptionMatch = (ticket.description || '').toLowerCase().includes(query);
      
      if (!subjectMatch && !descriptionMatch) {
        return false;
      }
    }

    // Status filter
    if (statusFilter) {
      if (ticket.status !== statusFilter) {
        return false;
      }
    }

    // Priority filter
    if (priorityFilter) {
      if (ticket.priority !== priorityFilter) {
        return false;
      }
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, dateFilter]);

  // Reset modal state when form is shown (to prevent modal from appearing when navigating back to form)
  useEffect(() => {
    if (showForm) {
      setIsSuccessModalOpen(false);
    }
  }, [showForm]);

  const handleDownloadMedia = async (mediaUrl, fileName) => {
    try {
      const loadingToast = toast.loading('Downloading file...');
      
      // Use XMLHttpRequest for better CORS handling with S3
      const xhr = new XMLHttpRequest();
      xhr.open('GET', mediaUrl, true);
      xhr.responseType = 'blob';
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName || 'document';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          toast.dismiss(loadingToast);
          toast.success('File downloaded successfully');
        } else {
          toast.dismiss(loadingToast);
          toast.error('Failed to download file. Please try again.');
        }
      };
      
      xhr.onerror = function() {
        toast.dismiss(loadingToast);
        toast.error('Failed to download file. Please try again.');
      };
      
      xhr.send();
      
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.dismiss();
      toast.error('Failed to download file. Please try again.');
    }
  };

  if (showForm) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumb />

          <div className="block">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold font-nunito text-secondary">
                Create Support Ticket
              </h1>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ subject: "", notes: "", priority: "medium" });
                  setUploadedFiles([]);
                  setIsSuccessModalOpen(false); // Reset modal state when canceling
                }}
                className="px-4 py-2 text-secondary border border-lightGray rounded-[10px] hover:bg-gray-50 font-nunito"
              >
                Cancel
              </button>
            </div>
            <div className="bg-white rounded-[14px] border border-lightGray p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Add Details Section */}
                <div>
                  <h2 className="text-xl font-semibold font-nunito text-secondary mb-4">
                    Add Details
                  </h2>
                  <div>
                    <label className="block text-base font-semibold text-secondary mb-1">
                      Subject <span className="text-gray-500 text-sm">(Max 50 characters)</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      maxLength={50}
                      className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 font-nunito"
                      placeholder="Enter subject (max 50 characters)"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.subject.length}/50 characters
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="block text-base font-semibold text-secondary mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 font-nunito bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Add Notes Section */}
                <div>
                  <h2 className="text-base font-semibold font-nunito text-secondary mb-1">
                    Add Notes <span className="text-gray-500 text-sm">(Max 200 characters)</span>
                  </h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="6"
                    maxLength={200}
                    className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 font-nunito resize-none"
                    placeholder="Enter your notes (max 200 characters)"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.notes.length}/200 characters
                  </p>
                </div>

                {/* Upload Documents Section */}
                <div>
                  <h2 className="text-base font-semibold font-nunito text-secondary mb-1">
                    Upload Documents
                  </h2>
                  <FileUpload
                    label=""
                    acceptedTypes=".pdf,.docx,.png"
                    maxFiles={3}
                    onFilesChange={setUploadedFiles}
                    uploadedFiles={uploadedFiles}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blueGradient text-white rounded-[10px] text-base hover:opacity-90 transition-opacity font-bold font-nunito disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb />

        <div className="block">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-nunito text-secondary">
              Support
            </h1>
            <button
              onClick={() => {
                setIsSuccessModalOpen(false); // Reset modal state when opening form
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blueGradient text-white rounded-[10px] hover:opacity-90 transition-opacity font-bold font-nunito"
            >
              <FiPlus className="h-5 w-5" />
              Create New Support
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-[14px] border border-lightGray p-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search Filter - Subject and Description */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Search (Subject, Description)
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject or description..."
                  className="w-full px-3 py-2 text-sm border border-lightGray rounded-[8px] focus:outline-none focus:ring-0 font-nunito"
                />
              </div>
              
              {/* Status Filter - Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-lightGray rounded-[8px] focus:outline-none focus:ring-0 font-nunito bg-white"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_customer">Waiting Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Priority Filter - Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-lightGray rounded-[8px] focus:outline-none focus:ring-0 font-nunito bg-white"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              {/* Date Filter with Clear Icon */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Created Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 pr-8 text-sm border border-lightGray rounded-[8px] focus:outline-none focus:ring-0 font-nunito"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clear date filter"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Clear All Filters */}
            {(searchQuery || statusFilter || priorityFilter || dateFilter) && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("");
                    setPriorityFilter("");
                    setDateFilter("");
                  }}
                  className="text-xs text-[#6B4EFF] hover:underline font-nunito"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[14px] border border-lightGray overflow-hidden">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
                <p className="mt-4 text-darkGray text-base">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-darkGray text-base">
                {tickets.length === 0 
                  ? 'No support tickets found. Click "Create New Support" to create your first ticket.'
                  : 'No tickets match your filters. Try adjusting your search or date filter.'
                }
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-lightGray bg-gray-50">
                        <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                          S.No
                        </th>
                        <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                          Description
                        </th>
                        <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                          Priority
                        </th>
                        <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                          Created Date
                        </th>
                        <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                          Documents
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTickets.map((ticket, index) => (
                        <tr key={ticket._id || ticket.id} className="border-b border-lightGray hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-darkGray text-sm font-medium">
                            {startIndex + index + 1}
                          </td>
                        <td className="py-3 px-4 text-darkGray text-sm font-medium">
                          <div 
                            className="max-w-xs cursor-help" 
                            title={ticket.subject || 'N/A'}
                          >
                            {truncateSubject(ticket.subject, 50)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-darkGray text-sm">
                          <div 
                            className="max-w-md cursor-help" 
                            title={ticket.description || 'N/A'}
                          >
                            <span className="line-clamp-2">
                              {truncateDescription(ticket.description, 100)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="py-3 px-4 text-darkGray text-sm capitalize">
                          {ticket.priority || 'medium'}
                        </td>
                        <td className="py-3 px-4 text-darkGray text-sm">
                          {formatDate(ticket.createdAt || ticket.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          {ticket.media && ticket.media.length > 0 ? (
                            <div className="flex items-center gap-2">
                              {ticket.media.map((media, mediaIndex) => (
                                <div
                                  key={media._id || mediaIndex}
                                  className="p-2 text-[#6B4EFF] rounded-lg"
                                  title={`${media.name || 'document'}`}
                                >
                                  <FiDownload className="h-5 w-5" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No documents</span>
                          )}
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-lightGray">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredTickets.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      itemName="tickets"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal - Only show on listing page after ticket creation */}
      <SupportSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </DashboardLayout>
  );
}

export default Support;
