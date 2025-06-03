// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Loginpage';
import SignupPage from './components/Signuppage';
import User from './components/UserLandingPage'; 
import Organizer from './components/OrganizerLandingPage';
import Shortlist from './components/ShortlistedPage';
import Checkout from './components/CheckoutPage';
import MyTickets from './components/MyTickets';
import Manage from './components/ManageParticipants';
import Admin from './components/AdminLandingPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/user" element={<User />} />
        <Route path="/organizer" element={<Organizer />} />
        <Route path="/shortlist" element={<Shortlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/admin-dashboard" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
