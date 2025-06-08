import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  Package,
  AlertCircle,
  Check
} from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';

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
          : type === 'warning'
          ? 'bg-yellow-500 text-white'
          : 'bg-blue-500 text-white'
        }
      `}>
        {type === 'success' && <Check className="h-5 w-5 flex-shrink-0" />}
        {type === 'error' && <X className="h-5 w-5 flex-shrink-0" />}
        {type === 'warning' && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
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

const KeloladonasiPage = () => {
  const { pantiId } = useParams();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [pantiInfo, setPantiInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    target: '',
    terkumpul: 0
  });

  const [errors, setErrors] = useState({});

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

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

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return null;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user data:', e);
      return null;
    }

    // Try to find email in different possible locations
    const userEmail = user?.email || user?.user?.email || user?.username;
    
    if (!userEmail) {
      console.error('User email not found in localStorage');
      return null;
    }

    return {
      'Authorization': `Bearer ${token}`,
      'X-User-Email': userEmail,
      'Content-Type': 'application/json'
    };
  };

  // FIX: Add dependency array to prevent infinite loop
  useEffect(() => {
    fetchPantiInfo();
    fetchItems();
  }, [pantiId]); // Only re-run when pantiId changes

  const fetchPantiInfo = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        showToast('Silakan login terlebih dahulu', 'error');
        navigate('/login');
        return;
      }
  
      // Use Firebase ID endpoint
      const response = await axios.get(`http://127.0.0.1:8000/api/panti/firebase/${pantiId}`, {
        headers
      });
  
      if (response.data.success) {
        setPantiInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching panti info:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        showToast('Sesi telah berakhir. Silakan login kembali', 'error');
        navigate('/login');
      }
    }
  };

  // ...existing code...
const fetchItems = async () => {
  setIsLoading(true);
  try {
    console.log('=== FETCHING BARANG FOR PANTI ===');
    
    const headers = getAuthHeaders();
    if (!headers) {
      showToast('Silakan login terlebih dahulu', 'error');
      navigate('/login');
      return;
    }

    console.log('Fetching barang for panti Firebase ID:', pantiId);
    console.log('Using headers:', headers);

    // FIXED: Use the correct endpoint - just /api/barang/{pantiId}
    const response = await axios.get(`http://127.0.0.1:8000/api/barang/${pantiId}`, {
      headers
    });

    console.log('Barang response:', response.data);

    if (response.data.success) {
      setItems(response.data.data || []);
    } else {
      throw new Error(response.data.message || 'Failed to fetch barang');
    }
  } catch (error) {
    console.error("Error fetching barang:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      if (error.response.status === 401) {
        showToast('Sesi telah berakhir. Silakan login kembali', 'error');
        localStorage.clear();
        navigate('/login');
        return;
      } else if (error.response.status === 404) {
        console.log('No barang found for this panti, starting with empty list');
        setItems([]); // Set empty array instead of showing error
      } else {
        showToast(
          error.response.data.message || 'Gagal memuat data barang', 
          'error'
        );
      }
    } else {
      showToast('Gagal terhubung ke server', 'error');
    }
  } finally {
    setIsLoading(false);
  }
};

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama item harus diisi';
    }

    if (!formData.target || formData.target <= 0) {
      newErrors.target = 'Target harus berupa angka positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
  
    try {
      console.log('=== SUBMITTING BARANG TO LARAVEL ===');
      console.log('pantiId from useParams:', pantiId); // Debug pantiId
      
      const headers = getAuthHeaders();
      if (!headers) {
        showToast('Silakan login terlebih dahulu', 'error');
        navigate('/login');
        return;
      }
  
      // Validate pantiId
      if (!pantiId || pantiId === 'undefined' || pantiId === 'null') {
        showToast('ID Panti tidak valid. Silakan kembali ke dashboard.', 'error');
        navigate('/adminpanti');
        return;
      }
  
      // FIXED: Send both panti_id and panti_firebase_id
      const submitData = {
        panti_id: pantiId, // Backend expects this field
        panti_firebase_id: pantiId, // Keep this for compatibility
        namaBarang: formData.nama.trim(),
        deskripsi: formData.deskripsi?.trim() || '',
        jumlah: parseInt(formData.target),
        satuan: 'buah', // You can make this configurable
        is_active: true
      };
  
      // Validate submitData before sending
      if (isNaN(submitData.jumlah) || submitData.jumlah <= 0) {
        showToast('Jumlah harus berupa angka positif', 'error');
        return;
      }
  
      console.log('Final submit data:', submitData);
      console.log('Using headers:', headers);
  
      let response;
      if (editingItem) {
        response = await axios.put(`http://127.0.0.1:8000/api/barang/${editingItem.id}`, submitData, {
          headers
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/barang', submitData, {
          headers
        });
      }
  
      console.log('Submit response:', response.data);
  
      if (response.data.success) {
        fetchItems();
        resetForm();
        showToast(
          editingItem ? 'Barang berhasil diperbarui! 🎉' : 'Barang berhasil ditambahkan! 🎉', 
          'success'
        );
      } else {
        throw new Error(response.data.message || 'Failed to save barang');
      }
  
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        
        if (error.response.status === 401) {
          showToast('Sesi telah berakhir. Silakan login kembali', 'error');
          localStorage.clear();
          navigate('/login');
          return;
        } else if (error.response.status === 422) {
          const validationErrors = error.response.data.errors || {};
          console.log('Validation errors:', validationErrors);
          setErrors(validationErrors);
          
          const errorMessages = Object.values(validationErrors).flat();
          if (errorMessages.length > 0) {
            showToast(`Kesalahan validasi: ${errorMessages.join(', ')}`, 'error');
          }
        } else {
          showToast(
            error.response.data.message || 'Gagal menyimpan barang', 
            'error'
          );
        }
      } else {
        showToast('Gagal terhubung ke server', 'error');
      }
    }
  };

  const deleteItem = async (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      console.log('=== DELETING BARANG FROM LARAVEL ===');
      
      const headers = getAuthHeaders();
      if (!headers) {
        showToast('Silakan login terlebih dahulu', 'error');
        navigate('/login');
        return;
      }

      console.log('Deleting barang:', itemToDelete);
      console.log('Using headers:', headers);

      const response = await axios.delete(`http://127.0.0.1:8000/api/barang/${itemToDelete}`, {
        headers
      });

      console.log('Delete response:', response.data);

      if (response.data.success) {
        fetchItems(); // Refresh data barang setelah dihapus
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        showToast('Barang berhasil dihapus! 🗑️', 'success');
      } else {
        throw new Error(response.data.message || 'Failed to delete barang');
      }

    } catch (error) {
      console.error('Delete error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.status === 401) {
          showToast('Sesi telah berakhir. Silakan login kembali', 'error');
          localStorage.clear();
          navigate('/login');
          return;
        }
        showToast(
          error.response.data.message || 'Gagal menghapus barang', 
          'error'
        );
      } else {
        showToast('Gagal terhubung ke server', 'error');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const editItem = (item) => {
    setEditingItem(item);
    setFormData({
      nama: item.namaBarang || '', // Map 'namaBarang' back to 'nama' for form
      deskripsi: item.deskripsi || '',
      target: item.jumlah || '', // Map 'jumlah' back to 'target' for form
      terkumpul: 0 // Barang model doesn't have terkumpul field
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      target: '',
      terkumpul: 0
    });
    setEditingItem(null);
    setShowForm(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercentage = (terkumpul, target) => {
    if (!target || target === 0) return 0;
    return Math.min((terkumpul / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <Navbar isAdmin={true} />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/adminpanti')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </button>
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Kelola Barang Kebutuhan
                </h1>
                <p className="text-gray-600 mt-1">
                  {pantiInfo ? `Panti: ${pantiInfo.namaPanti || pantiInfo.nama}` : 'Memuat info panti...'}
                </p>
              </div>
              
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Item Donasi
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Daftar Barang Kebutuhan
                  </h2>
                </div>
                
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Belum ada barang kebutuhan</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Tambah Barang Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          {/* FIX: Handle Barang model fields properly */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">
                                {item.namaBarang || 'Nama tidak tersedia'}
                              </h3>
                              {item.deskripsi && (
                                <p className="text-sm text-gray-500 mt-1">{item.deskripsi}</p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                Jumlah: {item.jumlah} {item.satuan}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => editItem(item)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* REMOVED: Progress Bar (not applicable for Barang model) */}
                          
                          {/* Stats - Modified for Barang */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Jumlah Barang</p>
                              <p className="font-semibold text-blue-600">
                                {item.jumlah} {item.satuan}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Status</p>
                              <p className={`font-semibold ${item.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Sidebar */}
            <div className="lg:col-span-1">
              {showForm && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}
                      </h2>
                      <button
                        onClick={resetForm}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nama */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Barang *
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                          errors.nama ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Contoh: Beras 10kg"
                      />
                      {errors.nama && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.nama}
                        </p>
                      )}
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Deskripsi kebutuhan..."
                      />
                    </div>

                    {/* Target/Jumlah */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Kebutuhan *
                      </label>
                      <input
                        type="number"
                        name="target"
                        value={formData.target}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                          errors.target ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="10"
                        min="1"
                      />
                      {errors.target && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.target}
                        </p>
                      )}
                    </div>

                    {/* Remove Terkumpul field since Barang model doesn't have it */}

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingItem ? 'Update' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Hapus
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus barang kebutuhan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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

export default KeloladonasiPage;