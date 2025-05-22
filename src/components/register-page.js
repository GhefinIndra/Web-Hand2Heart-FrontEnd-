import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Mail,
  Lock,
  User,
  Heart,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Phone,
  UserSquare,
  Shield,
  Info,
  UserPlus,
  HandHeart,
  Building,
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    }

    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Nomor HP harus diisi';
    }

    if (!formData.role) {
      newErrors.role = 'Pilih peran Anda';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
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
        const response = await axios.post('http://localhost:8080/api/user/register', {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        });
        console.log('Registration successful:', response.data);
        navigate('/login');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat registrasi.';
        setErrors({ api: errorMessage });
        console.error('Error during registration:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderRoleSelection = () => {
    const roles = [
      {
        value: 'donatur',
        label: 'Donatur',
        icon: <HandHeart className="h-8 w-8" />,
        description: 'Saya ingin berdonasi dan membantu',
      },
      {
        value: 'pj_panti',
        label: 'Penanggung Jawab Panti',
        icon: <Building className="h-8 w-8" />,
        description: 'Saya mengelola sebuah panti',
      },
    ];

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3 ml-2">Pilih Peran Anda</label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  role: role.value,
                }))
              }
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition ${
                formData.role === role.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              {React.cloneElement(role.icon, {
                className: `${
                  formData.role === role.value ? 'text-blue-500' : 'text-gray-400'
                } mb-2`,
              })}
              <span className="font-medium text-sm">{role.label}</span>
              <span className="text-xs text-gray-500 mt-1 text-center">{role.description}</span>
            </button>
          ))}
        </div>
        {errors.role && (
          <p className="mt-2 text-sm text-red-600 flex items-center ml-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.role}
          </p>
        )}
      </div>
    );
  };

  const renderInput = (name, label, type = 'text', icon, placeholder) => {
    const isPassword = type === 'password';
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 ml-2">{label}</label>
        <div className="relative">
          <input
            type={isPassword ? (showPassword[name] ? 'text' : 'password') : type}
            name={name}
            className={`w-full pl-10 ${
              isPassword ? 'pr-12' : 'pr-4'
            } py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white shadow-sm ${
              errors[name] ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
          />
          {React.cloneElement(icon, {
            className: 'h-5 w-5 text-blue-600 absolute left-3 top-3.5',
          })}
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              onClick={() =>
                setShowPassword((prev) => ({
                  ...prev,
                  [name]: !prev[name],
                }))
              }
            >
              {showPassword[name] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
          <h1 className="text-2xl font-bold text-blue-700">Daftar Akun Baru</h1>
          <p className="text-gray-600 mt-2 text-sm">Bergabunglah untuk mulai berdonasi</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <UserSquare className="h-5 w-5 text-blue-600 mr-3" />
              <h3 className="text-base font-bold text-gray-800">Informasi Pribadi</h3>
            </div>
            <hr className="mb-4 border-gray-200" />
            
            {renderInput('fullName', 'Nama Lengkap', 'text', <User />, 'Masukkan Nama Lengkap')}
            {renderInput('email', 'Email', 'email', <Mail />, 'Masukkan Email')}
            {renderInput('phone', 'Nomor HP', 'tel', <Phone />, 'Masukkan Nomor HP')}
            {renderRoleSelection()}
          </div>

          {/* Security Information Section */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-blue-600 mr-3" />
              <h3 className="text-base font-bold text-gray-800">Informasi Keamanan</h3>
            </div>
            <hr className="mb-4 border-gray-200" />
            
            {renderInput('password', 'Password', 'password', <Lock />, 'Masukkan Password')}
            {renderInput('confirmPassword', 'Konfirmasi Password', 'password', <Lock />, 'Masukkan Konfirmasi Password')}
          </div>

          {/* Role Information - hanya tampil jika role donatur dipilih */}
          {formData.role === 'donatur' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-700 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-blue-700 text-sm">
                  Anda akan terdaftar sebagai Donatur di platform kami
                </p>
              </div>
            </div>
          )}

          {/* API Error Message */}
          {errors.api && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-700 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.api}</p>
              </div>
            </div>
          )}

          {/* Register Button */}
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
                Memproses...
              </div>
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-3" />
                Daftar Sekarang
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">Sudah punya akun? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-700 hover:text-blue-800 font-semibold text-sm transition"
            >
              Masuk
            </button>
          </div>
        </form>

        {/* Back to Home */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 flex items-center justify-center w-full transition"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm">Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;