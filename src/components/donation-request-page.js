import React, { useState, useEffect } from "react";
import axios from "axios";
import { Home, ShoppingCart, Gift, CheckCircle, AlertCircle } from "lucide-react";
import NavBar from "./Navbar";

const DonationRequestPage = () => {
  const [donations, setDonations] = useState([]);
  const [selectedOrphanage, setSelectedOrphanage] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donorMessage, setDonorMessage] = useState(""); // ✅ Tambahkan ini
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
  const useDummy = false; // 🔁 Ganti ke false jika mau pakai API

  const fetchDonations = async () => {
    if (useDummy) {
      // ✅ Data dummy
      const dummyData = [
        {
          id: 1,
          orphanageName: "Panti Asuhan Kasih Ibu",
          city: "Bandung",
          requests: [
            { item: "Beras", quantity: 100 },
            { item: "Minyak Goreng", quantity: 50 },
          ],
        },
        {
          id: 2,
          orphanageName: "Panti Asuhan Harapan Bangsa",
          city: "Jakarta",
          requests: [
            { item: "Buku Tulis", quantity: 200 },
            { item: "Pulpen", quantity: 150 },
          ],
        },
      ];
      setDonations(dummyData);
    } else {
      // 🌐 Fetch dari API
      try {
        const responsePanti = await axios.get("http://localhost:8080/api/panti");
        const orphanages = responsePanti.data;

        const orphanagesWithRequests = await Promise.all(
          orphanages.map(async (orphanage) => {
            const responseBarang = await axios.get(
              `http://localhost:8080/api/barang/${orphanage.id}`
            );
            return {
              id: orphanage.id,
              orphanageName: orphanage.namaPanti,
              city: orphanage.kota,
              requests: responseBarang.data.map((item) => ({
                item: item.namaBarang,
                quantity: item.jumlah,
              })),
            };
          })
        );

        setDonations(orphanagesWithRequests);
      } catch (error) {
        console.error("Error fetching donation data:", error);
      }
    }
  };

  fetchDonations();
}, []);


  const handleOrphanageSelect = (orphanage) => {
    setSelectedOrphanage(orphanage);
    setSelectedRequest(null);
    setDonationAmount("");
    setDonorMessage(""); // Reset pesan juga
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setDonationAmount("");
    setDonorMessage("");
  };

  const handleDonationAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setDonationAmount(value);
    }
  };

  const isValidDonation = () => {
    if (!selectedRequest) return false;
    return (
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

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("User belum login.");
        return;
      }

      const donationData = {
        user: { id: user.id },
        pantiAsuhan: { id: selectedOrphanage.id },
        item: selectedRequest.item,
        amount: parseInt(donationAmount),
        message: donorMessage, // ✅ Tambahkan ke payload
      };

      const response = await axios.post(
        "http://localhost:8080/api/donation",
        donationData
      );

      if (response.status === 200) {
        setShowSuccessPopup(true);

        const updatedRequests = selectedOrphanage.requests.map((req) =>
          req.item === selectedRequest.item
            ? { ...req, quantity: req.quantity - donationData.amount }
            : req
        );

        setSelectedOrphanage({ ...selectedOrphanage, requests: updatedRequests });

        setDonationAmount("");
        setSelectedRequest(null);
        setDonorMessage(""); // ✅ Reset pesan
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("Gagal mengirim donasi. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-6">
      <NavBar />
      <div className="container mx-auto max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600 flex items-center justify-center">
          <Home className="mr-3 text-blue-500" /> Permintaan Donasi Panti Asuhan
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Pilih Panti Asuhan</h2>
            {donations.map((orphanage) => (
              <div
                key={orphanage.id}
                onClick={() => handleOrphanageSelect(orphanage)}
                className={`p-4 mb-4 border rounded-lg cursor-pointer transition ${
                  selectedOrphanage === orphanage
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{orphanage.orphanageName}</h3>
                    <p className="text-sm text-gray-600">{orphanage.city}</p>
                  </div>
                  <Home className="text-blue-500" />
                </div>
              </div>
            ))}
          </div>

          <div>
            {selectedOrphanage && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Kebutuhan {selectedOrphanage.orphanageName}
                </h2>
                {selectedOrphanage.requests.map((request) => (
                  <div
                    key={request.item}
                    onClick={() => handleRequestSelect(request)}
                    className={`p-4 mb-4 border rounded-lg cursor-pointer transition ${
                      selectedRequest === request
                        ? "border-green-500 bg-green-50"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{request.item}</h3>
                        <p className="text-sm text-gray-600">
                          Maksimal: {request.quantity} buah
                        </p>
                      </div>
                      <ShoppingCart className="text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedRequest && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Jumlah Donasi
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah {selectedRequest.item} yang ingin didonasikan:
                </label>
                <input
                  type="text"
                  value={donationAmount}
                  onChange={handleDonationAmountChange}
                  placeholder={`Maksimal ${selectedRequest.quantity} buah`}
                  className="w-full p-2 border rounded-md"
                />
                {donationAmount &&
                  parseInt(donationAmount) > selectedRequest.quantity && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Jumlah melebihi kebutuhan
                    </p>
                  )}
              </div>

              {/* ✅ Tambahkan input pesan */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan untuk Panti Asuhan (opsional):
                </label>
                <textarea
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder="Contoh: Semoga bermanfaat 😊"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <button
                onClick={handleSubmitDonation}
                className={`w-full py-3 rounded-lg transition flex items-center justify-center ${
                  isValidDonation()
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isValidDonation()}
              >
                <CheckCircle className="mr-2" /> Donasi
              </button>
            </div>
          </div>
        )}

        {showSuccessPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center animate-popup">
              <h3 className="text-lg font-bold text-green-600 mb-4">
                Donasi Berhasil!
              </h3>
              <p className="text-gray-700 mb-6">
                Terima kasih telah berdonasi untuk panti asuhan.
              </p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>

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
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DonationRequestPage;
