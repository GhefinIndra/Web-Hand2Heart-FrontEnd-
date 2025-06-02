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
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';

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

  useEffect(() => {
    fetchPantiInfo();
    fetchItems();
  }, [pantiId]);

  const fetchPantiInfo = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/panti/${pantiId}`, {
        headers
      });

      if (response.data.success) {
        setPantiInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching panti info:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      console.log('=== FETCHING DONATIONS FROM LARAVEL ===');
      
      const headers = getAuthHeaders();
      if (!headers) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      console.log('Fetching donations for panti:', pantiId);
      console.log('Using headers:', headers);

      const response = await axios.get(`http://127.0.0.1:8000/api/donations/panti/${pantiId}`, {
        headers
      });

      console.log('Donations response:', response.data);

      if (response.data.success) {
        setItems(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch donations');
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.clear();
          navigate('/login');
          return;
        }
      } else {
        alert("Failed to connect to server. Please check your connection.");
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
      console.log('=== SUBMITTING DONATION TO LARAVEL ===');
      
      const headers = getAuthHeaders();
      if (!headers) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const submitData = {
        ...formData,
        panti_id: pantiId,
        target: Number(formData.target),
        terkumpul: Number(formData.terkumpul || 0)
      };

      console.log('Submit data:', submitData);
      console.log('Using headers:', headers);

      let response;
      if (editingItem) {
        response = await axios.put(`http://127.0.0.1:8000/api/donations/${editingItem.id}`, submitData, {
          headers
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/donations', submitData, {
          headers
        });
      }

      console.log('Submit response:', response.data);

      if (response.data.success) {
        fetchItems();
        resetForm();
        alert(editingItem ? 'Item berhasil diperbarui!' : 'Item berhasil ditambahkan!');
      } else {
        throw new Error(response.data.message || 'Failed to save item');
      }

    } catch (error) {
      console.error('Submit error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.clear();
          navigate('/login');
          return;
        } else if (error.response.status === 422) {
          // Validation errors
          const validationErrors = error.response.data.errors || {};
          setErrors(validationErrors);
        } else {
          alert(`Error: ${error.response.data.message || 'Failed to save item'}`);
        }
      } else {
        alert("Gagal terhubung ke server.");
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
      console.log('=== DELETING ITEM FROM LARAVEL ===');
      
      const headers = getAuthHeaders();
      if (!headers) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      console.log('Deleting item:', itemToDelete);
      console.log('Using headers:', headers);

      const response = await axios.delete(`http://127.0.0.1:8000/api/donations/${itemToDelete}`, {
        headers
      });

      console.log('Delete response:', response.data);

      if (response.data.success) {
        fetchItems();
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        alert('Item berhasil dihapus!');
      } else {
        throw new Error(response.data.message || 'Failed to delete item');
      }

    } catch (error) {
      console.error('Delete error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.clear();
          navigate('/login');
          return;
        }
        alert(`Error: ${error.response.data.message || 'Failed to delete item'}`);
      } else {
        alert("Gagal terhubung ke server.");
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
      nama: item.nama || '',
      deskripsi: item.deskripsi || '',
      target: item.target || '',
      terkumpul: item.terkumpul || 0
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
                  Kelola Donasi
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
                    Daftar Item Donasi
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
                      <p className="text-gray-600 mb-4">Belum ada item donasi</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Tambah Item Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{item.nama}</h3>
                              {item.deskripsi && (
                                <p className="text-sm text-gray-500 mt-1">{item.deskripsi}</p>
                              )}
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
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{Math.round(getProgressPercentage(item.terkumpul, item.target))}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${getProgressPercentage(item.terkumpul, item.target)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Terkumpul</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(item.terkumpul || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Target</p>
                              <p className="font-semibold text-blue-600">
                                {formatCurrency(item.target || 0)}
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
                        {editingItem ? 'Edit Item' : 'Tambah Item Baru'}
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
                        Nama Item *
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

                    {/* Target */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target (Rp) *
                      </label>
                      <input
                        type="number"
                        name="target"
                        value={formData.target}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                          errors.target ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="100000"
                        min="1"
                      />
                      {errors.target && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.target}
                        </p>
                      )}
                    </div>

                    {/* Terkumpul (only show when editing) */}
                    {editingItem && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Terkumpul (Rp)
                        </label>
                        <input
                          type="number"
                          name="terkumpul"
                          value={formData.terkumpul}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    )}

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
              Apakah Anda yakin ingin menghapus item donasi ini? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  );
};

export default KeloladonasiPage;