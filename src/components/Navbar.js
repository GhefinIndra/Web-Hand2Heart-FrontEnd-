import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Hand, Heart } from "lucide-react";

const Hand2HeartLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/about");
  };

  return (
    <div
      className="flex items-center space-x-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleLogoClick}
    >
      <div className="relative">
        <div className="flex items-center">
          <Hand
            className={`h-6 w-6 text-sky-500 transition-all duration-300 absolute ${
              isHovered
                ? "translate-x-2 translate-y-2 opacity-0"
                : "opacity-100"
            }`}
          />
          <Heart
            className={`h-6 w-6 text-sky-500 transition-all duration-300 ${
              isHovered ? "scale-110 opacity-100" : "opacity-0"
            }`}
            fill={isHovered ? "#0ea5e9" : "none"}
          />
        </div>
      </div>
      <span className="font-bold text-xl text-sky-600">Hand2Heart</span>
    </div>
  );
};

const Navbar = ({ isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  // Check if current page is restricted for "Donasikan" and "Tentang Kami"
  const restrictedPaths = ["/tambah-panti", "/kelola-donasi", "/profile"];
  const isRestrictedPage = restrictedPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // Close the profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Hand2HeartLogo />

          {/* Navigation Links */}
          {!isAdmin && !isRestrictedPage && (
            <div className="hidden md:flex items-center space-x-8">
              <button
                className="text-sky-500 hover:text-sky-600"
                onClick={() => navigate("/donasi")}
              >
                Donasikan
              </button>
              <button
                className="text-sky-500 hover:text-sky-600"
                onClick={() => navigate("/about")}
              >
                Tentang Kami
              </button>
            </div>
          )}

          {/* Profile and Logout */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 transition-colors"
            >
              <User className="text-sky-600 w-6 h-6" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profil Saya
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
