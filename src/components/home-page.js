import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight, Hand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import anakImage from "./Asset/anak.jpeg";
import anakImage2 from "./Asset/anak2.jpg";
import anakImage3 from "./Asset/anak3.jpg";

const Hand2HeartLogo = () => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="flex items-center space-x-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="flex items-center">
          <Hand 
            className={`h-6 w-6 text-sky-500 transition-all duration-300 absolute
              ${isHovered ? 'translate-x-2 translate-y-2 opacity-0' : 'opacity-100'}`}
          />
          <Heart 
            className={`h-6 w-6 text-sky-500 transition-all duration-300
              ${isHovered ? 'scale-110 opacity-100' : 'opacity-0'}`}
            fill={isHovered ? "#0ea5e9" : "none"}
          />
        </div>
      </div>
      <span className="font-bold text-xl text-sky-600">Hand2Heart</span>
    </div>
  );
};

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const navigate = useNavigate();

  const slides = [
    {
      image: anakImage,
      title: "Berbagi Kebaikan",
      subtitle: "Setiap donasi membawa harapan baru"
    },
    {
      image: anakImage2,
      title: "Membantu Sesama",
      subtitle: "Bersama menciptakan perubahan positif"
    },
    {
      image: anakImage3,
      title: "Peduli Bersama",
      subtitle: "Satu langkah untuk masa depan lebih baik"
    }
  ];

  // Function to handle donation button click
  const handleDonateNow = () => {
    // Check if user is logged in (replace with your actual authentication logic)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
      // If logged in, navigate to donation page
      navigate('/donasi');
    } else {
      // If not logged in, navigate to login page
      navigate('/login');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Hand2HeartLogo />
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                className="text-sky-500 hover:text-sky-600"
                onClick={handleDonateNow}
              >
                Donasikan
              </button>
                <button 
                  className="text-sky-500 hover:text-sky-600"
                  onClick={() => navigate('/about')}
                >
                  Tentang Kami
                </button>
              </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <button 
                  className="text-sky-600 hover:text-sky-700"
                  onClick={() => navigate('/login')}
                >
                  Masuk
                </button>
                <button 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => navigate('/register')}
                >
                  Daftar
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="relative h-screen">
        {/* Hero Section with Image Slider */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 
              ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h1 className="text-5xl font-bold mb-4 text-center transform transition-all duration-500">
                {slide.title}
              </h1>
              <p className="text-xl mb-8 text-center transform transition-all duration-500">
                {slide.subtitle}
              </p>
              
              {/* Interactive Donation Button */}
              <button
                className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full transform transition-all duration-300 hover:scale-105"
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                onClick={handleDonateNow}
              >
                <span className="flex items-center space-x-2">
                  <span>Donasi Sekarang</span>
                  <ArrowRight className={`transition-transform duration-300 
                    ${isButtonHovered ? 'translate-x-1' : ''}`} 
                  />
                </span>
                <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 
                ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;