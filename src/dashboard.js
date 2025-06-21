import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const th_acc_no = localStorage.getItem("th_acc_no");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [dashboardRes, transactionRes] = await Promise.all([
          fetch(`http://localhost:5000/api/hajj/dashboard/${th_acc_no}`),
          fetch(`http://localhost:5000/api/hajj/transactions/${th_acc_no}`)
        ]);

        if (!dashboardRes.ok || !transactionRes.ok) {
          throw new Error('Failed to fetch one or more dashboard resources.');
        }

        const dashboardData = await dashboardRes.json();
        const transactionData = await transactionRes.json();

        setUserData(dashboardData);
        setTransactions(transactionData.transactions || []);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [th_acc_no]);

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Topbar />
          <div className="p-8 bg-gray-100 min-h-screen">
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Topbar />
          <div className="p-8 bg-gray-100 min-h-screen">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Topbar />
          <div className="p-8 bg-gray-100 min-h-screen">
            <p>No user data available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />
        <div className="p-8 bg-gray-100 min-h-screen mt-20">
          <div className="bg-white p-6 rounded shadow-md space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-green-700 mb-6">
                Welcome back, {userData?.full_name}!
              </h2>
              <h3 className="text-lg font-semibold">Hajj Status</h3>
              <p>
                {userData.has_performed_hajj
                  ? "You have already performed Hajj."
                  : "You have not yet performed Hajj."}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">TH Account Balance</h3>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-xl">RM {userData.balance}</p>
                <Link
                  to="/add-money"
                  className="bg-green-600 text-white px-4 py-1 rounded-md shadow hover:bg-green-700 transition-colors text-sm"
                >
                  Add Funds
                </Link>
              </div>
            </div>

            {userData.hajj_year ? (
              <div>
                <h3 className="text-lg font-semibold">Your Hajj Year</h3>
                <p>{userData.hajj_year}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold">Hajj Offer</h3>
                <p>You currently do not have a Hajj offer.</p>
              </div>
            )}

            {transactions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Amount (RM)</th>
                      <th className="border p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.transaction_id}>
                        <td className="border p-2">{new Date(tx.transaction_date).toLocaleString()}</td>
                        <td className="border p-2">{parseFloat(tx.amount).toFixed(2)}</td>
                        <td className="border p-2">{tx.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
