// CreateHajjOffer.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const CreateHajjOffer = () => {
    const [registrationId, setRegistrationId] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [previewData, setPreviewData] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        total: 0
    });
    const [selectedRegistrations, setSelectedRegistrations] = useState([]);
    const [earliestYearData, setEarliestYearData] = useState(null);
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkResults, setBulkResults] = useState(null);

  const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch available years with slot info
            const yearsResponse = await fetch('http://localhost:5000/api/admin/available-hajj-years');
            const yearsData = await yearsResponse.json();

            if (yearsData.success) {
                setAvailableYears(yearsData.years);
                setEarliestYearData(yearsData.earliestYear);
                if (yearsData.earliestYear) {
                    setSelectedYear(yearsData.earliestYear.year);
                }
            } else {
                setError(yearsData.message || 'Failed to fetch available years');
            }

            // Fetch approved registrations with pagination
            const regResponse = await fetch(
                `http://localhost:5000/api/admin/approved-hajj-applications?page=${pagination.currentPage}&limit=${pagination.limit}`
            );
            const regData = await regResponse.json();

            if (regData.success) {
                setRegistrations(regData.applications);
                setPagination(prev => ({
                    ...prev,
                    totalPages: regData.pagination.totalPages,
                    total: regData.pagination.total
                }));
            } else {
                setError(regData.message || 'Failed to fetch registrations');
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.currentPage, pagination.limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBulkSelect = (reg, isSelected) => {
        if (!earliestYearData) {
            Swal.fire('Error', 'No available Hajj year data', 'error');
            return;
        }

        let newSelectedRegistrations = [...selectedRegistrations];

        if (isSelected) {
            if (selectedRegistrations.length >= earliestYearData.availableSlots) {
                Swal.fire(
                    'Limit Reached',
                    `Only ${earliestYearData.availableSlots} slots available`,
                    'warning'
                );
                return;
            }
            newSelectedRegistrations.push(reg.registration_id);

            // Auto-select Mahram pair if available
            if (reg.mahram_user_id) {
                const mahramReg = registrations.find(r => r.user_id === reg.mahram_user_id);
                if (mahramReg && !newSelectedRegistrations.includes(mahramReg.registration_id)) {
                    newSelectedRegistrations.push(mahramReg.registration_id);
                }
            }
            //Auto select if this is a mahram pair
            const mahramForReg = registrations.find(r => r.mahram_user_id === reg.user_id);
            if(mahramForReg && !newSelectedRegistrations.includes(mahramForReg.registration_id)){
                newSelectedRegistrations.push(mahramForReg.registration_id)
            }

        } else {
            newSelectedRegistrations = newSelectedRegistrations.filter(id => id !== reg.registration_id);

            //Unselect mahram pair,if available
             if (reg.mahram_user_id) {
                const mahramReg = registrations.find(r => r.user_id === reg.mahram_user_id);
                if (mahramReg) {
                   newSelectedRegistrations = newSelectedRegistrations.filter(id => id !== mahramReg.registration_id);
                }
            }

            const mahramForReg = registrations.find(r => r.mahram_user_id === reg.user_id);
            if(mahramForReg){
                 newSelectedRegistrations = newSelectedRegistrations.filter(id => id !== mahramForReg.registration_id);
            }
        }

        if (newSelectedRegistrations.length > earliestYearData.availableSlots) {
            Swal.fire(
                'Limit Reached',
                `Only ${earliestYearData.availableSlots} slots available`,
                'warning'
            );
            return;
        }
        setSelectedRegistrations(newSelectedRegistrations);
    };

    const handleBulkSubmit = async () => {
        if (selectedRegistrations.length === 0) {
            setError('Please select at least one applicant');
            return;
        }

        Swal.fire({
            title: 'Confirm Bulk Offer Creation?',
            html: `Create offers for <b>${selectedRegistrations.length} applicants</b> for Hajj <b>${selectedYear}</b>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Create Offers',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsSubmitting(true);
                try {
                    const response = await fetch('http://localhost:5000/api/admin/hajj-offers/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ registration_ids: selectedRegistrations })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        const successCount = data.results.filter(r => r.success).length;
                        setBulkResults(data.results.filter(r => r.success));
                        
                        Swal.fire(
                            'Success!',
                            `Created ${successCount} offers for Hajj ${data.target_year}`,
                            'success'
                        );
                        
                        // Refresh data
                        fetchData();
                        setSelectedRegistrations([]);
                    } else {
                        setError(data.message);
                        Swal.fire('Error!', data.message, 'error');
                    }
                } catch (err) {
                    setError('Failed to connect to server');
                    Swal.fire('Error!', 'Failed to connect to server', 'error');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

const handleBulkGenerateLetters = async () => {
    if (!bulkResults || bulkResults.length === 0) {
        Swal.fire('Error', 'No successful offers to generate letters for', 'error');
        return;
    }

    const offerIds = bulkResults.map(r => r.offer_id);

    Swal.fire({
        title: 'Generating Offer Letters...',
        text: 'Please wait while we prepare all the letters.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch('http://localhost:5000/api/admin/generate-offer-letters-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offer_ids: offerIds })
        });

        const result = await response.json();
        if (result.success) {
            Swal.fire('Success', `${result.generated_ids.length} offer letters generated`, 'success');
        } else {
            Swal.fire('Error', result.message || 'Failed to generate offer letters', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'Server error while generating offer letters', 'error');
    }
};


    const filteredRegistrations = registrations.filter(reg =>
        reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.ic_no.includes(searchTerm) ||
        reg.th_acc_no.includes(searchTerm)
    );

    const handleRegistrationSelect = async (reg) => {
        if (bulkMode) return;

        // Check for Mahram Pair
        if (reg.mahram_user_id) {
            Swal.fire({
                title: 'Mahram Pair Detected',
                text: 'This applicant is part of a Mahram pair. Do you want to switch to Bulk Mode to create offers for both members?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Switch to Bulk Mode',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    setBulkMode(true);
                    setSelectedRegistrations([reg.registration_id]);
                    //Find mahram applicant in registrations and selected that too
                    const mahramReg = registrations.find(r => r.user_id === reg.mahram_user_id);
                    if (mahramReg) {
                        setSelectedRegistrations(prev => [...prev, mahramReg.registration_id]);
                    }
                }
            });
            return; // Exit if switching to bulk mode is offered
        }

        // If no Mahram or bulk mode not switched, proceed as before
        setRegistrationId(reg.registration_id.toString());
        setPreviewData({
            name: reg.full_name,
            ic_no: reg.ic_no,
            th_acc_no: reg.th_acc_no,
            income_group: reg.income_group
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
            setRegistrationId('');
            setPreviewData(null);
            setSelectedRegistrations([]);
            setBulkResults(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsSubmitting(true);

        if (!registrationId || !selectedYear) {
            setError('Please select an applicant and Hajj year');
            setIsSubmitting(false);
            return;
        }

        Swal.fire({
            title: 'Confirm Hajj Offer Creation?',
            html: `Are you sure you want to create a Hajj offer for <b>${previewData.name}</b> for the year <b>${selectedYear}</b>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, create offer!',
            cancelButtonText: 'No, cancel!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('http://localhost:5000/api/admin/hajj-offers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            registration_id: parseInt(registrationId),
                            hajj_year: parseInt(selectedYear)
                        }),
                    });

                    const data = await response.json();

                    if (data.success) {
                        setMessage(data.message);
                        Swal.fire(
                            'Success!',
                            data.message,
                            'success'
                        );
                        
                        // Refresh data
                        const yearsResponse = await fetch('http://localhost:5000/api/admin/available-hajj-years');
                        const yearsData = await yearsResponse.json();
                        if (yearsData.success) {
                            setAvailableYears(yearsData.years);
                            setEarliestYearData(yearsData.earliestYear);
                            setSelectedYear(yearsData.earliestYear?.year || '');
                        }
                        
                        // Refresh applicants list
                        const regResponse = await fetch(
                            `http://localhost:5000/api/admin/approved-hajj-applications?page=${pagination.currentPage}&limit=${pagination.limit}`
                        );
                        const regData = await regResponse.json();

                        if (regData.success) {
                            setRegistrations(regData.applications);
                            setPagination(prev => ({
                                ...prev,
                                totalPages: regData.pagination.totalPages,
                                total: regData.pagination.total
                            }));
                        }
                        
                        setRegistrationId('');
                        setPreviewData(null);
                    } else {
                        setError(data.message || 'Failed to create Hajj offer');
                        Swal.fire(
                            'Error!',
                            data.message || 'Failed to create Hajj offer',
                            'error'
                        );
                    }
                } catch (err) {
                    setError('Failed to connect to server. Please try again later.');
                    Swal.fire(
                        'Error!',
                        'Failed to connect to server. Please try again later.',
                        'error'
                    );
                } finally {
                    setIsSubmitting(false);
                }
            } else {
                setIsSubmitting(false);
            }
        });
    };

    const handleGenerateOfferLetter = (offerId) => {
        // const offerIdMatch = message.match(/Offer ID: (\d+)/);
        // const offerId = offerIdMatch ? offerIdMatch[1] : null;

        if (offerId) {
            window.open(`http://localhost:5000/api/admin/generate-offer-letter/${offerId}`, '_blank');
        } else {
            setError("Could not extract Offer ID from the success message.");
        }
    };

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1 ml-64">
                <AdminTopbar />
                <div className="p-8 bg-gray-100 min-h-screen mt-16">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-6 text-blue-800">Create Hajj Offer</h2>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                                <p>{error}</p>
                            </div>
                        )}

 {message && (
    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
       <p className="whitespace-pre-line">{message}</p>
       <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
          onClick={() => {
            const offerIdMatch = message.match(/Offer ID: (\d+)/);
            const offerId = offerIdMatch ? offerIdMatch[1] : null;

            if (offerId) {
              handleGenerateOfferLetter(offerId);
            } else {
              setError("Could not extract Offer ID from the success message.");
            }
          }}
        >
            Generate Offer Letter
        </button>
    </div>
)}

                        {bulkResults && bulkResults.length > 0 && (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
                                <p>Successfully created {bulkResults.length} offers in bulk.</p>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
                                    onClick={handleBulkGenerateLetters}
                                >
                                    Generate All Offer Letters
                                </button>
                            </div>
                        )}

                        {isLoading && (
                            <div className="text-center">
                                <p>Loading data...</p>
                            </div>
                        )}

                        {!isLoading && (
                            <div className="space-y-6">
                                {/* Hajj Availability Section */}
       <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        {earliestYearData ? (
            <>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-800">
                        Hajj {earliestYearData.year} Availability
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {earliestYearData.availableSlots} / {earliestYearData.totalSlots} slots available
                        (Reserved: {earliestYearData.reservedSlots})
                    </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                    Departure: {new Date(earliestYearData.departurePeriod.start).toLocaleDateString()} - {' '}
                    {new Date(earliestYearData.departurePeriod.end).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                    Payment Deadline: {new Date(
                        new Date(earliestYearData.departurePeriod.start).setMonth(
                            new Date(earliestYearData.departurePeriod.start).getMonth() - 6
                        )
                    ).toLocaleDateString()}
                </p>
            </>
        ) : (
            <p className="text-red-500">No available Hajj slots</p>
        )}
    </div>

                                {/* Available Years Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Available Hajj Years
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={availableYears.length === 0}
                                    >
                                        {availableYears.length > 0 ? (
                                            availableYears.map(year => (
                                                <option key={year} value={year}>
                                                    Hajj {year} (Dhu al-Hijjah {1446 + (year - 2025)}H)
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">No available years</option>
                                        )}
                                    </select>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {availableYears.length > 0
                                            ? `${availableYears.length} year(s) available`
                                            : 'All quotas are currently filled'}
                                    </p>
                                </div>

                                {/* Approved Applicants Section */}
                                <div>
                                    {/* Bulk mode toggle */}
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Approved Applicants Without Offers ({pagination.total})
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setBulkMode(!bulkMode);
                                                setSelectedRegistrations([]);
                                                setBulkResults(null);
                                            }}
                                            className={`px-4 py-2 rounded-md ${bulkMode 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-200 text-gray-800'}`}
                                        >
                                            {bulkMode ? 'Bulk Mode (ON)' : 'Bulk Mode'}
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Search by name, IC, or TH Account"
                                        className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IC No.</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TH Account</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income Group</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredRegistrations.length > 0 ? (
                                                    filteredRegistrations.map((reg) => (
                                                        <tr
                                                            key={reg.registration_id}
                                                            className={`${registrationId === reg.registration_id.toString() ? 'bg-blue-50' : ''} ${reg.mahram_user_id || registrations.find(r => r.mahram_user_id === reg.user_id) ? 'bg-yellow-50' : ''}`}
                                                            onClick={() => !bulkMode && handleRegistrationSelect(reg)}
                                                            style={{ cursor: bulkMode ? 'default' : 'pointer' }}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {bulkMode ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedRegistrations.includes(reg.registration_id)}
                                                                        onChange={(e) => handleBulkSelect(reg, e.target.checked)}
                                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type="radio"
                                                                        name="selectedApplicant"
                                                                        checked={registrationId === reg.registration_id.toString()}
                                                                        onChange={() => handleRegistrationSelect(reg)}
                                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                                                                        <div className="text-sm text-gray-500">{reg.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {reg.ic_no}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {reg.th_acc_no}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    reg.income_group === 'B40' ? 'bg-red-100 text-red-800' :
                                                                        reg.income_group === 'M40' ? 'bg-yellow-100 text-yellow-800' :
                                                                        reg.income_group === 'T20' ? 'bg-green-100 text-green-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {reg.income_group || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {new Date(reg.registration_date).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                            No approved applications found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Bulk action buttons */}
                                    {bulkMode && (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-md">
                                            <p className="font-medium">
                                                Bulk Mode: {selectedRegistrations.length} selected | 
                                                Available Slots: {earliestYearData?.availableSlots || 0}
                                            </p>
                                            {earliestYearData && (
                                                <p className="text-sm">
                                                    Hajj {earliestYearData.year} - {earliestYearData.availableSlots} slots remaining
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to{' '}
                                                <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.total)}</span> of{' '}
                                                <span className="font-medium">{pagination.total}</span> applicants
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Offer Preview */}
                                {previewData && !bulkMode && (
                                    <div className="border p-4 rounded-md shadow-sm">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Offer Preview</h3>
                                        <p>Applicant Name: {previewData.name}</p>
                                        <p>IC Number: {previewData.ic_no}</p>
                                        <p>TH Account: {previewData.th_acc_no}</p>
                                        <p>Income Group: {previewData.income_group}</p>
                                        <p>Hajj Year: {selectedYear}</p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/dashboard')}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>

                                    {!bulkMode && (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!registrationId || isSubmitting}
                                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                                !registrationId || isSubmitting
                                                    ? 'bg-blue-300 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                        >
                                            {isSubmitting ? 'Creating Offer...' : 'Create Offer'}
                                        </button>
                                    )}

                                    {bulkMode && (
                                        <button
                                            onClick={handleBulkSubmit}
                                            disabled={selectedRegistrations.length === 0 || isSubmitting}
                                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                                selectedRegistrations.length === 0 || isSubmitting
                                                    ? 'bg-blue-300 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                        >
                                            {isSubmitting ? 'Creating Offers...' : 'Create Offers'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateHajjOffer;