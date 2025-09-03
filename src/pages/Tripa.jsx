import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import CustomFormModal from "../components/modals/CustomFormModal";
import CustomTable from "../components/CustomTable";
import Loader from "../components/Loader";
import { useToast } from "../components/ToastContext";
import {
  FaMapMarkerAlt,
  FaClock,
  FaBus,
  FaCalendarAlt,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import moment from "jalali-moment"; // ✅ Import jalali-moment

// ✅ Vite: use import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Afghan month names in Dari
const afghanMonths = {
  1: "حمل",
  2: "ثور",
  3: "جوزا",
  4: "سرطان",
  5: "اسد",
  6: "سنبله",
  7: "میزان",
  8: "عقرب",
  9: "قوس",
  10: "جدی",
  11: "دلو",
  12: "حوت",
};

// Persian weekday names
const persianWeekdays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

// ✅ Persian Date Picker with restrictions
const PersianDatePicker = ({ selectedDate, onDateChange }) => {
  const today = moment().locale("fa").format("jYYYY/jM/jD");
  const [todayYear, todayMonth, todayDay] = today.split("/").map(Number);

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth);

  // ✅ Calculate selectable range: today → today+5
  const selectableDays = Array.from({ length: 6 }, (_, i) =>
    moment(`${todayYear}/${todayMonth}/${todayDay}`, "jYYYY/jM/jD")
      .add(i, "day")
      .format("jYYYY/jM/jD")
  );
  const selectableSet = new Set(selectableDays);

  const getDaysInMonth = (year, month) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return moment.jIsLeapYear(year) ? 30 : 29;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  const isSelectable = (day) => {
    const dateStr = `${currentYear}/${currentMonth}/${day}`;
    return selectableSet.has(dateStr);
  };

  const isSelected = (day) => {
    return (
      selectedDate &&
      selectedDate.year === currentYear &&
      selectedDate.month === currentMonth &&
      selectedDate.day === day
    );
  };

  const prevMonth = () => {
    // Don’t allow going before today’s month
    if (currentYear === todayYear && currentMonth === todayMonth) return;
    setCurrentMonth((m) => (m === 1 ? 12 : m - 1));
  };

  const nextMonth = () => {
    // Don’t allow going past the last selectable day
    const [lastYear, lastMonth] = selectableDays[5].split("/").map(Number);
    if (currentYear === lastYear && currentMonth === lastMonth) return;
    setCurrentMonth((m) => (m === 12 ? 1 : m + 1));
  };

  const handleDaySelect = (day) => {
    if (!isSelectable(day)) return;
    onDateChange({ year: currentYear, month: currentMonth, day });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 w-64 font-vazir">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-100 text-sm"
        >
          <FaChevronRight className="text-[#0B2A5B]" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[#0B2A5B] font-semibold text-sm">
            {currentYear}
          </span>
          <span className="text-[#0B2A5B] font-semibold text-sm">
            {afghanMonths[currentMonth]}
          </span>
        </div>
        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-100 text-sm"
        >
          <FaChevronLeft className="text-[#0B2A5B]" />
        </button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {persianWeekdays.map((day) => (
          <div key={day} className="text-center text-gray-500 py-1">
            {day.charAt(0)}
          </div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const selectable = isSelectable(day);
          return (
            <button
              key={day}
              onClick={() => handleDaySelect(day)}
              disabled={!selectable}
              className={`p-1 rounded-full text-center ${
                isSelected(day)
                  ? "bg-[#F37021] text-white"
                  : selectable
                  ? "hover:bg-gray-100 text-[#0B2A5B]"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected date */}
      {selectedDate && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md text-center text-[#0B2A5B] text-xs">
          {`${selectedDate.year}/${selectedDate.month}/${selectedDate.day} - ${
            afghanMonths[selectedDate.month]
          }`}
        </div>
      )}
    </div>
  );
};

export default function Tripa() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedJalaliDate, setSelectedJalaliDate] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const token = sessionStorage.getItem("auth_token");

  // Table columns
  const columns = [
    { header: "از", accessor: "from" },
    { header: "به", accessor: "to" },
    { header: "تاریخ", accessor: "departure_date_dari" },
    { header: "زمان حرکت", accessor: "departure_time_ampm" },
    { header: "ترمینال حرکت", accessor: "departure_terminal" },
    { header: "ترمینال رسید", accessor: "arrival_terminal" },
    { header: "قیمت (افغانی)", accessor: "price" },
    {
      header: "تاریخ ایجاد",
      accessor: "created_at",
      render: (row) =>
        row.created_at
          ? moment(row.created_at).locale("fa").format("jYYYY/jM/jD")
          : "-",
    },
  ];

  // Form fields
  const fields = useMemo(
    () => [
      {
        label: "به کجا",
        name: "to",
        type: "text",
        placeholder: "مثال: هرات",
        icon: <FaMapMarkerAlt />,
        required: true,
      },
      {
        label: "از کجا",
        name: "from",
        type: "text",
        placeholder: "مثال: کابل",
        icon: <FaMapMarkerAlt />,
        required: true,
      },
      {
        label: "زمان حرکت",
        name: "departure_time",
        type: "time",
        icon: <FaClock />,
        required: false,
      },
      {
        label: "ترمینال حرکت",
        name: "departure_terminal",
        type: "text",
        icon: <FaBus />,
        required: true,
      },
      {
        label: "ترمینال رسید",
        name: "arrival_terminal",
        type: "text",
        icon: <FaBus />,
        required: true,
      },
      {
        label: "قیمت (افغانی)",
        name: "price",
        type: "number",
        placeholder: "مثال: 500",
        icon: <FaBus />,
        required: true,
      },
    ],
    []
  );

  // Fetch trips
  const fetchTrips = async () => {
    if (!token) {
      toast.error("توکن معتبر موجود نیست. لطفاً دوباره وارد شوید.");
      setIsLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/public/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedTrips = [...res.data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setTrips(sortedTrips);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در دریافت لیست سفرها.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Add trip
  const handleAddTrip = async (formData) => {
    if (!token) return toast.error("توکن معتبر موجود نیست.");
    if (!selectedJalaliDate)
      return toast.error("لطفاً تاریخ سفر را انتخاب کنید.");

    try {
      const payload = {
        ...formData,
        departure_date_jalali: selectedJalaliDate,
        price: Number(formData.price),
      };
      const res = await axios.post(`${API_BASE_URL}/api/trips`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips((prev) => [res.data.trip, ...prev]);
      setIsModalOpen(false);
      setSelectedJalaliDate(null);
      setShowDatePicker(false);
      toast.success("سفر جدید با موفقیت اضافه شد.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در ایجاد سفر.");
    }
  };

  // Edit trip
  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    const [year, month, day] = trip.departure_date.split("-").map(Number);
    setSelectedJalaliDate({ year, month, day });
    setIsModalOpen(true);
  };

  // Update trip
  const handleUpdateTrip = async (formData) => {
    if (!token) return toast.error("توکن معتبر موجود نیست.");
    if (!editingTrip) return;
    try {
      const payload = {
        ...formData,
        departure_date_jalali: selectedJalaliDate,
        price: Number(formData.price),
      };
      const res = await axios.put(
        `${API_BASE_URL}/api/trips/${editingTrip.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrips((prev) =>
        prev.map((t) => (t.id === res.data.trip.id ? res.data.trip : t))
      );
      setIsModalOpen(false);
      setEditingTrip(null);
      setSelectedJalaliDate(null);
      setShowDatePicker(false);
      toast.success("سفر با موفقیت ویرایش شد.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در ویرایش سفر.");
    }
  };

  // Delete trip
  const handleDeleteTrip = async (trip) => {
    if (!trip || !trip.id) return toast.error("شناسه سفر معتبر نیست.");
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این سفر را حذف کنید؟"))
      return;
    if (!token) return toast.error("توکن معتبر موجود نیست.");
    try {
      await axios.delete(`${API_BASE_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      toast.success("سفر با موفقیت حذف شد.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در حذف سفر.");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <DashboardLayout>
      <div className="p-4 font-vazir text-right">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#0B2A5B]">لیست سفرها</h1>
          <button
            onClick={() => {
              const today = moment().locale("fa").format("jYYYY/jM/jD");
              const [y, m, d] = today.split("/").map(Number);
              setIsModalOpen(true);
              setEditingTrip(null);
              setSelectedJalaliDate({ year: y, month: m, day: d }); // ✅ auto-select today
              setShowDatePicker(false);
            }}
            className="bg-[#F37021] text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            افزودن سفر جدید
          </button>
        </div>

        <CustomTable
          data={trips}
          columns={columns}
          onView={(trip) => navigate("/tripdetails", { state: trip })}
          onEdit={handleEditTrip}
          onDelete={handleDeleteTrip}
        />

        {/* Modal */}
        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTrip(null);
            setSelectedJalaliDate(null);
            setShowDatePicker(false);
          }}
          onSubmit={editingTrip ? handleUpdateTrip : handleAddTrip}
          title={editingTrip ? "ویرایش سفر" : "افزودن سفر جدید"}
          titleIcon={<FaBus />}
          fields={fields}
          initialData={editingTrip || {}}
        >
          <div className="sm:col-span-2 relative">
            <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2">
              <FaCalendarAlt className="text-orange-500" />
              تاریخ سفر
            </label>
            <div
              className="w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {selectedJalaliDate ? (
                <span className="text-[#0B2A5B]">
                  {`${selectedJalaliDate.year}/${selectedJalaliDate.month}/${selectedJalaliDate.day} - ${
                    afghanMonths[selectedJalaliDate.month]
                  }`}
                </span>
              ) : (
                <span className="text-gray-400">تاریخ سفر را انتخاب کنید</span>
              )}
              <FaCalendarAlt className="text-orange-500" />
            </div>
            {showDatePicker && (
              <div className="absolute z-10 bottom-full right-0 mb-2">
                <PersianDatePicker
                  selectedDate={selectedJalaliDate}
                  onDateChange={(date) => {
                    setSelectedJalaliDate(date);
                    setShowDatePicker(false);
                  }}
                />
              </div>
            )}
          </div>
        </CustomFormModal>
      </div>
    </DashboardLayout>
  );
}
