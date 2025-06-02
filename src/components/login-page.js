import React, { useState } from 'react';
import {
  Mail,
  Lock,
  LogIn,
  Heart,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        console.log('Login data to send:', {
          email: formData.email,
          password: formData.password,
        });
  
        const response = await axios.post('http://127.0.0.1:8000/api/login', {
          email: formData.email,
          password: formData.password,
        });
  
        console.log('Login successful:', response.data);
  
        const responseData = response.data;
        
        // Cari userData dengan berbagai kemungkinan struktur
        let userData = null;
        
        // Kemungkinan 1: response.data.data
        if (responseData.data) {
          userData = responseData.data;
          console.log('Found userData in responseData.data:', userData);
        }
        // Kemungkinan 2: response.data.user
        else if (responseData.user) {
          userData = responseData.user;
          console.log('Found userData in responseData.user:', userData);
        }
        // Kemungkinan 3: response.data langsung
        else {
          userData = responseData;
          console.log('Using responseData as userData:', userData);
        }
  
        // Debug userData
        console.log('Final userData:', userData);
        console.log('userData keys:', Object.keys(userData));
  
        // Simpan userData ke localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        if (userData.token) {
          localStorage.setItem("token", userData.token);
        }
  
        // Akses role dengan benar - role ada di userData.user.role
        let role = null;
        
        if (userData.user && userData.user.role) {
          role = userData.user.role;
          console.log('Found role in userData.user.role:', role);
        } else if (userData.role) {
          role = userData.role;
          console.log('Found role in userData.role:', role);
        }
  
        console.log('Final extracted role:', role);
        console.log('Role type:', typeof role);
  
        // Routing berdasarkan role
        if (role === "pj_panti") {
          console.log('Redirecting to /adminpanti');
          navigate("/adminpanti");
        } else if (role === "donatur") {
          console.log('Redirecting to /donasi');
          navigate("/donasi");
        } else {
          console.log('Unknown role:', role);
          console.log('Available userData for debugging:', userData);
          // Default redirect
          navigate("/donasi");
        }
  
      } catch (error) {
        console.error('Login error:', error);
  
        let errorMessage = 'Login gagal. Silakan coba lagi.';
        
        if (error.response?.data) {
          const errorData = error.response.data;
          
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.errors) {
            const firstErrorKey = Object.keys(errorData.errors)[0];
            errorMessage = errorData.errors[firstErrorKey][0] || errorMessage;
          } else if (errorData.success === false && errorData.message) {
            errorMessage = errorData.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
  
        setErrors({ api: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderInput = (name, label, type = 'text', icon, placeholder) => {
    const isPassword = type === 'password';
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">{label}</label>
        <div className="relative">
          <input
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            name={name}
            className={`w-full pl-10 ${
              isPassword ? 'pr-12' : 'pr-4'
            } py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white shadow-sm ${
              errors[name] ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            disabled={isLoading}
          />
          {React.cloneElement(icon, {
            className: 'h-5 w-5 text-blue-600 absolute left-3 top-3.5',
          })}
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {errors[name] && (
          <p className="mt-2 text-sm text-red-600 flex items-center ml-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg">
              <Heart className="h-9 w-9 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-blue-700">Selamat Datang</h1>
          <p className="text-gray-600 mt-2 text-sm">Masuk untuk mulai berdonasi</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Login Form */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
            {renderInput('email', 'Email', 'email', <Mail />, 'Masukkan Email')}
            {renderInput('password', 'Password', 'password', <Lock />, 'Masukkan Password')}
          </div>

          {/* API Error Message */}
          {errors.api && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-700 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.api}</p>
              </div>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full py-4 px-4 rounded-xl transition flex items-center justify-center font-semibold text-base shadow-md ${
              isLoading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            } text-white`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Masuk...
              </div>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-3" />
                Masuk
              </>
            )}
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">Belum punya akun? </span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-700 hover:text-blue-800 font-semibold text-sm transition"
              disabled={isLoading}
            >
              Daftar Sekarang
            </button>
          </div>
        </form>

        {/* Back to Home */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 flex items-center justify-center w-full transition"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm">Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;