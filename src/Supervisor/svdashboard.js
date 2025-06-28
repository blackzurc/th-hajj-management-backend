import React, { useState, useEffect } from 'react';
import SVSidebar from './svsidebar';
import SVTopbar from './svtopbar';
import { Pie, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
Chart.register(CategoryScale);

const SVDashboard = () => {
  const [demographicsData, setDemographicsData] = useState(null);
  const [offerStatsData, setOfferStatsData] = useState(null);
  const [appealStatsData, setAppealStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithErrorHandling = async (url) => {
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Non-JSON response from ${url}: ${text.substring(0, 200)}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [demographics, offerStats, appealStats] = await Promise.all([
          fetchWithErrorHandling('http://localhost:5000/api/supervisor/applicant-demographics'),
          fetchWithErrorHandling('http://localhost:5000/api/supervisor/offer-statistics'),
          fetchWithErrorHandling('http://localhost:5000/api/supervisor/appeal-statistics')
        ]);

        setDemographicsData(demographics.data);
        setOfferStatsData(offerStats.data);
        setAppealStatsData(appealStats.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const appealData = appealStatsData?.appealSuccessRate && appealStatsData.appealSuccessRate[0];

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="flex">
      <SVSidebar />
      <div className="flex-1 ml-64">
        <SVTopbar />
        <div className="p-8 bg-gray-100 min-h-screen mt-16">
          <h1 className="text-3xl font-bold mb-6">Supervisor Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {demographicsData?.genderDistribution && (
              <div className="bg-white p-6 rounded-lg shadow" style={{ height: '400px' }}>
                <h2 className="text-xl font-semibold mb-4">Gender Distribution</h2>
                <Pie
                  data={{
                    labels: demographicsData.genderDistribution.map(g => g.gender),
                    datasets: [{
                      data: demographicsData.genderDistribution.map(g => g.applicant_count),
                      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 0 },
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            )}

            {demographicsData?.ageDistribution && (
              <div className="bg-white p-6 rounded-lg shadow" style={{ height: '400px' }}>
                <h2 className="text-xl font-semibold mb-4">Age Distribution</h2>
                <Bar
                  data={{
                    labels: demographicsData.ageDistribution.map(a => a.age_group),
                    datasets: [{
                      label: 'Applicants',
                      data: demographicsData.ageDistribution.map(a => a.applicant_count),
                      backgroundColor: '#4BC0C0',
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 0 },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: Math.max(...demographicsData.ageDistribution.map(a => a.applicant_count)) + 1,
                        ticks: { precision: 0, stepSize: 1 }
                      }
                    },
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            )}
          </div>

{appealStatsData?.appealApprovalByType?.length > 0 && (
  <div className="bg-white p-6 rounded-lg shadow mb-6">
    <h2 className="text-xl font-semibold mb-4">Appeal Summary by Type</h2>
    <table className="w-full text-left border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Appeal Type</th>
          <th className="border p-2">Total</th>
          <th className="border p-2">Approved</th>
          <th className="border p-2">Approval Rate (%)</th>
        </tr>
      </thead>
      <tbody>
        {appealStatsData.appealApprovalByType.map((row, idx) => (
          <tr key={idx} className="border-t">
            <td className="p-2 border">{row.appeal_type}</td>
            <td className="p-2 border">{row.total}</td>
            <td className="p-2 border">{row.approved}</td>
            <td className="p-2 border">{parseFloat(row.approval_rate).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


          {offerStatsData && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Offer Statistics</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded">
                  <h3 className="font-medium text-purple-800">Total Offers</h3>
                  <p className="text-2xl font-bold">{offerStatsData.offerSummary?.total_offers || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <h3 className="font-medium text-yellow-800">Accepted</h3>
                  <p className="text-2xl font-bold">{offerStatsData.offerSummary?.accepted_offers || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="font-medium text-red-800">Rejected</h3>
                  <p className="text-2xl font-bold">{offerStatsData.offerSummary?.rejected_offers || 0}</p>
                </div>
              </div>

              {/* New Bar Chart for Acceptance Rate by Year */}
              <div className="h-64">
                <Bar
                  data={{
                    labels: offerStatsData.acceptanceRateByYear.map(item => item.hajj_year),
                    datasets: [{
                      label: 'Acceptance Rate (%)',
                      data: offerStatsData.acceptanceRateByYear.map(item => parseFloat(item.acceptance_rate)),
                      backgroundColor: '#9f7aea',
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          stepSize: 10,
                          callback: value => `${value}%`
                        }
                      }
                    },
                    plugins: {
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SVDashboard;
