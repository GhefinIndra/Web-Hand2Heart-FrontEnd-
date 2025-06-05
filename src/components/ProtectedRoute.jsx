import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, redirectPath }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        // Check if user is logged in
        if (!token || !userStr) {
          alert('Silakan login terlebih dahulu');
          navigate('/login');
          return;
        }

        // Parse user data
        const user = JSON.parse(userStr);
        const userRole = user?.role; // Sesuaikan dengan struktur data Anda
        
        console.log('Checking access - User role:', userRole, 'Allowed roles:', allowedRoles);
        
        // Check if user role is allowed
        if (!allowedRoles.includes(userRole)) {
          const message = userRole === 'donatur' 
            ? 'Akses ditolak. Anda akan diarahkan ke halaman donasi.'
            : userRole === 'pj_panti'
            ? 'Akses ditolak. Anda akan diarahkan ke halaman admin.'
            : 'Akses ditolak.';
            
          alert(message);
          
          // Redirect based on user role
          const defaultRedirect = userRole === 'donatur' ? '/donasi' : 
                                 userRole === 'pj_panti' ? '/adminpanti' : '/';
          navigate(redirectPath || defaultRedirect);
          return;
        }
        
      } catch (error) {
        console.error('Error checking user access:', error);
        alert('Error checking user permissions. Please login again.');
        localStorage.clear();
        navigate('/login');
      }
    };

    checkAccess();
  }, [allowedRoles, redirectPath, navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;