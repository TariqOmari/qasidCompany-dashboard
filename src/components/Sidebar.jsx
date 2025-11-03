import React, { useState, useEffect } from "react";
import {
  RiDashboardLine,
  RiBusFill,
  RiDriveLine,
  RiAirplayFill,
  RiLogoutBoxRLine,
  RiMoneyCnyBoxFill,
  RiMoneyDollarBoxFill,
} from "react-icons/ri";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext.jsX";
import { translations } from "../pages/locales/translations";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [company, setCompany] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const logo_url = import.meta.env.VITE_API_BASE_URL_For_logo;

  useEffect(() => {
    const storedCompany = sessionStorage.getItem("company");
    if (storedCompany) {
      setCompany(JSON.parse(storedCompany));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const links = [
    { label: t.dashboard, icon: <RiDashboardLine />, to: "/" },
    { label: t.buses, icon: <RiBusFill />, to: "/bus" },
    { label: t.drivers, icon: <RiDriveLine />, to: "/driver" },
    { label: t.trips, icon: <RiAirplayFill />, to: "/trips" },
    { label: t.chalans, icon: <RiAirplayFill />, to: "/chalans" },
    { label: t.incomes, icon: <RiMoneyDollarBoxFill />, to: "/incomes" },
    { label: t.copones, icon: <RiMoneyDollarBoxFill />, to: "/copones" },

  ];

  return (
    <>
      {/* Sidebar - EXACT SAME STYLES */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-slate-800 text-white pt-20 shadow-xl z-30 transition-transform duration-300 transform
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0 md:block`}
        
      >
        {company && (
          <div className="px-6 flex flex-col items-center text-center mb-6">
            <img
              src={
                company.logo_url
                  ? `${logo_url}/public/${company.logo_url}`
                  : "/default-avatar.png"
              }
              alt="لوگو شرکت"
              className="w-16 h-16 rounded-full shadow-lg border-2 border-white mb-3"
            />
            <h1 className="text-lg font-extrabold">{`شرکت ترانسپورتی ${company.name}`}</h1>
            <p className="text-sm text-gray-300 mt-1">
              {t.welcome}: <span className="font-semibold">{company.username}</span>
            </p>
          </div>
        )}

        <nav className="flex flex-col gap-1 px-4 font-medium text-base" dir="ltr">
          {links.map((link, idx) => (
            <SidebarLink
              key={idx}
              {...link}
              active={location.pathname === link.to}
            />
          ))}
        </nav>

        <div className="px-4 absolute bottom-6 w-full">
          <button
            onClick={handleLogout}
            className="w-full flex justify-end items-center gap-3 hover:bg-slate-700 py-2 px-3 rounded transition font-semibold"
          >
            <span>{t.logout}</span>
            <RiLogoutBoxRLine className="text-xl" />
          </button>
        </div>
      </aside>

      {/* Backdrop Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

const SidebarLink = ({ icon, label, to, active }) => (
  <Link
    to={to}
    className={`w-full flex justify-end items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 text-right
      ${
        active
          ? "bg-slate-900 text-white font-semibold shadow-md border-r-4 border-indigo-400"
          : "hover:bg-slate-700 hover:text-white"
      }`}
  >
    <span>{label}</span>
    <span className="text-lg">{icon}</span>
  </Link>
);

export default Sidebar;