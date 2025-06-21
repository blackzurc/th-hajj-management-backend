// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import Profile from "./Profile";
import Applyhajj from "./Applyhajj";
import Addapplicant from "./Addapplicant";
import Appstatus from "./Appstatus";
import Register from "./register";
import Dashboard from "./dashboard"; // Import the Dashboard component
import ViewOffer from "./viewoffer";
import AdminLogin from "./Admin/AdminLogin"; // Add this import
import AdminDashboard from "./Admin/AdminDashboard"; // You'll need to create this
import HajjApplications from './Admin/HajjApplications';
import CreateHajjOffer from "./Admin/CreateHajjOffer";
import HajjAppeal from "./hajjappeal";
import AdminViewAppeals from "./Admin/AdminAppeal";
import AddMoney from './AddMoney';
import SVLogin from "./Supervisor/svlogin"; 
import SVDashboard from "./Supervisor/svdashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/apply-hajj" element={<Applyhajj />} />
        <Route path="/add-applicant" element={<Addapplicant />} />
        <Route path="/application-status" element={<Appstatus />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Add the route for the dashboard */}
        <Route path="/view-offer" element={<ViewOffer />} />
         <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/hajj-applications" element={<HajjApplications />} />
        <Route path="/admin/hajj-offers" element={<CreateHajjOffer />} />
        <Route path="/appeal" element={<HajjAppeal />} />
        <Route path="/admin/hajj-appeals" element={<AdminViewAppeals />} />
        <Route path="/add-money" element={<AddMoney />} />
        <Route path="/sv/login" element={<SVLogin />} />
        <Route path="/sv/dashboard" element={<SVDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;