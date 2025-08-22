import React, { useState, useEffect } from "react";
import {
  RiDashboardLine,
  RiBusFill,
  RiDriveLine,
  RiAirplayFill,
  RiLogoutBoxRLine,
  RiCloseLine,
  RiMenu3Line,
} from "react-icons/ri";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [company, setCompany] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // ✅ Get company data from sessionStorage
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
    { label: "داشبورد", icon: <RiDashboardLine />, to: "/" },
    { label: "بس ها", icon: <RiBusFill />, to: "/bus" },
    { label: "راننده ها", icon: <RiDriveLine />, to: "/driver" },
    { label: "سفرها", icon: <RiAirplayFill />, to: "/trips" },
    { label: "چالان هایی شرکت", icon: <RiAirplayFill />, to: "/chalans" },
  ];

  return (
    <>
      {/* Toggle Button (Mobile Only) */}
      <button
        className="fixed top-4 right-4 z-40 md:hidden bg-slate-800 p-2 rounded-md shadow text-white"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
      </button>

      {/* Backdrop Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-slate-800 text-white pt-20 shadow-xl z-30 transition-transform duration-300 transform
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0 md:block`}
      >
        {/* Company Info */}
        {company && (
          <div className="px-6 flex flex-col items-center text-center mb-6">
            {/* Logo */}
            <img
              src={
                company.logo_url
                  ? `http://127.0.0.1:8000/storage/${company.logo_url}`
                  : "/default-avatar.png"
              }
              alt="لوگو شرکت"
              className="w-16 h-16 rounded-full shadow-lg border-2 border-white mb-3"
            />
            {/* Company Name */}
            <h1 className="text-lg font-extrabold">{`شرکت ترانسپورتی ${company.name}`}</h1>
            {/* Username */}
            <p className="text-sm text-gray-300 mt-1">
              کاربر: <span className="font-semibold">{company.username}</span>
            </p>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-4 font-medium text-base">
          {links.map((link, idx) => (
            <SidebarLink
              key={idx}
              {...link}
              active={location.pathname === link.to}
            />
          ))}
        </nav>

        {/* Logout button */}
        <div className="px-4 absolute bottom-6 w-full">
          <button
            onClick={handleLogout}
            className="w-full flex justify-end items-center gap-3 hover:bg-slate-700 py-2 px-3 rounded transition font-semibold"
          >
            <span>خروج</span>
            <RiLogoutBoxRLine className="text-xl" />
          </button>
        </div>
      </aside>
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
