// HajjAppeal.js
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const HajjAppeal = () => {
    const [appealType, setAppealType] = useState('');
    const [mahramFullName, setMahramFullName] = useState('');
    const [mahramIcNo, setMahramIcNo] = useState('');
    const [mahramThAccNo, setMahramThAccNo] = useState('');
    const [relationshipType, setRelationshipType] = useState('');
    const [consentLetter, setConsentLetter] = useState(null);
    const [appealLetter, setAppealLetter] = useState(null);
    const [isMahramVerified, setIsMahramVerified] = useState(false);
    const [relatedUserId, setRelatedUserId] = useState(null);

    const [medicalCondition, setMedicalCondition] = useState('');
    const [medicalCertificate, setMedicalCertificate] = useState(null);
    const [otherConditionDescription, setOtherConditionDescription] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [appealStatus, setAppealStatus] = useState(null);
    const [appealDetails, setAppealDetails] = useState(null);

    // New state for reupload requirements
    const [reuploadRequirements, setReuploadRequirements] = useState({
        appealLetter: false,
        consentLetter: false,
        medicalCertificate: false
    });

    // New states for reupload functionality
    const [showReuploadForm, setShowReuploadForm] = useState(false);
    const [reuploadFiles, setReuploadFiles] = useState({
        appealLetter: null,
        consentLetter: null,
        medicalCertificate: null
    });

    //Fetch from localstorage
    const userId = localStorage.getItem("userId");
    const registrationId = localStorage.getItem("registrationId");
    const fullName = localStorage.getItem("fullName");
    const icNo = localStorage.getItem("icNo");
    const thAccNo = localStorage.getItem("thAccNo");
    //const gender = localStorage.getItem("gender"); NO LONGER NEEDED
    //const birthDate = localStorage.getItem("birthDate"); NO LONGER NEEDED

    const isMahramVerifiedRef = useRef(false);

    //Extract Gender and Age Function
    const getGenderFromIC = (icNo) => {
        const lastDigit = parseInt(icNo.slice(-1));
        return lastDigit % 2 === 0 ? 'Female' : 'Male';
    };

    const getBirthDateFromIC = (icNo) => {
        const year = "20"+icNo.slice(0, 2);
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

    const gender = getGenderFromIC(icNo);
    const birthDate = getBirthDateFromIC(icNo);
    const age = calculateAge(birthDate);

    const handleMahramCheck = async () => {
        try {
            setLoading(true);
            const mahramCheckResponse = await fetch('http://20.198.176.110:5000/thApi/checkMahram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullname1: fullName,
                    icno1: icNo,
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
                setIsMahramVerified(true);
                isMahramVerifiedRef.current = true;

                try {
                    const userResponse = await fetch(`http://localhost:5000/api/user/icno/${mahramIcNo}`);
                    if (!userResponse.ok) {
                        throw new Error("Failed to fetch Mahram's user ID");
                    }
                    const userData = await userResponse.json();
                    setRelatedUserId(userData.user_id);
                    console.log("Fetched Mahram user ID:", userData.user_id);
                } catch (userError) {
                    console.error("Error fetching Mahram user ID:", userError);
                    Swal.fire('Error', 'Failed to fetch Mahram user ID. Please try again.', 'error');
                    setRelatedUserId(null);
                }
            } else {
                Swal.fire('Error', mahramCheckResult.message || 'Mahram verification failed', 'error');
                setRelationshipType('');
                setIsMahramVerified(false);
                isMahramVerifiedRef.current = false;
                setRelatedUserId(null);
            }
        } catch (error) {
            console.error('Mahram check error:', error);
            Swal.fire('Error', 'Failed to verify Mahram. Please try again later.', 'error');
            setRelationshipType('');
            setIsMahramVerified(false);
            isMahramVerifiedRef.current = false;
            setRelatedUserId(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAppealTypeChange = (e) => {
        const newAppealType = e.target.value;
        setAppealType(newAppealType);

        if (newAppealType === 'Old' || newAppealType === 'Sick') {
            setRelatedUserId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('registration_id', registrationId);
        formData.append('appeal_type', appealType);

        if (appealLetter) {
            formData.append('appealLetter', appealLetter);
        }

        if (appealType === 'Mahram') {
            if (!isMahramVerifiedRef.current || !relatedUserId) {
                Swal.fire('Warning', "Please verify the Mahram before submitting.", 'warning');
                setLoading(false);
                return;
            }

            formData.append('related_user_id', relatedUserId.toString());
            formData.append('relationship_type', relationshipType);

            if (consentLetter) {
                formData.append('consentLetter', consentLetter);
            }
        }

        if (appealType === 'Sick' && medicalCertificate) {
            formData.append('medicalCertificate', medicalCertificate);
            formData.append('medical_condition', medicalCondition);
            if (medicalCondition === 'Others') {
                formData.append('other_condition_description', otherConditionDescription);
            }
        }

        console.log('formData contents:');
        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        try {
            const response = await fetch('http://localhost:5000/api/hajj/submit-appeal', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message);
                Swal.fire(
                    'Success',
                    "Appeal submitted successfully.",
                    'success'
                );
                // Reset form fields
                setAppealType('');
                setMahramFullName('');
                setMahramIcNo('');
                setMahramThAccNo('');
                setRelationshipType('');
                setConsentLetter(null);
                setAppealLetter(null);
                setIsMahramVerified(false);
                setMedicalCondition('');
                setMedicalCertificate(null);
                setOtherConditionDescription('');
                setRelatedUserId(null);
                setSubmissionSuccess(true);
                fetchAppealStatus();
            } else {
                setError(data.message || 'Appeal submission failed.');
                Swal.fire('Error', data.message || "Server error during appeal submission.", 'error');
            }
        } catch (err) {
            console.error('Error submitting appeal:', err);
            setError('Failed to submit appeal. Please try again later.');
            Swal.fire('Error', "Server error during appeal submission.", 'error');
        } finally {
            setLoading(false);
        }
    };

  const fetchAppealStatus = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/hajj/appeal-details/${userId}`);
            const data = await response.json();
            console.log("get data appeal:",data)

            if (response.ok && data.success) {
                setAppealStatus(data.appeal.status);
                setAppealDetails(data.appeal);

                // Set reupload requirements using the actual response
                setReuploadRequirements({
                    appealLetter: data.appeal.appeal_letter_reupload_required || false,
                    consentLetter: data.appeal.consent_letter_reupload_required || false,
                    medicalCertificate: data.appeal.medical_certificate_reupload_required || false
                });
            } else {
                setError(data.message || 'Failed to fetch appeal status.');
            }
        } catch (err) {
            console.error('Error fetching appeal status:', err);
            setError('Failed to fetch appeal status. Please try again later.');
        }
    };
    // Handle document reupload
    const handleReupload = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('appeal_id', appealDetails.appeal_id);

        // Add files to formData. Only append the files that are requested.
        if (reuploadRequirements.appealLetter && reuploadFiles.appealLetter) {
            formData.append('appealLetter', reuploadFiles.appealLetter);
        }
        if (reuploadRequirements.consentLetter && reuploadFiles.consentLetter) {
            formData.append('consentLetter', reuploadFiles.consentLetter);
        }
        if (reuploadRequirements.medicalCertificate && reuploadFiles.medicalCertificate) {
            formData.append('medicalCertificate', reuploadFiles.medicalCertificate);
        }

        console.log('Reupload Requirements:');
        console.log(reuploadRequirements);
        console.log('Reupload Files:');
        console.log(reuploadFiles);

        try {
            const response = await fetch('http://localhost:5000/api/hajj/reupload-appeal-documents', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Success', 'Documents re-uploaded successfully.', 'success');
                setShowReuploadForm(false);
                setReuploadFiles({
                    appealLetter: null,
                    consentLetter: null,
                    medicalCertificate: null
                });
                fetchAppealStatus(); // Refresh appeal status
            } else {
                Swal.fire('Error', data.message || 'Failed to re-upload documents.', 'error');
            }
        } catch (err) {
            console.error('Error re-uploading documents:', err);
            Swal.fire('Error', 'Failed to re-upload documents. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReuploadFileChange = (fileType, file) => {
        setReuploadFiles(prev => ({
            ...prev,
            [fileType]: file
        }));
    };

    // Check for existing appeal on component mount
    useEffect(() => {
        fetchAppealStatus();
    }, [userId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'text-yellow-600';
            case 'Approved':
                return 'text-green-600';
            case 'Rejected':
                return 'text-red-600';
            case 'Reupload':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'Pending':
                return 'Your appeal is being reviewed. Please wait for admin approval.';
            case 'Approved':
                return 'Congratulations! Your appeal has been approved.';
            case 'Rejected':
                return 'Your appeal has been rejected. Please contact admin for more information.';
            case 'Reupload':
                return 'Please reupload the required documents as requested by the admin.';
            default:
                return 'Appeal status unknown.';
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Topbar />
                <div className="p-8 bg-gray-100 min-h-screen">
                    <h2 className="text-2xl font-bold text-green-700 mb-6">Hajj Appeal Submission</h2>

                    {/* Show appeal status if user has submitted an appeal */}
                    {(submissionSuccess || appealDetails) && (
                        <div className="bg-white p-6 rounded shadow-md space-y-4 mb-6">
                            <div className="border-l-4 border-green-500 pl-4">
                                <h3 className="text-lg font-semibold text-green-700">Appeal Submitted Successfully</h3>
                                <p className="text-gray-600">You have successfully submitted your appeal.</p>
                            </div>

                            {appealDetails && (
                                <div className="mt-4 p-4 bg-gray-50 rounded">
                                    <h4 className="font-semibold mb-2">Appeal Details:</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Appeal Type:</span>
                                            <span className="ml-2">{appealDetails.appeal_type}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Submitted Date:</span>
                                            <span className="ml-2">{new Date(appealDetails.submitted_date).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Status:</span>
                                            <span className={`ml-2 font-semibold ${getStatusColor(appealDetails.status)}`}>
                                                {appealDetails.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 p-3 bg-blue-50 rounded">
                                        <p className={`text-sm ${getStatusColor(appealDetails.status)}`}>
                                            {getStatusMessage(appealDetails.status)}
                                        </p>
                                    </div>

                                    {appealDetails.justification && (
                                        <div className="mt-3">
                                            <span className="font-medium">Admin Comments:</span>
                                            <p className="text-sm text-gray-700 mt-1 p-2 bg-yellow-50 rounded">
                                                {appealDetails.justification}
                                            </p>
                                        </div>
                                    )}

                                    {/* Show reupload button if status is Reupload */}
                                    {appealDetails.status === 'Reupload' && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => setShowReuploadForm(!showReuploadForm)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                            >
                                                {showReuploadForm ? 'Cancel Reupload' : 'Reupload Documents'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reupload Form */}
                    {showReuploadForm && appealDetails && (
                        <div className="bg-white p-6 rounded shadow-md space-y-4 mb-6">
                            <h3 className="text-xl font-semibold text-blue-700">Reupload Documents</h3>
                            <p className="text-gray-600">Please reupload the required documents as requested by the admin.</p>

                            <form onSubmit={handleReupload} className="space-y-4">
                                {reuploadRequirements.appealLetter && (
                                    <div>
                                        <label className="block text-gray-700">Appeal Letter</label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleReuploadFileChange('appealLetter', e.target.files[0])}
                                            required={reuploadRequirements.appealLetter}
                                        />
                                        {reuploadFiles.appealLetter && (
                                            <p className="text-sm text-green-600">Selected: {reuploadFiles.appealLetter.name}</p>
                                        )}
                                    </div>
                                )}

                                {reuploadRequirements.consentLetter && appealDetails.appeal_type === 'Mahram' && (
                                    <div>
                                        <label className="block text-gray-700">Consent Letter</label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleReuploadFileChange('consentLetter', e.target.files[0])}
                                            required={reuploadRequirements.consentLetter}
                                        />
                                        {reuploadFiles.consentLetter && (
                                            <p className="text-sm text-green-600">Selected: {reuploadFiles.consentLetter.name}</p>
                                        )}
                                    </div>
                                )}

                                {reuploadRequirements.medicalCertificate && appealDetails.appeal_type === 'Sick' && (
                                    <div>
                                        <label className="block text-gray-700">Medical Certificate</label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleReuploadFileChange('medicalCertificate', e.target.files[0])}
                                            required={reuploadRequirements.medicalCertificate}
                                        />
                                        {reuploadFiles.medicalCertificate && (
                                            <p className="text-sm text-green-600">Selected: {reuploadFiles.medicalCertificate.name}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowReuploadForm(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        disabled={loading}
                                    >
                                        {loading ? 'Uploading...' : 'Upload Documents'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {/* Original Appeal Form - Only show if no appeal submitted or appeal is rejected */}
                    {!appealDetails || appealDetails.status === 'Rejected' ? (
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4">
                            {/* Appeal Type Selection */}
                            <div>
                                <label className="block text-gray-700">Appeal Type:</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    value={appealType}
                                    onChange={handleAppealTypeChange}
                                >
                                    <option value="">Select Appeal Type</option>
                                    <option value="Mahram" disabled={getGenderFromIC(icNo) !== 'Female'}>
                                        Mahram {getGenderFromIC(icNo) !== 'Female' ? '(Only for Females)' : ''}
                                    </option>
                                    <option value="Sick">Sick</option>
                                    <option value="Old" disabled={calculateAge(getBirthDateFromIC(icNo)) < 60}>
                                        Old {calculateAge(getBirthDateFromIC(icNo)) < 60 ? '(Only for 60+)' : ''}
                                    </option>
                                </select>
                            </div>

                            {/* Mahram Appeal Section */}
                            {appealType === 'Mahram' && (
                                <div className="border p-4 rounded">
                                    <h3 className="text-xl font-semibold mb-3">Mahram Appeal</h3>

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
                                        <button
                                            type="button"
                                            onClick={handleMahramCheck}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            disabled={loading || isMahramVerified}
                                        >
                                            {loading ? 'Checking...' : 'Check Mahram'}
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
                                        <label className="block text-gray-700">Consent Letter *</label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setConsentLetter(e.target.files[0])}
                                            required
                                        />
                                        {consentLetter && <p>Selected File: {consentLetter.name}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Sick Appeal Section */}
                            {appealType === 'Sick' && (
                                <div className="border p-4 rounded">
                                    <h3 className="text-xl font-semibold mb-3">Sick Appeal</h3>

                                    <div>
                                        <label className="block text-gray-700">Medical Condition</label>
                                        <select
                                            className="w-full border p-2 rounded"
                                            value={medicalCondition}
                                            onChange={(e) => setMedicalCondition(e.target.value)}
                                        >
                                            <option value="">Select Condition</option>
                                            <option value="Cancer">Cancer</option>
                                            <option value="Diabetes">Diabetes (Kencing Manis)</option>
                                            <option value="Hypertension">Hypertension (Darah Tinggi)</option>
                                            <option value="Heart Disease">Heart Disease</option>
                                            <option value="Kidney Disease">Kidney Disease</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>

                                    {medicalCondition === 'Others' && (
                                        <div>
                                            <label className="block text-gray-700">Describe Condition</label>
                                            <textarea
                                                className="w-full border p-2 rounded"
                                                value={otherConditionDescription}
                                                onChange={(e) => setOtherConditionDescription(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-gray-700">Medical Certificate</label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setMedicalCertificate(e.target.files[0])}
                                        />
                                        {medicalCertificate && <p>Selected File: {medicalCertificate.name}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Old Appeal Section */}
                            {appealType === 'Old' && (
                                <div className="border p-4 rounded">
                                    <h3 className="text-xl font-semibold mb-3">Old Appeal</h3>
                                </div>
                            )}

                            {/* Common Appeal Letter */}
                            <div>
                                <label className="block text-gray-700">Appeal Letter *</label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setAppealLetter(e.target.files[0])}
                                    required
                                />
                                {appealLetter && <p>Selected File: {appealLetter.name}</p>}
                            </div>

                            {/* Submit Button and Messages */}
                            <div className="flex justify-between mt-6">
                                <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit Appeal'}
                                </button>
                            </div>

                            {error && <p className="text-red-500">{error}</p>}
                            {successMessage && <p className="text-green-500">{successMessage}</p>}
                        </form>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default HajjAppeal;