// src/Admin/AdminTopbar.js
import React from "react";
import { useNavigate, Link } from "react-router-dom";

const AdminTopbar = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName');

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    navigate("/admin/login");
  };

  return (
    <div className="w-[calc(100%-16rem)] h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between px-6 fixed top-0 left-64 z-30 shadow-md">
      <div className="flex items-center">
        <Link to="/admin/dashboard" className="text-2xl font-bold hover:underline">
          Admin Panel
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-medium">Welcome, {adminName}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-700 px-4 py-1 rounded hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminTopbar;
