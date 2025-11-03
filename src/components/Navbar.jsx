import React, { useState, useRef, useEffect } from "react";
import { RiMenu3Line } from "react-icons/ri";
import qlogo from "../assets/qlogo.jfif";
import { useLanguage } from "../contexts/LanguageContext.jsX";
import { translations } from "../pages/locales/translations";

const Navbar = ({ setIsSidebarOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="fixed top-0 right-0 left-0 bg-slate-800 text-white px-6 py-3 flex justify-between items-center shadow z-40">
      {/* ✅ Language Selector - Added on left side */}
      
      {/* ✅ Right side (Persian layout): logo + title - EXACTLY AS BEFORE */}
      <div className="flex gap-4 justify-content-end">
         <img
          src={qlogo}
          alt="لوگو قاصد"
          className="w-10 h-10 rounded-full shadow"
        />
        <span className="text-2xl font-bold text-orange-400">
          {t.dashboardTitle}
        </span>
       
      </div>

      {/* ✅ Left side: mobile menu toggle */}
      <button
        className="md:hidden bg-slate-700 p-2 rounded-md"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-label="Toggle Sidebar"
      >
        <RiMenu3Line size={24} />
      </button>
      <div className="flex items-center">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
          >
            <span className="text-sm">
              {language === 'fa' ? 'فارسی' : 'پښتو'}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-slate-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  changeLanguage('fa');
                  setShowDropdown(false);
                }}
                className={`w-full text-right px-4 py-2 hover:bg-slate-600 transition rounded-t-lg ${
                  language === 'fa' ? 'bg-slate-600' : ''
                }`}
              >
                فارسی
              </button>
              <button
                onClick={() => {
                  changeLanguage('ps');
                  setShowDropdown(false);
                }}
                className={`w-full text-right px-4 py-2 hover:bg-slate-600 transition rounded-b-lg ${
                  language === 'ps' ? 'bg-slate-600' : ''
                }`}
              >
                پښتو
              </button>
            </div>
          )}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;