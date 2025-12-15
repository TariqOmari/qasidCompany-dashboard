import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  FaCalendarPlus,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import moment from "jalali-moment";
import { useLanguage } from "../contexts/LanguageContext.jsX";
import { translations } from "./locales/translations";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const afghanMonths = {
  1: "حمل", 2: "ثور", 3: "جوزا", 4: "سرطان",
  5: "اسد", 6: "سنبله", 7: "میزان", 8: "عقرب",
  9: "قوس", 10: "جدی", 11: "دلو", 12: "حوت",
};

const persianWeekdays = [
  "شنبه", "یکشنبه", "دوشنبه", "سه شنبه", 
  "چهارشنبه", "پنجشنبه", "جمعه",
];

// Enhanced Persian Date Picker with Range Selection - FIXED
const PersianDatePicker = ({ 
  selectedDates = [], 
  onDateChange, 
  disabled = false,
  isRange = false,
  maxSelectableDays = 30,
  onClose 
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const today = moment().locale("fa").format("jYYYY/jM/jD");
  const [todayYear, todayMonth, todayDay] = today.split("/").map(Number);
  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth);

  // Generate selectable days for the next 6 months
  const selectableDays = Array.from({ length: 180 }, (_, i) =>
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
    const dateStr = `${currentYear}/${currentMonth}/${day}`;
    return selectedDates.some(date => 
      date.year === currentYear && 
      date.month === currentMonth && 
      date.day === day
    );
  };

  const canSelectMore = () => {
    return selectedDates.length < maxSelectableDays;
  };

  const prevMonth = () => {
    if (disabled || (currentYear === todayYear && currentMonth === todayMonth)) return;
    setCurrentMonth((m) => (m === 1 ? 12 : m - 1));
    if (currentMonth === 1) setCurrentYear(y => y - 1);
  };

  const nextMonth = () => {
    if (disabled) return;
    const lastSelectable = moment(selectableDays[selectableDays.length - 1], "jYYYY/jM/jD");
    const lastYear = lastSelectable.jYear();
    const lastMonth = lastSelectable.jMonth() + 1;
    
    if (currentYear === lastYear && currentMonth === lastMonth) return;
    
    setCurrentMonth((m) => (m === 12 ? 1 : m + 1));
    if (currentMonth === 12) setCurrentYear(y => y + 1);
  };

  const handleDaySelect = (day) => {
    if (disabled || !isSelectable(day) || (!canSelectMore() && !isSelected(day))) return;
    
    const newDate = { year: currentYear, month: currentMonth, day };
    
    if (isRange) {
      // For range trips: toggle date selection
      const isAlreadySelected = selectedDates.some(date => 
        date.year === currentYear && 
        date.month === currentMonth && 
        date.day === day
      );
      
      let newSelectedDates;
      if (isAlreadySelected) {
        // Remove date
        newSelectedDates = selectedDates.filter(date => 
          !(date.year === currentYear && date.month === currentMonth && date.day === day)
        );
      } else {
        // Add date if we haven't reached the limit
        if (canSelectMore()) {
          newSelectedDates = [...selectedDates, newDate];
        } else {
          return; // Can't select more
        }
      }
      onDateChange(newSelectedDates);
    } else {
      // For single date trips: replace the entire selection with just this one date
      onDateChange([newDate]);
    }
  };

  const clearSelection = () => {
    onDateChange([]);
  };

  const handleDone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) onClose();
  };

  const handleContainerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-3 w-72 font-vazir ${disabled ? 'opacity-50' : ''}`}
      onClick={handleContainerClick}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            disabled={disabled}
            className="p-1 rounded-full hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronRight className="text-[#0B2A5B]" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            disabled={disabled}
            className="p-1 rounded-full hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft className="text-[#0B2A5B]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#0B2A5B] font-semibold text-sm">
            {currentYear}
          </span>
          <span className="text-[#0B2A5B] font-semibold text-sm">
            {afghanMonths[currentMonth]}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDone}
          className="p-1 rounded-full hover:bg-gray-100 text-sm text-[#0B2A5B]"
        >
          {language === 'fa' ? "انجام" : "ترسره کول"}
        </button>
      </div>

      {isRange && (
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="text-[#0B2A5B]">
            {language === 'fa' ? `انتخاب شده: ${selectedDates.length}/${maxSelectableDays}` : `ټاکل شوي: ${selectedDates.length}/${maxSelectableDays}`}
          </span>
          {selectedDates.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              {language === 'fa' ? "پاک کردن" : "پاک کول"}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 text-xs mb-3">
        {persianWeekdays.map((day) => (
          <div key={day} className="text-center text-gray-500 py-1">
            {day.charAt(0)}
          </div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const selectable = isSelectable(day);
          const selected = isSelected(day);
          const canSelect = selectable && (selected || canSelectMore());
          
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDaySelect(day)}
              disabled={disabled || !canSelect}
              className={`p-1 rounded-full text-center text-xs ${
                selected
                  ? "bg-[#F37021] text-white"
                  : selectable && !disabled
                  ? "hover:bg-gray-100 text-[#0B2A5B]"
                  : "text-gray-300 cursor-not-allowed"
              } ${
                !canSelect && !selected ? "opacity-50" : ""
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && !disabled && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md">
          <div className="text-[#0B2A5B] text-xs font-semibold mb-1">
            {language === 'fa' ? "تاریخ‌های انتخاب شده:" : "ټاکل شوې نېټې:"}
          </div>
          <div className="text-[#0B2A5B] text-xs max-h-20 overflow-y-auto">
            {selectedDates.slice(0, 5).map((date, index) => (
              <div key={index}>
                {`${date.year}/${date.month}/${date.day} - ${afghanMonths[date.month]}`}
              </div>
            ))}
            {selectedDates.length > 5 && (
              <div className="text-orange-500">
                {language === 'fa' ? `و ${selectedDates.length - 5} تاریخ دیگر` : `او ${selectedDates.length - 5} نورې نېټې`}
              </div>
            )}
          </div>
        </div>
      )}
      
      {disabled && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md text-center text-gray-500 text-xs">
          {language === 'fa' 
            ? "برای سفرهای همه روزه نیاز به انتخاب تاریخ نیست"
            : "د هرې ورځې سفرونو لپاره د نېټې انتخاب ته اړتیا نشته"
          }
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
const PriceInput = ({ label, value, onChange, disabled, icon, required }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <div className="text-right">
      <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2 justify-end">
        {required && <span className="text-red-500">*</span>}
        {label}
        {icon && <span className="text-orange-500">{icon}</span>}
      </label>
      <input
        type="number"
        min="1"
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={disabled ? 
          (language === 'fa' ? "غیرفعال" : "غیر فعال") 
          : (language === 'fa' ? "قیمت به افغانی" : "په افغانیو کې بیه")
        }
        required={required && !disabled}
        dir="rtl"
        className={`w-full border rounded-md py-2 pr-10 pl-3 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300'
        }`}
      />
      {required && !disabled && (!value || value === '') && (
        <p className="text-red-600 text-xs mt-1">
          {language === 'fa' ? "این فیلد الزامی است" : "دا فیلد اړین دی"}
        </p>
      )}
    </div>
  );
};

// Capacity Input Component
const CapacityInput = ({ label, value, onChange, disabled, icon, baseCapacity }) => {
  const { language } = useLanguage();
  
  return (
    <div className="text-right">
      <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2 justify-end">
        {label}
        {icon && <span className="text-blue-500">{icon}</span>}
      </label>
      <input
        type="number"
        min="0"
        max="20"
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={disabled ? 
          (language === 'fa' ? "غیرفعال" : "غیر فعال") 
          : (language === 'fa' ? "تعدادچوکی اضافی" : "د اضافي څوکيو شمېر")
        }
        dir="rtl"
        className={`w-full border rounded-md py-2 pr-10 pl-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300'
        }`}
      />
      {!disabled && (
        <div className="text-xs text-gray-500 mt-1">
          {language === 'fa' 
            ? `ظرفیت پایه: ${baseCapacity} + اضافه: ${value || 0} = کل: ${baseCapacity + parseInt(value || 0)}چوکی`
            : `اصلي ظرفيت: ${baseCapacity} + اضافي: ${value || 0} = ټول: ${baseCapacity + parseInt(value || 0)} څوکۍ`
          }
        </div>
      )}
    </div>
  );
};

// Selected Dates Display Component
const SelectedDatesDisplay = ({ dates, onRemove, isRange }) => {
  const { language } = useLanguage();

  if (!isRange || dates.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
      <div className="text-[#0B2A5B] text-sm font-semibold mb-2 flex justify-between items-center">
        <span>
          {language === 'fa' ? "تاریخ‌های انتخاب شده:" : "ټاکل شوې نېټې:"}
        </span>
        <span className="text-xs text-blue-600">
          {dates.length} {language === 'fa' ? "تاریخ" : "نېټې"}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
        {dates.map((date, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center bg-white p-2 rounded border border-gray-200"
          >
            <span className="text-[#0B2A5B] text-sm">
              {`${date.year}/${date.month}/${date.day} - ${afghanMonths[date.month]}`}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 text-xs p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
      {dates.length > 4 && (
        <div className="text-orange-500 text-xs mt-2 text-center">
          {language === 'fa' 
            ? `+ ${dates.length - 4} تاریخ دیگر` 
            : `+ ${dates.length - 4} نورې نېټې`
          }
        </div>
      )}
    </div>
  );
};

export default function Tripa() {
  const navigate = useNavigate();
  const toast = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // UNIFIED STATE: Combine all form state
  const [formState, setFormState] = useState({
    // Form fields
    formData: {},
    // Bus types
    busTypes: [],
    // Prices
    priceVip: '',
    price580: '',
    // Capacities
    additionalCapacityVip: '',
    additionalCapacity580: '',
    // Date selection
    selectedJalaliDates: [],
    allDays: false,
    isRange: false,
    // Track if form has been modified (for enabling update button)
    isFormModified: false,
  });

  const token = sessionStorage.getItem("auth_token");

  // Update form state
  const updateFormState = (updates) => {
    setFormState(prev => ({ 
      ...prev, 
      ...updates,
      // Always mark as modified when updating
      isFormModified: true 
    }));
  };

  // Reset all state
  const resetAllState = () => {
    setFormState({
      formData: {},
      busTypes: [],
      priceVip: '',
      price580: '',
      additionalCapacityVip: '',
      additionalCapacity580: '',
      selectedJalaliDates: [],
      allDays: false,
      isRange: false,
      isFormModified: false,
    });
  };

  // Table columns
  const columns = [
    { header: t.from, accessor: "from" },
    { header: t.to, accessor: "to" },
    { 
      header: language === 'fa' ? "تاریخ‌ها" : "نېټې", 
      accessor: "departure_dates",
      render: (row) => {
        if (row.all_days) {
          return (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {language === 'fa' ? "همه روزها" : "ټولې ورځې"}
            </span>
          );
        }
        
        if (row.is_range && row.departure_dates_jalali && row.departure_dates_jalali.length > 0) {
          const dates = row.departure_dates_jalali.slice(0, 3).map(date => 
            `${date.year}/${date.month}/${date.day}`
          ).join('، ');
          
          const extraCount = row.departure_dates_jalali.length - 3;
          
          return (
            <div className="text-xs">
              <div>{dates}</div>
              {extraCount > 0 && (
                <div className="text-orange-500 mt-1">
                  {language === 'fa' ? `+ ${extraCount} تاریخ دیگر` : `+ ${extraCount} نورې نېټې`}
                </div>
              )}
            </div>
          );
        }
        
        return row.departure_date_dari || '-';
      }
    },
    { header: t.departureTime, accessor: "departure_time_ampm" },
    { header: t.departureTerminal, accessor: "departure_terminal" },
    { header: t.arrivalTerminal, accessor: "arrival_terminal" },
    {
      header: language === 'fa' ? "قیمت ها" : "قیمتونه",
      accessor: "prices",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.prices?.VIP && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">VIP</span>
              <span>{row.prices.VIP} {language === 'fa' ? "افغانی" : "افغاني"}</span>
            </div>
          )}
          {row.prices?.["580"] && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">۵۸۰</span>
              <span>{row.prices["580"]} {language === 'fa' ? "افغانی" : "افغاني"}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: language === 'fa' ? "ظرفیت اضافی" : "اضافي ظرفيت",
      accessor: "additional_capacity",
      render: (row) => (
        <div className="flex flex-col gap-1 text-xs">
          {row.additional_capacity?.VIP !== undefined && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">VIP</span>
              <span>+{row.additional_capacity.VIP}</span>
            </div>
          )}
          {row.additional_capacity?.["580"] !== undefined && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">۵۸۰</span>
              <span>+{row.additional_capacity["580"]}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: t.busType,
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
    {
      header: language === 'fa' ? "همه روزها" : "ټولې ورځې",
      accessor: "all_days",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.all_days ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {row.all_days ? 
            (language === 'fa' ? "بله" : "هو") : 
            (language === 'fa' ? "خیر" : "نه")
          }
        </span>
      ),
    },
    {
      header: language === 'fa' ? "سفر دوره‌ای" : "دوري سفر",
      accessor: "is_range",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.is_range ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
        }`}>
          {row.is_range ? 
            (language === 'fa' ? "بله" : "هو") : 
            (language === 'fa' ? "خیر" : "نه")
          }
        </span>
      ),
    },
    {
      header: language === 'fa' ? "تاریخ ایجاد" : "د جوړیدو نېټه",
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
        label: language === 'fa' ? "به کجا" : "چېرته",
        name: "to",
        type: "text",
        placeholder: language === 'fa' ? "مثال: هرات" : "لومړنی: هرات",
        icon: <FaMapMarkerAlt />,
        required: true,
      },
      {
        label: language === 'fa' ? "از کجا" : "له چېرې",
        name: "from",
        type: "text",
        placeholder: language === 'fa' ? "مثال: کابل" : "لومړنی: کابل",
        icon: <FaMapMarkerAlt />,
        required: true,
      },
      {
        label: t.departureTime,
        name: "departure_time",
        type: "time",
        icon: <FaClock />,
        required: false,
      },
      {
        label: t.departureTerminal,
        name: "departure_terminal",
        type: "text",
        icon: <FaBus />,
        required: true,
      },
      {
        label: t.arrivalTerminal,
        name: "arrival_terminal",
        type: "text",
        icon: <FaBus />,
        required: true,
      },
      {
        name: "all_days",
        label: language === 'fa' ? "همه روزها" : "ټولې ورځې",
        type: "checkbox",
        placeholder: language === 'fa' 
          ? "این سفر برای همه روزها فعال باشد"
          : "دا سفر د ټولو ورځو لپاره فعال وي"
      },
      {
        name: "is_range",
        label: language === 'fa' ? "سفر دوره‌ای" : "دوري سفر",
        type: "checkbox",
        placeholder: language === 'fa' 
          ? "این سفر در چند تاریخ مختلف فعال باشد"
          : "دا سفر په څو مختلفو نېټو کې فعال وي"
      }
    ],
    [language, t]
  );

  // Fetch trips
  const fetchTrips = async () => {
    if (!token) {
      toast.error(language === 'fa' 
        ? "توکن معتبر موجود نیست. لطفاً دوباره وارد شوید."
        : "معتبر ټوکن نشته. مهرباني وکړئ بیا ننوځئ."
      );
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
      toast.error(err.response?.data?.message || 
        (language === 'fa' ? "خطا در دریافت لیست سفرها." : "د سفرونو د لیست په ترلاسه کولو کې تېروتنه.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Handle bus type selection
  const handleBusTypeChange = (type) => {
    const newBusTypes = formState.busTypes.includes(type) 
      ? formState.busTypes.filter(t => t !== type)
      : [...formState.busTypes, type];
    
    updateFormState({ busTypes: newBusTypes });
    
    // Clear prices and capacities when bus type is deselected
    if (!newBusTypes.includes("VIP")) {
      updateFormState({ priceVip: '', additionalCapacityVip: '' });
    }
    if (!newBusTypes.includes("580")) {
      updateFormState({ price580: '', additionalCapacity580: '' });
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      resetAllState();
      setEditingTrip(null);
      setShowDatePicker(false);
    }
  }, [isModalOpen]);

  // FIXED: Set initial values when editing - PROPERLY SYNCHRONIZED
  useEffect(() => {
    if (editingTrip && isModalOpen) {
      console.log("Editing trip:", editingTrip); // Debug log
      
      // Set bus types first
      const initialBusTypes = Array.isArray(editingTrip.bus_type) ? editingTrip.bus_type : [];
      
      // Set prices and capacities
      const priceVip = editingTrip.prices?.VIP?.toString() || '';
      const price580 = editingTrip.prices?.["580"]?.toString() || '';
      const additionalCapacityVip = editingTrip.additional_capacity?.VIP?.toString() || '';
      const additionalCapacity580 = editingTrip.additional_capacity?.["580"]?.toString() || '';
      
      const allDays = editingTrip.all_days || false;
      const isRange = editingTrip.is_range || false;
      
      // FIX: Handle range trip dates properly - check both departure_dates_range and departure_dates_jalali
      let selectedJalaliDates = [];
      
      if (isRange) {
        // First check for departure_dates_range (backend format)
        if (editingTrip.departure_dates_range && Array.isArray(editingTrip.departure_dates_range)) {
          console.log("Range trip dates found in departure_dates_range:", editingTrip.departure_dates_range);
          
          selectedJalaliDates = editingTrip.departure_dates_range
            .filter(dateObj => dateObj && dateObj.jalali)
            .map(dateObj => {
              const [year, month, day] = dateObj.jalali.split('-').map(Number);
              return { year, month, day };
            });
        }
        // Then check for departure_dates_jalali (frontend format)
        else if (editingTrip.departure_dates_jalali && Array.isArray(editingTrip.departure_dates_jalali)) {
          console.log("Range trip dates found in departure_dates_jalali:", editingTrip.departure_dates_jalali);
          selectedJalaliDates = editingTrip.departure_dates_jalali;
        }
        
        console.log("Parsed range dates:", selectedJalaliDates);
      } else if (!allDays) {
        // For single date trips
        console.log("Single date trip:", editingTrip.departure_date);
        
        if (editingTrip.departure_date_jalali) {
          // Use departure_date_jalali object if available
          selectedJalaliDates = [editingTrip.departure_date_jalali];
        } else if (editingTrip.departure_date && editingTrip.departure_date.includes('-')) {
          // Parse from departure_date string (format: YYYY-MM-DD)
          const [year, month, day] = editingTrip.departure_date.split('-').map(Number);
          selectedJalaliDates = [{ year, month, day }];
        }
      }
      
      console.log("Final selected dates:", selectedJalaliDates);
      
      // Set initial form data for the modal
      const initialFormData = {};
      fields.forEach(field => {
        if (field.name === 'all_days') {
          initialFormData[field.name] = allDays;
        } else if (field.name === 'is_range') {
          initialFormData[field.name] = isRange;
        } else {
          initialFormData[field.name] = editingTrip[field.name] || '';
        }
      });
      
      // CRITICAL FIX: Set ALL state at once to avoid race conditions
      setFormState({
        formData: initialFormData,
        busTypes: initialBusTypes,
        priceVip,
        price580,
        additionalCapacityVip,
        additionalCapacity580,
        selectedJalaliDates,
        allDays,
        isRange,
        isFormModified: false, // Reset modification flag for edit mode
      });
    }
  }, [editingTrip, isModalOpen]);

  // Handle form field changes from the modal - IMPROVED
  const handleFormFieldChange = (name, value) => {
    const updatedFormData = { ...formState.formData, [name]: value };
    
    updateFormState({ formData: updatedFormData });
    
    // Handle trip type changes carefully
    if (name === 'all_days') {
      const newAllDays = value;
      const newIsRange = newAllDays ? false : formState.isRange;
      
      updateFormState({ 
        allDays: newAllDays,
        isRange: newIsRange,
        // Only clear dates if switching TO all_days mode
        selectedJalaliDates: newAllDays ? [] : formState.selectedJalaliDates
      });
      
      // Also update the is_range checkbox in form data if needed
      if (newAllDays) {
        updateFormState(prev => ({
          ...prev,
          formData: { ...prev.formData, is_range: false }
        }));
      }
    }
    
    if (name === 'is_range') {
      const newIsRange = value;
      const newAllDays = newIsRange ? false : formState.allDays;
      
      updateFormState({ 
        isRange: newIsRange,
        allDays: newAllDays,
        // Preserve existing dates when switching to range mode
        selectedJalaliDates: formState.selectedJalaliDates
      });
      
      // Also update the all_days checkbox in form data if needed
      if (newIsRange) {
        updateFormState(prev => ({
          ...prev,
          formData: { ...prev.formData, all_days: false }
        }));
      }
    }
  };

  // Handle date selection from date picker
  const handleDateSelection = (dates) => {
    updateFormState({ selectedJalaliDates: dates });
  };

  // Handle date removal
  const handleDateRemove = (index) => {
    const newDates = formState.selectedJalaliDates.filter((_, i) => i !== index);
    updateFormState({ selectedJalaliDates: newDates });
  };

  // Add trip
  const handleAddTrip = async (formDataFromModal) => {
    if (!token) return toast.error(
      language === 'fa' ? "توکن معتبر موجود نیست." : "معتبر ټوکن نشته."
    );
    
    // Validate based on trip type
    if (!formState.allDays) {
      if (formState.isRange) {
        // Range trip validation - require at least 1 date
        if (formState.selectedJalaliDates.length === 0) {
          return toast.error(
            language === 'fa' ? "لطفاً حداقل یک تاریخ برای سفر دوره‌ای انتخاب کنید." : "مهرباني وکړئ لږ تر لږه یوه نېټه د دوري سفر لپاره وټاکئ."
          );
        }
      } else {
        // Single date trip validation
        if (formState.selectedJalaliDates.length === 0) {
          return toast.error(
            language === 'fa' ? "لطفاً تاریخ سفر را انتخاب کنید." : "مهرباني وکړئ د سفر نېټه وټاکئ."
          );
        }
      }
    }
    
    if (formState.busTypes.length === 0) {
      return toast.error(
        language === 'fa' ? "لطفاً حداقل یک نوع اتوبوس انتخاب کنید." : "مهرباني وکړئ لږ تر لږه یو ډول بس وټاکئ."
      );
    }
    
    // Validate prices based on selected bus types
    if (formState.busTypes.includes("VIP") && (!formState.priceVip || isNaN(Number(formState.priceVip)) || Number(formState.priceVip) <= 0)) {
      return toast.error(
        language === 'fa' ? "لطفاً قیمت معتبر برای اتوبوس VIP وارد کنید." : "مهرباني وکړئ د VIP بس لپاره معتبره بیه وارد کړئ."
      );
    }
    
    if (formState.busTypes.includes("580") && (!formState.price580 || isNaN(Number(formState.price580)) || Number(formState.price580) <= 0)) {
      return toast.error(
        language === 'fa' ? "لطفاً قیمت معتبر برای اتوبوس ۵۸۰ را وارد کنید." : "مهرباني وکړئ د ۵۸۰ بس لپاره معتبره بیه وارد کړئ."
      );
    }

    try {
      const payload = {
        ...formDataFromModal,
        all_days: formState.allDays,
        is_range: formState.isRange,
        bus_type: formState.busTypes,
      };

      // Add dates based on trip type
      if (!formState.allDays) {
        if (formState.isRange) {
          payload.departure_dates_jalali = formState.selectedJalaliDates;
        } else {
          // Single date - take the first selected date
          payload.departure_date_jalali = formState.selectedJalaliDates[0];
        }
      }

      // Only include prices for SELECTED bus types
      if (formState.busTypes.includes("VIP")) {
        payload.price_vip = Number(formState.priceVip);
      }
      if (formState.busTypes.includes("580")) {
        payload.price_580 = Number(formState.price580);
      }

      // Handle additional capacity as object {"VIP": 2, "580": 5}
      payload.additional_capacity_vip = formState.additionalCapacityVip ? Number(formState.additionalCapacityVip) : 0;
      payload.additional_capacity_580 = formState.additionalCapacity580 ? Number(formState.additionalCapacity580) : 0;
      
      const res = await axios.post(`${API_BASE_URL}/api/trips`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTrips((prev) => [res.data.trip, ...prev]);
      setIsModalOpen(false);
      resetAllState();
      setShowDatePicker(false);
      toast.success(
        language === 'fa' ? "سفر جدید با موفقیت اضافه شد." : "نوی سفر په بریالیتوب سره اضافه شو."
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 
        (language === 'fa' ? "خطا در ایجاد سفر." : "د سفر په جوړولو کې تېروتنه.")
      );
    }
  };

  // Edit trip
  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  // Update trip
  const handleUpdateTrip = async (formDataFromModal) => {
    if (!token) return toast.error(
      language === 'fa' ? "توکن معتبر موجود نیست." : "معتبر ټوکن نشته."
    );
    if (!editingTrip) return;
    
    // Validate based on trip type
    if (!formState.allDays) {
      if (formState.isRange) {
        // Range trip validation - require at least 1 date
        if (formState.selectedJalaliDates.length === 0) {
          return toast.error(
            language === 'fa' ? "لطفاً حداقل یک تاریخ برای سفر دوره‌ای انتخاب کنید." : "مهرباني وکړئ لږ تر لږه یوه نېټه د دوري سفر لپاره وټاکئ."
          );
        }
      } else {
        // Single date trip validation
        if (formState.selectedJalaliDates.length === 0) {
          return toast.error(
            language === 'fa' ? "لطفاً تاریخ سفر را انتخاب کنید." : "مهرباني وکړئ د سفر نېټه وټاکئ."
          );
        }
      }
    }
    
    if (formState.busTypes.length === 0) {
      return toast.error(
        language === 'fa' ? "لطفاً حداقل یک نوع اتوبوس انتخاب کنید." : "مهرباني وکړئ لږ تر لږه یو ډول بس وټاکئ."
      );
    }
    
    // Validate prices based on selected bus types ONLY
    if (formState.busTypes.includes("VIP") && (!formState.priceVip || isNaN(Number(formState.priceVip)) || Number(formState.priceVip) <= 0)) {
      return toast.error(
        language === 'fa' ? "لطفاً قیمت معتبر برای اتوبوس VIP وارد کنید." : "مهرباني وکړئ د VIP بس لپاره معتبره بیه وارد کړئ."
      );
    }
    
    if (formState.busTypes.includes("580") && (!formState.price580 || isNaN(Number(formState.price580)) || Number(formState.price580) <= 0)) {
      return toast.error(
        language === 'fa' ? "لطفاً قیمت معتبر برای اتوبوس ۵۸۰ را وارد کنید." : "مهرباني وکړئ د ۵۸۰ بس لپاره معتبره بیه وارد کړئ."
      );
    }

    try {
      const payload = {
        ...formDataFromModal,
        all_days: formState.allDays,
        is_range: formState.isRange,
        bus_type: formState.busTypes,
      };

      // Add dates based on trip type
      if (!formState.allDays) {
        if (formState.isRange) {
          payload.departure_dates_jalali = formState.selectedJalaliDates;
        } else {
          // Single date - take the first selected date
          payload.departure_date_jalali = formState.selectedJalaliDates[0];
        }
      }

      // Only include prices for SELECTED bus types
      if (formState.busTypes.includes("VIP")) {
        payload.price_vip = Number(formState.priceVip);
      }
      if (formState.busTypes.includes("580")) {
        payload.price_580 = Number(formState.price580);
      }

      // Handle additional capacity as object {"VIP": 2, "580": 5}
      payload.additional_capacity_vip = formState.additionalCapacityVip ? Number(formState.additionalCapacityVip) : 0;
      payload.additional_capacity_580 = formState.additionalCapacity580 ? Number(formState.additionalCapacity580) : 0;
      
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
      resetAllState();
      setShowDatePicker(false);
      toast.success(
        language === 'fa' ? "سفر با موفقیت ویرایش شد." : "سفر په بریالیتوب سره سم شو."
      );
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || 
        (language === 'fa' ? "خطا در ویرایش سفر." : "د سفر په سمون کې تېروتنه.")
      );
    }
  };

  // Delete trip
  const handleDeleteTrip = async (trip) => {
    if (!trip || !trip.id) return toast.error(
      language === 'fa' ? "شناسه سفر معتبر نیست." : "د سفر معتبر پېژندښت نشته."
    );
    
    const confirmMessage = language === 'fa' 
      ? "آیا مطمئن هستید که می‌خواهید این سفر را حذف کنید؟"
      : "آیا تاسې ډاډه یاست چې غواړئ دا سفر ړنګ کړئ؟";
    
    if (!window.confirm(confirmMessage)) return;
    
    if (!token) return toast.error(
      language === 'fa' ? "توکن معتبر موجود نیست." : "معتبر ټوکن نشته."
    );
    
    try {
      await axios.delete(`${API_BASE_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      toast.success(
        language === 'fa' ? "سفر با موفقیت حذف شد." : "سفر په بریالیتوب سره ړنګ شو."
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 
        (language === 'fa' ? "خطا در حذف سفر." : "د سفر په ړنګولو کې تېروتنه.")
      );
    }
  };

  if (isLoading) return <Loader />;

  return (
    <DashboardLayout>
      <div className="p-4 font-vazir text-right">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#0B2A5B]">
            {language === 'fa' ? "لیست سفرها" : "د سفرونو لیست"}
          </h1>
          <button
            onClick={() => {
              const today = moment().locale("fa").format("jYYYY/jM/jD");
              const [y, m, d] = today.split("/").map(Number);
              setIsModalOpen(true);
              setEditingTrip(null);
              setFormState({
                formData: {},
                busTypes: [],
                priceVip: '',
                price580: '',
                additionalCapacityVip: '',
                additionalCapacity580: '',
                selectedJalaliDates: [{ year: y, month: m, day: d }],
                allDays: false,
                isRange: false,
                isFormModified: false,
              });
              setShowDatePicker(false);
            }}
            className="bg-[#F37021] text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            {language === 'fa' ? "افزودن سفر جدید" : "نوی سفر اضافه کړئ"}
          </button>
        </div>

        <CustomTable
          data={trips}
          columns={columns}
   
          onEdit={handleEditTrip}
          onDelete={handleDeleteTrip}
      title={language === 'fa' ? "سفرها" : "سفرونه"} // Add this line
       language={language} // ← ADD THIS LINE

        />

        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTrip(null);
            resetAllState();
            setShowDatePicker(false);
          }}
          onSubmit={editingTrip ? handleUpdateTrip : handleAddTrip}
          title={editingTrip ? 
            (language === 'fa' ? "ویرایش سفر" : "د سفر سمون") : 
            (language === 'fa' ? "افزودن سفر جدید" : "نوی سفر اضافه کړئ")
          }
          titleIcon={<FaBus />}
           language={language} // Add this line
          fields={fields}
          initialData={editingTrip}
          onFieldChange={handleFormFieldChange}
          // FIX: Pass isFormModified to enable update button when dates change
          isValid={editingTrip ? formState.isFormModified : true}
        >
          {/* Bus Type Selection */}
          <div className="sm:col-span-2">
            <label className="block mb-2 font-semibold text-[#0B2A5B]">
              {language === 'fa' ? "نوع اتوبوس *" : "د بس ډول *"}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <BusTypeCheckbox
                label={language === 'fa' ? "اتوبوس VIP" : "VIP بس"}
                value="VIP"
                checked={formState.busTypes.includes("VIP")}
                onChange={() => handleBusTypeChange("VIP")}
                icon={<FaCrown />}
                description={language === 'fa' 
                  ? "اتوبوس لوکس با امکانات کامل" 
                  : "لوکس بس د بشپړو اسانتیاو سره"
                }
              />
              <BusTypeCheckbox
                label={language === 'fa' ? "اتوبوس ۵۸۰" : "۵۸۰ بس"}
                value="580"
                checked={formState.busTypes.includes("580")}
                onChange={() => handleBusTypeChange("580")}
                icon={<FaShuttleVan />}
                description={language === 'fa' 
                  ? "اتوبوس استاندارد و اقتصادی" 
                  : "معیاري او اقتصادي بس"
                }
              />
            </div>
            {formState.busTypes.length === 0 && (
              <p className="text-red-600 text-sm mt-1">
                {language === 'fa' 
                  ? "لطفاً حداقل یک نوع اتوبوس انتخاب کنید"
                  : "مهرباني وکړئ لږ تر لږه یو ډول بس وټاکئ"
                }
              </p>
            )}
          </div>

          {/* Price Inputs */}
          <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <PriceInput
              label={language === 'fa' 
                ? "قیمت اتوبوس VIP (افغانی)" 
                : "د VIP بس بیه (افغاني)"
              }
              value={formState.priceVip}
              onChange={(e) => updateFormState({ priceVip: e.target.value })}
              disabled={!formState.busTypes.includes("VIP")}
              icon={<FaMoneyBillWave />}
              required={formState.busTypes.includes("VIP")}
            />
            <PriceInput
              label={language === 'fa' 
                ? "قیمت اتوبوس ۵۸۰ (افغانی)" 
                : "د ۵۸۰ بس بیه (افغاني)"
              }
              value={formState.price580}
              onChange={(e) => updateFormState({ price580: e.target.value })}
              disabled={!formState.busTypes.includes("580")}
              icon={<FaMoneyBillWave />}
              required={formState.busTypes.includes("580")}
            />
          </div>

          {/* Additional Capacity Inputs */}
          <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <CapacityInput
              label={language === 'fa' 
                ? "ظرفیت اضافی VIP" 
                : "د VIP اضافي ظرفيت"
              }
              value={formState.additionalCapacityVip}
              onChange={(e) => updateFormState({ additionalCapacityVip: e.target.value })}
              disabled={!formState.busTypes.includes("VIP")}
              icon={<FaUsers />}
              baseCapacity={35}
            />
            <CapacityInput
              label={language === 'fa' 
                ? "ظرفیت اضافی ۵۸۰" 
                : "د ۵۸۰ اضافي ظرفيت"
              }
              value={formState.additionalCapacity580}
              onChange={(e) => updateFormState({ additionalCapacity580: e.target.value })}
              disabled={!formState.busTypes.includes("580")}
              icon={<FaUsers />}
              baseCapacity={49}
            />
          </div>

          {/* Date Picker - FIXED */}
          <div className="sm:col-span-2 relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block font-semibold text-[#0B2A5B] flex items-center gap-2">
                <FaCalendarAlt className="text-orange-500" />
                {formState.isRange 
                  ? (language === 'fa' ? "تاریخ‌های سفر (چندتایی)" : "د سفر نېټې (څو)")
                  : (language === 'fa' ? "تاریخ سفر" : "د سفر نېټه")
                }
              </label>
              <div className="text-xs text-gray-500">
                {formState.allDays ? (
                  <span className="text-green-600">
                    {language === 'fa' ? "همه روزها فعال" : "ټولې ورځې فعال"}
                  </span>
                ) : formState.isRange ? (
                  <span className="text-blue-600">
                    {language === 'fa' ? "حالت دوره‌ای" : "دوري حالت"}
                  </span>
                ) : (
                  <span className="text-orange-600">
                    {language === 'fa' ? "حالت تک تاریخی" : "یوازې یوه نېټه"}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`w-full border border-gray-300 rounded-md px-3 py-2 flex justify-between items-center ${
                formState.allDays ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                !formState.allDays && setShowDatePicker(!showDatePicker);
              }}
            >
              {formState.selectedJalaliDates.length > 0 ? (
                <span className="text-[#0B2A5B] text-sm">
                  {formState.isRange ? (
                    language === 'fa' 
                      ? `${formState.selectedJalaliDates.length} تاریخ انتخاب شده`
                      : `${formState.selectedJalaliDates.length} نېټې ټاکل شوي`
                  ) : (
                    `${formState.selectedJalaliDates[0].year}/${formState.selectedJalaliDates[0].month}/${formState.selectedJalaliDates[0].day} - ${
                      afghanMonths[formState.selectedJalaliDates[0].month]
                    }`
                  )}
                </span>
              ) : (
                <span className={formState.allDays ? "text-gray-400" : "text-gray-400"}>
                  {formState.allDays ? 
                    (language === 'fa' ? "نیاز به انتخاب تاریخ نیست" : "د نېټې انتخاب ته اړتیا نشته") : 
                    (formState.isRange ? 
                      (language === 'fa' ? "تاریخ‌های سفر را انتخاب کنید" : "د سفر نېټې وټاکئ") :
                      (language === 'fa' ? "تاریخ سفر را انتخاب کنید" : "د سفر نېټه وټاکئ")
                    )
                  }
                </span>
              )}
              <FaCalendarPlus className={formState.allDays ? "text-gray-400" : "text-orange-500"} />
            </div>
            
            {/* Selected Dates Display - Always show when there are dates */}
            <SelectedDatesDisplay 
              dates={formState.selectedJalaliDates}
              onRemove={handleDateRemove}
              isRange={formState.isRange}
            />

            {showDatePicker && !formState.allDays && (
              <div 
                className="absolute z-10 bottom-full right-0 mb-2"
                onClick={(e) => e.stopPropagation()}
              >
                <PersianDatePicker
                  selectedDates={formState.selectedJalaliDates}
                  onDateChange={handleDateSelection}
                  disabled={formState.allDays}
                  isRange={formState.isRange}
                  maxSelectableDays={30}
                  onClose={() => setShowDatePicker(false)}
                />
              </div>
            )}
          </div>
        </CustomFormModal>
      </div>
    </DashboardLayout>
  );
}