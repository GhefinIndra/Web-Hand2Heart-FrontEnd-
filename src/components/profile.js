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
  RefreshCw,
} from "lucide-react";
import Navbar from "./Navbar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("User belum login.");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/api/user/profile/${user.id}`
      );

      setUserProfile(response.data.user);
      setEditedProfile(response.data.user);
      setDonationHistory(response.data.donations || []);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("Gagal memuat profil. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await axios.put(
          `http://localhost:8080/api/user/${user.id}`,
          {
            username: editedProfile.username,
            email: editedProfile.email,
            phone: editedProfile.phone,
          }
        );
        setUserProfile(response.data);
        showCustomSnackBar("Profil berhasil diperbarui");
      } catch (error) {
        console.error("Error updating profile:", error);
        showCustomSnackBar("Gagal memperbarui profil. Silakan coba lagi.");
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
    navigate("/login");
  };

  const showCustomSnackBar = (message) => {
    // Simple alert for now, you can replace with toast notification
    alert(message);
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
            placeholder={`Masukkan ${label}`}
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
  const pantiTerbantu = [...new Set(donationHistory.map(d => d.orphanageName))].length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar isAdmin={isAdmin} />
      
      <div className="pt-20 pb-8">
        <div className="container mx-auto max-w-2xl px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </button>
            
            <h1 className="text-xl font-bold text-gray-800">Profil</h1>
            
            <button
              onClick={handleEditToggle}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition"
            >
              {isEditing ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Edit className="h-5 w-5 text-blue-600" />
              )}
            </button>
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
                  onClick={() => showCustomSnackBar("Fitur ganti foto profil akan segera hadir")}
                >
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {userProfile.username || 'Nama Tidak Ditemukan'}
              </h2>
              
              <div className="flex items-center justify-center text-gray-600 mb-6">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">{userProfile.email || 'Email Tidak Ditemukan'}</span>
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
                
                {renderProfileField('username', 'Nama', <User />)}
                {renderProfileField('email', 'Email', <Mail />, 'email')}
                {renderProfileField('phone', 'Nomor Telepon', <Phone />, 'tel')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 space-y-3">
              <button
                onClick={fetchUserProfile}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Data
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

          {/* Donation History for Admin (if needed) */}
          {isAdmin && donationHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Riwayat Donasi</h3>
              <div className="space-y-4">
                {donationHistory.map((donation) => (
                  <div
                    key={donation.id}
                    className="border rounded-xl p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-blue-700">
                        {donation.orphanageName}
                      </h4>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {donation.date}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 text-green-500 h-4 w-4" />
                        <span className="text-sm">
                          {donation.type === "uang"
                            ? formatCurrency(donation.amount)
                            : `${donation.amount} ${donation.item}`}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          donation.type === "uang"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {donation.type === "uang"
                          ? "Donasi Dana"
                          : "Donasi Barang"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;