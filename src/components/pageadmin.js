import React, { useState, useEffect } from "react";
import { Home, Users, DollarSign, Plus, ArrowRight } from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [panti, setPanti] = useState([]);
  const [selectedPanti, setSelectedPanti] = useState(null);

  useEffect(() => {
    const fetchPanti = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/panti");
        setPanti(response.data);
      } catch (error) {
        console.error("Error fetching orphanages:", error);
      }
    };

    fetchPanti();
  }, []);

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
                <h3 className="text-xl font-semibold mb-4">
                  Daftar Panti Asuhan
                </h3>
                {panti.map((orphanage) => (
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
                      </div>
                      <Home className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                ))}
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
                  className="w-full bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer p-6"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Kelola Donasi
                      </h3>
                      <p className="mt-2 text-purple-100">
                        Atur kebutuhan dan donasi
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
