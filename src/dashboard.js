import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const th_acc_no = localStorage.getItem("th_acc_no");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Change the API call
        const response = await fetch(
          `http://localhost:5000/api/hajj/dashboard/${th_acc_no}` // Modified from /api/dashboard to /api/hajj/dashboard
        );

        console.log("API response:", response);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
        console.log("Dashboard userData:", data); //Inspect `data` which is the value you are getting

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
  console.log("This code must run");
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />
        <div className="p-8 bg-gray-100 min-h-screen mt-20"> {/*Increase the margin to pt 20*/}
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
              <p>RM {userData.balance}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;