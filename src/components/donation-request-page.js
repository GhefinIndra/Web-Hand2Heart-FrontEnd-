import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Heart, 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  Users,
  Package,
  ArrowLeft,
  Send
} from "lucide-react";
import Navbar from "./Navbar";

const DonationRequestPage = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [selectedOrphanage, setSelectedOrphanage] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      console.log('=== FETCHING DONATIONS FROM LARAVEL ===');
      
      // Get token and user from localStorage
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      console.log('Auth data from localStorage:', {
        token: token,
        user: user,
        user_email: user?.email
      });
      
      if (!token || !user) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      if (!user.email) {
        alert('User email is missing. Please login again.');
        localStorage.clear();
        navigate('/login');
        return;
      }

      console.log('Fetching panti with headers:', {
        'Authorization': `Bearer ${token}`,
        'X-User-Email': user.email,
        'Content-Type': 'application/json'
      });

      // 1. Get all panti from Laravel API
      const responsePanti = await axios.get("http://127.0.0.1:8000/api/panti", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': user.email,
          'Content-Type': 'application/json'
        }
      });

      console.log('Panti response:', responsePanti.data);

      if (!responsePanti.data.success) {
        throw new Error(responsePanti.data.message || 'Failed to fetch panti');
      }

      const orphanages = responsePanti.data.data;

      // 2. Get barang for each panti
      const orphanagesWithRequests = await Promise.all(
        orphanages.map(async (orphanage) => {
          try {
            console.log('Fetching barang for panti:', orphanage.id);
            
            const responseBarang = await axios.get(
              `http://127.0.0.1:8000/api/barang/${orphanage.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'X-User-Email': user.email,
                  'Content-Type': 'application/json'
                }
              }
            );

            console.log(`Barang for panti ${orphanage.id}:`, responseBarang.data);

            return {
              id: orphanage.id,
              orphanageName: orphanage.namaPanti,
              city: orphanage.kota,
              alamat: orphanage.alamat,
              kontak: orphanage.kontak,
              deskripsi: orphanage.deskripsi,
              requests: responseBarang.data.success ? 
                responseBarang.data.data.map((item) => ({
                  id: item.id,
                  item: item.namaBarang,
                  quantity: item.jumlah,
                  satuan: item.satuan || 'buah'
                })) : []
            };
          } catch (error) {
            console.error(`Error fetching barang for panti ${orphanage.id}:`, error);
            return {
              id: orphanage.id,
              orphanageName: orphanage.namaPanti,
              city: orphanage.kota,
              alamat: orphanage.alamat,
              kontak: orphanage.kontak,
              deskripsi: orphanage.deskripsi,
              requests: []
            };
          }
        })
      );

      console.log('Final orphanages with requests:', orphanagesWithRequests);
      setDonations(orphanagesWithRequests);

    } catch (error) {
      console.error("Error fetching donation data:", error);
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

  const handleDonate = (orphanage, request) => {
    setSelectedOrphanage(orphanage);
    setSelectedRequest(request);
    setShowDonationForm(true);
    setDonationAmount("");
    setDonorMessage("");
  };

  const isValidDonation = () => {
    return (
      selectedOrphanage &&
      selectedRequest &&
      donationAmount &&
      parseInt(donationAmount) > 0 &&
      parseInt(donationAmount) <= selectedRequest.quantity
    );
  };

  const handleSubmitDonation = async () => {
    try {
      if (!isValidDonation()) {
        alert("Data donasi tidak valid.");
        return;
      }

      setIsSubmitting(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      
      if (!user || !user.id || !token) {
        alert("User belum login.");
        return;
      }

      if (!user.email) {
        alert("User email is missing. Please login again.");
        localStorage.clear();
        navigate('/login');
        return;
      }

      console.log('=== SUBMITTING DONATION TO LARAVEL ===');

      const donationData = {
        user: { id: user.id },
        pantiAsuhan: { id: selectedOrphanage.id },
        item: selectedRequest.item,
        amount: parseInt(donationAmount),
        message: donorMessage,
      };

      console.log('Donation data to submit:', donationData);
      console.log('Using headers:', {
        'Authorization': `Bearer ${token}`,
        'X-User-Email': user.email,
        'Content-Type': 'application/json'
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/api/donation",
        donationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': user.email,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Donation response:', response.data);

      if (response.data.success) {
        setShowSuccessPopup(true);
        setShowDonationForm(false);
        
        // Update the local state to reflect the donation
        setDonations(prevDonations =>
          prevDonations.map(orphanage => {
            if (orphanage.id === selectedOrphanage.id) {
              return {
                ...orphanage,
                requests: orphanage.requests.map(request => {
                  if (request.id === selectedRequest.id) {
                    return {
                      ...request,
                      quantity: Math.max(0, request.quantity - parseInt(donationAmount))
                    };
                  }
                  return request;
                })
              };
            }
            return orphanage;
          })
        );
      } else {
        throw new Error(response.data.message || 'Donation failed');
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.clear();
          navigate('/login');
          return;
        } else if (error.response.status === 422) {
          const validationErrors = error.response.data.errors || {};
          const errorMessages = Object.values(validationErrors).flat();
          alert(`Validation error: ${errorMessages.join(', ')}`);
        } else {
          alert(`Error: ${error.response.data.message || 'Gagal mengirim donasi'}`);
        }
      } else {
        alert("Gagal mengirim donasi. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSelectedOrphanage(null);
    setSelectedRequest(null);
    setDonationAmount("");
    setDonorMessage("");
  };

  const handleCloseDonationForm = () => {
    setShowDonationForm(false);
    setSelectedOrphanage(null);
    setSelectedRequest(null);
    setDonationAmount("");
    setDonorMessage("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data donasi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Donasi untuk Panti Asuhan
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Berbagi kebahagiaan dengan membantu kebutuhan anak-anak di panti asuhan
            </p>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali
            </button>
          </div>

          {/* Donation Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {donations.map((orphanage) => (
              <div key={orphanage.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {orphanage.orphanageName}
                  </h3>
                  <div className="flex items-center text-blue-100 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{orphanage.city}</span>
                  </div>
                  {orphanage.kontak && (
                    <div className="flex items-center text-blue-100">
                      <Phone className="h-4 w-4 mr-1" />
                      <span className="text-sm">{orphanage.kontak}</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {orphanage.deskripsi && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {orphanage.deskripsi}
                    </p>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <Package className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-semibold text-gray-800">
                        Kebutuhan ({orphanage.requests.length})
                      </span>
                    </div>

                    {orphanage.requests.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {orphanage.requests.map((request) => (
                          <div key={request.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-800">
                                {request.item}
                              </span>
                              <p className="text-sm text-gray-600">
                                Dibutuhkan: {request.quantity} {request.satuan}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDonate(orphanage, request)}
                              disabled={request.quantity <= 0}
                              className={`px-4 py-2 rounded-lg font-medium transition ${
                                request.quantity > 0
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {request.quantity > 0 ? 'Donasi' : 'Terpenuhi'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-gray-600">
                          Semua kebutuhan sudah terpenuhi
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Terima kasih untuk semua donatur
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {donations.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Data Panti Asuhan
              </h3>
              <p className="text-gray-500">
                Saat ini belum ada panti asuhan yang terdaftar di sistem.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md animate-popup">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Form Donasi
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Panti Asuhan
                </label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                  {selectedOrphanage?.orphanageName}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item yang Didonasikan
                </label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                  {selectedRequest?.item} (Tersedia: {selectedRequest?.quantity} {selectedRequest?.satuan})
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Donasi *
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  min="1"
                  max={selectedRequest?.quantity}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Maksimal ${selectedRequest?.quantity} ${selectedRequest?.satuan}`}
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan untuk Panti Asuhan (Opsional)
                </label>
                <textarea
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tulis pesan motivasi atau dukungan..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseDonationForm}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitDonation}
                  disabled={!isValidDonation() || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Kirim Donasi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md text-center animate-popup">
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-600 mb-2">
                Donasi Berhasil Dikirim!
              </h3>
              <p className="text-gray-700 mb-4">
                Terima kasih atas donasi Anda untuk {selectedOrphanage?.orphanageName}.
                Donasi Anda akan sangat membantu anak-anak di sana.
              </p>
              <button
                onClick={handleCloseSuccessPopup}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-popup {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DonationRequestPage;