// src/Profile.js
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Profile = () => {
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
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700">Full Name</label>
                <input type="text" className="w-full border p-2 rounded" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input type="email" className="w-full border p-2 rounded" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-gray-700">Phone Number</label>
                <input type="tel" className="w-full border p-2 rounded" placeholder="0123456789" />
              </div>
              <div>
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
