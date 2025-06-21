// src/Admin/AdminDashboard.js
import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';

Chart.register(CategoryScale);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [hajjQuotaData, setHajjQuotaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsUrl = 'http://localhost:5000/api/admin/dashboard-stats';
        const quotaUrl = 'http://localhost:5000/api/admin/hajj-quota';

        const [statsResponse, quotaResponse] = await Promise.all([
          fetch(statsUrl),
          fetch(quotaUrl)
        ]);

        const statsData = await statsResponse.json();
        const quotaData = await quotaResponse.json();

        if (statsData.success) setDashboardData(statsData.data);
        if (quotaData.success) setHajjQuotaData(quotaData.data);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <AdminTopbar />
          <div className="p-8 bg-gray-100 min-h-screen mt-16">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600">Loading dashboard data...</p>
              <div className="mt-4 bg-gray-200 rounded h-2">
                <div className="bg-blue-500 h-2 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <AdminTopbar />
          <div className="p-8 bg-gray-100 min-h-screen mt-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-red-800 font-bold mb-2">Dashboard Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <AdminTopbar />
          <div className="p-8 bg-gray-100 min-h-screen mt-16">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">No dashboard data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const registrationTrendsData = {
    labels: ['This Month', 'This Year'],
    datasets: [
      {
        label: 'New Registrations',
        data: [
          dashboardData.newRegistrationsThisMonth,
          dashboardData.newRegistrationsThisYear
        ],
        backgroundColor: ['#36A2EB', '#FFCE56'],
        borderColor: ['#36A2EB', '#FFCE56'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminTopbar />
        <div className="p-8 bg-gray-100 min-h-screen mt-16">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Applicants</h2>
              <p className="text-3xl font-bold text-blue-600">
                {dashboardData.totalRegisteredApplicants}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700">New Registrations (This Month)</h2>
              <p className="text-3xl font-bold text-green-600">
                {dashboardData.newRegistrationsThisMonth}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700">New Registrations (This Year)</h2>
              <p className="text-3xl font-bold text-purple-600">
                {dashboardData.newRegistrationsThisYear}
              </p>
            </div>
          </div>

          {/* Registration Trends Chart */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Registration Trends</h2>
            <div className="h-64">
              <Bar
                data={registrationTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
{/* Hajj Quota Table */}
<div className="bg-white shadow rounded-lg p-6 mt-6">
  <h2 className="text-xl font-semibold mb-4">Hajj Quota Summary</h2>
  {hajjQuotaData.length > 0 ? (
    <table className="w-full text-left border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border">Year</th>
          <th className="p-2 border">Total Slots</th>
          <th className="p-2 border">Filled Slots</th>
          <th className="p-2 border">Reserved Slots</th>
        </tr>
      </thead>
      <tbody>
        {hajjQuotaData.map((row, index) => (
          <tr key={index} className="border-t">
            <td className="p-2 border">{row.year}</td>
            <td className="p-2 border">{row.total_slots}</td>
            <td className="p-2 border">{row.filled_slots}</td>
            <td className="p-2 border">{row.reserved_slots}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No quota data available.</p>
  )}
</div>


        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
