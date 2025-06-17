// HajjAppeal.js
import React, { useState, useRef } from 'react';
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

    //Fetch from localstorage
    const userId = localStorage.getItem("userId");
    const registrationId = localStorage.getItem("registrationId");
    const fullName = localStorage.getItem("fullName");
    const icNo = localStorage.getItem("icNo");

    const isMahramVerifiedRef = useRef(false);

    const handleMahramCheck = async () => {
        try {
            setLoading(true);
            const mahramCheckResponse = await fetch('http://192.168.0.100:5000/thApi/checkMahram', {
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
                setIsMahramVerified(true); // Set verification status to true
                isMahramVerifiedRef.current = true;
                // **NEW: Fetch Mahram's user ID from your backend**
                try {
                    const userResponse = await fetch(`http://localhost:5000/api/user/icno/${mahramIcNo}`); // Replace with your API endpoint
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
                setIsMahramVerified(false); // Set verification status to false
                isMahramVerifiedRef.current = false;
                setRelatedUserId(null);
            }
        } catch (error) {
            console.error('Mahram check error:', error);
            Swal.fire('Error', 'Failed to verify Mahram. Please try again later.', 'error');
            setRelationshipType('');
            setIsMahramVerified(false); // Ensure it's false on error too
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
            setRelatedUserId(null); // Reset relatedUserId
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

        if (appealType === 'Mahram') 
            {
            if (!isMahramVerifiedRef.current || !relatedUserId) 
                {
                Swal.fire('Warning', "Please verify the Mahram before submitting.", 'warning');
                setLoading(false);
                return;
                 }

            formData.append('related_user_id', relatedUserId.toString());
            formData.append('relationship_type', relationshipType);

            if (consentLetter) 
            {
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

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Topbar />
                <div className="p-8 bg-gray-100 min-h-screen">
                    <h2 className="text-2xl font-bold text-green-700 mb-6">Hajj Appeal Submission</h2>

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
                                <option value="Mahram">Mahram</option>
                                <option value="Sick">Sick</option>
                                <option value="Old">Old (75+)</option>
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
                </div>
            </div>
        </div>
    );
};

export default HajjAppeal;