import React from 'react';
import { Heart, Users, Target, Award, HandHeart, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';

const AboutPage = () => {
  const stats = [
    { number: '1000+', label: 'Donatur Aktif' },
    { number: '50+', label: 'Panti Asuhan' },
    { number: 'Rp 500jt+', label: 'Total Donasi' },
    { number: '5000+', label: 'Anak Terbantu' },
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: 'Kepedulian',
      description: 'Kami percaya setiap tindakan peduli, sekecil apapun, dapat membawa perubahan berarti dalam kehidupan anak-anak.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: 'Transparansi',
      description: 'Komitmen kami untuk menjaga kepercayaan dengan keterbukaan dalam setiap pengelolaan donasi.'
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: 'Dampak',
      description: 'Fokus kami adalah menciptakan dampak nyata dan berkelanjutan bagi masa depan anak-anak Indonesia.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Tentang Hand2Heart</h1>
          <p className="text-lg md:text-xl opacity-90">
            Membangun jembatan kebaikan antara para donatur dan anak-anak panti asuhan, 
            menciptakan masa depan yang lebih cerah bagi generasi mendatang.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-sky-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Misi Kami</h2>
          <p className="text-lg text-gray-600 mb-8">
            Hand2Heart hadir untuk memudahkan setiap orang berbagi kebaikan kepada 
            anak-anak panti asuhan di Indonesia. Kami berkomitmen menciptakan 
            platform donasi yang transparan, aman, dan berdampak.
          </p>
          <div className="flex justify-center">
            <HandHeart className="w-16 h-16 text-sky-500" />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nilai-Nilai Kami</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-sky-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Bergabung Bersama Kami</h2>
          <p className="text-lg text-gray-600 mb-8">
            Jadilah bagian dari perubahan. Setiap donasi Anda membawa harapan baru 
            bagi anak-anak yang membutuhkan.
          </p>
          <button className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-all duration-300 group">
            <span className="mr-2">Mulai Berdonasi</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Achievement Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Award className="w-12 h-12 text-sky-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Pencapaian</h2>
          <p className="text-lg text-gray-600">
            Sejak 2024, Hand2Heart telah membantu ribuan anak mendapatkan akses 
            pendidikan, kesehatan, dan kebutuhan dasar yang lebih baik. Kepercayaan 
            Anda adalah motivasi kami untuk terus berkembang dan memberikan dampak 
            lebih besar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;