import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [form, setForm] = useState({
        fullName: "",
        icNo: "",
        address: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [nameValid, setNameValid] = useState(true);
    const [icValid, setIcValid] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic frontend validation (you should also have backend validation)
    if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    // Validate required fields
    if (!form.fullName || !form.icNo || !form.email || !form.password || !form.address) {
        setError("Please fill in all required fields.");
        return;
    }

    try {
        setMessage('')
        setError('')
        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                full_name: form.fullName,
                ic_no: form.icNo,
                address: form.address,
                email: form.email,
                password: form.password,
            }),
        });

        const data = await response.json();

        if (data.success) {
            setMessage("Registration successful! Please login.");
            navigate("/"); // Redirect to login page
        } else {
            setError(data.message || "Registration failed.");
        }
    } catch (error) {
        console.error("Error:", error);
        setError("Server error.");
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

                {/* Success and Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                <label className="block mb-2">Full Name (as in MyKad)</label>
                <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
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
    placeholder="e.g., 850515127677"
/>
               <label className="block mb-2">Address</label>
                 <textarea
                    name="address"
                    value={form.address}
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

export default Register;