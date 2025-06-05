import React, { useState, useEffect } from "react";
import {
  Calendar,
  Package,
  Heart,
  ChevronRight,
  X,
  Gift,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Clock,
  MessageCircle,
  Check,
  Hourglass,
  XCircle,
  Sparkles,
} from "lucide-react";

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
      const token = localStorage.getItem("token");
      console.log("Token:", token ? "exists" : "missing");

      // Make sure you're using the correct endpoint URL
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch("http://127.0.0.1:8000/api/donation", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Email": user?.email || "",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Non-JSON response received:", textResponse);
        throw new Error(
          `Expected JSON but got ${contentType}. Response: ${textResponse.substring(
            0,
            200
          )}...`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.success) {
        setDonationHistory(data.data || []);
      } else {
        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error fetching donation history:", error);

      // Set more detailed error message
      if (
        error.name === "SyntaxError" &&
        error.message.includes("Unexpected token")
      ) {
        setError(
          "Server returned HTML instead of JSON. Please check your API endpoint and authentication."
        );
      } else {
        setError(error.message);
      }

      // Load sample data for demo purposes
      setDonationHistory([
        {
          id: 1,
          panti: { name: "Panti Asuhan Kasih Ibu", kota: "Jakarta" },
          item_name: "Baju Bekas Layak Pakai",
          amount: 1,
          message: "Semoga berkah",
          status: "approved",
          created_at: "2025-04-10T10:00:00Z",
        },
        {
          id: 2,
          panti: { name: "Rumah Yatim Piatu Nur Iman", kota: "Bandung" },
          item_name: "Buku Pelajaran SD",
          amount: 10,
          message: "Semoga bermanfaat untuk pendidikan",
          status: "pending",
          created_at: "2025-03-28T14:30:00Z",
        },
        {
          id: 3,
          panti: { name: "Panti Asuhan Cahaya Kasih", kota: "Surabaya" },
          item_name: "Paket Sembako",
          amount: 5,
          message: "Untuk kebutuhan sehari-hari",
          status: "approved",
          created_at: "2025-03-02T09:15:00Z",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          color: "text-emerald-700 bg-emerald-100 border-emerald-200",
          icon: Check,
          gradient: "from-emerald-50 to-emerald-100"
        };
      case "pending":
        return {
          color: "text-amber-700 bg-amber-100 border-amber-200",
          icon: Hourglass,
          gradient: "from-amber-50 to-amber-100"
        };
      case "rejected":
        return {
          color: "text-red-700 bg-red-100 border-red-200",
          icon: XCircle,
          gradient: "from-red-50 to-red-100"
        };
      default:
        return {
          color: "text-gray-700 bg-gray-100 border-gray-200",
          icon: Clock,
          gradient: "from-gray-50 to-gray-100"
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "pending":
        return "Menunggu";
      case "rejected":
        return "Ditolak";
      default:
        return "Unknown";
    }
  };

  const showDonationDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  const handleBackClick = () => {
    window.location.href = "/profile";
  };

  // Error State Component
  const ErrorState = () => (
    <div className="mx-4 my-6 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl border border-red-200 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center mr-3">
          <AlertCircle size={20} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-red-800">Terjadi Kesalahan</h3>
      </div>
      <p className="text-sm text-red-700 mb-5 leading-relaxed">{error}</p>
      <button
        onClick={fetchDonationHistory}
        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        Coba Lagi
      </button>
    </div>
  );

  // Empty State Component
  const EmptyDonationHistory = () => (
    <div className="mx-4 my-6 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl flex flex-col items-center border border-blue-100 shadow-sm">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Gift size={32} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">Belum Ada Riwayat Donasi</h3>
      <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed max-w-xs">
        Mulai berbagi kebaikan dengan berdonasi untuk membantu yang membutuhkan
      </p>
      <button
        onClick={() => (window.location.href = "/donasi")}
        className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        <Heart size={18} />
        <span className="font-semibold">Donasi Sekarang</span>
      </button>
    </div>
  );

  // Detail Modal Component
  const DonationDetailModal = () => {
    if (!showDetailModal || !selectedDonation) return null;

    const statusConfig = getStatusConfig(selectedDonation.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Detail Donasi</h2>
            <button
              onClick={() => setShowDetailModal(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="space-y-6">
            <DetailRow
              icon={<Package size={16} className="text-blue-600" />}
              label="Panti Asuhan"
              value={selectedDonation.panti?.name || "N/A"}
            />
            <DetailRow
              icon={<Gift size={16} className="text-purple-600" />}
              label="Barang"
              value={`${selectedDonation.amount} ${selectedDonation.item_name}`}
            />
            <DetailRow
              icon={<Calendar size={16} className="text-green-600" />}
              label="Tanggal"
              value={formatDate(selectedDonation.created_at)}
            />
            <DetailRow
              icon={<StatusIcon size={16} className={statusConfig.color.split(' ')[0]} />}
              label="Status"
              value={getStatusText(selectedDonation.status)}
              badge={
                <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${statusConfig.color}`}>
                  {getStatusText(selectedDonation.status)}
                </span>
              }
            />
            <DetailRow
              icon={<MessageCircle size={16} className="text-orange-600" />}
              label="Pesan"
              value={selectedDonation.message || "Tidak ada pesan"}
            />
          </div>

          <button
            onClick={() => setShowDetailModal(false)}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  };

  // Detail Row Component
  const DetailRow = ({ icon, label, value, badge }) => (
    <div className="flex items-start py-3 px-4 bg-gray-50 rounded-2xl">
      <div className="w-8 h-8 flex items-center justify-center mr-4 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800 leading-relaxed">{value}</div>
          {badge && badge}
        </div>
      </div>
    </div>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={handleBackClick}
                className="p-3 hover:bg-gray-100 rounded-xl mr-3 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-bold flex-1 text-center mr-12 text-gray-800">
                Riwayat Donasi
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalDonations = donationHistory.length;
  const approvedDonations = donationHistory.filter(d => d.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBackClick}
              className="p-3 hover:bg-gray-100 rounded-xl mr-3 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold flex-1 text-center mr-12 text-gray-800">
              Riwayat Donasi
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4">
        {/* Stats Card */}
        {!error && totalDonations > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 mb-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90 mb-1">Total Donasi</h3>
                <p className="text-3xl font-bold">{totalDonations}</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium opacity-90 mb-1">Disetujui</h3>
                <p className="text-3xl font-bold">{approvedDonations}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles size={28} />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Riwayat Donasi Anda</h2>
            <p className="text-sm text-gray-600 mt-1">Lihat semua donasi yang telah Anda berikan</p>
          </div>

          {error ? (
            <ErrorState />
          ) : donationHistory.length === 0 ? (
            <EmptyDonationHistory />
          ) : (
            <div className="pb-4">
              {donationHistory.map((donation, index) => {
                const statusConfig = getStatusConfig(donation.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={donation.id}>
                    <div
                      onClick={() => showDonationDetails(donation)}
                      className="flex items-start p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 group"
                    >
                      {/* Icon */}
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mr-4 shadow-sm group-hover:shadow-md transition-shadow">
                        <Package className="text-blue-600" size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-base text-gray-800 truncate pr-2">
                            {donation.panti?.name || "Unknown Panti"}
                          </h3>
                          <span className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 ${statusConfig.color} shrink-0`}>
                            <StatusIcon size={12} />
                            {getStatusText(donation.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{donation.panti?.kota}</span>
                        </div>

                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          {donation.amount} {donation.item_name}
                        </p>

                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(donation.created_at)}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="text-gray-400 ml-2 group-hover:text-gray-600 transition-colors" size={20} />
                    </div>

                    {/* Divider */}
                    {index < donationHistory.length - 1 && (
                      <div className="mx-6 border-t border-gray-100"></div>
                    )}
                  </div>
                );
              })}
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