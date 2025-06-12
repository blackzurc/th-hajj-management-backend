// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentIcon,       // For Apply Hajj
  CheckCircleIcon,  // For Application Status
  EyeIcon,            // For View Offer
  HandRaisedIcon, // For Appeal (replaced ExclamationIcon)
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-green-600 to-amber-500 text-white fixed top-0 left-0 z-20">
      {/* Logo Container */}
      <div className="p-6 flex justify-center">
        <img src="/tabung_haji_logo.png" alt="Tabung Haji Logo" className="h-20" />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-4 p-6">
        <Link to="/apply-hajj" className="flex items-center hover:underline">
          <DocumentIcon className="h-5 w-5 mr-2" /> Apply Hajj
        </Link>
        <Link to="/application-status" className="flex items-center hover:underline">
          <CheckCircleIcon className="h-5 w-5 mr-2" /> Hajj Application Status
        </Link>
        <Link to="/view-offer" className="flex items-center hover:underline">
          <EyeIcon className="h-5 w-5 mr-2" /> View Hajj Offer
        </Link>
        <Link to="/appeal" className="flex items-center hover:underline">
          <HandRaisedIcon className="h-5 w-5 mr-2" /> Hajj Appeal
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;