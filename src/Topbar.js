import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("th_acc_no");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="w-[calc(100%-16rem)] h-16 bg-gradient-to-r from-green-600 to-amber-500 text-white flex items-center justify-between px-6 fixed top-0 left-64 z-30 shadow-md">
      <div className="flex items-center">
        <Link to="/dashboard" className="text-2xl font-bold hover:underline">
          Tabung Haji
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-white text-green-700 px-4 py-1 rounded hover:bg-gray-100 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Topbar;