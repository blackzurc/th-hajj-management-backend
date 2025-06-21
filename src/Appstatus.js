import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Appstatus = () => {
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [birthCertificate, setBirthCertificate] = useState(null);
    const [nationalID, setNationalID] = useState(null);

    const th_acc_no = localStorage.getItem("th_acc_no");

    useEffect(() => {
        const fetchRegistrationStatus = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/hajj/registration-status/${th_acc_no}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setRegistrationStatus(data);
                setShowModal(true);
            } catch (err) {
                console.error("Error fetching registration status:", err);
                setError(err.message || "Failed to fetch registration status.");
                setShowModal(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistrationStatus();
    }, [th_acc_no]);

    const closeModal = () => {
        setShowModal(false);
    };

    const handleBirthCertificateChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setUploadError("Birth Certificate file is too large. Maximum size is 5MB.");
                event.target.value = '';
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setUploadError("Birth Certificate must be a JPEG, JPG, PNG, or PDF file.");
                event.target.value = '';
                return;
            }
            
            setBirthCertificate(file);
            setUploadError(null);
        }
    };

    const handleNationalIDChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setUploadError("National ID file is too large. Maximum size is 5MB.");
                event.target.value = '';
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setUploadError("National ID must be a JPEG, JPG, PNG, or PDF file.");
                event.target.value = '';
                return;
            }
            
            setNationalID(file);
            setUploadError(null);
        }
    };

    const handleReuploadDocuments = async () => {
        setUploadError(null);

        if (!birthCertificate && !nationalID) {
            setUploadError("Please select at least one document to reupload.");
            return;
        }

        const formData = new FormData();
        if (birthCertificate) formData.append("birthCertificate", birthCertificate);
        if (nationalID) formData.append("nationalID", nationalID);

        setIsLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/user/reupload-documents/${th_acc_no}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                // If response is not JSON, get text instead
                const text = await response.text();
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}...`);
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! Status: ${response.status}`);
            }

            if (!data.success) {
                throw new Error(data.message || "Upload failed");
            }

            // Success - refresh the status
            try {
                const statusResponse = await fetch(`http://localhost:5000/api/hajj/registration-status/${th_acc_no}`);
                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    setRegistrationStatus(statusData);
                }
            } catch (statusError) {
                console.warn("Failed to refresh status after upload:", statusError);
                // Don't fail the whole operation if status refresh fails
            }

            // Clear the file inputs
            setBirthCertificate(null);
            setNationalID(null);
            
            // Reset file input elements
            const birthInput = document.querySelector('input[type="file"][data-type="birth"]');
            const nationalInput = document.querySelector('input[type="file"][data-type="national"]');
            if (birthInput) birthInput.value = '';
            if (nationalInput) nationalInput.value = '';

            alert("Documents uploaded successfully!");

        } catch (err) {
            console.error("Error re-uploading documents:", err);
            setUploadError(err.message || "Failed to re-upload documents. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Topbar />
                <div className="p-8 bg-gray-100 min-h-screen">
                    <h2 className="text-2xl font-bold text-green-700 mb-6">
                        Semak Status Pendaftaran Haji
                    </h2>

                    <div className="bg-white p-6 rounded shadow-md space-y-4">
                        <div>
                            <label className="block text-gray-700">Nombor Akaun TH</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded bg-gray-100"
                                value={th_acc_no || ""}
                                readOnly
                            />
                        </div>

                        {/* Modal */}
                        {showModal && (
                            <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                                <div className="bg-white p-8 rounded shadow-md max-w-md w-full mx-4">
                                    <h3 className="text-xl font-semibold mb-4">Status Pendaftaran</h3>
                                    
                                    {error && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                            {error}
                                        </div>
                                    )}
                                    
                                    {registrationStatus ? (
                                        <>
                                            <div className="mb-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    registrationStatus.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    registrationStatus.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    registrationStatus.status === 'Reupload' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    Status: {registrationStatus.status || "Not Registered"}
                                                </span>
                                            </div>
                                            
                                            {registrationStatus.justification && (
                                                <div className="mb-4 p-3 bg-gray-50 rounded">
                                                    <p className="text-sm font-medium text-gray-700">Admin's Note:</p>
                                                    <p className="text-sm text-gray-600">{registrationStatus.justification}</p>
                                                </div>
                                            )}
                                            
                                            {registrationStatus.registration_date && (
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Registration Date: {new Date(registrationStatus.registration_date).toLocaleDateString()}
                                                </p>
                                            )}

                                            {registrationStatus.status === "Reupload" && (
                                                <div className="border-t pt-4">
                                                    <p className="text-yellow-600 font-semibold mb-4">
                                                        Please re-upload required documents:
                                                    </p>
                                                    
                                                    {registrationStatus.birth_certificate_reupload_required && (
                                                        <div className="mb-4">
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                                Reupload Birth Certificate:
                                                            </label>
                                                            <input 
                                                                type="file" 
                                                                data-type="birth"
                                                                accept=".jpg,.jpeg,.png,.pdf"
                                                                onChange={handleBirthCertificateChange}
                                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Allowed: JPG, PNG, PDF</p>
                                                        </div>
                                                    )}
                                                    
                                                    {registrationStatus.national_id_reupload_required && (
                                                        <div className="mb-4">
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                                Reupload National ID:
                                                            </label>
                                                            <input 
                                                                type="file" 
                                                                data-type="national"
                                                                accept=".jpg,.jpeg,.png,.pdf"
                                                                onChange={handleNationalIDChange}
                                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Allowed: JPG, PNG, PDF</p>
                                                        </div>
                                                    )}
                                                    
                                                    {uploadError && (
                                                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                                                            {uploadError}
                                                        </div>
                                                    )}
                                                    
                                                    <button
                                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                                        onClick={handleReuploadDocuments}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? "Re-uploading..." : "Re-upload Documents"}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-600">Tiada maklumat pendaftaran ditemui.</p>
                                    )}
                                    
                                    <button
                                        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mt-4"
                                        onClick={closeModal}
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appstatus;