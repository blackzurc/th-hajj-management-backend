// ✅ Applyhajj.js — only navigation, no file upload
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useNavigate } from "react-router-dom";

const Applyhajj = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const th_acc_no = localStorage.getItem("th_acc_no");

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

  const handleNext = () => {
    navigate("/add-applicant");
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
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            Please Check Your Personal Information
          </h2>

          <div className="space-y-4 bg-white p-6 rounded shadow-md">
            <div>
              <label className="block text-gray-700">IC Number</label>
              <input type="text" className="w-full border p-2 rounded" value={userData?.ic_no || ""} readOnly />
            </div>
            <div>
              <label className="block text-gray-700">Birth Date</label>
              <input type="date" className="w-full border p-2 rounded" value={userData?.birth_date || ""} readOnly />
            </div>
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input type="text" className="w-full border p-2 rounded" value={userData?.full_name || ""} readOnly />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input type="email" className="w-full border p-2 rounded" value={userData?.email || ""} readOnly />
            </div>
            <div>
              <label className="block text-gray-700">Home Address</label>
              <textarea className="w-full border p-2 rounded" value={userData?.address || ""} readOnly />
            </div>
            <div>
              <label className="block text-gray-700">Phone Number</label>
              <input type="tel" className="w-full border p-2 rounded" value={userData?.phone_number || ""} readOnly />
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applyhajj;
