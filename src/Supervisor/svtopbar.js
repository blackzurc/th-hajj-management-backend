// src/Supervisor/SVTopbar.js
import React from "react";
import { useNavigate } from "react-router-dom";

const SVTopbar = () => {
  const navigate = useNavigate();
  const supervisorName = localStorage.getItem('supervisorName');

  const handleLogout = () => {
    localStorage.removeItem("supervisorId");
    localStorage.removeItem("supervisorName");
    localStorage.removeItem("userRole"); // Remove the user role on logout
    navigate("/sv/login");
  };

  return (
    <div className="w-[calc(100%-16rem)] h-16 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-between px-6 fixed top-0 left-64 z-30 shadow-md">
      <div className="flex items-center">
        <span className="text-2xl font-bold">
          Supervisor Panel
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-medium">Welcome, {supervisorName}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-green-700 px-4 py-1 rounded hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SVTopbar;