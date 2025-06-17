// src/Profile.js
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // For success feedback

  const th_acc_no = localStorage.getItem("th_acc_no");
  const navigate = useNavigate();  // Initialize useNavigate

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');  // Clear any previous success message
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/user/update/${th_acc_no}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          address: userData.address,
          phone_number: userData.phone_number,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Try to parse error message from the server
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`); // Use message from server if available
      }

      setSuccessMessage('Profile updated successfully!');  // Set success message
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || "Failed to update profile.");  // Set error message
    }
  };

  const handleBack = () => {
    navigate('/apply-hajj');  // Navigate back to Applyhajj
  };


  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-gray-100 pl-64 pt-16">
          <Topbar />
          <div className="p-8">
            <h2 className="text-3xl font-bold text-green-700">User Profile</h2>
            <div className="text-gray-600">Loading profile data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-gray-100 pl-64 pt-16">
          <Topbar />
          <div className="p-8">
            <h2 className="text-3xl font-bold text-green-700">User Profile</h2>
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-100 pl-64 pt-16">
        <Topbar />
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-green-700">User Profile</h2>
            <div className="text-gray-600">User</div>
          </div>

          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-xl font-semibold mb-4">Account Information</h3>
            {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700">IC Number</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded bg-gray-100 text-gray-500"
                  placeholder="IC Number"
                  value={userData?.ic_no || ""}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700">Birth Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded bg-gray-100 text-gray-500"
                  placeholder="Birth Date"
                  value={userData?.birth_date || ""}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700">Full Name</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded bg-gray-100 text-gray-500"
                  placeholder="Full Name"
                  value={userData?.full_name || ""}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full border p-2 rounded"
                  placeholder="user@example.com"
                  value={userData?.email || ""}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700">Home Address</label>
                <textarea
                  className="w-full border p-2 rounded"
                  placeholder="Home Address"
                  value={userData?.address || ""}
                  onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border p-2 rounded"
                  placeholder="0123456789"
                  value={userData?.phone_number || ""}
                  onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                />
              </div>
              {/* Button Container */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;