import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import Navbar from '../components/Navbar';
import { FaSearch, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import jalaali from 'jalaali-js';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from './locales/translations';

// Afghan month names in Dari and Pashto
const afghanMonths = {
  fa: {
    1: 'حمل', 2: 'ثور', 3: 'جوزا', 4: 'سرطان',
    5: 'اسد', 6: 'سنبله', 7: 'میزان', 8: 'عقرب',
    9: 'قوس', 10: 'جدی', 11: 'دلو', 12: 'حوت'
  },
  ps: {
    1: 'وری', 2: 'غویی', 3: 'غبرګولی', 4: 'چنګاښ',
    5: 'زمری', 6: 'وږی', 7: 'تله', 8: 'لړم',
    9: 'ليندۍ', 10: 'مرغومی', 11: 'سلواغه', 12: 'كب'
  },
  en: {
    1: 'Hamal', 2: 'Thawr', 3: 'Jawza', 4: 'Saratān',
    5: 'Asad', 6: 'Sunbula', 7: 'Mīzān', 8: 'Aqrab',
    9: 'Qaws', 10: 'Jadī', 11: 'Dalw', 12: 'Hūt'
  }
};

const afghanWeekdays = {
  fa: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
  ps: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
  en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
};

// Get months based on language
const getMonths = (language) => {
  return afghanMonths[language] || afghanMonths.fa;
};

// Get weekdays based on language
const getWeekdays = (language) => {
  return afghanWeekdays[language] || afghanWeekdays.fa;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export default function Busbooking() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dropdownError, setDropdownError] = useState(null);

  const todayGregorian = new Date();
  const todayJalali = jalaali.toJalaali(todayGregorian);
  const today = { year: todayJalali.jy, month: todayJalali.jm, day: todayJalali.jd };
  const [tripDate, setTripDate] = useState(today);

  const generateCacheKey = () => 'busbooking_dropdown_data';
  const isCacheValid = (cachedData) => cachedData && (new Date().getTime() - cachedData.timestamp) < 10 * 60 * 1000;
  const saveToCache = (data) => localStorage.setItem(generateCacheKey(), JSON.stringify({ data, timestamp: new Date().getTime() }));
  const getFromCache = () => {
    const cached = localStorage.getItem(generateCacheKey());
    if (!cached) return null;
    const cachedData = JSON.parse(cached);
    if (isCacheValid(cachedData)) return cachedData.data;
    localStorage.removeItem(generateCacheKey());
    return null;
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        setDropdownError(null);

        const cachedData = getFromCache();
        if (cachedData) {
          setFromOptions(cachedData.from || []);
          setToOptions(cachedData.to || []);
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/public/trips`);
        const trips = response.data;

        const fromList = [...new Set(trips.map(t => t.from))];
        const toList = [...new Set(trips.map(t => t.to))];

        setFromOptions(fromList);
        setToOptions(toList);
        saveToCache({ from: fromList, to: toList });
      } catch (err) {
        console.error(err);
        setDropdownError(
          language === 'fa' 
            ? 'بارگذاری مکان‌ها با مشکل مواجه شد. لطفا دوباره تلاش کنید.' 
            : language === 'ps'
            ? 'د ځایونو پورته کول ستونزمن شول. بیا هڅه وکړئ.'
            : 'Loading locations failed. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const getSelectableDates = () => {
    const dates = [];
    for (let i = 0; i <= 5; i++) {
      const tempDate = new Date(todayGregorian);
      tempDate.setDate(todayGregorian.getDate() + i);
      const jalaliDate = jalaali.toJalaali(tempDate);
      dates.push({ year: jalaliDate.jy, month: jalaliDate.jm, day: jalaliDate.jd });
    }
    return dates;
  };
  const selectableDates = getSelectableDates();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!tripDate) {
      setError(
        language === 'fa' 
          ? "لطفا تاریخ سفر را انتخاب کنید" 
          : language === 'ps'
          ? "مهرباني وکړئ د سفر نېټه وټاکئ"
          : "Please select travel date"
      );
      return;
    }
    setError("");

    const formattedDate = `${tripDate.year}-${String(tripDate.month).padStart(2, '0')}-${String(tripDate.day).padStart(2, '0')}`;
    navigate('/search', { state: { from, to, date: formattedDate } });
  };

  const handleDaySelect = (dayObj) => {
    setTripDate(dayObj);
    setShowDatePicker(false);
    setError('');
  };

  const formatSelectedDate = () => {
    if (!tripDate) {
      return language === 'fa' 
        ? "تاریخ سفر را انتخاب کنید" 
        : language === 'ps'
        ? "د سفر نېټه وټاکئ"
        : "Select travel date";
    }
    
    const months = getMonths(language);
    return `${tripDate.year}/${tripDate.month}/${tripDate.day} - ${months[tripDate.month]}`;
  };

  const getDaysInMonth = (year, month) => month <= 6 ? 31 : month <= 11 ? 30 : (year % 4 === 0 ? 30 : 29);
  const monthsToRender = [...new Set(selectableDates.map(d => `${d.year}-${d.month}`))];

  // Localized text content
  const localizedText = {
    pageTitle: language === 'fa' 
      ? 'جستجوی تکت بس' 
      : language === 'ps'
      ? 'د بس ټکټ پلټنه'
      : 'Bus Ticket Search',
    pageSubtitle: language === 'fa' 
      ? 'مسیر و تاریخ مورد نظر خود را انتخاب کنید' 
      : language === 'ps'
      ? 'خپل مسیر او نېټه وټاکئ'
      : 'Select your route and date',
    fromLabel: language === 'fa' 
      ? 'مبدا' 
      : language === 'ps'
      ? 'له چیرې'
      : 'From',
    toLabel: language === 'fa' 
      ? 'مقصد' 
      : language === 'ps'
      ? 'چیرې ته'
      : 'To',
    selectPlaceholder: language === 'fa' 
      ? '-- انتخاب کنید --' 
      : language === 'ps'
      ? '-- وټاکئ --'
      : '-- Select --',
    dateLabel: language === 'fa' 
      ? 'تاریخ سفر' 
      : language === 'ps'
      ? 'د سفر نېټه'
      : 'Travel Date',
    searchButton: language === 'fa' 
      ? 'جستجو' 
      : language === 'ps'
      ? 'پلټنه'
      : 'Search',
    retryButton: language === 'fa' 
      ? 'تلاش مجدد' 
      : language === 'ps'
      ? 'بیا هڅه'
      : 'Retry'
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen pt-16 font-vazir" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <Navbar />

        <div className="flex justify-center px-4 mt-10">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">
              {localizedText.pageTitle}
            </h1>
            <p className="text-center text-gray-600 mb-6">
              {localizedText.pageSubtitle}
            </p>

            <form className="space-y-6" onSubmit={handleSearch}>
              {/* From / To Selectors */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">
                    {localizedText.fromLabel}
                  </label>
                  <div className="relative">
                    <select
                      value={from}
                      required
                      onChange={(e) => setFrom(e.target.value)}
                      className="w-full border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      disabled={loading}
                    >
                      <option value="">{localizedText.selectPlaceholder}</option>
                      {fromOptions.map((f, i) => <option key={i} value={f}>{f}</option>)}
                    </select>
                    {loading && <FaSpinner className="absolute left-2 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">
                    {localizedText.toLabel}
                  </label>
                  <div className="relative">
                    <select
                      value={to}
                      required
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      disabled={loading}
                    >
                      <option value="">{localizedText.selectPlaceholder}</option>
                      {toOptions.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                    {loading && <FaSpinner className="absolute left-2 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />}
                  </div>
                </div>
              </div>

              {dropdownError && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm flex justify-between items-center">
                  {dropdownError}
                  <button onClick={() => window.location.reload()} className="underline text-red-800">
                    {localizedText.retryButton}
                  </button>
                </div>
              )}

              {/* Date Picker */}
              <div className="relative">
                <label className="block text-gray-700 mb-1">
                  {localizedText.dateLabel}
                </label>
                <div
                  className="flex justify-between items-center cursor-pointer border border-gray-400 rounded-md px-3 py-2 hover:ring-2 hover:ring-blue-400 transition"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <span className={tripDate ? "text-gray-800" : "text-gray-400"}>
                    {formatSelectedDate()}
                  </span>
                  <FaCalendarAlt className="text-blue-600" />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

                {showDatePicker && (
                  <div className="absolute z-20 bg-white shadow-lg rounded-lg mt-2 w-full p-3">
                    {monthsToRender.map(monthKey => {
                      const [year, month] = monthKey.split('-').map(Number);
                      const daysInMonth = getDaysInMonth(year, month);
                      const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                      const months = getMonths(language);
                      const weekdays = getWeekdays(language);

                      return (
                        <div key={monthKey} className="mb-4">
                          <h3 className="text-center text-blue-700 font-semibold mb-2">
                            {months[month]} {year}
                          </h3>
                          <div className="grid grid-cols-7 gap-1 text-xs">
                            {weekdays.map(day => (
                              <div key={day} className="text-center text-gray-400 py-1">
                                {language === 'en' ? day : day.charAt(0)}
                              </div>
                            ))}
                            {monthDays.map(day => {
                              const isSelectable = selectableDates.some(d => d.year === year && d.month === month && d.day === day);
                              const isSelected = tripDate.year === year && tripDate.month === month && tripDate.day === day;
                              const isToday = today.year === year && today.month === month && today.day === day;

                              return (
                                <button
                                  key={day}
                                  disabled={!isSelectable}
                                  onClick={() => isSelectable && handleDaySelect({ year, month, day })}
                                  className={`py-1 rounded-full text-center transition ${
                                    !isSelectable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-100 text-gray-800'
                                  } ${isSelected ? 'bg-blue-600 text-white' : ''} ${isToday && !isSelected ? 'border border-blue-400' : ''}`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />} 
                {localizedText.searchButton}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}