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
  FaCrown,
  FaShuttleVan,
  FaMoneyBillWave,
} from "react-icons/fa";
import moment from "jalali-moment";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

const persianWeekdays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

const PersianDatePicker = ({ selectedDate, onDateChange, disabled = false }) => {
  const today = moment().locale("fa").format("jYYYY/jM/jD");
  const [todayYear, todayMonth, todayDay] = today.split("/").map(Number);

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth);

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
    if (disabled || (currentYear === todayYear && currentMonth === todayMonth)) return;
    setCurrentMonth((m) => (m === 1 ? 12 : m - 1));
  };

  const nextMonth = () => {
    if (disabled) return;
    const [lastYear, lastMonth] = selectableDays[5].split("/").map(Number);
    if (currentYear === lastYear && currentMonth === lastMonth) return;
    setCurrentMonth((m) => (m === 12 ? 1 : m + 1));
  };

  const handleDaySelect = (day) => {
    if (disabled || !isSelectable(day)) return;
    onDateChange({ year: currentYear, month: currentMonth, day });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-3 w-64 font-vazir ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={prevMonth}
          disabled={disabled}
          className="p-1 rounded-full hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          disabled={disabled}
          className="p-1 rounded-full hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaChevronLeft className="text-[#0B2A5B]" />
        </button>
      </div>

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
              disabled={disabled || !selectable}
              className={`p-1 rounded-full text-center ${
                isSelected(day)
                  ? "bg-[#F37021] text-white"
                  : selectable && !disabled
                  ? "hover:bg-gray-100 text-[#0B2A5B]"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDate && !disabled && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md text-center text-[#0B2A5B] text-xs">
          {`${selectedDate.year}/${selectedDate.month}/${selectedDate.day} - ${
            afghanMonths[selectedDate.month]
          }`}
        </div>
      )}
      
      {disabled && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md text-center text-gray-500 text-xs">
          برای سفرهای همه روزه نیاز به انتخاب تاریخ نیست
        </div>
      )}
    </div>
  );
};

// Bus Type Checkbox Component
const BusTypeCheckbox = ({ label, value, checked, onChange, icon, description }) => (
  <label className="flex items-center justify-start p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
    <input
      type="checkbox"
      value={value}
      checked={checked}
      onChange={onChange}
      className="ml-2 h-4 w-4 text-[#F37021] focus:ring-[#F37021] border-gray-300 rounded"
    />
    <div className="flex items-center">
      <span className="text-[#F37021] ml-2">{icon}</span>
      <div>
        <div className="font-medium text-[#0B2A5B]">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
  </label>
);

// Price Input Component
const PriceInput = ({ label, value, onChange, disabled, icon, required }) => (
  <div className="text-right">
    <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2 justify-end">
      {required && <span className="text-red-500">*</span>}
      {label}
      {icon && <span className="text-orange-500">{icon}</span>}
    </label>
    <input
      type="number"
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      placeholder="قیمت به افغانی"
      required={required && !disabled}
      dir="rtl"
      className={`w-full border rounded-md py-2 pr-10 pl-3 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 ${
        disabled ? 'bg-gray-100 text-gray-400' : 'border-gray-300'
      }`}
    />
  </div>
);

export default function Tripa() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedJalaliDate, setSelectedJalaliDate] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [busTypes, setBusTypes] = useState([]);
  const [priceVip, setPriceVip] = useState('');
  const [price580, setPrice580] = useState('');
  const [allDays, setAllDays] = useState(false);
  const [formData, setFormData] = useState({});

  const token = sessionStorage.getItem("auth_token");

  // Update table columns to show prices correctly
  const columns = [
    { header: "از", accessor: "from" },
    { header: "به", accessor: "to" },
    { header: "تاریخ", accessor: "departure_date_dari" },
    { header: "زمان حرکت", accessor: "departure_time_ampm" },
    { header: "ترمینال حرکت", accessor: "departure_terminal" },
    { header: "ترمینال رسید", accessor: "arrival_terminal" },
    {
      header: "قیمت ها",
      accessor: "prices",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.prices?.VIP && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">VIP</span>
              <span>{row.prices.VIP} افغانی</span>
            </div>
          )}
          {row.prices?.["580"] && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">۵۸۰</span>
              <span>{row.prices["580"]} افغانی</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "نوع اتوبوس",
      accessor: "bus_type",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(row.bus_type) && row.bus_type.map(type => (
            <span key={type} className="px-2 py-1 bg-[#F37021] text-white text-xs rounded-full">
              {type === "VIP" ? "VIP" : "۵۸۰"}
            </span>
          ))}
        </div>
      ),
    },

     // Add all_days column
  {
    header: "همه روزها",
    accessor: "all_days",
    render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.all_days ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}>
        {row.all_days ? "بله" : "خیر"}
      </span>
    ),
  },

    {
      header: "تاریخ ایجاد",
      accessor: "created_at",
      render: (row) =>
        row.created_at
          ? moment(row.created_at).locale("fa").format("jYYYY/jM/jD")
          : "-",
    },
  ];

  // Form fields (removed the single price field)
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
      name: "all_days",
      label: "همه روزها",
      type: "checkbox",
      placeholder: "این سفر برای همه روزها فعال باشد"
    }
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

  // Handle bus type selection
  const handleBusTypeChange = (type) => {
    const newBusTypes = busTypes.includes(type) 
      ? busTypes.filter(t => t !== type)
      : [...busTypes, type];
    
    setBusTypes(newBusTypes);
    
    // Clear prices when bus type is deselected
    if (!newBusTypes.includes("VIP")) setPriceVip('');
    if (!newBusTypes.includes("580")) setPrice580('');
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setBusTypes([]);
      setPriceVip('');
      setPrice580('');
      setAllDays(false);
      setFormData({});
    }
  }, [isModalOpen]);

  // Set initial values when editing
  useEffect(() => {
    if (editingTrip) {
      if (editingTrip.prices) {
        setPriceVip(editingTrip.prices.VIP || '');
        setPrice580(editingTrip.prices["580"] || '');
      }
      setAllDays(editingTrip.all_days || false);
      
      // Set initial form data for the modal
      const initialFormData = {};
      fields.forEach(field => {
        initialFormData[field.name] = editingTrip[field.name] || '';
      });
      setFormData(initialFormData);
    }
  }, [editingTrip]);

  // Handle form field changes from the modal
  const handleFormFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'all_days') {
      setAllDays(value);
    }
  };

  // Add trip
  const handleAddTrip = async (formDataFromModal) => {
    if (!token) return toast.error("توکن معتبر موجود نیست.");
    
    // Don't require date selection if it's an all_days trip
    if (!allDays && !selectedJalaliDate)
      return toast.error("لطفاً تاریخ سفر را انتخاب کنید.");
    
    if (busTypes.length === 0)
      return toast.error("لطفاً حداقل یک نوع اتوبوس انتخاب کنید.");
    
    // Validate prices based on selected bus types
    if (busTypes.includes("VIP") && !priceVip)
      return toast.error("لطفاً قیمت اتوبوس VIP را وارد کنید.");
    if (busTypes.includes("580") && !price580)
      return toast.error("لطفاً قیمت اتوبوس ۵۸۰ را وارد کنید.");

    try {
      const payload = {
        ...formDataFromModal,
        all_days: allDays,
        departure_date_jalali: allDays ? null : selectedJalaliDate,
        bus_type: busTypes,
        price_vip: priceVip ? Number(priceVip) : null,
        price_580: price580 ? Number(price580) : null,
      };
      
      const res = await axios.post(`${API_BASE_URL}/api/trips`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTrips((prev) => [res.data.trip, ...prev]);
      setIsModalOpen(false);
      setSelectedJalaliDate(null);
      setShowDatePicker(false);
      setBusTypes([]);
      setPriceVip('');
      setPrice580('');
      setAllDays(false);
      setFormData({});
      toast.success("سفر جدید با موفقیت اضافه شد.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در ایجاد سفر.");
    }
  };

  // Edit trip
  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    
    // Set date only if it's not an all_days trip
    if (!trip.all_days && trip.departure_date) {
      const [year, month, day] = trip.departure_date.split("-").map(Number);
      setSelectedJalaliDate({ year, month, day });
    } else {
      setSelectedJalaliDate(null);
    }
    
    setBusTypes(Array.isArray(trip.bus_type) ? trip.bus_type : []);
    setAllDays(trip.all_days || false);
    
    // Set initial form data for the modal
    const initialFormData = {};
    fields.forEach(field => {
      initialFormData[field.name] = trip[field.name] || '';
    });
    setFormData(initialFormData);
    
    setIsModalOpen(true);
  };

  // Update trip
  const handleUpdateTrip = async (formDataFromModal) => {
    if (!token) return toast.error("توکن معتبر موجود نیست.");
    if (!editingTrip) return;
    
    // Don't require date selection if it's an all_days trip
    if (!allDays && !selectedJalaliDate)
      return toast.error("لطفاً تاریخ سفر را انتخاب کنید.");
    
    if (busTypes.length === 0)
      return toast.error("لطفاً حداقل یک نوع اتوبוס انتخاب کنید.");
    
    // Validate prices based on selected bus types
    if (busTypes.includes("VIP") && !priceVip)
      return toast.error("لطفاً قیمت اتوبوس VIP را وارد کنید.");
    if (busTypes.includes("580") && !price580)
      return toast.error("لطفاً قیمت اتوبوس ۵۸۰ را وارد کنید.");

    try {
      const payload = {
        ...formDataFromModal,
        all_days: allDays,
        departure_date_jalali: allDays ? null : selectedJalaliDate,
        bus_type: busTypes,
        price_vip: priceVip ? Number(priceVip) : null,
        price_580: price580 ? Number(price580) : null,
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
      setBusTypes([]);
      setPriceVip('');
      setPrice580('');
      setAllDays(false);
      setFormData({});
      toast.success("سفر با успеیت ویرایش شد.");
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
              setSelectedJalaliDate({ year: y, month: m, day: d });
              setShowDatePicker(false);
              setBusTypes([]);
              setPriceVip('');
              setPrice580('');
              setAllDays(false);
              setFormData({});
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

        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTrip(null);
            setSelectedJalaliDate(null);
            setShowDatePicker(false);
            setBusTypes([]);
            setPriceVip('');
            setPrice580('');
            setAllDays(false);
            setFormData({});
          }}
          onSubmit={editingTrip ? handleUpdateTrip : handleAddTrip}
          title={editingTrip ? "ویرایش سفر" : "افزودن سفر جدید"}
          titleIcon={<FaBus />}
          fields={fields}
          initialData={editingTrip || formData}
          onFieldChange={handleFormFieldChange}
        >
          {/* Bus Type Selection */}
          <div className="sm:col-span-2">
            <label className="block mb-2 font-semibold text-[#0B2A5B]">
              نوع اتوبوس *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <BusTypeCheckbox
                label="اتوبوس VIP"
                value="VIP"
                checked={busTypes.includes("VIP")}
                onChange={() => handleBusTypeChange("VIP")}
                icon={<FaCrown />}
                description="اتوبوس لوکس با امکانات کامل"
              />
              <BusTypeCheckbox
                label="اتوبوس ۵۸۰"
                value="580"
                checked={busTypes.includes("580")}
                onChange={() => handleBusTypeChange("580")}
                icon={<FaShuttleVan />}
                description="اتوبوس استاندارد و اقتصادی"
              />
            </div>
            {busTypes.length === 0 && (
              <p className="text-red-600 text-sm mt-1">
                لطفاً حداقل یک نوع اتوبוס انتخاب کنید
              </p>
            )}
          </div>

          {/* Price Inputs */}
          <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <PriceInput
              label="قیمت اتوبوس VIP (افغانی)"
              value={priceVip}
              onChange={(e) => setPriceVip(e.target.value)}
              disabled={!busTypes.includes("VIP")}
              icon={<FaMoneyBillWave />}
              required={busTypes.includes("VIP")}
            />
            <PriceInput
              label="قیمت اتوبوس ۵۸۰ (افغانی)"
              value={price580}
              onChange={(e) => setPrice580(e.target.value)}
              disabled={!busTypes.includes("580")}
              icon={<FaMoneyBillWave />}
              required={busTypes.includes("580")}
            />
          </div>

          {/* Date Picker */}
          <div className="sm:col-span-2 relative">
            <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2">
              <FaCalendarAlt className="text-orange-500" />
              تاریخ سفر {allDays && "(غیرفعال برای سفرهای همه روزه)"}
            </label>
            <div
              className={`w-full border border-gray-300 rounded-md px-3 py-2 flex justify-between items-center ${
                allDays ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={() => !allDays && setShowDatePicker(!showDatePicker)}
            >
              {selectedJalaliDate ? (
                <span className="text-[#0B2A5B]">
                  {`${selectedJalaliDate.year}/${selectedJalaliDate.month}/${selectedJalaliDate.day} - ${
                    afghanMonths[selectedJalaliDate.month]
                  }`}
                </span>
              ) : (
                <span className={allDays ? "text-gray-400" : "text-gray-400"}>
                  {allDays ? "نیاز به انتخاب تاریخ نیست" : "تاریخ سفر را انتخاب کنید"}
                </span>
              )}
              <FaCalendarAlt className={allDays ? "text-gray-400" : "text-orange-500"} />
            </div>
            {showDatePicker && !allDays && (
              <div className="absolute z-10 bottom-full right-0 mb-2">
                <PersianDatePicker
                  selectedDate={selectedJalaliDate}
                  onDateChange={(date) => {
                    setSelectedJalaliDate(date);
                    setShowDatePicker(false);
                  }}
                  disabled={allDays}
                />
              </div>
            )}
          </div>
        </CustomFormModal>
      </div>
    </DashboardLayout>
  );
}