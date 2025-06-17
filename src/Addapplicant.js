// ✅ Addapplicant.js with Mahram Registration, API Validation, Document Upload
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AddApplicant = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [nationalIdFile, setNationalIdFile] = useState(null);
    const [birthCertificateFile, setBirthCertificateFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Mahram Registration States
    const [isApplyingWithMahram, setIsApplyingWithMahram] = useState(false);
    const [mahramFullName, setMahramFullName] = useState("");
    const [mahramIcNo, setMahramIcNo] = useState("");
    const [mahramThAccNo, setMahramThAccNo] = useState("");
    const [relationshipType, setRelationshipType] = useState("");
    const [mahramNationalIdFile, setMahramNationalIdFile] = useState(null);
    const [mahramBirthCertificateFile, setMahramBirthCertificateFile] = useState(null);
    const [isMahramVerified, setIsMahramVerified] = useState(false);

    const th_acc_no = localStorage.getItem("th_acc_no");
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:5000/api/user/user/${th_acc_no}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setUserData(data);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.message || "Failed to fetch user data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [th_acc_no]);

    const handleMahramCheck = async () => {
        try {
            const mahramCheckResponse = await fetch('http://192.168.0.100:5000/thApi/checkMahram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullname1: userData.full_name,
                    icno1: userData.ic_no,
                    fullname2: mahramFullName,
                    icno2: mahramIcNo
                })
            });

            const mahramCheckResult = await mahramCheckResponse.json();

            if (mahramCheckResult.success) {
                Swal.fire(
                    'Mahram Verified!',
                    mahramCheckResult.message + '. Relationship: ' + mahramCheckResult.application.hubungan,
                    'success'
                );
                setRelationshipType(mahramCheckResult.application.hubungan);
                setIsMahramVerified(true); // Set verification status to true
                
            } else {
                Swal.fire('Error', mahramCheckResult.message || 'Mahram verification failed', 'error');
                setRelationshipType('');
                setIsMahramVerified(false); // Set verification status to false
            }
        } catch (error) {
            console.error('Mahram check error:', error);
            Swal.fire('Error', 'Failed to verify Mahram. Please try again later.', 'error');
            setRelationshipType('');
            setIsMahramVerified(false); // Ensure it's false on error too
        }
    };


    const handleAddApplicant = async () => {
        if (!nationalIdFile || !birthCertificateFile) {
            Swal.fire('Warning', "Please upload both National ID and Birth Certificate files.", 'warning');
            return;
        }
        if (isApplyingWithMahram && !isMahramVerified) {
            Swal.fire('Warning', "Please verify the Mahram before submitting.", 'warning');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("national_id", nationalIdFile);
        formData.append("birth_certificate", birthCertificateFile);
        formData.append("user_id", userId);
        // Append Mahram's documents if available
        if (isApplyingWithMahram) {
            if (!mahramFullName || !mahramIcNo || !mahramThAccNo || !relationshipType) {
                Swal.fire('Warning', "Please provide all Mahram details.", 'warning');
                return;
            }

            if (!mahramNationalIdFile || !mahramBirthCertificateFile) {
                Swal.fire('Warning', "Please upload Mahram's National ID and Birth Certificate files.", 'warning');
                return;
            }
            formData.append("mahram_full_name", mahramFullName);
            formData.append("mahram_ic_no", mahramIcNo);
            formData.append("mahram_th_acc_no", mahramThAccNo);
            formData.append("relationship_type", relationshipType);
            formData.append("is_applying_with_mahram", isApplyingWithMahram);

            formData.append("mahram_national_id", mahramNationalIdFile);
            formData.append("mahram_birth_certificate", mahramBirthCertificateFile);
        }

        try {
            // Step 1: Upload documents
            const uploadResponse = await fetch("http://localhost:5000/api/hajj/upload-documents", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error("Document upload failed.");
            }

            // Step 2: Register for Hajj
            const hajjResponse = await fetch("http://localhost:5000/api/hajj/hajj-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    mahram_full_name: mahramFullName,
                    mahram_ic_no: mahramIcNo,
                    mahram_th_acc_no: mahramThAccNo,
                    relationship_type: relationshipType,
                    is_applying_with_mahram: isApplyingWithMahram,
                }),
            });

            const hajjData = await hajjResponse.json(); // Parse the JSON response

            if (hajjResponse.ok && hajjData.success) { // Check both response.ok and data.success
                Swal.fire(
                    'Success',
                    "Applicant added and documents uploaded successfully.",
                    'success'
                );

                // Store the registration ID in localStorage
                localStorage.setItem('registrationId', hajjData.applicant_registration_id);
                console.log("Registration ID set in localStorage:", hajjData.applicant_registration_id);

                navigate('/apply-hajj2'); // Redirect to the next page or dashboard
            } else {
                throw new Error(hajjData.message || "Hajj registration failed."); // Use hajjData.message for the error
            }
        } catch (error) {
            console.error("Add applicant error:", error);
            Swal.fire('Error', error.message || "Server error during applicant submission.", 'error');
        } finally {
            setUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Topbar />
                    <div className="p-8 bg-gray-100 min-h-screen">
                        <p>Loading user information...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Topbar />
                    <div className="p-8 bg-gray-100 min-h-screen">
                        <p className="text-red-500">Error: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Topbar />
                <div className="p-8 bg-gray-100 min-h-screen">
                    <h2 className="text-2xl font-bold text-green-700 mb-6">Hajj Registration</h2>

                    <div className="bg-white p-6 rounded shadow-md space-y-4">
                        <p>Press <strong>Add Applicant</strong> to complete the registration.</p>

                        <div>
                            <label className="block text-gray-700">TH Account Number *</label>
                            <input type="text" className="w-full border p-2 rounded" value={userData?.th_acc_no || ""} readOnly />
                        </div>

                        <div>
                            <label className="block text-gray-700">IC Number *</label>
                            <input type="text" className="w-full border p-2 rounded" value={userData?.ic_no || ""} readOnly />
                        </div>

                        <div>
                            <label className="block text-gray-700">National ID Photo (Front and Back) *</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setNationalIdFile(e.target.files[0])} required />
                        </div>
                        <div>
                            <label className="block text-gray-700">Birth Certificate Scan *</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setBirthCertificateFile(e.target.files[0])} required />
                        </div>

                        {/* Mahram Section */}
                        <div className="mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-green-600"
                                    checked={isApplyingWithMahram}
                                    onChange={(e) => setIsApplyingWithMahram(e.target.checked)}
                                />
                                <span className="ml-2 text-gray-700">Applying with Mahram?</span>
                            </label>
                        </div>

                        {isApplyingWithMahram && (
                            <div className="space-y-4 border p-4 rounded">
                                <div>
                                    <label className="block text-gray-700">Mahram Full Name *</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded"
                                        value={mahramFullName}
                                        onChange={(e) => setMahramFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Mahram IC Number *</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded"
                                        value={mahramIcNo}
                                        onChange={(e) => setMahramIcNo(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Mahram TH Account Number *</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded"
                                        value={mahramThAccNo}
                                        onChange={(e) => setMahramThAccNo(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={handleMahramCheck}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Check Mahram
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-gray-700">Relationship to Applicant *</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded"
                                        value={relationshipType}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Mahram National ID Photo (Front and Back) *</label>
                                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setMahramNationalIdFile(e.target.files[0])} required />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Mahram Birth Certificate Scan *</label>
                                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setMahramBirthCertificateFile(e.target.files[0])} required />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                onClick={handleAddApplicant}
                                disabled={uploading || (isApplyingWithMahram && !isMahramVerified)}
                            >
                                {uploading ? "Uploading..." : "Add Applicant"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddApplicant;