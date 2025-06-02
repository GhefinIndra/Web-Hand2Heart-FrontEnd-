import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./Navbar";

const TambahPanti = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaPanti: "",
    kota: "",
    kontak: "",
    deskripsi: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("=== ADDING NEW PANTI TO LARAVEL ===");
      
      // Get auth data from localStorage
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      console.log("Raw localStorage data:", {
        token: token,
        userStr: userStr
      });
      
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

      console.log("Parsed user object:", user);
      console.log("User keys:", Object.keys(user));
      console.log("User properties:");
      Object.keys(user).forEach(key => {
        console.log(`  ${key}:`, user[key]);
      });

      // Try to find email in different possible locations
      let userEmail = user?.email || user?.user?.email || user?.username;
      
      console.log("Email search results:", {
        'user.email': user?.email,
        'user.user?.email': user?.user?.email,
        'user.username': user?.username,
        'final_email': userEmail
      });

      if (!userEmail) {
        console.error("User email is missing from localStorage");
        console.log("Complete user object:", user);
        
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
          alert("Email user tidak ditemukan. Silakan login kembali.");
          localStorage.clear();
          navigate("/login");
          return;
        }
      }

      console.log("Using user email:", userEmail);

      // Prepare data for Laravel API
      const requestData = {
        namaPanti: formData.namaPanti.trim(),
        kota: formData.kota.trim(),
        kontak: formData.kontak.trim(),
        deskripsi: formData.deskripsi.trim()
      };

      console.log("Request data:", requestData);
      console.log("Request headers:", {
        'Authorization': `Bearer ${token}`,
        'X-User-Email': userEmail,
        'Content-Type': 'application/json'
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/api/panti",
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': userEmail,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        setFormData({
          namaPanti: "",
          kota: "",
          kontak: "",
          deskripsi: "",
        });

        setMessage("Panti berhasil ditambahkan!");
        
        // Navigate to admin panti after 2 seconds
        setTimeout(() => {
          navigate("/adminpanti");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Failed to add panti");
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        
        if (error.response.status === 401) {
          alert("Sesi telah berakhir. Silakan login kembali.");
          localStorage.clear();
          navigate("/login");
          return;
        } else if (error.response.status === 422) {
          // Validation errors
          const validationErrors = error.response.data.errors || {};
          const errorMessages = Object.values(validationErrors).flat();
          setMessage(`Validation error: ${errorMessages.join(', ')}`);
        } else if (error.response.status === 403) {
          setMessage("Anda tidak memiliki izin untuk menambah panti asuhan.");
        } else {
          setMessage(`Error: ${error.response.data.message || "Gagal menambahkan panti"}`);
        }
      } else {
        setMessage("Gagal menambahkan panti. Periksa koneksi internet Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavBar isAdmin={true} />
      <div className="container mx-auto max-w-2xl bg-white shadow-lg rounded-lg p-8 mt-20">
        <h1 className="text-2xl font-bold text-center mb-8 text-blue-600">
          Tambah Panti Asuhan Baru
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Panti Asuhan *
            </label>
            <input
              type="text"
              name="namaPanti"
              value={formData.namaPanti}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama panti asuhan"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kota *
            </label>
            <input
              type="text"
              name="kota"
              value={formData.kota}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama kota"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Kontak *
            </label>
            <input
              type="text"
              name="kontak"
              value={formData.kontak}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nomor telepon/WhatsApp"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan deskripsi singkat tentang panti asuhan (opsional)"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white bg-blue-600 rounded-lg p-3 hover:bg-blue-700 transition font-medium ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Menambahkan...' : 'Tambah Panti'}
          </button>
        </form>
        
        {message && (
          <p className={`mt-4 text-center font-medium ${
            message.includes("berhasil") ? "text-green-600" : "text-red-600"
          }`}>
            {message}
          </p>
        )}
        
        <button
          onClick={() => navigate("/adminpanti")}
          disabled={isLoading}
          className={`mt-4 w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition font-medium ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default TambahPanti;