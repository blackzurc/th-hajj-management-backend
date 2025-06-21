// src/Supervisor/SVLogin.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SVLogin() {
  const [supervisorId, setSupervisorId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/sv-login", { // Adjust URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supervisor_id: supervisorId,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Supervisor login successful:", data.supervisor);
        localStorage.setItem('supervisorId', data.supervisor.supervisor_id);
        localStorage.setItem('supervisorName', data.supervisor.name);
        localStorage.setItem('userRole', 'supervisor'); // Set the user role
        navigate("/sv/dashboard"); // Redirect to supervisor dashboard
      } else {
        alert("❌ Invalid Supervisor ID or Password");
      }
    } catch (error) {
      console.error("Supervisor login error:", error);
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
          Supervisor Login
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Supervisor ID
          </label>
          <input
            type="text"
            className="w-full border border-blue-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
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