import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Gift, 
  Clock, 
  Check, 
  X, 
  User, 
  Package, 
  MessageCircle, 
  Calendar,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import NavBar from "./Navbar";

const DonationManagement = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [selectedPanti, setSelectedPanti] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    filterDonations();
  }, [donations, statusFilter, searchTerm, selectedPanti]);

  const fetchDonations = async () => {
    setIsLoading(true);
    setMessage("");
    
    try {
      console.log("=== FETCHING DONATIONS FROM LARAVEL ===");
      
      // Get auth data from localStorage
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      if (!token || !userStr) {
        alert("Session telah berakhir. Silakan login kembali.");
        navigate("/login");
        return;
      }

      let user;
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error("Failed to parse user data:", e);
        alert("Invalid user data. Please login again.");
        localStorage.clear();
        navigate("/login");
        return;
      }
     

      let userEmail = user?.email || user?.user?.email || user?.username;
      
      if (!userEmail) {
        alert("Email user tidak ditemukan. Silakan login kembali.");
        localStorage.clear();
        navigate("/login");
        return;
      }

      console.log("Fetching donations with token:", token);

      // Call API to get donation records
      const response = await axios.get(
        "http://127.0.0.1:8000/api/donation",
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': userEmail,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Donations response:", response.data);

      if (response.data.success) {
        setDonations(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch donations");
      }

    } catch (error) {
      console.error("Error fetching donations:", error);
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        
        if (error.response.status === 401) {
          alert("Sesi telah berakhir. Silakan login kembali.");
          localStorage.clear();
          navigate("/login");
          return;
        } else {
          setMessage(`Error: ${error.response.data.message || "Gagal memuat data donasi"}`);
        }
      } else {
        setMessage("Gagal memuat data donasi. Periksa koneksi internet Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...donations];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
  filtered = filtered.filter(d => 
    d.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.panti?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

    // Filter by selected panti if any
    if (selectedPanti) {
      filtered = filtered.filter(d => d.panti_id === selectedPanti.id);
    }

    setFilteredDonations(filtered);
  };

  const handleStatusUpdate = async (donationId, newStatus) => {
    setProcessingId(donationId);
    setMessage("");
    
    try {
      console.log(`=== UPDATING DONATION STATUS TO ${newStatus.toUpperCase()} ===`);
      
      // Get auth data from localStorage
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      if (!token || !userStr) {
        alert("Session telah berakhir. Silakan login kembali.");
        navigate("/login");
        return;
      }
  
      let user;
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error("Failed to parse user data:", e);
        alert("Invalid user data. Please login again.");
        localStorage.clear();
        navigate("/login");
        return;
      }
  
      let userEmail = user?.email || user?.user?.email || user?.username;
      
      if (!userEmail) {
        alert("Email user tidak ditemukan. Silakan login kembali.");
        localStorage.clear();
        navigate("/login");
        return;
      }
  
      // FIXED: Use the correct endpoints based on status
      let endpoint;
      if (newStatus === 'approved') {
        endpoint = `http://127.0.0.1:8000/api/donation/${donationId}/approve`;
      } else if (newStatus === 'rejected') {
        endpoint = `http://127.0.0.1:8000/api/donation/${donationId}/reject`;
      } else {
        throw new Error('Invalid status. Only approved or rejected are allowed.');
      }
  
      console.log('Using endpoint:', endpoint);
  
      // Call API to update donation status
      const response = await axios.put(
        endpoint,
        {}, // Empty body since status is determined by endpoint
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': userEmail,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log("Update status response:", response.data);
  
      if (response.data.success) {
        // Update local state
        setDonations(prev => prev.map(d => 
          d.id === donationId 
            ? { 
                ...d, 
                status: newStatus, 
                approved_at: newStatus !== 'pending' ? new Date().toISOString() : null 
              }
            : d
        ));
        
        setShowConfirmModal(false);
        setSelectedDonation(null);
        setActionType('');
        setMessage(`Donasi berhasil ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}!`);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
        
      } else {
        throw new Error(response.data.message || "Failed to update donation status");
      }
      
    } catch (error) {
      console.error("Error updating donation status:", error);
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        
        if (error.response.status === 401) {
          alert("Sesi telah berakhir. Silakan login kembali.");
          localStorage.clear();
          navigate("/login");
          return;
        } else {
          setMessage(`Error: ${error.response.data.message || "Gagal mengupdate status donasi"}`);
        }
      } else {
        setMessage("Gagal mengupdate status donasi. Periksa koneksi internet Anda.");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const showConfirmation = (donation, action) => {
    setSelectedDonation(donation);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const showDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'text-amber-700 bg-amber-100 border-amber-200',
          bgColor: 'bg-amber-50',
          icon: Clock,
          text: 'Menunggu'
        };
      case 'approved':
        return {
          color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
          bgColor: 'bg-emerald-50',
          icon: CheckCircle,
          text: 'Disetujui'
        };
      case 'rejected':
        return {
          color: 'text-red-700 bg-red-100 border-red-200',
          bgColor: 'bg-red-50',
          icon: XCircle,
          text: 'Ditolak'
        };
      default:
        return {
          color: 'text-gray-700 bg-gray-100 border-gray-200',
          bgColor: 'bg-gray-50',
          icon: Clock,
          text: 'Unknown'
        };
    }
  };

  const getStatusCounts = () => {
    return {
      all: donations.length,
      pending: donations.filter(d => d.status === 'pending').length,
      approved: donations.filter(d => d.status === 'approved').length,
      rejected: donations.filter(d => d.status === 'rejected').length
    };
  };

  const statusCounts = getStatusCounts();

  // Detail Modal Component
  const DetailModal = () => {
    if (!showDetailModal || !selectedDonation) return null;

    const statusConfig = getStatusConfig(selectedDonation.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-90vh overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-blue-600">Detail Donasi</h3>
            <button 
              onClick={() => setShowDetailModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${statusConfig.color}`}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig.text}
              </span>
            </div>

            {/* Donatur Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Informasi Donatur
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium">{selectedDonation.user?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{selectedDonation.user?.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telepon:</span>
                  <span className="font-medium">{selectedDonation.user?.phone || '-'}</span>
                </div>
              </div>
            </div>

            {/* Panti Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Panti Tujuan
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium">{selectedDonation.panti?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kota:</span>
                  <span className="font-medium">{selectedDonation.panti?.kota || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kontak:</span>
                  <span className="font-medium">{selectedDonation.panti?.phone || selectedDonation.panti?.contact || '-'}</span>
                </div>
              </div>
            </div>

            {/* Donation Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Detail Donasi
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Barang:</span>
                  <span className="font-medium">{selectedDonation.item_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah:</span>
                  <span className="font-medium">{selectedDonation.amount || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-medium">{formatDate(selectedDonation.created_at)}</span>
                </div>
                {selectedDonation.processed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diproses:</span>
                    <span className="font-medium">{formatDate(selectedDonation.processed_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {selectedDonation.message && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Pesan Donatur
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedDonation.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedDonation.status === 'pending' && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => showConfirmation(selectedDonation, 'approve')}
                  className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Setujui
                </button>
                <button
                  onClick={() => showConfirmation(selectedDonation, 'reject')}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Tolak
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!showConfirmModal || !selectedDonation) return null;

    const isApprove = actionType === 'approve';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-full mr-3 ${isApprove ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {isApprove ? (
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold">
              {isApprove ? 'Setujui Donasi' : 'Tolak Donasi'}
            </h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Apakah Anda yakin ingin {isApprove ? 'menyetujui' : 'menolak'} donasi{' '}
            <span className="font-semibold">
              {selectedDonation.amount} {selectedDonation.item_name}
            </span>{' '}
            dari <span className="font-semibold">{selectedDonation.user?.name}</span>?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={processingId === selectedDonation.id}
            >
              Batal
            </button>
            <button
              onClick={() => handleStatusUpdate(selectedDonation.id, isApprove ? 'approved' : 'rejected')}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isApprove 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              disabled={processingId === selectedDonation.id}
            >
              {processingId === selectedDonation.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Memproses...
                </>
              ) : (
                <>
                  {isApprove ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {isApprove ? 'Setujui' : 'Tolak'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavBar isAdmin={true} />
      
      <div className="container mx-auto max-w-6xl mt-20">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/adminpanti")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <Gift className="h-8 w-8" />
                Kelola Donasi Masuk
              </h1>
            </div>
            <button
              onClick={fetchDonations}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes("berhasil") 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              {message}
            </div>
          )}

          {selectedPanti && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Menampilkan donasi untuk: <span className="font-semibold">{selectedPanti.namaPanti}</span>
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-800">{statusCounts.all}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-3xl font-bold text-amber-700">{statusCounts.pending}</div>
              <div className="text-sm text-amber-600">Menunggu</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-3xl font-bold text-emerald-700">{statusCounts.approved}</div>
              <div className="text-sm text-emerald-600">Disetujui</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-700">{statusCounts.rejected}</div>
              <div className="text-sm text-red-600">Ditolak</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari donatur, barang, atau panti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Memuat data donasi...</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2 text-lg">
                {donations.length === 0 
                  ? "Belum ada donasi masuk" 
                  : "Tidak ada donasi yang sesuai dengan filter"
                }
              </p>
              {searchTerm || statusFilter !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Reset Filter
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDonations.map((donation) => {
                const statusConfig = getStatusConfig(donation.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={donation.id}
                    className={`border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer ${statusConfig.bgColor} border-gray-200`}
                    onClick={() => showDetails(donation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {donation.user?.name || 'Unknown User'} 
                            </h4>
                            <p className="text-sm text-gray-600">
                              {donation.panti?.name || 'Unknown Panti'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-16 space-y-2">
                          <p className="font-medium text-gray-700 text-lg">
                            {donation.amount} {donation.item_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatDate(donation.created_at)}
                          </div>
                          {donation.message && (
                            <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
                              "{donation.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${statusConfig.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          {statusConfig.text}
                        </span>
                        
                        {donation.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirmation(donation, 'approve');
                              }}
                              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Setujui"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirmation(donation, 'reject');
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Tolak"
                              >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DetailModal />
      <ConfirmationModal />
    </div>
  );
};

export default DonationManagement;