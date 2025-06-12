// src/Admin/AdminDashboard.js
import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const AdminDashboard = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminTopbar />
        <div className="p-8 bg-gray-100 min-h-screen mt-16">
          {/* Admin dashboard content goes here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;