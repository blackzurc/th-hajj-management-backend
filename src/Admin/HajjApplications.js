// src/Admin/HajjApplications.js
import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const HajjApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [documents, setDocuments] = useState([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [earliestYearData, setEarliestYearData] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);

  //New state for check box selection
  const [reuploadBirthCert, setReuploadBirthCert] = useState(false);
  const [reuploadNationalId, setReuploadNationalId] = useState(false);

  // Filter and pagination states
  const [statusFilter, setStatusFilter] = useState("Registered");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "registration_date",
    direction: "asc",
  });

  const applicationsPerPage = 10;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/hajj-applications");
        const data = await response.json();
        if (data.success) {
          setApplications(data.applications);
          setFilteredApplications(data.applications);
        } else {
          setError(data.message || "Failed to fetch applications");
        }
      } catch (err) {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = applications;

    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter(app => app.status === statusFilter);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app =>
        app.full_name.toLowerCase().includes(term) ||
        app.ic_no.toLowerCase().includes(term) ||
        app.th_acc_no.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredApplications(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [applications, statusFilter, searchTerm, sortConfig]);

  // Pagination logic
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = filteredApplications.slice(
    indexOfFirstApplication,
    indexOfLastApplication
  );
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const fetchUserDocuments = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/user-documents/${userId}`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
        setShowDocumentsModal(true);
      } else {
        alert(data.message || "Failed to fetch user documents");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    }
  };

  const handleDecision = async () => {
    if (!selectedApplication || !decision) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/hajj-applications/${selectedApplication.registration_id}/decision`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision,
            reason: reason || null,
            reuploadBirthCert,  //New
            reuploadNationalId, //New
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setApplications(applications.map(app =>
          app.registration_id === selectedApplication.registration_id ?
          { ...app, status: decision } : app
        ));
        setSelectedApplication(null);
        setDecision("");
        setReason("");
        setReuploadBirthCert(false);   //New
        setReuploadNationalId(false);  //New
      } else {
        alert(data.message || "Failed to update application");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    }
  };

  const openDocumentsModal = (userId) => {
    fetchUserDocuments(userId);
  };

  const closeDocumentsModal = () => {
    setShowDocumentsModal(false);
    setDocuments([]);
  };

    // New function to handle setting selected application and initializing the reupload states
    const handleManageApplication = (application) => {
        setSelectedApplication(application);
        setReuploadBirthCert(application.birth_certificate_reupload_required || false);
        setReuploadNationalId(application.national_id_reupload_required || false);
    };


    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            );
        }

        return (
            <>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-800">Hajj Applications</h1>
                    <div className="flex space-x-4">
                        <div className="relative">
                            <select
                                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Registered">Registered</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Reupload">Reupload</option>
                                <option value="Awaiting Review">Awaiting Review</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search applicants..."
                                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded leading-tight focus:outline-none focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort("full_name")}
                                >
                                    <div className="flex items-center">
                                        User
                                        {sortConfig.key === "full_name" && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IC No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TH Account</th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort("registration_date")}
                                >
                                    <div className="flex items-center">
                                        Registration Date
                                        {sortConfig.key === "registration_date" && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentApplications.length > 0 ? (
                                currentApplications.map((application) => (
                                    <tr key={application.registration_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{application.full_name}</div>
                                                    <div className="text-sm text-gray-500">{application.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {application.ic_no}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {application.th_acc_no}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(application.registration_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${application.status === 'Registered' ? 'bg-blue-100 text-blue-800' :
                                                    application.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        application.status === 'Reupload' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                {application.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleManageApplication(application)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Manage
                                            </button>
                                            <button
                                                onClick={() => openDocumentsModal(application.user_id)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                View Docs
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No applications found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredApplications.length > applicationsPerPage && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstApplication + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastApplication, filteredApplications.length)}
                            </span>{' '}
                            of <span className="font-medium">{filteredApplications.length}</span> applications
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded-md ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`px-4 py-2 border rounded-md ${currentPage === number ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 border rounded-md ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Topbar */}
            <AdminTopbar />

            {/* Main Content */}
            <div className="ml-64 pt-16">
                <div className="container mx-auto px-4 py-8">
                    {renderContent()}
                </div>
            </div>

            {/* Decision Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Manage Application</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Decision
                            </label>
                            <select
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={decision}
                                onChange={(e) => setDecision(e.target.value)}
                                required
                            >
                                <option value="">Select decision</option>
                                <option value="Approved">Approve</option>
                                <option value="Rejected">Reject</option>
                                <option value="Reupload">Reupload</option>
                            </select>
                        </div>

                        {/* Show reupload options only when Reupload is selected */}
                        {decision === "Reupload" && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Documents to Reupload
                                    </label>
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id="reuploadBirthCert"
                                            className="mr-2"
                                            checked={reuploadBirthCert}
                                            onChange={(e) => setReuploadBirthCert(e.target.checked)}
                                        />
                                        <label htmlFor="reuploadBirthCert" className="text-gray-700">Birth Certificate</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="reuploadNationalId"
                                            className="mr-2"
                                            checked={reuploadNationalId}
                                            onChange={(e) => setReuploadNationalId(e.target.checked)}
                                        />
                                        <label htmlFor="reuploadNationalId" className="text-gray-700">National ID</label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Reason (optional)
                            </label>
                            <textarea
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                rows="3"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setSelectedApplication(null);
                                    setDecision("");
                                    setReason("");
                                    setReuploadBirthCert(false);       //New
                                    setReuploadNationalId(false);      //New
                                }}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDecision}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
                                disabled={!decision}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Documents Modal */}
            {showDocumentsModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">User Documents</h2>
                        {documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {documents.map((doc) => (
                                    <div key={doc.document_id} className="border rounded-lg p-4">
                                        <p className="font-semibold mb-2">{doc.document_type}</p>
                                        {doc.file_path ? (

                                            doc.file_path.toLowerCase().endsWith('.pdf') ? (
                                                <div className="flex flex-col items-center">
                                                    <a
                                                        href={`http://localhost:5000/${doc.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline mb-2"
                                                    >
                                                        View PDF Document
                                                    </a>
                                                    <embed
                                                        src={`http://localhost:5000/${doc.file_path}#toolbar=0&navpanes=0`}
                                                        type="application/pdf"
                                                        width="100%"
                                                        height="300px"
                                                        className="border"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={`http://localhost:5000/${doc.file_path}`}
                                                        alt={doc.document_type}
                                                        className="max-w-full h-64 object-contain"
                                                        onError={(e) => {
                                                            const container = e.target.parentElement;
                                                            if (container) {
                                                                container.innerHTML =
                                                                    `<p class="text-red-500">Failed to load image. <a href="http://localhost:5000/${doc.file_path}" target="_blank" class="text-blue-600 hover:underline">Try opening directly</a></p>`;
                                                            }
                                                        }}
                                                    />
                                                    <p className="text-sm text-gray-500 mt-2 text-center">{doc.file_name}</p>
                                                </div>
                                            )

                                        ) : (
                                            <p className="text-red-500">No file available</p>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                        ) : (
                            <p>No documents found for this user.</p>
                        )
                        }
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={closeDocumentsModal}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
                )}
        </div >
    );
};

export default HajjApplications;