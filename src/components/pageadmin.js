import React, { useState, useEffect } from "react";
import { Home, Users, DollarSign, Plus, ArrowRight, Edit, Trash2, Building2, MapPin, Phone, FileText, AlertTriangle, X } from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [panti, setPanti] = useState([]);
  const [selectedPanti, setSelectedPanti] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPanti, setEditingPanti] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    namaPanti: '',
    kota: '',
    kontak: '',
    deskripsi: ''
  });

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

  const handleEditPanti = (orphanage) => {
    setEditingPanti(orphanage);
    setEditForm({
      namaPanti: orphanage.namaPanti,
      kota: orphanage.kota,
      kontak: orphanage.kontak,
      deskripsi: orphanage.deskripsi || ''
    });
  };

  const handleUpdatePanti = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      const userEmail = user?.email || user?.user?.email || user?.username;

      const response = await axios.put(
        `http://127.0.0.1:8000/api/panti/${editingPanti.id}`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': userEmail,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Panti berhasil diperbarui!');
        setEditingPanti(null);
        fetchPanti(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to update panti');
      }
    } catch (error) {
      console.error("Error updating panti:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Failed to update panti'}`);
      } else {
        alert("Failed to connect to server. Please check your connection.");
      }
    }
  };

  const handleDeletePanti = async (pantiId) => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      const userEmail = user?.email || user?.user?.email || user?.username;

      const response = await axios.delete(
        `http://127.0.0.1:8000/api/panti/${pantiId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': userEmail,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Panti berhasil dihapus!');
        setDeleteConfirm(null);
        if (selectedPanti && selectedPanti.id === pantiId) {
          setSelectedPanti(null);
        }
        fetchPanti(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to delete panti');
      }
    } catch (error) {
      console.error("Error deleting panti:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Failed to delete panti'}`);
      } else {
        alert("Failed to connect to server. Please check your connection.");
      }
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

  // Edit Modal
  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Panti Asuhan</h3>
          <button onClick={() => setEditingPanti(null)} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panti</label>
            <input
              type="text"
              value={editForm.namaPanti}
              onChange={(e) => setEditForm({...editForm, namaPanti: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
            <input
              type="text"
              value={editForm.kota}
              onChange={(e) => setEditForm({...editForm, kota: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kontak</label>
            <input
              type="text"
              value={editForm.kontak}
              onChange={(e) => setEditForm({...editForm, kontak: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={editForm.deskripsi}
              onChange={(e) => setEditForm({...editForm, deskripsi: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setEditingPanti(null)}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleUpdatePanti}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus panti "{deleteConfirm?.namaPanti}"?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={() => handleDeletePanti(deleteConfirm.id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );

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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-500" />
                    Daftar Panti Asuhan
                  </h3>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data panti...</p>
                  </div>
                ) : panti.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Belum ada panti asuhan yang terdaftar.</p>
                    <button 
                      onClick={() => navigate("/tambahpanti")}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Panti Pertama
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {panti.map((orphanage) => (
                      <div
                        key={orphanage.id}
                        onClick={() => handleSelectPanti(orphanage)}
                        className={`p-6 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedPanti && selectedPanti.id === orphanage.id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Home className="h-5 w-5 text-blue-600" />
                              </div>
                              <h4 className="font-bold text-gray-800 text-lg">
                                {orphanage.namaPanti}
                              </h4>
                            </div>
                            
                            <div className="space-y-2 ml-10">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Kota:</span> 
                                <span>{orphanage.kota}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Kontak:</span> 
                                <span>{orphanage.kontak}</span>
                              </div>
                              
                              {orphanage.deskripsi && (
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <span className="font-medium">Deskripsi:</span> 
                                  <span className="line-clamp-2">{orphanage.deskripsi}</span>
                                </div>
                              )}
                              
                              {orphanage.firebase_synced && (
                                <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  ✓ Synced
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPanti(orphanage);
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit Panti"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(orphanage);
                              }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              title="Hapus Panti"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-72">
              <div className="sticky top-20 space-y-4">
                <button
                  onClick={() => navigate("/tambahpanti")}
                  className="w-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer p-6 transform hover:scale-105"
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
                  className={`w-full rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer p-6 transform hover:scale-105 ${
                    selectedPanti 
                      ? "bg-gradient-to-br from-purple-500 to-purple-600"
                      : "bg-gray-300 cursor-not-allowed"
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

      {/* Modals */}
      {editingPanti && <EditModal />}
      {deleteConfirm && <DeleteModal />}
    </div>
  );
};

export default DashboardHome;