import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";


export default function Login() {
  const [accountNo, setAccountNo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          th_acc_no: accountNo,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Login successful:", data.user);

        // Store the userId and th_acc_no in local storage
        localStorage.setItem('userId', data.user.user_id);   // Store the user ID
        localStorage.setItem('th_acc_no', data.user.th_acc_no); // Store the TH account number
        localStorage.setItem('fullName', data.user.full_name); // Store full name
        localStorage.setItem('icNo', data.user.ic_no); // Store IC number

        navigate("/dashboard");  // Redirect to dashboard
      } else {
        alert("❌ Invalid TH Account No or Password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border border-green-200"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-green-700">
          Tabung Haji Login
        </h2>

        {/* TH Account Number */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            TH account no
          </label>
          <input
            type="text"
            className="w-full border border-green-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-green-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Forgot password + Register */}
        <div className="flex justify-between text-sm mb-4">
          <a href="#" className="text-green-700 hover:underline font-medium">
            Forgot Password?
          </a>
          <Link to="/register" className="text-green-700 hover:underline font-medium">
            Register
          </Link>

        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}