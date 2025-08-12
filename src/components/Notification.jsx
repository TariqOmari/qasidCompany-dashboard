import React, { useState, useRef, useEffect } from "react";
import { RiNotification3Line } from "react-icons/ri";

const Notification = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Static notifications (Persian/Dari)
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
    <div className="relative" ref={ref} dir="rtl">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative hover:text-orange-400 transition text-xl"
      >
        <RiNotification3Line />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {notifications.length}
        </span>
      </button>

      {open && (
        <div
          className="absolute mt-3 w-80 bg-white text-gray-800 shadow-lg rounded-lg overflow-hidden z-50"
          style={{
            right: "60%", // moves more into the screen
            transform: "translateX(60%)",
          }}
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
  );
};

export default Notification;
