// ✅ Updated Addapplicant.js — handles file upload and registration on submit
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AddApplicant = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nationalIdFile, setNationalIdFile] = useState(null);
  const [birthCertificateFile, setBirthCertificateFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const th_acc_no = localStorage.getItem("th_acc_no");
  const userId = localStorage.getItem("userId");

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

  const handleAddApplicant = async () => {
    if (!nationalIdFile || !birthCertificateFile) {
      alert("Please upload both National ID and Birth Certificate files.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("national_id", nationalIdFile);
    formData.append("birth_certificate", birthCertificateFile);
    formData.append("user_id", userId);

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
        body: JSON.stringify({ user_id: userId }),
      });

      if (hajjResponse.ok) {
        alert("Applicant added and documents uploaded successfully.");
      } else {
        throw new Error("Hajj registration failed.");
      }
    } catch (error) {
      console.error("Add applicant error:", error);
      alert(error.message || "Server error during applicant submission.");
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

            <div className="flex justify-between mt-6">
              <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleAddApplicant}
                disabled={uploading || !nationalIdFile || !birthCertificateFile}
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
