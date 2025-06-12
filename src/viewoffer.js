import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const ViewOffer = () => {
    const [offerDetails, setOfferDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const th_acc_no = localStorage.getItem('th_acc_no');

    useEffect(() => {
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

        if (th_acc_no) {
            fetchOfferDetails();
        } else {
            setError('You are not logged in.');
            setIsLoading(false);
        }
    }, [th_acc_no]);

    let totalAmount;
    if (offerDetails) {
        switch (offerDetails.income_group) {
            case 'B40': totalAmount = 15000; break;
            case 'M40': totalAmount = 23500; break;
            case 'T20': totalAmount = 33300; break;
            default: totalAmount = 0; // Or handle the error appropriately
        }
    }

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
                                    <p className="text-2xl font-bold text-green-700">RM {totalAmount?.toLocaleString()}</p>
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
                            
                            {!offerDetails.offer_letter_path && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                                    <p className="text-yellow-800">📝 Offer letter not available yet.</p>
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