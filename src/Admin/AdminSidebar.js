// src/Admin/AdminSidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-600 to-blue-800 text-white fixed top-0 left-0 z-20">
      {/* Logo Container */}
      <div className="p-6 flex justify-center">
        <img src="/tabung_haji_logo.png" alt="Tabung Haji Logo" className="h-20" />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-4 p-6">
        <Link to="/admin/hajj-applications" className="hover:underline hover:bg-blue-700 p-2 rounded">
          Hajj Applications
        </Link>
        <Link to="/admin/hajj-offers" className="hover:underline hover:bg-blue-700 p-2 rounded">
          Hajj Offers
        </Link>
        <Link to="/admin/hajj-appeals" className="hover:underline hover:bg-blue-700 p-2 rounded">
          Hajj Appeals
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;