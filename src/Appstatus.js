import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Appstatus = () => {
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // New state for modal visibility
  const th_acc_no = localStorage.getItem("th_acc_no");

  const handleCheckStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch registration status from the backend based on th_acc_no
      const response = await fetch(`http://localhost:5000/api/hajj/registration-status/${th_acc_no}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setRegistrationStatus(data);
      setShowModal(true); // Show modal after successful fetch

    } catch (err) {
      console.error("Error fetching registration status:", err);
      setError(err.message || "Failed to fetch registration status.");
      setShowModal(true); // Show error in the modal, too!
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />
        <div className="p-8 bg-gray-100 min-h-screen">
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            Semak Status Pendaftaran Haji
          </h2>

          <div className="bg-white p-6 rounded shadow-md space-y-4">
            <div>
              <label className="block text-gray-700">Nombor Akaun TH</label>
              <input
                type="text"
                className="w-full border p-2 rounded bg-gray-100"
                value={th_acc_no || ""} // Display th_acc_no
                readOnly
              />
            </div>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleCheckStatus}
              disabled={isLoading}
            >
              {isLoading ? "Checking Status..." : "Semak Status"}
            </button>

            {/* Modal */}
            {showModal && (
              <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white p-8 rounded shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Status Pendaftaran</h3>
                  {error && <p className="text-red-500">{error}</p>}
                  {registrationStatus ? (
                    <>
                      <p>Status: {registrationStatus.status || "Not Registered"}</p>
                      {registrationStatus.registration_date && (
                        <p>
                          Registration Date:{" "}
                          {new Date(registrationStatus.registration_date).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>Tiada maklumat pendaftaran ditemui.</p>
                  )}
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mt-4"
                    onClick={closeModal}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appstatus;