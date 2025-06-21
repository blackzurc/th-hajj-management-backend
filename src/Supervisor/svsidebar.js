// src/Supervisor/SVSidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const SVSidebar = () => {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-green-600 to-green-800 text-white fixed top-0 left-0 z-20">
      {/* Logo Container */}
      <div className="p-6 flex justify-center">
        <img src="/tabung_haji_logo.png" alt="Tabung Haji Logo" className="h-20" />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-4 p-6">
        <Link to="/sv/detailed-statistics" className="hover:underline hover:bg-green-700 p-2 rounded">
          Detailed Statistics
        </Link>
        {/* Add other supervisor links here */}
      </nav>
    </div>
  );
};

export default SVSidebar;