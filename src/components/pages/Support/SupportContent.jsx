'use client'

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import FileUpload from "@/components/FileUpload";
import SupportSuccessModal from "@/components/adminDashboard/Support/SupportSuccessModal";
import { createSupportTicket, getSupportTicketById, uploadSupportTicketMedia, getMySupportTickets } from "@/api/supportTickets";
import { FiPlus, FiDownload, FiX } from "react-icons/fi";
import Pagination from "@/components/adminDashboard/common/Pagination";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";

function SupportContent({ showBreadcrumb = false, BreadcrumbComponent = null }) {
  const [showForm, setShowForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    notes: "",
    priority: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({
    subject: "",
    notes: "",
    priority: "",
    files: "",
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const countNonSpaceChars = (text) => (text || "").replace(/\s/g, "").length;

  useEffect(() => {
    setIsLoading(true);
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await getMySupportTickets({
        page: 1,
        limit: 1000, // Get all tickets, frontend will handle pagination
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      let ticketsData = [];
      
      if (response?.data?.tickets) {
        ticketsData = response.data.tickets;
      } else if (response?.tickets) {
        ticketsData = response.tickets;
      } else if (Array.isArray(response?.data)) {
        ticketsData = response.data;
      } else if (Array.isArray(response)) {
        ticketsData = response;
      }
      
      // Ensure media is an array for each ticket
      ticketsData = ticketsData.map(ticket => ({
        ...ticket,
        media: Array.isArray(ticket.media) ? ticket.media : []
      }));
      
      setTickets(ticketsData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = value;

    // Limit by non-space characters (spaces do not count towards the limit)
    if (name === 'subject') {
      if (countNonSpaceChars(processedValue) > 50) return;
    }
    if (name === 'notes') {
      if (countNonSpaceChars(processedValue) > 200) return;
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear inline error when user fixes the field
    if (name === 'subject') {
      if (processedValue.trim()) {
        setFieldErrors((prev) => ({ ...prev, subject: "" }));
      }
    }
    if (name === 'notes') {
      if (processedValue.trim()) {
        setFieldErrors((prev) => ({ ...prev, notes: "" }));
      }
    }
    if (name === 'priority') {
      if (processedValue) {
        setFieldErrors((prev) => ({ ...prev, priority: "" }));
      }
    }
  };

  const handleFilesChange = (files) => {
    // Validate file types and sizes - only images allowed
    const allowedImageMimes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    
    if (files && files.length > 0) {
      // Check file count
      if (files.length > 3) {
        setFieldErrors((prev) => ({ ...prev, files: "Maximum 3 files allowed" }));
        return;
      }
      
      // Validate each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size
        if (file.size > maxFileSize) {
          setFieldErrors((prev) => ({ ...prev, files: `${file.name} exceeds 10MB limit. Please select a smaller file.` }));
          return;
        }
        
        // Check file type - only images allowed
        const isValidType = allowedImageMimes.has(file.type.toLowerCase());
        
        if (!isValidType) {
          setFieldErrors((prev) => ({ ...prev, files: "Invalid file type. Only image/jpeg, image/jpg, image/png, image/gif, image/webp are allowed." }));
          return;
        }
      }
      
      // All validations passed
      setUploadedFiles(files);
      setFieldErrors((prev) => ({ ...prev, files: "" }));
    } else {
      setUploadedFiles([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Inline validation (avoid browser tooltips)
    const nextErrors = { subject: "", notes: "", priority: "", files: "" };
    if (countNonSpaceChars(formData.subject) === 0) nextErrors.subject = "Subject is required";
    if (countNonSpaceChars(formData.notes) === 0) nextErrors.notes = "Notes are required";
    if (countNonSpaceChars(formData.notes) > 200) nextErrors.notes = "Notes cannot exceed 200 characters";
    if (!formData.priority) nextErrors.priority = "Priority is required";
    // Required documents (matches UI asterisk)
    if (!uploadedFiles || uploadedFiles.length === 0) {
      nextErrors.files = "Please upload at least one document";
    }

    // Validate file types and sizes - only images allowed
    if (uploadedFiles && uploadedFiles.length > 0) {
      const allowedImageMimes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);
      const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
      
      // Check file count
      if (uploadedFiles.length > 3) {
        nextErrors.files = "Maximum 3 files allowed";
      }
      
      // Validate each file
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Check file size
        if (file.size > maxFileSize) {
          nextErrors.files = `${file.name} exceeds 10MB limit. Please select a smaller file.`;
          break;
        }
        
        // Check file type - only images allowed
        const isValidType = allowedImageMimes.has(file.type.toLowerCase());
        
        if (!isValidType) {
          nextErrors.files = "Invalid file type. Only image/jpeg, image/jpg, image/png, image/gif, image/webp are allowed.";
          break;
        }
      }
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const subject = formData.subject.trim();

      const ticketResponse = await createSupportTicket({
        subject: subject,
        description: formData.notes,
        priority: formData.priority
      });

      const ticketId = ticketResponse?.data?._id || ticketResponse?.data?.id || ticketResponse?._id || ticketResponse?.data?.ticket?._id;
      
      if (!ticketId) {
        throw new Error('Failed to create ticket');
      }

      if (uploadedFiles.length > 0) {
        try {
          await uploadSupportTicketMedia(ticketId, uploadedFiles);
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          // Ticket is created but attachments failed - don't show success modal
          const msg =
            uploadError.response?.data?.error ||
            uploadError.response?.data?.message ||
            uploadError.message ||
            'Failed to upload attachments. Please try again with image files (JPG, PNG, GIF, WEBP).';
          toast.error(msg);

          // Refresh list so user can see the created ticket
          setIsLoading(true);
          setShowForm(false);
          await loadTickets();
          return;
        }
      }

      setFormData({
        subject: "",
        notes: "",
        priority: "",
      });
      setUploadedFiles([]);
      setFieldErrors({ subject: "", notes: "", priority: "", files: "" });
      setIsLoading(true);
      setShowForm(false);

      await loadTickets();
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const filteredTickets = tickets.filter((ticket) => {
    if (dateFilter) {
      const ticketDate = new Date(ticket.createdAt || ticket.created_at);
      const filterDate = new Date(dateFilter);
      const ticketDateStr = ticketDate.toISOString().split('T')[0];
      const filterDateStr = filterDate.toISOString().split('T')[0];
      if (ticketDateStr !== filterDateStr) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const subjectMatch = (ticket.subject || '').toLowerCase().includes(query);
      const descriptionMatch = (ticket.description || '').toLowerCase().includes(query);
      if (!subjectMatch && !descriptionMatch) {
        return false;
      }
    }

    if (statusFilter) {
      if (ticket.status !== statusFilter) {
        return false;
      }
    }

    if (priorityFilter) {
      if (ticket.priority !== priorityFilter) {
        return false;
      }
    }

    return true;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const handleDownloadFile = async (mediaId, fileName) => {
    try {
      const response = await getSupportTicketById(mediaId);
      const ticketData = response?.data || response;
      
      if (ticketData?.media) {
        const media = Array.isArray(ticketData.media) 
          ? ticketData.media.find(m => m._id === mediaId || m.id === mediaId)
          : ticketData.media;
        
        if (media?.url) {
          window.open(media.url, '_blank');
        } else {
          toast.error('File URL not available');
        }
      } else {
        toast.error('File not found');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        {showBreadcrumb && BreadcrumbComponent && <BreadcrumbComponent />}

        <div className="block">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-nunito text-secondary">
              Create Support Ticket
            </h1>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ subject: "", notes: "", priority: "" });
                setUploadedFiles([]);
                setFieldErrors({ subject: "", notes: "", priority: "", files: "" });
                setIsSuccessModalOpen(false);
              }}
              className="px-4 py-2 text-secondary border border-lightGray rounded-[10px] hover:bg-gray-50 font-nunito"
            >
              Cancel
            </button>
          </div>
          <div className="bg-white rounded-[14px] border border-lightGray p-4">
            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold font-nunito text-secondary mb-4">
                  Add Details
                </h2>
                <div>
                  <label className="block text-base font-semibold text-secondary mb-1">
                    Subject<span className="text-errorColor">*</span> <span className="text-gray-500 text-sm">(Max 50 characters)</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 font-nunito ${
                      fieldErrors.subject ? 'border-errorColor' : 'border-lightGray'
                    }`}
                    placeholder="Enter subject (max 50 characters)"
                  />
                  {fieldErrors.subject && (
                    <p className="mt-1 text-sm text-errorColor">{fieldErrors.subject}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {countNonSpaceChars(formData.subject)}/50 characters
                  </p>
                </div>
                <div className="mt-4">
                  <label className="block text-base font-semibold text-secondary mb-1">
                    Priority<span className="text-errorColor">*</span>
                  </label>
                  <CustomDropdown
                    options={[
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                      { value: "urgent", label: "Urgent" },
                    ]}
                    value={formData.priority}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, priority: value }));
                      if (fieldErrors.priority) {
                        setFieldErrors(prev => ({ ...prev, priority: "" }));
                      }
                    }}
                    placeholder="Select priority"
                    error={!!fieldErrors.priority}
                  />
                  {fieldErrors.priority && (
                    <p className="mt-1 text-sm text-errorColor">{fieldErrors.priority}</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold font-nunito text-secondary mb-1">
                  Add Notes<span className="text-errorColor">*</span> <span className="text-gray-500 text-sm">(Max 200 characters)</span>
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="6"
                  className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 font-nunito resize-none ${
                    fieldErrors.notes ? 'border-errorColor' : 'border-lightGray'
                  }`}
                  placeholder="Enter your notes (max 200 characters)"
                />
                {fieldErrors.notes && (
                  <p className="mt-1 text-sm text-errorColor">{fieldErrors.notes}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {countNonSpaceChars(formData.notes)}/200 characters
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold font-nunito text-secondary mb-1">
                  Upload Documents<span className="text-errorColor">*</span>
                </h2>
                <p className="text-sm text-gray-500 mb-2">
                  Images only (JPG, PNG, GIF, WEBP). Max 3 files, 10MB each.
                </p>
                <FileUpload
                  label=""
                  acceptedTypes=".jpg,.jpeg,.png,.gif,.webp"
                  maxFiles={3}
                  onFilesChange={handleFilesChange}
                  uploadedFiles={uploadedFiles}
                />
                {fieldErrors.files && (
                  <p className="mt-1 text-sm text-errorColor">{fieldErrors.files}</p>
                )}
              </div>

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
    );
  }

  return (
    <div className="space-y-6">
      {showBreadcrumb && BreadcrumbComponent && <BreadcrumbComponent />}

      <div className="block">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-nunito text-secondary">
            Support
          </h1>
          <button
            onClick={() => {
              setIsSuccessModalOpen(false);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blueGradient text-white rounded-[10px] hover:opacity-90 transition-opacity font-bold font-nunito"
          >
            <FiPlus className="h-5 w-5" />
            Create New Support
          </button>
        </div>

        <div className="bg-white rounded-[14px] border border-lightGray p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">
                Search (Subject, Description)
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.replace(/^\s+/, ''))}
                placeholder="Search subject or description..."
                className="w-full px-3 py-2 text-sm border border-lightGray rounded-[8px] focus:outline-none focus:ring-0 font-nunito"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-secondary mb-3">
                Status
              </label>
              <CustomDropdown
                options={[
                  { value: "", label: "All Status" },
                  { value: "open", label: "Open" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "waiting_customer", label: "Waiting Customer" },
                  { value: "resolved", label: "Resolved" },
                  { value: "closed", label: "Closed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                placeholder="All Status"
                className="h-[40px]"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1 mt-2">
                Priority
              </label>
              <CustomDropdown
                options={[
                  { value: "", label: "All Priority" },
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value)}
                placeholder="All Priority"
                className="h-[40px]"
              />
            </div>
            
             <div>
               <label className="block text-xs font-semibold text-secondary mb-1 mt-2">
                 Created Date
               </label>
               <div className="relative">
                 <input
                   type="date"
                   value={dateFilter}
                   onChange={(e) => setDateFilter(e.target.value)}
                   max={new Date().toISOString().split('T')[0]}
                   className="w-full px-3 py-2 pr-8 text-sm border border-lightGray rounded-[8px] focus:outline-none focus:ring-0 font-nunito text-secondary"
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
                                  className="p-2 text-[#6B4EFF] rounded-lg cursor-pointer hover:bg-gray-100"
                                  title={`${media.name || 'document'}`}
                                  onClick={() => handleDownloadFile(media._id || media.id, media.name)}
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

      <SupportSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}

export default SupportContent;

