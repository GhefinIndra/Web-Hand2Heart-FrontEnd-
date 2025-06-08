import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './home-page';
import Login from './login-page';
import Register from './register-page';
import About from './aboutus';
import Profile from './profile';
import Donasi from './donation-request-page';
import AdminPanti from './pageadmin';
import AdminDonasi from './keloladonasi';
import TambahPanti from './tambahpanti';
import DonasiMasuk from './donasimasuk';
import DonationHistory from './donation_history';
import ProtectedRoute from './ProtectedRoute';

const RoleBasedRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />

      {/* Protected Routes for All Authenticated Users */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['donatur', 'pj_panti']}>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* Routes for Donatur */}
      <Route 
        path="/donasi" 
        element={
          <ProtectedRoute allowedRoles={['donatur']} redirectPath="/login">
            <Donasi />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/donation-history" 
        element={
          <ProtectedRoute allowedRoles={['donatur']} redirectPath="/login">
            <DonationHistory />
          </ProtectedRoute>
        } 
      />

      {/* Routes for PJ Panti */}
      <Route 
        path="/adminpanti" 
        element={
          <ProtectedRoute allowedRoles={['pj_panti']} redirectPath="/login">
            <AdminPanti />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admindonasi/:pantiId" 
        element={
          <ProtectedRoute allowedRoles={['pj_panti']} redirectPath="/login">
            <AdminDonasi />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tambahpanti" 
        element={
          <ProtectedRoute allowedRoles={['pj_panti']} redirectPath="/login">
            <TambahPanti />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/donasi-masuk" 
        element={
          <ProtectedRoute allowedRoles={['pj_panti']} redirectPath="/login">
            <DonasiMasuk />
          </ProtectedRoute>
        } 
      />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default RoleBasedRoutes;