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
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationId, setRegistrationId] = useState(null);

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

                // Check registration status after fetching user data
                const checkRegistrationResponse = await fetch(`http://localhost:5000/api/hajj/check-registration/${data.user_id}`);
                const checkRegistrationData = await checkRegistrationResponse.json();

                setIsRegistered(checkRegistrationData.isRegistered);
                setRegistrationId(checkRegistrationData.registrationId);

            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.message || "Failed to fetch user data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [th_acc_no, userId]);

    const isFemaleBelow45 = () => {
        if (userData && userData.ic_no) {
            // Get the last digit of the IC number
            const lastDigit = parseInt(userData.ic_no.slice(-1));

            // Check if the last digit is an even number
            const gender = lastDigit % 2 === 0 ? 'Female' : 'Male'; // Even number indicates female

            const birthDate = getBirthDateFromIC(userData.ic_no)
            const age = calculateAge(birthDate)

            return (gender === 'Female' && age < 45); // Check is female && Below 45
        }
        return false;
    };

    const handleMahramCheck = async () => {
        try {
            const mahramCheckResponse = await fetch('https://myjpn.ddns.net:5443/thApi/checkMahram', {
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

            if (
  mahramCheckResult.success &&
  mahramCheckResult.application?.mahram === 'MAHRAM'
)   {
  Swal.fire(
    'Mahram Verified!',
    `${mahramCheckResult.message}. Relationship: ${mahramCheckResult.application.hubungan}`,
    'success'
  );
  setRelationshipType(mahramCheckResult.application.hubungan);
  setIsMahramVerified(true);
  setIsApplyingWithMahram(true);
} else {
  const reason =
    mahramCheckResult.application?.mahram === 'BUKAN MAHRAM'
      ? 'The selected person is **not** a valid mahram.'
      : mahramCheckResult.message || 'Mahram verification failed.';

  Swal.fire('Error', reason, 'error');
  setRelationshipType('');
  setIsMahramVerified(false);
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

        if (isFemaleBelow45() && !isApplyingWithMahram) {
            Swal.fire('Warning', "Unaccompanied females below 45 may face difficulties during the Hajj process.  It is strongly recommended to register with a Mahram.", 'warning');
            // DO NOT RETURN - Allow the submission to continue
        }

        if (isApplyingWithMahram && !isMahramVerified) {
            Swal.fire('Warning', "Please verify the Mahram before submitting.", 'warning');
            return;
        }

        const registrationCost = isApplyingWithMahram ? 2600 : 1300;

        // Check balance first before any uploads
        if (userData.balance < registrationCost) {
            Swal.fire('Warning', `You need a minimum balance of RM ${registrationCost} to register.`, 'warning');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // First check balance via API before proceeding
            const balanceCheckResponse = await fetch("http://localhost:5000/api/hajj/hajj-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    mahram_full_name: mahramFullName,
                    mahram_ic_no: mahramIcNo,
                    mahram_th_acc_no: mahramThAccNo,
                    relationship_type: relationshipType,
                    is_applying_with_mahram: isApplyingWithMahram,
                    registrationCost: registrationCost
                }),
            });

            const balanceCheckData = await balanceCheckResponse.json();

            if (!balanceCheckResponse.ok || !balanceCheckData.success) {
                throw new Error(balanceCheckData.message || "Balance check failed");
            }

            // Only proceed with document upload if balance check passed
            const formData = new FormData();
            formData.append("national_id", nationalIdFile);
            formData.append("birth_certificate", birthCertificateFile);
            formData.append("user_id", userId);

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

            const uploadResponse = await fetch("http://localhost:5000/api/hajj/upload-documents", {
                method: "POST",
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                if (uploadData.message === 'document_failed') {
                    Swal.fire('Warning', "Please upload both National ID and Birth Certificate files.", 'warning');
                }
                if (uploadData.message === 'mahram_invalid') {
                    Swal.fire('Warning', "Please enter a valid th account mahram.", 'warning');
                }
                if (uploadData.message === 'mahram_document_failed') {
                    Swal.fire('Warning', "Please enter a valid Mahram document", 'warning');
                }
                throw new Error("Document upload failed.");
            }

            // If everything succeeded
            Swal.fire(
                'Success',
                "Applicant added and documents uploaded successfully.",
                'success'
            );

            localStorage.setItem('registrationId', balanceCheckData.applicant_registration_id);
            console.log("Registration ID set in localStorage:", balanceCheckData.applicant_registration_id);
            navigate('/dashboard');

        } catch (error) {
            console.error("Add applicant error:", error);
            Swal.fire('Error', error.message || "Server error during applicant submission.", 'error');
        } finally {
            setUploading(false);
        }
    };
    const getBirthDateFromIC = (icNo) => {
        const year = "20" + icNo.slice(0, 2);
        const month = icNo.slice(2, 4);
        const day = icNo.slice(4, 6);
        return `${year}-${month}-${day}`;
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const month = today.getMonth() - birth.getMonth();
        if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleMahramCheckboxChange = (e) => {
        setIsApplyingWithMahram(e.target.checked);
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
    if (isRegistered) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Topbar />
                    <div className="p-8 bg-gray-100 min-h-screen pt-20"> {/* Added pt-20 */}
                        <div className="bg-white p-6 rounded shadow-md">
                            <p className="text-green-600 font-bold">
                                You are already registered for Hajj.
                            </p>
                            <p>
                                Your registration ID is: <span className="font-semibold">{registrationId}</span>
                            </p>
                        </div>
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
                        <p>Available balance : {userData?.balance}</p>

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
                        {isFemaleBelow45() && (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                                <p><strong>Warning:</strong> Unaccompanied females below 45 may face difficulties during the Hajj process.  It is strongly recommended to register with a Mahram.</p>
                            </div>
                        )}

                        {/* Mahram Section */}
                        <div className="mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-green-600"
                                    checked={isApplyingWithMahram}
                                    onChange={handleMahramCheckboxChange}
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
                            <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                onClick={handleAddApplicant}
                                disabled={
                                    uploading ||
                                    (isApplyingWithMahram && !isMahramVerified) ||
                                    userData?.balance < (isApplyingWithMahram ? 2600 : 1300)
                                }
                            >
                                {uploading ? 'Submitting...' : 'Add Applicant'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getBirthDateFromIC = (icNo) => {
    const year = "20" + icNo.slice(0, 2);
    const month = icNo.slice(2, 4);
    const day = icNo.slice(4, 6);
    return `${year}-${month}-${day}`;
};

const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export default AddApplicant;