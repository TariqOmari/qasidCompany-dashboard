import React, { useState } from 'react';
import {
  RiDashboardLine,
  RiUser3Line,
  RiMessage3Line,
  RiBusFill,
  RiAdminFill,
  RiTicket2Fill,
  RiMoneyDollarBoxLine,
  RiShoppingBag2Fill,
  RiDriveLine,
  RiAirplayFill,
  RiLogoutBoxRLine,
  RiCloseLine,
  RiMenu3Line,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import qlogo from '../assets/qlogo.jfif';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const links = [
    { label: 'داشبورد', icon: <RiDashboardLine />, to: '/' },
    // { label: 'کاربران', icon: <RiUser3Line />, to: '/employees' },
    // { label: 'پیام‌ها', icon: <RiMessage3Line />, to: '/messages' },
    { label: 'بس ها', icon: <RiBusFill />, to: '/bus' },
    { label: 'ادمین ها', icon: <RiAdminFill />, to: '/admins' },
    // { label: 'سفارشات', icon: <RiTicket2Fill />, to: '/orders' },
    // { label: 'عاید ما', icon: <RiMoneyDollarBoxLine />, to: '/income' },
    // { label: 'فروشات ما', icon: <RiShoppingBag2Fill />, to: '/sells' },
    { label: 'راننده ها', icon: <RiDriveLine />, to: '/driver' },
    { label: 'سفرها', icon: <RiAirplayFill />, to: '/trips' },
  ];

  return (
    <>
      {/* Toggle Button (Mobile Only) */}
      <button
        className="fixed top-4 right-4 z-40 md:hidden bg-orange-500 p-2 rounded-md shadow text-white"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
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
        className={`fixed top-0 right-0 h-full w-64 bg-orange-500 text-white pt-20 shadow-xl z-30 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0 md:block`}
      >
        {/* User info */}
        <div className="px-6 flex items-center gap-3 justify-end mb-4">
          <div>
            <div className="font-semibold">احمد احمدی</div>
            <div className="text-sm text-orange-100">پنل مدیریت</div>
          </div>
          <img src={qlogo} alt="لوگو" className="w-10 h-10 rounded-full shadow" />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-4 font-medium text-base">
          {links.map((link, idx) => (
            <SidebarLink key={idx} {...link} />
          ))}
        </nav>

        {/* Logout button */}
        <div className="px-4 absolute bottom-6 w-full">
          <button className="w-full flex justify-end items-center gap-3 hover:bg-orange-600 py-2 px-3 rounded transition">
            <span>خروج</span>
            <RiLogoutBoxRLine className="text-xl" />
          </button>
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({ icon, label, to }) => (
  <Link
    to={to}
    className="w-full flex justify-end items-center gap-3 hover:bg-orange-600 py-2 px-3 rounded transition text-right"
  >
    <span>{label}</span>
    <span className="text-lg">{icon}</span>
  </Link>
);

export default Sidebar;
