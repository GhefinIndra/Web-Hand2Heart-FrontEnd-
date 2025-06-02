import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Donasi from './components/donation-request-page';
import Login from './components/register-page';
import Register from './components/login-page';
import Home from './components/home-page';
import Profile from './components/profile'; 
import About from './components/aboutus'; 
import AdminDonasi from './components/keloladonasi'
import AdminPanti from './components/pageadmin'
import TambahPanti from './components/tambahpanti';
import DonationHistory from './components/donation_history';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/register" element={<Login />} />
        <Route path="/login" element={<Register />} />
        <Route path="/donasi" element={<Donasi />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/admindonasi/:pantiId" element={<AdminDonasi />} />
        <Route path="/adminpanti" element={<AdminPanti />} />
        <Route path="/tambahpanti" element={<TambahPanti />} />
        <Route path="/donation-history" element={<DonationHistory />} />
      </Routes>
    </div>
  );
}

export default App;
