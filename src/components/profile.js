import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Edit,
  CheckCircle,
  DollarSign,
  Calendar,
  Phone,
  Camera,
  Heart,
  CalendarDays,
  History,
  LogOut,
  ArrowLeft,
  X,
  Check
} from "lucide-react";

// Toast Notification Component
const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm
        ${type === 'success' 
          ? 'bg-green-500 text-white' 
          : type === 'error' 
          ? 'bg-red-500 text-white' 
          : 'bg-blue-500 text-white'
        }
      `}>
        {type === 'success' && <Check className="h-5 w-5 flex-shrink-0" />}
        {type === 'error' && <X className="h-5 w-5 flex-shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-80 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Function to get back navigation path based on user role
  const getBackNavigationPath = () => {
    if (!userProfile || !userProfile.role) {
      return '/'; // default fallback
    }
    
    switch (userProfile.role) {
      case 'donatur':
        return '/donasi';
      case 'pj_panti':
        return '/adminpanti';
      case 'admin':
        return '/adminpanti'; // or any other admin path you prefer
      default:
        return '/';
    }
  };

  const handleBackNavigation = () => {
    const backPath = getBackNavigationPath();
    navigate(backPath);
  };

  const fetchUserProfile = async () => {
  setIsLoading(true);
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!user || !user.id || !token) {
      showToast("User belum login", "error");
      navigate("/login");
      return;
    }

    // Fetch user profile
    const profileResponse = await axios.get(
      `http://127.0.0.1:8000/api/user/profile/${user.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': user.email,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!profileResponse.data.success) {
      throw new Error(profileResponse.data.message || 'Failed to fetch profile');
    }

    setUserProfile(profileResponse.data.user);
    setEditedProfile(profileResponse.data.user);

    // Fetch donation history from the same endpoint as donation-history.js
    try {
      const donationResponse = await axios.get(
        'http://127.0.0.1:8000/api/donation',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': user.email,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log("Donation API Response:", donationResponse.data);

      if (donationResponse.data.success && donationResponse.data.data) {
        setDonationHistory(donationResponse.data.data);
        console.log("Donation History Set:", donationResponse.data.data);
      } else {
        // Fallback: try to get from profile response
        setDonationHistory(profileResponse.data.donations || []);
        console.log("Using fallback donations:", profileResponse.data.donations || []);
      }
    } catch (donationError) {
      console.error("Error fetching donations:", donationError);
      // Use donations from profile response as fallback
      setDonationHistory(profileResponse.data.donations || []);
    }

  } catch (error) {
    console.error("Error fetching user profile:", error);
    const errorMessage = error.response?.data?.message || "Gagal memuat profil";
    showToast(errorMessage, "error");
  } finally {
    setIsLoading(false);
  }
};

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes
      setIsUpdating(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        
        const response = await axios.put(
          `http://127.0.0.1:8000/api/user/${user.id}`,
          {
            full_name: editedProfile.full_name,
            email: editedProfile.email,
            phone: editedProfile.phone,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-User-Email': user.email,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          setUserProfile(response.data.data);  // bukan response.data.user
          showToast("Profil berhasil diperbarui! 🎉", "success");
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(response.data.data)); 
        } else {
          throw new Error(response.data.message || 'Update failed');
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        const errorMessage = error.response?.data?.message || "Gagal memperbarui profil";
        showToast(errorMessage, "error");
      } finally {
        setIsUpdating(false);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    showToast("Berhasil keluar", "success");
    setTimeout(() => navigate("/login"), 1000);
  };

  const formatCurrency = (value) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const renderProfileField = (name, label, icon, type = 'text') => {
    return (
      <div className="px-5 py-2">
        <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">
          {label}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={editedProfile?.[name] || ''}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
              isEditing 
                ? 'bg-white border-blue-200 shadow-sm' 
                : 'bg-gray-100 border-transparent'
            }`}
            placeholder={isEditing ? `Masukkan ${label}` : ''}
          />
          {React.cloneElement(icon, {
            className: `h-5 w-5 ${isEditing ? 'text-blue-600' : 'text-gray-600'} absolute left-3 top-3.5`,
          })}
        </div>
      </div>
    );
  };

  const renderStatCard = (icon, color, value, label) => {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex flex-col items-center text-center">
          {React.cloneElement(icon, {
            className: `h-7 w-7 ${color} mb-2`,
          })}
          <span className="text-xl font-bold text-gray-800">{value}</span>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Profil tidak ditemukan</p>
      </div>
    );
  }

  const isAdmin = userProfile.role === "admin" || userProfile.role === "pj_panti";
  const donationCount = donationHistory.length;
  const pantiTerbantu = [...new Set(donationHistory.map(d => d.panti?.name).filter(name => name))].length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <div className="pt-20 pb-8">
        <div className="container mx-auto max-w-2xl px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackNavigation}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition"
              title={`Kembali ke ${userProfile.role === 'donatur' ? 'Donasi' : 'Admin Panti'}`}
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </button>
            
            <h1 className="text-xl font-bold text-gray-800">Profil</h1>
            
            <div className="w-10 h-10"></div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Profile Header */}
            <div className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
                  {userProfile.photoUrl ? (
                    <img 
                      src={userProfile.photoUrl} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-blue-700" />
                  )}
                </div>
                <button 
                  className="absolute -bottom-2 -right-2 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
                  onClick={() => showToast("Fitur ganti foto profil akan segera hadir", "info")}
                >
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {userProfile.full_name || 'Nama Tidak Ditemukan'}
              </h2>
              
              <div className="flex items-center justify-center text-gray-600 mb-2">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">{userProfile.email || 'Email Tidak Ditemukan'}</span>
              </div>

              {/* Role Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userProfile.role === 'donatur' 
                    ? 'bg-green-100 text-green-800' 
                    : userProfile.role === 'pj_panti'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userProfile.role === 'donatur' ? 'Donatur' : 
                   userProfile.role === 'pj_panti' ? 'Penanggung Jawab Panti' : 
                   userProfile.role}
                </span>
              </div>

              {/* Stats - Only show for non-admin users */}
              {!isAdmin && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {renderStatCard(
                      <Heart />, 
                      'text-blue-600', 
                      donationCount.toString(), 
                      'Total Donasi'
                    )}
                    {renderStatCard(
                      <CalendarDays />, 
                      'text-green-600', 
                      pantiTerbantu.toString(), 
                      'Panti Terbantu'
                    )}
                  </div>

                  {/* Donation History Button */}
                  <button
                    onClick={() => navigate('/donation-history')}
                    className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-3 px-4 rounded-xl font-medium hover:bg-blue-100 transition flex items-center justify-center mb-6"
                  >
                    <History className="h-5 w-5 mr-2" />
                    Lihat Riwayat Donasi
                  </button>
                </>
              )}
            </div>

            {/* Profile Information */}
            <div className="border-t bg-gray-50">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">
                  Informasi Profil
                </h3>
                
                {renderProfileField('full_name', 'Nama', <User />)}
                {renderProfileField('email', 'Email', <Mail />, 'email')}
                {renderProfileField('phone', 'Nomor Telepon', <Phone />, 'tel')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6">
              <button
                onClick={handleEditToggle}
                disabled={isUpdating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center mb-3 disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : isEditing ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <Edit className="h-5 w-5 mr-2" />
                )}
                {isUpdating ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Edit Profil'}
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Keluar
              </button>
            </div>
          </div>

          
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;