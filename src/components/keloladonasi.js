import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./Navbar";

const AdminDonationManagement = () => {
  const { pantiId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
  });

  useEffect(() => {
    if (!pantiId) {
      alert("ID panti tidak ditemukan!");
      navigate("/");
    }
  }, [pantiId, navigate]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/barang/${pantiId}`
        );
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [pantiId]);

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value,
    });
  };

  const addNewItem = async () => {
    if (!newItem.name || !newItem.quantity) {
      alert("Semua field wajib diisi!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/barang", {
        namaBarang: newItem.name.trim(),
        jumlah: parseInt(newItem.quantity),
        pantiAsuhan: { id: parseInt(pantiId) },
      });

      setItems([...items, response.data]);
      setNewItem({ name: "", quantity: "" });
    } catch (error) {
      if (error.response) {
        console.error("Response error:", error.response.data);
        alert(`Error: ${error.response.data.message || "Gagal menambahkan item."}`);
      } else {
        console.error("Network error:", error);
        alert("Gagal terhubung ke server.");
      }
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8080/api/barang/${itemId}`);
      setItems(items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar isAdmin={true} /> {/* Mengirimkan properti isAdmin */}
      <div className="container mx-auto max-w-4xl p-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Kelola Kebutuhan Donasi
        </h1>
        {/* Tambah Item Donasi */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Tambah Item Donasi
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nama Barang"
              name="name"
              value={newItem.name}
              onChange={handleNewItemChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Jumlah"
              name="quantity"
              value={newItem.quantity}
              onChange={handleNewItemChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addNewItem}
            className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Tambah Item
          </button>
        </div>
        {/* Daftar Item Donasi */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Daftar Kebutuhan Donasi
          </h2>
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 mb-4 border rounded-lg"
              >
                <div>
                  <h3 className="text-lg font-bold">{item.namaBarang}</h3>
                  <p className="text-sm text-gray-600">
                    Jumlah: {item.jumlah} buah
                  </p>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                >
                  Hapus
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">
              Belum ada barang yang ditambahkan.
            </p>
          )}
        </div>
        {/* Tombol Kembali */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/adminpanti")} // Path kembali ke halaman admin
            className="mt-8 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDonationManagement;
