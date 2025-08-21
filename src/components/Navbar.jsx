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
    


        </div>

      {/* Logo and brand */}
      <div className="flex items-center gap-4">
         <span className="text-2xl font-bold text-orange-400">پنل مدیریت شرکت هایی ترانسپورتی</span>
        <img
          src={qlogo}
          alt="لوگو قاصد"
          className="w-10 h-10 rounded-full shadow"
        />
       
      </div>
    </nav>
  );
};

export default Navbar;
