import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Import all your components
import Donasi from './donation-request-page';
import Login from './register-page';
import Register from './login-page';
import Home from './home-page';
import Profile from './profile'; 
import About from './aboutus'; 
import AdminDonasi from './keloladonasi';
import AdminPanti from './pageadmin';
import TambahPanti from './tambahpanti';
import DonationHistory from './donation_history';
import DonasiMasuk from './donasimasuk';

const RoleBasedRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/register" element={<Login />} />
      <Route path="/login" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />

      {/* Profile Route - Both roles can access */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['donatur', 'pj_panti']}>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* Donatur Only Routes */}
      <Route 
        path="/donasi" 
        element={
          <ProtectedRoute allowedRoles={['donatur']} redirectPath="/adminpanti">
            <Donasi />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/donation-history" 
        element={
          <ProtectedRoute allowedRoles={['donatur']} redirectPath="/adminpanti">
            <DonationHistory />
          </ProtectedRoute>
        } 
      />

      {/* PJ Panti Only Routes */}
      <Route 
        path="/admindonasi/:pantiId" 
        element={
          <ProtectedRoute allowedRoles={['pj_panti']} redirectPath="/donasi">
            <AdminDonasi />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/adminpanti" 
        element={
          <ProtectedRoute allowedRoles={['pj_panti']} redirectPath="/donasi">
            <AdminPanti />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tambahpanti" 
        element={
          <ProtectedRoute allowedRoles={['pj_panti']} redirectPath="/donasi">
            <TambahPanti />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/donasi-masuk" 
        element={
          <ProtectedRoute allowedRoles={['pj_panti']} redirectPath="/donasi">
            <DonasiMasuk />
          </ProtectedRoute>
        } 
      />


      {/* Catch all route - redirect to appropriate dashboard */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default RoleBasedRoutes;