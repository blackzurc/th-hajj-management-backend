import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import UserDocumentsModal from './UserDocumentsModal';

const AdminViewAppeals = () => {
    const [appeals, setAppeals] = useState([]);
    const [filteredAppeals, setFilteredAppeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [decision, setDecision] = useState('');
    const [justification, setJustification] = useState('');
    const [HajjYear, setHajjYear] = useState('');
    const [appealTypeFilter, setAppealTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'submitted_date', direction: 'asc' });
    const [relatedUserInfo, setRelatedUserInfo] = useState(null);
    const [allQuotaData, setAllQuotaData] = useState([]);
    const [applicantInfo, setApplicantInfo] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const appealsPerPage = 10;
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [user_id, setUserID] = useState('')
    const [openEditYearModel, setopenEditYearModel] = useState(false)
    const [offer_id, setoffer_id] = useState('')

    // Moved fetchAppeals outside useEffect to make it accessible in other functions
    const fetchAppeals = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/admin/hajj-appeals');
            const data = await response.json();
            if (data.success) {
                setAppeals(data.appeals);
            } else {
                setError(data.message || 'Failed to fetch appeals');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppeals();
    }, []);

    useEffect(() => {
        let result = appeals;

        if (appealTypeFilter !== 'All') {
            result = result.filter(appeal => appeal.appeal_type === appealTypeFilter);
        }

        if (statusFilter !== 'All') {
            result = result.filter(appeal => appeal.status === statusFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(appeal =>
                appeal.full_name.toLowerCase().includes(term) ||
                appeal.ic_no.toLowerCase().includes(term) ||
                appeal.th_acc_no.toLowerCase().includes(term)
            );
        }

        result = [...result].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setFilteredAppeals(result);
        setCurrentPage(1);
    }, [appeals, appealTypeFilter, statusFilter, searchTerm, sortConfig]);

    const indexOfLastAppeal = currentPage * appealsPerPage;
    const indexOfFirstAppeal = indexOfLastAppeal - appealsPerPage;
    const currentAppeals = filteredAppeals.slice(indexOfFirstAppeal, indexOfLastAppeal);
    const totalPages = Math.ceil(filteredAppeals.length / appealsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDecisionSubmit = async () => {
        if (!selectedAppeal || !decision) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/hajj-appeals/${selectedAppeal.appeal_id}/decision`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        decision,
                        justification: justification || null,
                        related_user_id: selectedAppeal.related_user_id,
                        user_id:selectedAppeal.user_id,
                    }),
                }
            );

            const data = await response.json();
            if (data.success) {
                setAppeals(appeals.map(appeal =>
                    appeal.appeal_id === selectedAppeal.appeal_id ? { ...appeal, status: decision } : appeal
                ));
                setSelectedAppeal(null);
                setDecision('');
                setJustification('');
            } else {
                alert(data.message || 'Failed to update appeal status');
            }
        } catch (err) {
            alert('Server error. Please try again later.');
        }
    };

    // Corrected handlehajjYearChangeSubmit function
    const handlehajjYearChangeSubmit = async () => {
        let offerIdToModify, targetYear, personBeingMoved, targetPersonName;

        if (selectedAppeal?.appeal_type === 'Mahram') {
            // For Mahram appeals: Move the RELATED USER (mahram) to join the APPELLANT (anchor)
            // Appellant = anchor person, their year is the target.
            // Related user = person to be moved.
            offerIdToModify = relatedUserInfo?.offer_id;  // The Mahram's offer
            targetYear = applicantInfo?.hajj_year;        // The Appellant's year is the target
            personBeingMoved = relatedUserInfo?.full_name;
            targetPersonName = applicantInfo?.full_name;
            
            console.log(`Mahram Appeal: Moving ${personBeingMoved} (offer_id: ${offerIdToModify}) to year ${targetYear} to join ${targetPersonName}`);
            
        } else {
            // For Sick/Old appeals: Move the APPELLANT to an earlier year
            offerIdToModify = applicantInfo?.offer_id;    // Appellant's offer
            targetYear = HajjYear;                        // Earlier available year calculated by useEffect
            personBeingMoved = applicantInfo?.full_name;
            
            console.log(`${selectedAppeal.appeal_type} Appeal: Moving ${personBeingMoved} (offer_id: ${offerIdToModify}) to earlier year ${targetYear}`);
        }

        // Validation checks
        if (!offerIdToModify) {
            alert(`No valid Hajj offer found for ${personBeingMoved}. Cannot proceed.`);
            return;
        }
        
        if (!targetYear) {
            alert("A valid target Hajj year could not be determined.");
            return;
        }

        try {
            const apiEndpoint = `http://localhost:5000/api/admin/hajj-offers/${offerIdToModify}/transferyear`;
            
            const payload = { 
                new_hajj_year: targetYear,
            };

            console.log('API Call:', { endpoint: apiEndpoint, payload });

            const response = await fetch(apiEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                const successMessage = selectedAppeal?.appeal_type === 'Mahram' 
                    ? `Successfully moved ${personBeingMoved} to year ${targetYear} to join ${targetPersonName}.`
                    : `Successfully moved ${personBeingMoved} to year ${targetYear}.`;
                
                alert(successMessage);
                closeEditYearModal();
                fetchAppeals();
            } else {
                alert(data.message || 'Failed to change Hajj year');
            }
        } catch (e) {
            console.error('Error changing Hajj year:', e);
            alert('Error changing Hajj year: ' + e.message);
        }
    };

    useEffect(() => {
      // Fetches info for the person to be joined (for Mahram appeals)
      if (selectedAppeal?.related_user_id) {
        const fetchRelatedUserInfo = async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/admin/user/${selectedAppeal.related_user_id}`);
            const data = await response.json();
            if (data.success) {
              setRelatedUserInfo(data.user);
            }
          } catch (err) {
            console.error("Error fetching related user info:", err);
          }
        };
        fetchRelatedUserInfo();
      } else {
        setRelatedUserInfo(null);
      }
    }, [selectedAppeal]);

    useEffect(() => {
      // Fetches info for the person appealing (appellant)
      if (selectedAppeal?.user_id) {
        const fetchApplicantInfo = async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/admin/user/${selectedAppeal.user_id}`);
            const data = await response.json();
            if (data.success) {
              setApplicantInfo(data.user);
            }
          } catch (err) {
            console.error("Error fetching appellant info:", err);
          }
        };
        fetchApplicantInfo();
      } else {
        setApplicantInfo(null);
      }
    }, [selectedAppeal]);

    useEffect(() => {
        const fetchAllQuotaData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/hajj-quota/all');
                const data = await response.json();
                if (data.success) {
                    setAllQuotaData(data.quota);
                } else {
                    console.error("Failed to fetch quota data:", data.message);
                }
            } catch (err) {
                console.error("Error fetching all quota data:", err);
            }
        };

        fetchAllQuotaData();
    }, []);

    // Corrected and consolidated useEffect for setting the target Hajj year
    useEffect(() => {
        setHajjYear('');
        if (!openEditYearModel || !selectedAppeal || !allQuotaData.length) {
            return;
        }

        const { appeal_type } = selectedAppeal;
        const quotaWithAvailability = allQuotaData.map(q => ({
            ...q,
            available_slots: q.total_slots - q.filled_slots - q.reserved_slots
        }));

        if (appeal_type === 'Mahram') {
            // For Mahram: Target is the APPELLANT'S year, where the related user will be moved.
            if (applicantInfo?.hajj_year) {
                const targetYear = applicantInfo.hajj_year;
                const targetQuota = quotaWithAvailability.find(q => q.year === targetYear);
                
                // Check if appellant's year has space for the related user.
                if (targetQuota && targetQuota.available_slots > 0) {
                    setHajjYear(targetYear);
                    console.log(`Mahram: Target year ${targetYear} has ${targetQuota.available_slots} slots available.`);
                } else {
                    console.log(`Mahram: Target year ${targetYear} has no available slots.`);
                }
            }
        } else if (appeal_type === 'Sick' || appeal_type === 'Old') {
            // For Sick/Old: Find an earlier year with available slots for the appellant.
            if (applicantInfo?.hajj_year) {
                const currentAppellantYear = applicantInfo.hajj_year;
                const suitableYears = quotaWithAvailability
                    .filter(q => q.available_slots > 0 && q.year < currentAppellantYear)
                    .sort((a, b) => a.year - b.year); // Earliest first

                if (suitableYears.length > 0) {
                    setHajjYear(suitableYears[0].year);
                    console.log(`${appeal_type}: Found earlier year ${suitableYears[0].year} with ${suitableYears[0].available_slots} slots.`);
                } else {
                    console.log(`${appeal_type}: No earlier years with available slots found.`);
                }
            }
        }
    }, [openEditYearModel, selectedAppeal, allQuotaData, applicantInfo, relatedUserInfo]);

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
                    <h1 className="text-2xl font-bold text-blue-800">Hajj Appeals</h1>
                    <div className="flex space-x-4">
                        <div className="relative">
                            <select
                                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
                                value={appealTypeFilter}
                                onChange={(e) => setAppealTypeFilter(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                <option value="Mahram">Mahram</option>
                                <option value="Sick">Sick</option>
                                <option value="Old">Old</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IC No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TH Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appeal Type</th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('submitted_date')}
                                >
                                    Submitted Date {sortConfig.key === 'submitted_date' && (
                                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentAppeals.length > 0 ? (
                                currentAppeals.map((appeal) => (
                                    <tr key={appeal.appeal_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{appeal.full_name}</div>
                                                    <div className="text-sm text-gray-500">{appeal.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appeal.ic_no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appeal.th_acc_no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appeal.appeal_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(appeal.submitted_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${appeal.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    appeal.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {appeal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setSelectedAppeal(appeal)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Manage
                                            </button>
                                              <button
                                                      onClick={() => {
                                                        setSelectedAppeal(appeal);
                                                        setopenEditYearModel(true);
                                                      }}
                                                      className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Change Year
                                              </button>
                                            <button
                                                onClick={() => {
                                                    openDocumentsModal(appeal.appeal_id);
                                                    setUserID(appeal.user_id);
                                                }}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Docs
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No appeals found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredAppeals.length > appealsPerPage && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstAppeal + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastAppeal, filteredAppeals.length)}
                            </span>{' '}
                            of <span className="font-medium">{filteredAppeals.length}</span> appeals
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded-md ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={`px-4 py-2 border rounded-md ${currentPage === number ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white hover:bg-gray-50'}`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
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
    
    const closeDocumentsModal = () => {
        setShowDocumentsModal(false);
        setDocuments([]);
    };
    
    const openDocumentsModal = async (appealId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/appeal-documents/${appealId}`);
            const data = await response.json();
            if (data.success) {
                setDocuments(data.documents);
                setShowDocumentsModal(true);
            } else {
                alert(data.message || "No documents found for this appeal.");
                setDocuments([]);
                setShowDocumentsModal(true); // Show modal even if empty
            }
        } catch (err) {
            alert("Server error. Please try again later.");
        }
    };
    
    const closeEditYearModal = () => {
        setopenEditYearModel(false);
        setSelectedAppeal(null);
        setApplicantInfo(null);
        setRelatedUserInfo(null);
        setHajjYear('');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminSidebar />
            <AdminTopbar />

            <div className="ml-64 pt-16">
                <div className="container mx-auto px-4 py-8">
                    {renderContent()}
                </div>
            </div>

            {/* Decision Modal */}
            {selectedAppeal && !openEditYearModel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Manage Appeal</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Decision</label>
                            <select
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={decision}
                                onChange={(e) => setDecision(e.target.value)}
                                required
                            >
                                <option value="">Select decision</option>
                                <option value="Approved">Approve</option>
                                <option value="Rejected">Reject</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Justification (Reason)</label>
                            <textarea
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                rows="3"
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setSelectedAppeal(null)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded">Cancel</button>
                            <button onClick={handleDecisionSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded" disabled={!decision}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Hajj Year Modal */}
            {openEditYearModel && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
                  <h2 className="text-xl font-bold mb-4">Edit Hajj Year</h2>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Hajj Quota Information</h3>
                    <div className="overflow-x-auto max-h-48">
                      <table className="min-w-full border">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="border px-4 py-2 text-left">Year</th>
                            <th className="border px-4 py-2 text-left">Total Slots</th>
                            <th className="border px-4 py-2 text-left">Filled Slots</th>
                            <th className="border px-4 py-2 text-left">Reserved Slots</th>
                            <th className="border px-4 py-2 text-left">Available Slots</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allQuotaData.length > 0 ? (
                            allQuotaData.map(quota => (
                              <tr key={quota.year} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{quota.year}</td>
                                <td className="border px-4 py-2">{quota.total_slots}</td>
                                <td className="border px-4 py-2">{quota.filled_slots}</td>
                                <td className="border px-4 py-2">{quota.reserved_slots}</td>
                                <td className="border px-4 py-2 font-medium">{quota.total_slots - quota.filled_slots - quota.reserved_slots}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="5" className="border px-4 py-2 text-center">No quota data available.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedAppeal?.appeal_type === 'Mahram' && (
                    <div className="mb-4 p-3 bg-blue-50 rounded">
                      <h3 className="font-semibold mb-2">Mahram Pair Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Appellant (Anchor Person):</h4>
                          <p>Name: {applicantInfo?.full_name || 'Loading...'}</p>
                          <p>Current Hajj Year: {applicantInfo?.hajj_year || 'Not assigned'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Mahram (To be Moved):</h4>
                          <p>Name: {relatedUserInfo?.full_name || 'Loading...'}</p>
                          <p>Current Hajj Year: {relatedUserInfo?.hajj_year || 'Not assigned'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Target Hajj Year</label>
                    <input type="text" className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200" value={HajjYear || 'Not Available'} readOnly />
                    {!HajjYear && openEditYearModel && (
                        <p className="text-red-500 text-xs italic mt-2">
                            {selectedAppeal?.appeal_type === 'Mahram' 
                                ? "The anchor person's Hajj year is full, not found, or user info is still loading. Cannot move the mahram."
                                : "No earlier year with available slots found."
                            }
                        </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button onClick={closeEditYearModal} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded">Cancel</button>
                    <button onClick={handlehajjYearChangeSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded" disabled={!HajjYear}>Submit</button>
                  </div>
                </div>
              </div>
            )}

            {showDocumentsModal && (
                <UserDocumentsModal userId={user_id} documents={documents} closeModal={closeDocumentsModal} />
            )}
        </div>
    );
};

export default AdminViewAppeals;