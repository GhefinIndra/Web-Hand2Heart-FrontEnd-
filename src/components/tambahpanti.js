import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Tambahkan ini
import axios from "axios";
import NavBar from "./Navbar";

const TambahPanti = () => {
  const navigate = useNavigate(); // Inisialisasi navigate
  const [formData, setFormData] = useState({
    namaPanti: "",
    kota: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/panti", formData);

      setFormData({
        namaPanti: "",
        kota: "",
      });

      setMessage("Panti berhasil ditambahkan!");
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Gagal menambahkan panti. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavBar isAdmin={true} /> {/* Mengirimkan properti isAdmin */}
      <div className="container mx-auto max-w-2xl bg-white shadow-lg rounded-lg p-8 mt-20">
        <h1 className="text-2xl font-bold text-center mb-8 text-blue-600">
          Tambah Panti Asuhan Baru
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Panti Asuhan
            </label>
            <input
              type="text"
              name="namaPanti"
              value={formData.namaPanti}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Masukkan nama panti asuhan"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kota
            </label>
            <input
              type="text"
              name="kota"
              value={formData.kota}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Masukkan nama kota"
              required
            />
          </div>
          <button
            type="submit"
            className="text-blue-600 border border-blue-600 rounded-lg p-2 hover:bg-blue-600 hover:text-white transition"
          >
            Tambah Panti
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center ${message.includes("berhasil") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <button
          onClick={() => navigate("/adminpanti")} // Navigasi kembali ke halaman admin
          className="mt-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default TambahPanti;
