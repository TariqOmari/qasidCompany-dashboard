import React, { useState } from 'react';
import {
  RiDashboardLine,
  RiUser3Line,
  RiMessage3Line,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiArrowDownSLine,
  RiBusFill,
  RiAdminFill,
  RiTicket2Fill,
  RiMoneyDollarBoxLine,
  RiShoppingBag2Fill,
  RiCloseLine,
  RiMenu3Line,
  RiDriveFill,
  RiDriveLine,
  RiAirplayFill,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import qlogo from '../assets/qlogo.jfif';

const Sidebar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
          <SidebarLink icon={<RiDashboardLine />} label="داشبورد" to="/" />

          <div>
            <button
              onClick={() => setOpenSubMenu(!openSubMenu)}
              className="w-full flex justify-between items-center hover:bg-orange-600 py-2 px-3 rounded transition"
              aria-expanded={openSubMenu}
            >
              <div className="flex gap-2 items-center justify-end">
                <span>مدیریت</span>
                <RiSettings3Line className="text-lg" />
              </div>
              <RiArrowDownSLine />
            </button>

            {openSubMenu && (
              <div className="mr-5 mt-1 flex flex-col gap-1 text-sm">
                <SidebarLink label="کاربران" icon={<RiUser3Line />} to="/employees" small />
                <SidebarLink label="پیام‌ها" icon={<RiMessage3Line />} to="/messages" small />
                <SidebarLink label="بس ها" icon={<RiBusFill />} to="/bus" small />
                <SidebarLink label="ادمین ها" icon={<RiAdminFill />} to="/admins" small />
                <SidebarLink label="سفارشات" icon={<RiTicket2Fill />} to="/orders" small />
                <SidebarLink label="عاید ما" icon={<RiMoneyDollarBoxLine />} to="/income" small />
                <SidebarLink label="فروشات ما" icon={<RiShoppingBag2Fill />} to="/sells" small />
                <SidebarLink label=" راننده ها" icon={<RiDriveLine />} to="/driver" small />
                 <SidebarLink label=" سفرها " icon={<RiAirplayFill />} to="/trips" small />
              </div>
            )}
          </div>
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

const SidebarLink = ({ icon, label, to, small = false }) => {
  return (
    <Link
      to={to}
      className={`w-full flex justify-end items-center gap-3 hover:bg-orange-600 py-2 px-3 rounded transition text-right ${
        small ? 'text-sm' : ''
      }`}
    >
      <span>{label}</span>
      <span className="text-lg">{icon}</span>
    </Link>
  );
};

export default Sidebar;
