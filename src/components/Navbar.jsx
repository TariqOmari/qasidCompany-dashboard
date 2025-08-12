import React, { useState, useRef, useEffect } from "react";
import {
  RiNotification3Line,
  RiMessage3Line,
  RiUser3Line,
  RiLogoutBoxRLine,
  RiDeleteBin6Line,
  RiArrowDownSLine,
} from "react-icons/ri";
import qlogo from "../assets/qlogo.jfif";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Static notifications
  const notifications = [
    {
      id: 1,
      title: "تعیین راننده",
      message: "لطفاً برای سفر شماره ۱ راننده تعیین کنید.",
      date: "۱۳ مرداد ۱۴۰۴",
    },
    {
      id: 2,
      title: "رزرو صندلی‌ها",
      message: "برای سفر شماره ۲ تعداد ۳۵ صندلی رزرو شده است.",
      date: "۱۴ مرداد ۱۴۰۴",
    },
    {
      id: 3,
      title: "تعیین کارت عبور",
      message: "برای سفر شماره ۳ نیاز به تعیین کارت عبور دارید.",
      date: "۱۵ مرداد ۱۴۰۴",
    },
    {
      id: 4,
      title: "دریافت سفارش‌ها",
      message: "برای سفر شماره ۴ تعداد ۲۸ سفارش ثبت شده است.",
      date: "۱۶ مرداد ۱۴۰۴",
    },
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 bg-slate-800 text-white px-6 py-3 flex justify-between items-center shadow z-40">
      {/* Search + icons */}
      <div className="flex items-center gap-4 text-xl">
        {/* Notification Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative hover:text-orange-400 transition"
          >
            <RiNotification3Line />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

    {showNotifications && (
  <div
    className="absolute mt-3 max-w-xs w-full bg-white text-gray-800 shadow-lg rounded-lg overflow-hidden z-50"
    style={{
      minWidth: "320px",
      right: "90%",
      transform: "translateX(90%)",
    }}
    dir="rtl"
  >
    <div className="px-4 py-3 border-b bg-slate-100 font-semibold text-right">
      اعلان‌ها
    </div>
    <div className="max-h-72 overflow-y-auto">
      {notifications.map((note) => (
        <div
          key={note.id}
          className="px-4 py-3 hover:bg-gray-50 transition border-b text-sm text-right"
        >
          <div className="font-medium text-orange-500">{note.title}</div>
          <div className="text-gray-600">{note.message}</div>
          <div className="text-xs text-gray-400 mt-1">
            اعلام شده: {note.date}
          </div>
        </div>
      ))}
    </div>
    <div className="px-4 py-2 text-center text-sm text-blue-500 cursor-pointer hover:underline">
      مشاهده همه
    </div>
  </div>
)}


        </div>

        <button className="hover:text-orange-400 transition">
          <RiMessage3Line />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:text-orange-400 transition"
          >
            <RiUser3Line className="text-2xl" />
            <RiArrowDownSLine className="text-sm" />
          </button>

          {showDropdown && (
            <div className="absolute left-0 mt-3 w-44 bg-white text-gray-800 shadow-lg rounded-md overflow-hidden z-50 text-sm text-right">
              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-end gap-2">
                <RiUser3Line /> پروفایل من
              </div>
              <div className="px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer flex justify-end gap-2">
                <RiDeleteBin6Line /> حذف حساب
              </div>
              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-end gap-2">
                <RiLogoutBoxRLine /> خروج
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logo and brand */}
      <div className="flex items-center gap-4">
        <img
          src={qlogo}
          alt="لوگو قاصد"
          className="w-10 h-10 rounded-full shadow"
        />
        <span className="text-2xl font-bold text-orange-400">قاصد</span>
      </div>
    </nav>
  );
};

export default Navbar;
