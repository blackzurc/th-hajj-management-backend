import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Swal from 'sweetalert2';

const ViewOffer = () => {
    const [offerDetails, setOfferDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const th_acc_no = localStorage.getItem('th_acc_no');
    const [acceptRejectMessage, setAcceptRejectMessage] = useState('');
    const [applicantNotification, setApplicantNotification] = useState(null);

    const fetchOfferDetails = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5000/api/user/offer-details/${th_acc_no}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setOfferDetails(data.offer);
            } else {
                setError(data.message || 'No offer found for this account.');
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again later.');
            console.error("Error fetching offer details:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (th_acc_no) {
            fetchOfferDetails();
        } else {
            setError('You are not logged in.');
            setIsLoading(false);
        }
    }, [th_acc_no]);

 const handleAcceptOffer = async () => {
        Swal.fire({
            title: 'Confirm Accept Offer?',
            text: "Are you sure you want to accept this Hajj offer?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, accept!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Existing API call to accept offer...
                    const th_acc_no = localStorage.getItem('th_acc_no');
                    const response = await fetch(`http://localhost:5000/api/user/offer/${offerDetails.offer_id}/decision`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            decision: 'Accept',
                            th_acc_no: th_acc_no
                        }),
                    });

                    const data = await response.json();

                    if (data.success) {
                        setAcceptRejectMessage(data.message);
                        // Refresh offer details after accepting
                        fetchOfferDetails();
                    } else {
                        setError(data.message);
                    }
                } catch (err) {
                    setError('Failed to connect to server. Please try again later.');
                    console.error("Error accepting offer:", err);
                }
            }
        });
    };

const handleRejectOffer = async () => {
    try {
        // First, check if this user is a Mahram (has applicants linked to them)
        // Check if the *current* user is a male *dependent* (mahram_user_id != null AND gender = 'Male')
        const isMahramDependent = offerDetails.mahram_user_id !== null && offerDetails.gender === 'Male';

        const confirmationText = isMahramDependent
            ? "Warning: Rejecting this offer will also reject your applicant's participation in Hajj. Are you sure?"
            : "Are you sure you want to reject this Hajj offer?";

        Swal.fire({
            title: 'Confirm Reject Offer?',
            text: confirmationText,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reject!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch(`http://localhost:5000/api/user/offer/${offerDetails.offer_id}/decision`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        decision: 'Reject',
                        th_acc_no: localStorage.getItem('th_acc_no')
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    // Show appropriate notification
                    if (data.applicant_affected) {
                        Swal.fire(
                            'Both Offers Rejected',
                            'Your offer and your applicant\'s offer have been rejected. Any payments will be refunded.',
                            'info'
                        );
                    } else {
                        Swal.fire(
                            'Offer Rejected',
                            'Your Hajj offer has been rejected.',
                            'success'
                        );
                    }
                    fetchOfferDetails(); // Refresh offer details after rejection
                } else {
                    setError(data.message);
                }
            }
        });
    } catch (err) {
        setError('Failed to check Mahram status. Please try again later.');
        console.error("Error checking Mahram status:", err);
    }
};
    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />
            <Topbar />

            {/* Main Content - moved down to avoid topbar overlap */}
            <div className="ml-64 pt-20 p-6">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4 text-green-700">View Hajj Offer</h2>

                    {isLoading && (
                        <div className="text-center">
                            <p>Loading offer details...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    {acceptRejectMessage && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                            <p>{acceptRejectMessage}</p>
                        </div>
                    )}

                    {offerDetails && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Hajj Year</p>
                                    <p className="text-lg font-semibold">{offerDetails.hajj_year}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Payment Deadline</p>
                                    <p className="text-lg font-semibold">{new Date(offerDetails.payment_deadline).toLocaleDateString()}</p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg border border-green-200 md:col-span-2">
                                    <p className="text-sm text-green-600">Total Amount Payable</p>
                                    <p className="text-2xl font-bold text-green-700">RM {offerDetails.base_payment?.toLocaleString()}</p>
                                </div>
                            </div>

                            {offerDetails.offer_letter_url && (
                                <div className="mt-6">
                                    <a
                                        href={offerDetails.offer_letter_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                    >
                                        📄 View Offer Letter
                                    </a>
                                </div>
                            )}

                            {!offerDetails.offer_letter_url && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                                    <p className="text-yellow-800">📝 Offer letter not available yet.</p>
                                </div>
                            )}

                            {/* Accept/Reject Buttons */}
                            {offerDetails.status === 'Offered' && (
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={handleAcceptOffer}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                    >
                                        Accept Offer
                                    </button>
                                    <button
                                        onClick={handleRejectOffer}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                    >
                                        Reject Offer
                                    </button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewOffer;