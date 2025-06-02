import React, { useState, useEffect } from "react";
import { Home, Users, DollarSign, Plus, ArrowRight } from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [panti, setPanti] = useState([]);
  const [selectedPanti, setSelectedPanti] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPanti();
  }, []);

  const fetchPanti = async () => {
    setIsLoading(true);
    try {
      console.log('=== FETCHING PANTI FROM LARAVEL ===');
      
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('Raw localStorage data:', {
        token: token,
        userStr: userStr
      });
      
      if (!token || !userStr) {
        alert('Please login first');
        navigate('/login');
        return;
      }
  
      let user;
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        alert('Invalid user data. Please login again.');
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      console.log('Parsed user object:', user);
      console.log('User keys:', Object.keys(user));
      console.log('User properties:');
      Object.keys(user).forEach(key => {
        console.log(`  ${key}:`, user[key]);
      });
  
      // Try to find email in different possible locations
      let userEmail = user?.email || user?.user?.email || user?.username;
      
      console.log('Email search results:', {
        'user.email': user?.email,
        'user.user?.email': user?.user?.email,
        'user.username': user?.username,
        'final_email': userEmail
      });
  
      if (!userEmail) {
        console.error('User email is missing from localStorage');
        console.log('Complete user object:', user);
        
        // Last resort: try to use any email-like field
        const possibleEmailFields = ['email', 'user_email', 'userEmail', 'emailAddress'];
        for (const field of possibleEmailFields) {
          if (user[field] && user[field].includes('@')) {
            userEmail = user[field];
            console.log(`Found email in field ${field}:`, userEmail);
            break;
          }
        }
        
        if (!userEmail) {
          alert('User email is missing. Please login again.');
          localStorage.clear();
          navigate('/login');
          return;
        }
      }
  
      console.log('Using user email:', userEmail);
  
      const response = await axios.get("http://127.0.0.1:8000/api/panti", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Panti response:', response.data);
  
      if (response.data.success) {
        setPanti(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch panti');
      }
    } catch (error) {
      console.error("Error fetching orphanages:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.clear();
          navigate('/login');
          return;
        }
        
        alert(`Error: ${error.response.data.message || 'Failed to fetch data'}`);
      } else {
        alert("Failed to connect to server. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToDonation = () => {
    if (selectedPanti) {
      navigate(`/admindonasi/${selectedPanti.id}`);
    } else {
      alert("Pilih panti terlebih dahulu!");
    }
  };

  const handleSelectPanti = (orphanage) => {
    setSelectedPanti(orphanage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar for Admin */}
      <Navbar isAdmin={true} />

      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Selamat Datang, Admin
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola panti asuhan dan donasi dengan mudah
            </p>
          </div>

          <div className="flex gap-6 relative">
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Daftar Panti Asuhan</h3>
                  <button 
                    onClick={fetchPanti}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Refresh
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data panti...</p>
                  </div>
                ) : panti.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Belum ada panti asuhan yang terdaftar.</p>
                    <button 
                      onClick={() => navigate("/tambahpanti")}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Tambah Panti Pertama
                    </button>
                  </div>
                ) : (
                  panti.map((orphanage) => (
                    <div
                      key={orphanage.id}
                      onClick={() => handleSelectPanti(orphanage)}
                      className={`p-4 mb-4 border rounded-lg cursor-pointer transition ${
                        selectedPanti && selectedPanti.id === orphanage.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {orphanage.namaPanti}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {orphanage.kota}
                          </p>
                          <p className="text-xs text-gray-500">
                            {orphanage.alamat}
                          </p>
                          {orphanage.firebase_synced && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded mt-1">
                              Synced
                            </span>
                          )}
                        </div>
                        <Home className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="w-72">
              <div className="sticky top-20 space-y-4">
                <button
                  onClick={() => navigate("/tambahpanti")}
                  className="w-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer p-6"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Tambah Panti Baru
                      </h3>
                      <p className="mt-2 text-blue-100">
                        Daftarkan panti asuhan baru
                      </p>
                    </div>
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </button>

                <button
                  onClick={handleNavigateToDonation}
                  className={`w-full rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer p-6 ${
                    selectedPanti 
                      ? "bg-gradient-to-br from-purple-500 to-purple-600"
                      : "bg-gray-300"
                  }`}
                  disabled={!selectedPanti}
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Kelola Donasi
                      </h3>
                      <p className="mt-2 text-purple-100">
                        {selectedPanti 
                          ? `Atur donasi ${selectedPanti.namaPanti}`
                          : "Pilih panti terlebih dahulu"
                        }
                      </p>
                    </div>
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;