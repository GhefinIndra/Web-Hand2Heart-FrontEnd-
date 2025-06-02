import React, { useState, useEffect } from 'react';
import { Calendar, Package, Heart, ChevronRight, X, Gift, AlertCircle } from 'lucide-react';

const DonationHistoryPage = () => {
  const [donationHistory, setDonationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'exists' : 'missing');
      
      // Make sure you're using the correct endpoint URL
      const response = await fetch('/api/donation', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`Expected JSON but got ${contentType}. Response: ${textResponse.substring(0, 200)}...`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok && data.success) {
        setDonationHistory(data.data || []);
      } else {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Error fetching donation history:', error);
      
      // Set more detailed error message
      if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
        setError('Server returned HTML instead of JSON. Please check your API endpoint and authentication.');
      } else {
        setError(error.message);
      }
      
      // Load sample data for demo purposes
      setDonationHistory([
        {
          id: 1,
          panti: { name: 'Panti Asuhan Kasih Ibu', kota: 'Jakarta' },
          item_name: 'Baju Bekas Layak Pakai',
          amount: 1,
          message: 'Semoga berkah',
          status: 'approved',
          created_at: '2025-04-10T10:00:00Z'
        },
        {
          id: 2,
          panti: { name: 'Rumah Yatim Piatu Nur Iman', kota: 'Bandung' },
          item_name: 'Buku Pelajaran SD',
          amount: 10,
          message: 'Semoga bermanfaat untuk pendidikan',
          status: 'pending',
          created_at: '2025-03-28T14:30:00Z'
        },
        {
          id: 3,
          panti: { name: 'Panti Asuhan Cahaya Kasih', kota: 'Surabaya' },
          item_name: 'Paket Sembako',
          amount: 5,
          message: 'Untuk kebutuhan sehari-hari',
          status: 'approved',
          created_at: '2025-03-02T09:15:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      default: return 'Unknown';
    }
  };

  const showDonationDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  // Error State Component
  const ErrorState = () => (
    <div className="mx-4 my-5 p-5 bg-red-50 rounded-2xl">
      <div className="flex items-center mb-3">
        <AlertCircle size={20} className="text-red-500 mr-2" />
        <h3 className="text-lg font-bold text-red-700">Error</h3>
      </div>
      <p className="text-sm text-red-600 mb-4">{error}</p>
      <button 
        onClick={fetchDonationHistory}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );

  // Empty State Component
  const EmptyDonationHistory = () => (
    <div className="mx-4 my-5 p-5 bg-gray-50 rounded-2xl flex flex-col items-center">
      <Gift size={60} className="text-gray-300 mb-4" />
      <h3 className="text-lg font-bold mb-2">Belum Ada Riwayat Donasi</h3>
      <p className="text-sm text-gray-600 text-center mb-5">
        Donasi sekarang untuk membantu yang membutuhkan
      </p>
      <button 
        onClick={() => window.location.href = '/donation-options'}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
      >
        <Heart size={16} />
        Donasi Sekarang
      </button>
    </div>
  );

  // Detail Modal Component
  const DonationDetailModal = () => {
    if (!showDetailModal || !selectedDonation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Detail Donasi</h2>
            <button 
              onClick={() => setShowDetailModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <DetailRow label="Panti Asuhan" value={selectedDonation.panti?.name || 'N/A'} />
            <DetailRow 
              label="Barang" 
              value={`${selectedDonation.amount} ${selectedDonation.item_name}`} 
            />
            <DetailRow label="Tanggal" value={formatDate(selectedDonation.created_at)} />
            <DetailRow label="Status" value={getStatusText(selectedDonation.status)} />
            <DetailRow label="Pesan" value={selectedDonation.message || 'Tidak ada pesan'} />
          </div>
          
          <button 
            onClick={() => setShowDetailModal(false)}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  };

  // Detail Row Component
  const DetailRow = ({ label, value }) => (
    <div className="flex py-2">
      <div className="w-24 text-sm text-gray-600">{label}</div>
      <div className="ml-2 flex-1 text-sm font-medium">{value}</div>
    </div>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-lg mx-auto px-4 py-4">
            <h1 className="text-lg font-semibold text-center">Riwayat Donasi</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-center">Riwayat Donasi</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-bold text-gray-800">Riwayat Donasi</h2>
          </div>
          
          {error ? (
            <ErrorState />
          ) : donationHistory.length === 0 ? (
            <EmptyDonationHistory />
          ) : (
            <div className="pb-4">
              {donationHistory.map((donation, index) => (
                <div key={donation.id}>
                  <div 
                    onClick={() => showDonationDetails(donation)}
                    className="flex items-start p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4">
                      <Package className="text-amber-500" size={24} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate">
                        {donation.panti?.name || 'Unknown Panti'}
                      </h3>
                      <p className="text-sm text-gray-700 mt-1">
                        {donation.amount} {donation.item_name}
                      </p>
                      
                      <div className="flex items-center mt-2 gap-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(donation.created_at)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                          {getStatusText(donation.status)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <ChevronRight className="text-gray-400 ml-2" size={20} />
                  </div>
                  
                  {/* Divider */}
                  {index < donationHistory.length - 1 && (
                    <div className="mx-6 border-t border-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DonationDetailModal />
    </div>
  );
};

export default DonationHistoryPage;