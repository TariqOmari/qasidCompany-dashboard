import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import CustomFormModal from "../components/modals/CustomFormModal";
import CustomTable from "../components/CustomTable";
import Loader from "../components/Loader";
import { useToast } from "../components/ToastContext";
import { FaMapMarkerAlt, FaClock, FaBus, FaCalendarAlt, FaChevronRight, FaChevronLeft, FaAngleDown } from "react-icons/fa";

// ✅ Vite: use import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Afghan month names in Dari
const afghanMonths = {
  1: 'حمل', 2: 'ثور', 3: 'جوزا', 4: 'سرطان',
  5: 'اسد', 6: 'سنبله', 7: 'میزان', 8: 'عقرب',
  9: 'قوس', 10: 'جدی', 11: 'دلو', 12: 'حوت'
};

// Persian weekday names (starting with Saturday)
const persianWeekdays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

// Compact Persian Date Picker Component
const PersianDatePicker = ({ selectedDate, onDateChange }) => {
  const [currentYear, setCurrentYear] = useState(1403);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Generate years list (10 years range)
  const yearsList = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Generate days in month
  const getDaysInMonth = (year, month) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return 29; // Simple implementation for Esfand
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }, [currentYear, currentMonth]);

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle day selection
  const handleDaySelect = (day) => {
    onDateChange({
      year: currentYear,
      month: currentMonth,
      day: day
    });
  };

  // Handle month selection
  const handleMonthSelect = (month) => {
    setCurrentMonth(month);
    setShowMonthSelector(false);
  };

  // Handle year change
  const handleYearChange = (increment) => {
    setCurrentYear(currentYear + increment);
  };

  // Check if a day is selected
  const isSelected = (day) => {
    return selectedDate && 
           selectedDate.year === currentYear && 
           selectedDate.month === currentMonth && 
           selectedDate.day === day;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 w-64 font-vazir">
      {/* Header with month/year navigation */}
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-100 text-sm"
        >
          <FaChevronRight className="text-[#0B2A5B]" />
        </button>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleYearChange(-1)}
            className="px-1 text-[#0B2A5B] font-bold text-sm"
          >
            ‹
          </button>
          
          <span className="text-[#0B2A5B] font-semibold text-sm">
            {currentYear}
          </span>
          
          <button 
            onClick={() => handleYearChange(1)}
            className="px-1 text-[#0B2A5B] font-bold text-sm"
          >
            ›
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMonthSelector(!showMonthSelector)}
              className="px-2 py-1 rounded-md hover:bg-gray-100 font-semibold text-[#0B2A5B] text-sm flex items-center gap-1"
            >
              {afghanMonths[currentMonth]}
              <FaAngleDown className="text-xs" />
            </button>
            
            {/* Month selector dropdown */}
            {showMonthSelector && (
              <div className="absolute z-10 left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
                {Object.entries(afghanMonths).map(([num, name]) => (
                  <div
                    key={num}
                    onClick={() => handleMonthSelect(parseInt(num))}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      parseInt(num) === currentMonth ? 'bg-[#F37021] text-white hover:bg-orange-600' : 'text-[#0B2A5B]'
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
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
        {/* Day headers (Sat, Sun, Mon, ...) */}
        {persianWeekdays.map(day => (
          <div key={day} className="text-center text-gray-500 py-1">
            {day.charAt(0)}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map(day => (
          <button
            key={day}
            onClick={() => handleDaySelect(day)}
            className={`p-1 rounded-full text-center ${
              isSelected(day)
                ? 'bg-[#F37021] text-white'
                : 'hover:bg-gray-100 text-[#0B2A5B]'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Selected date display */}
      {selectedDate && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md text-center text-[#0B2A5B] text-xs">
          {`${selectedDate.year}/${selectedDate.month}/${selectedDate.day} - ${afghanMonths[selectedDate.month]}`}
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
     { header: "قیمت (افغانی)", accessor: "price" } // ✅ Added price
  ];

  // Form fields
// Form fields
const fields = useMemo(
  () => [
    {
      label: "به کجا",   // <-- TO stays in the first column (right)
      name: "to",
      type: "text",
      placeholder: "مثال: هرات",
      icon: <FaMapMarkerAlt />,
      required: true,
    },
    {
      label: "از کجا",   // <-- FROM goes second column (left)
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
      required: true,
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

      setTrips(res.data);
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
    
    // Validate Jalali date
    if (!selectedJalaliDate || !selectedJalaliDate.year || !selectedJalaliDate.month || !selectedJalaliDate.day) {
      return toast.error("لطفاً تاریخ سفر را انتخاب کنید.");
      
    }

    try {
      const payload = {
        ...formData,
        departure_date_jalali: selectedJalaliDate,
         price: Number(formData.price), // ✅ Ensure price is numeric
      };

      const res = await axios.post(`${API_BASE_URL}/api/trips`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrips((prev) => [...prev, res.data.trip]);
      setIsModalOpen(false);
      setSelectedJalaliDate(null);
      setShowDatePicker(false);
      toast.success("سفر جدید با موفقیت اضافه شد.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در ایجاد سفر.");
    }
  };

  // Edit trip (open modal with prefilled values)
  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    // Convert stored Jalali date back to inputs
    const [year, month, day] = trip.departure_date.split('-').map(Number);
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

    if (!token) {
      toast.error("توکن معتبر موجود نیست. لطفاً دوباره وارد شوید.");
      return;
    }

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
              setIsModalOpen(true);
              setEditingTrip(null);
              setSelectedJalaliDate(null);
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

        {/* Modal for Add/Edit */}
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
            
            {/* Date display and picker toggle */}
            <div 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer flex justify-between items-center"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {selectedJalaliDate ? (
                <span className="text-[#0B2A5B]">
                  {`${selectedJalaliDate.year}/${selectedJalaliDate.month}/${selectedJalaliDate.day} - ${afghanMonths[selectedJalaliDate.month]}`}
                </span>
              ) : (
                <span className="text-gray-400">تاریخ سفر را انتخاب کنید</span>
              )}
              <FaCalendarAlt className="text-orange-500" />
            </div>
            
            {/* Date Picker Popover - positioned above the input */}
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