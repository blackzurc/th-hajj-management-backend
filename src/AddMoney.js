import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Link, useNavigate } from "react-router-dom";

const AddMoney = () => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const navigate = useNavigate();
  const th_acc_no = localStorage.getItem("th_acc_no");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Please enter a valid positive amount.");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/hajj/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          th_acc_no: th_acc_no,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }
      
      setMessageType("success");
      setMessage(`Successfully deposited RM ${amount}. Your new balance is RM ${data.newBalance}.`);
      setAmount(""); // Clear input on success

      // Optional: Redirect back to dashboard after a short delay
      setTimeout(() => navigate("/dashboard"), 3000);

    } catch (err) {
      setMessageType("error");
      setMessage(err.message || "Failed to process deposit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />
        <div className="p-8 bg-gray-100 min-h-screen mt-20">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
              Add Funds to Your Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Deposit Amount (RM)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 500.00"
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {isLoading ? "Processing..." : "Deposit Now"}
                </button>
              </div>
            </form>

            {message && (
              <div
                className={`mt-4 p-4 rounded-md text-sm ${
                  messageType === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message}
              </div>
            )}
            <div className="mt-4 text-center">
                <Link to="/dashboard" className="text-sm text-green-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoney;