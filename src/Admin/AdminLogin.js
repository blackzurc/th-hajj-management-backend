import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_id: adminId,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Admin login successful:", data.admin);
        localStorage.setItem('adminId', data.admin.admin_id);
        localStorage.setItem('adminName', data.admin.name);
        navigate("/admin/dashboard"); // Redirect to admin dashboard
      } else {
        alert("❌ Invalid Admin ID or Password");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border border-blue-200"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
          Admin Login
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Admin ID
          </label>
          <input
            type="text"
            className="w-full border border-blue-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-blue-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}