import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    birthDate: "",
    icNo: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const navigate = useNavigate(); // Add this line

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.fullName,
          birth_date: form.birthDate,
          ic_no: form.icNo,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Registration successful! Please login.");
        navigate("/"); // Add this line (redirect to login page)
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
          Register for Tabung Haji
        </h2>

        <label className="block mb-2">Full Name (as in MyKad)</label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2">Birth Date</label>
        <input
          type="date"
          name="birthDate"
          value={form.birthDate}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2">IC Number</label>
        <input
          type="text"
          name="icNo"
          value={form.icNo}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-6"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}