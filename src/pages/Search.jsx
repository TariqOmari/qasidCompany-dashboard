import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from './locales/translations';

import { 
  FaWifi, FaToilet, FaPlug, FaTv, FaArrowLeft, 
  FaMapMarkerAlt, FaClock, FaBus, FaCrown, 
  FaShieldAlt, FaTimes, FaStar, FaRegStar, FaStarHalfAlt,
  FaArrowRight, FaHome, FaCalendarAlt, FaComment, FaUser,
  FaBuilding, FaFilter, FaCheck, FaChevronRight, FaChevronLeft,
  FaRoute, FaChair
} from 'react-icons/fa';
import { toJalaali } from 'jalaali-js';

// Afghan month names in Persian and Pashto
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

// Get months based on language
const getMonths = (language) => {
  return afghanMonths[language] || afghanMonths.fa;
};

// Afghan day names in Persian and Pashto
const afghanDays = {
  fa: {
    0: 'یکشنبه',
    1: 'دوشنبه', 
    2: 'سه شنبه',
    3: 'چهارشنبه',
    4: 'پنجشنبه',
    5: 'جمعه',
    6: 'شنبه'
  },
  ps: {
    0: 'یکشنبه',
    1: 'دوشنبه', 
    2: 'سه شنبه',
    3: 'چهارشنبه',
    4: 'پنجشنبه',
    5: 'جمعه',
    6: 'شنبه'
  },
  en: {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  }
};

// Get days based on language
const getDays = (language) => {
  return afghanDays[language] || afghanDays.fa;
};

// Company Filter Modal Component
const CompanyFilterModal = ({ isOpen, onClose, companies, selectedCompanies, onCompanyToggle, onSelectAll, onClearAll, language }) => {
  if (!isOpen) return null;

  const t = translations[language];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FaBuilding className="text-white" />
              {language === 'fa' ? 'فیلتر شرکت‌ها' : language === 'ps' ? 'د شرکتونو فلټر' : 'Company Filter'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition text-xl p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={onSelectAll}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition text-sm font-medium"
            >
              {language === 'fa' ? 'انتخاب همه' : language === 'ps' ? 'ټول انتخاب کړئ' : 'Select All'}
            </button>
            <button
              onClick={onClearAll}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition text-sm font-medium"
            >
              {language === 'fa' ? 'پاک کردن همه' : language === 'ps' ? 'ټول پاک کړئ' : 'Clear All'}
            </button>
          </div>
        </div>

        {/* Companies List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaBuilding className="text-4xl text-gray-300 mx-auto mb-3" />
              <p>{language === 'fa' ? 'شرکتی یافت نشد' : language === 'ps' ? 'هیڅ شرکت ونه موندل شو' : 'No companies found'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {companies.map((company) => (
                <label
                  key={company.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-teal-50 hover:border-teal-200 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 font-bold border border-teal-200">
                        {company.name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 group-hover:text-teal-700 text-right">
                        {company.name}
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        {company.tripCount} {language === 'fa' ? 'سفر' : language === 'ps' ? 'سفر' : 'trips'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => onCompanyToggle(company.id)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                      selectedCompanies.includes(company.id)
                        ? 'bg-teal-500 border-teal-500'
                        : 'bg-white border-gray-300 group-hover:border-teal-400'
                    }`}>
                      {selectedCompanies.includes(company.id) && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition font-semibold shadow-md"
          >
            {language === 'fa' ? 'اعمال فیلتر' : language === 'ps' ? 'فلټر تطبیق کړئ' : 'Apply Filter'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reviews Modal Component
const ReviewsModal = ({ isOpen, onClose, reviews, companyName, language }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {language === 'fa' ? 'نظرات مسافران' : language === 'ps' ? 'د مسافرینو نظرونه' : 'Passenger Reviews'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition text-xl p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaComment className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{companyName}</h3>
              <p className="text-white text-opacity-80 mt-1">
                {language === 'fa' ? 'همه نظرات مسافران' : language === 'ps' ? 'د مسافرینو ټول نظرونه' : 'All passenger reviews'}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaComment className="text-4xl text-gray-300 mx-auto mb-3" />
              <p>{language === 'fa' ? 'هنوز نظری ثبت نشده است' : language === 'ps' ? 'تر اوسه هیڅ نظر ثبت شوی ندی' : 'No reviews yet'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-teal-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {language === 'fa' ? 'مسافر' : language === 'ps' ? 'مسافر' : 'Passenger'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${
                                i < review.rating ? 'text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  
                  {review.review ? (
                    <p className="text-gray-700 leading-relaxed text-right">
                      {review.review}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic text-right">
                      {language === 'fa' ? 'این کاربر فقط امتیاز داده است' : language === 'ps' ? 'دا کارن یوازې رېټینګ ورکړی دی' : 'This user only gave a rating'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition font-semibold shadow-md"
          >
            {language === 'fa' ? 'بستن' : language === 'ps' ? 'تړل' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Single Trip Card Component
const TripCard = ({ 
  trip, 
  busType, 
  onReserve, 
  onViewReviews, 
  companyRating, 
  API_BASE_URL,
  language 
}) => {
  const formatTimeWithPersianAmPm = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    let hours12 = hours % 12;
    if (hours12 === 0) hours12 = 12;
    const amPm = hours < 12 ? (language === 'fa' ? 'ق.ظ' : language === 'ps' ? 'م:غ' : 'AM') : (language === 'fa' ? 'ب.ظ' : language === 'ps' ? 'و:غ' : 'PM');
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${amPm}`;
  };

  
  const getBusTypeColor = (type) => {
    const config = {
      'VIP': 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      '580': 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600', 
      'Standard': 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
    };
    return config[type] || 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600';
  };

  const getBusTypeBadgeColor = (type) => {
    const config = {
      'VIP': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      '580': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
      'Standard': 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
    };
    return config[type] || 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
  };

  const getPriceForBusType = (trip, busType) => {
    if (trip.prices && trip.prices[busType]) {
      return trip.prices[busType];
    }
    return trip.price || 1500;
  };

  const renderFacilities = (facilities) => (
    <div className="flex gap-3 text-gray-500">
      {facilities?.wifi && (
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FaWifi className="text-blue-500 text-sm" />
          </div>
          <span className="text-xs text-gray-500">
            {language === 'fa' ? 'وای‌فای' : language === 'ps' ? 'وای فای' : 'WiFi'}
          </span>
        </div>
      )}
      {facilities?.toilet && (
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 bg-green-50 rounded-lg">
            <FaToilet className="text-green-500 text-sm" />
          </div>
          <span className="text-xs text-gray-500">
            {language === 'fa' ? 'توالت' : language === 'ps' ? 'تشناب' : 'Toilet'}
          </span>
        </div>
      )}
      {facilities?.charging && (
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <FaPlug className="text-yellow-500 text-sm" />
          </div>
          <span className="text-xs text-gray-500">
            {language === 'fa' ? 'شارژر' : language === 'ps' ? 'چارجونکی' : 'Charger'}
          </span>
        </div>
      )}
      {facilities?.tv && (
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 bg-purple-50 rounded-lg">
            <FaTv className="text-purple-500 text-sm" />
          </div>
          <span className="text-xs text-gray-500">
            {language === 'fa' ? 'تلویزیون' : language === 'ps' ? 'ٹیلیویژن' : 'TV'}
          </span>
        </div>
      )}
    </div>
  );

  const renderStarRating = (averageRating, totalRatings, onViewReviews, trip) => {
    const hasRatings = totalRatings > 0;
    
    return (
      <button
        onClick={() => onViewReviews(trip)}
        className={`transition-transform hover:scale-105 cursor-pointer`}
      >
        <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-1 border border-amber-200">
          <FaStar className={`text-xs ${hasRatings ? 'text-amber-400' : 'text-gray-400'}`} />
          <span className="font-bold text-amber-700 text-xs">
            {hasRatings ? averageRating.toFixed(1) : '0.0'}
          </span>
          <span className="text-amber-600 text-xs font-medium">
            ({hasRatings ? totalRatings : '0'})
          </span>
        </div>
      </button>
    );
  };

  const busColor = getBusTypeColor(busType);
  const busBadgeColor = getBusTypeBadgeColor(busType);
  const price = getPriceForBusType(trip, busType);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 transition-all duration-300 hover:shadow-xl relative overflow-hidden" dir={language === 'en' ? 'ltr' : 'rtl'}>
      {/* Decorative accent line */}
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
      
      {/* Top Section: Company info and time */}
      <div className="flex justify-between items-start mb-4">
        {/* Left side: Company logo and name */}
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            {trip.company_logo ? (
              <img 
                src={`${API_BASE_URL}/public/${trip.company_logo}`} 
                alt={trip.company_name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 font-bold border-2 border-teal-100 shadow-sm text-sm">
                {trip.company_name?.charAt(0) || 'C'}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {trip.company_name || (language === 'fa' ? 'وردک بابا' : language === 'ps' ? 'وردک بابا' : 'Wardak Baba')}
              </h3>
              {/* Ratings placed under company name */}
              <div className="mt-1">
                {renderStarRating(
                  companyRating.average_rating, 
                  companyRating.total_reviews, 
                  onViewReviews, 
                  trip
                )}
              </div>
            </div>
          </div>
        </div>
      
        {/* Right side: Departure time */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100 shadow-sm">
            <FaClock className="text-blue-500 text-sm" />
            <span className="font-bold text-gray-800 text-sm">
              {formatTimeWithPersianAmPm(trip.departure_time)}
            </span>
          </div>
          
          {/* Daily Trip Badge */}
          {trip.isDailyTrip && (
            <div className="mt-2">
              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                {language === 'fa' ? 'همه روزه' : language === 'ps' ? 'هره ورځ' : 'Daily'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Route Information */}
      <div className="mb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <FaRoute className="text-teal-500" />
            <span className="font-semibold text-sm">
              {language === 'fa' ? 'مسیر سفر' : language === 'ps' ? 'د سفر مسیر' : 'Travel Route'}
            </span>
          </div>
        </div>

        {/* Route Points */}
        <div className="flex items-center justify-between relative">
          {/* From Section */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mb-2 shadow-md"></div>
            <span className="font-bold text-gray-800 text-sm">{trip.from}</span>
            <span className="text-xs text-gray-500 mt-1">{trip.departure_terminal}</span>
          </div>

          {/* Connecting Line */}
          <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 mx-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
          </div>

          {/* To Section */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-3 h-3 bg-teal-500 rounded-full mb-2 shadow-md"></div>
            <span className="font-bold text-gray-800 text-sm">{trip.to}</span>
            <span className="text-xs text-gray-500 mt-1">{trip.arrival_terminal}</span>
          </div>
        </div>

        {/* Price and Bus Type */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          {/* Bus Type */}
          <div className="flex items-center gap-2">
            <FaChair className="text-gray-400 text-sm" />
            <span className={`px-3 py-1 rounded-full text-white text-xs font-bold shadow-md ${busBadgeColor}`}>
              {busType}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">
              {language === 'fa' ? 'قیمت:' : language === 'ps' ? 'بیه:' : 'Price:'}
            </span>
            <span className="text-emerald-600 font-bold text-lg">
              {price} {language === 'fa' ? 'افغانی' : language === 'ps' ? 'افغانۍ' : 'AFN'}
            </span>
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div className="mb-4">
        <div className="flex justify-center">
          {renderFacilities(trip.facilities)}
        </div>
      </div>

      {/* Reserve Button */}
      <div className="text-center">
        <button
          onClick={() => onReserve(trip, busType)}
          className={`${busColor} text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 mx-auto w-full`}
        >
          <FaBus className="text-sm" />
          {language === 'fa' ? 'رزرو بلیط' : language === 'ps' ? 'ټکټ ریزرو کړئ' : 'Reserve Ticket'}
        </button>
      </div>
    </div>
  );
};

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, to, date } = location.state || {};
  const { language } = useLanguage();
  const t = translations[language];

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBusType, setSelectedBusType] = useState('all');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [companyFilterModalOpen, setCompanyFilterModalOpen] = useState(false);
  const [companyRatings, setCompanyRatings] = useState({});
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedTripForReviews, setSelectedTripForReviews] = useState(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  // Get unique companies from trips
  const companies = React.useMemo(() => {
    const companyMap = {};
    trips.forEach(trip => {
      if (trip.company_id && trip.company_name) {
        if (!companyMap[trip.company_id]) {
          companyMap[trip.company_id] = {
            id: trip.company_id,
            name: trip.company_name,
            logo: trip.company_logo ? `${API_BASE_URL}/public/${trip.company_logo}` : null,
            tripCount: 0
          };
        }
        companyMap[trip.company_id].tripCount++;
      }
    });
    return Object.values(companyMap).sort((a, b) => b.tripCount - a.tripCount);
  }, [trips, API_BASE_URL]);

  // Get next 5 days including today
  const getNextFiveDays = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 5; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      
      const jalaaliDate = toJalaali(nextDay);
      const months = getMonths(language);
      const daysList = getDays(language);
      
      days.push({
        date: `${jalaaliDate.jy}-${String(jalaaliDate.jm).padStart(2, '0')}-${String(jalaaliDate.jd).padStart(2, '0')}`,
        dayName: daysList[nextDay.getDay()],
        displayDate: `${jalaaliDate.jd} ${months[jalaaliDate.jm]}`,
        isToday: i === 0,
        isTomorrow: i === 1,
        isDayAfterTomorrow: i === 2,
        isDay3: i === 3,
        isDay4: i === 4
      });
    }
    
    return days;
  };

  const nextFiveDays = getNextFiveDays();

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      const months = getMonths(language);
      return `${day} ${months[parseInt(month)] || ''}`;
    }
    
    return dateString;
  };

  // Company filter handlers
  const handleCompanyToggle = (companyId) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSelectAllCompanies = () => {
    setSelectedCompanies(companies.map(company => company.id));
  };

  const handleClearAllCompanies = () => {
    setSelectedCompanies([]);
  };

  // Generate a cache key based on search parameters
  const generateCacheKey = (searchDate = selectedDate) => {
    return `search_${from}_${to}_${searchDate}`;
  };

  // Check if cached data is still valid (less than 5 minutes old)
  const isCacheValid = (cachedData) => {
    const now = new Date().getTime();
    return cachedData && (now - cachedData.timestamp) < 5 * 60 * 1000;
  };

  // Save data to cache with timestamp
  const saveToCache = (data, searchDate = selectedDate) => {
    const cacheKey = generateCacheKey(searchDate);
    const cacheData = {
      data: data,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  };

  // Get data from cache if available and valid
  const getFromCache = (searchDate = selectedDate) => {
    const cacheKey = generateCacheKey(searchDate);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      if (isCacheValid(cachedData)) {
        return cachedData.data;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
    return null;
  };

  // Process trips data
  const processTripsData = (tripsData, searchDate = selectedDate) => {
    return tripsData.map(trip => {
      const processedTrip = {
        id: trip.id,
        from: trip.from,
        to: trip.to,
        departure_time: trip.departure_time,
        departure_date: trip.departure_date,
        departure_terminal: trip.departure_terminal,
        arrival_terminal: trip.arrival_terminal,
        prices: trip.prices,
        bus_types: trip.bus_type || [trip.formatted_bus_type || 'Standard'],
        facilities: {
          wifi: true,
          toilet: true,
          charging: true,
          tv: true
        },
        company_name: language === 'fa' ? 'وردک بابا' : language === 'ps' ? 'وردک بابا' : 'Wardak Baba',
        company_id: 1,
        isDailyTrip: trip.all_days === 1 || trip.departure_date === null
      };

      if (processedTrip.isDailyTrip && !processedTrip.departure_date) {
        processedTrip.departure_date = searchDate;
      }

      return processedTrip;
    });
  };

  // Fetch company ratings and reviews
  const fetchCompanyRatings = async (companyId) => {
    try {
      if (!companyId) {
        console.warn("Missing company ID for ratings");
        return;
      }

      const apiUrl = `${API_BASE_URL}/api/companies/${companyId}/reviews`;

      console.log("Fetching company ratings from:", apiUrl);

      const response = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        validateStatus: function (status) {
          return status < 500;
        },
      });

      if (response.status === 200 && response.data) {
        setCompanyRatings(prev => ({
          ...prev,
          [companyId]: {
            average_rating: response.data.average_rating || 0,
            total_reviews: response.data.total_reviews || 0,
            reviews: response.data.reviews || []
          }
        }));
      } else {
        console.warn("Unexpected response status for company", companyId, ":", response.status);
        setCompanyRatings(prev => ({
          ...prev,
          [companyId]: { average_rating: 0, total_reviews: 0, reviews: [] }
        }));
      }
    } catch (error) {
      console.error("Error fetching company ratings for company", companyId, ":", error);
      setCompanyRatings(prev => ({
        ...prev,
        [companyId]: { average_rating: 0, total_reviews: 0, reviews: [] }
      }));
    }
  };

  // Handle view all reviews
  const handleViewAllReviews = async (trip) => {
    const companyId = trip.company_id;
    const companyRating = companyRatings[companyId] || { average_rating: 0, total_reviews: 0, reviews: [] };
    
    setSelectedTripForReviews({
      ...trip,
      reviews: companyRating.reviews || [],
      company_name: trip.company_name
    });
    setReviewsModalOpen(true);
  };

  // Fetch trips for a specific date
  const fetchTripsForDate = async (searchDate = selectedDate) => {
    try {
      setLoading(true);
      setError(null);

      const cachedTrips = getFromCache(searchDate);
      if (cachedTrips) {
        const processedTrips = processTripsData(cachedTrips, searchDate);
        setTrips(processedTrips);
        
        const uniqueCompanyIds = [...new Set(processedTrips.map(trip => trip.company_id).filter(Boolean))];
        uniqueCompanyIds.forEach(companyId => {
          fetchCompanyRatings(companyId);
        });
        
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/public/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(searchDate)}`
      );

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      console.log('API Response:', data);

      if (data && Array.isArray(data)) {
        const processedTrips = processTripsData(data, searchDate);
        setTrips(processedTrips);
        
        const uniqueCompanyIds = [...new Set(processedTrips.map(trip => trip.company_id).filter(Boolean))];
        uniqueCompanyIds.forEach(companyId => {
          fetchCompanyRatings(companyId);
        });
        
        saveToCache(data, searchDate);
      } else if (data.trips && Array.isArray(data.trips)) {
        const processedTrips = processTripsData(data.trips, searchDate);
        setTrips(processedTrips);
        
        const uniqueCompanyIds = [...new Set(processedTrips.map(trip => trip.company_id).filter(Boolean))];
        uniqueCompanyIds.forEach(companyId => {
          fetchCompanyRatings(companyId);
        });
        
        saveToCache(data.trips, searchDate);
      } else {
        setTrips([]);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError(
        language === 'fa' 
          ? 'دریافت سفرها با خطا مواجه شد. لطفا دوباره تلاش کنید.' 
          : language === 'ps'
          ? 'د سفرونو ترلاسه کول ستونزمن شول. بیا هڅه وکړئ.'
          : 'Failed to fetch trips. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (newDate, dayInfo) => {
    setSelectedDate(newDate);
    fetchTripsForDate(newDate);
  };

  useEffect(() => {
    if (from && to && selectedDate) {
      fetchTripsForDate(selectedDate);
    } else {
      setError(
        language === 'fa' 
          ? 'پارامترهای جستجو وجود ندارد' 
          : language === 'ps'
          ? 'د پلټنی پارامترونو نشتوالی'
          : 'Search parameters are missing'
      );
      setLoading(false);
    }
  }, [from, to, selectedDate]);

  const handleReserve = (trip, busType = null) => {
    const selectedBusType = busType || (trip.bus_types && trip.bus_types[0]) || 'Standard';
    
    const finalDepartureDate = trip.isDailyTrip ? selectedDate : trip.departure_date;
    
    navigate('/details', {
      state: {
        trip_id: trip.id,
        from: trip.from,
        to: trip.to,
        company: trip.company_name || (language === 'fa' ? 'وردک بابا' : language === 'ps' ? 'وردک بابا' : 'Wardak Baba'),
        company_phone: trip.company_phone,
        price: trip.prices && trip.prices[selectedBusType] ? trip.prices[selectedBusType] : trip.price || 1500,
        bus_type: selectedBusType,
        seat: "A2",
        terminal: trip.departure_terminal,
        arrivaterminal: trip.arrival_terminal,
        departure_date: finalDepartureDate,
        departure_time: trip.departure_time,
        facilities: {
          wifi: trip.facilities?.wifi || true,
          toilet: trip.facilities?.toilet || true,
          charging: trip.facilities?.charging || true,
          tv: trip.facilities?.tv || true,
        },
        isDailyTrip: trip.isDailyTrip || false,
        selectedDate: selectedDate
      },
    });
  };

  // Generate separate cards for each bus type
  const generateTripCards = () => {
    const cards = [];
    
    trips.forEach((trip) => {
      const companyMatch = selectedCompanies.length === 0 || 
        (trip.company_id && selectedCompanies.includes(trip.company_id));
      
      if (!companyMatch) return;

      const busTypes = trip.bus_types || ['Standard'];
      
      busTypes.forEach((busType) => {
        if (selectedBusType !== 'all' && busType !== selectedBusType) {
          return;
        }

        const companyRating = companyRatings[trip.company_id] || { average_rating: 0, total_reviews: 0, reviews: [] };
        
        cards.push(
          <TripCard
            key={`${trip.id}-${busType}`}
            trip={trip}
            busType={busType}
            onReserve={handleReserve}
            onViewReviews={handleViewAllReviews}
            companyRating={companyRating}
            API_BASE_URL={API_BASE_URL}
            language={language}
          />
        );
      });
    });
    
    return cards;
  };

  // Get unique bus types from all trips
  const allBusTypes = [...new Set(trips.flatMap(trip => trip.bus_types || ['Standard']))];

  return (
    <>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <Navbar />

          {/* Company Filter Modal */}
          <CompanyFilterModal
            isOpen={companyFilterModalOpen}
            onClose={() => setCompanyFilterModalOpen(false)}
            companies={companies}
            selectedCompanies={selectedCompanies}
            onCompanyToggle={handleCompanyToggle}
            onSelectAll={handleSelectAllCompanies}
            onClearAll={handleClearAllCompanies}
            language={language}
          />

          {/* Reviews Modal */}
          <ReviewsModal
            isOpen={reviewsModalOpen}
            onClose={() => setReviewsModalOpen(false)}
            reviews={selectedTripForReviews?.reviews || []}
            companyName={selectedTripForReviews?.company_name}
            language={language}
          />

          <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
            
            {/* Search Summary Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    <FaRoute className="text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {language === 'fa' ? 'نتایج جستجو' : language === 'ps' ? 'د پلټنی پایلې' : 'Search Results'}
                    </h1>
                    <p className="text-white text-opacity-90">
                      {language === 'fa' ? `سفرهای موجود از ${from} به ${to}` : language === 'ps' ? `شته سفرونه له ${from} څخه ${to} ته` : `Available trips from ${from} to ${to}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm bg-white bg-opacity-20 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-white text-opacity-80" />
                    <span>
                      {language === 'fa' ? 'تاریخ:' : language === 'ps' ? 'نېټه:' : 'Date:'} {formatDisplayDate(selectedDate)}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white bg-opacity-30"></div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-white text-opacity-80" />
                    <span>{from} → {to}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Filter */}
            {!loading && !error && trips.length > 0 && (
              <div className="sticky z-40 top-16 bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <FaCalendarAlt className="text-teal-500 text-lg" />
                  <h3 className="text-base font-bold text-gray-800">
                    {language === 'fa' ? 'انتخاب تاریخ سفر' : language === 'ps' ? 'د سفر نېټه وټاکئ' : 'Select Travel Date'}
                  </h3>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {nextFiveDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateChange(day.date, day)}
                      className={`min-w-[90px] flex-1 p-3 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                        selectedDate === day.date
                          ? 'border-teal-500 bg-teal-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-teal-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`font-bold text-xs mb-1 ${
                          selectedDate === day.date ? 'text-teal-600' : 'text-gray-800'
                        }`}>
                          {day.dayName}
                        </div>
                        <div className={`text-xs ${
                          selectedDate === day.date ? 'text-teal-500' : 'text-gray-600'
                        }`}>
                          {day.displayDate}
                        </div>
                        {day.isToday && (
                          <div className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded-full mt-1 inline-block">
                            {language === 'fa' ? 'امروز' : language === 'ps' ? 'نن' : 'Today'}
                          </div>
                        )}
                        {day.isTomorrow && (
                          <div className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded-full mt-1 inline-block">
                            {language === 'fa' ? 'فردا' : language === 'ps' ? 'سبا' : 'Tomorrow'}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters Section - Bus Type and Company */}
            {trips.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Bus Type Filter */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <FaBus className="text-gray-600" />
                      <span className="font-semibold text-gray-700">
                        {language === 'fa' ? 'نوع بس:' : language === 'ps' ? 'د بس ډول:' : 'Bus Type:'}
                      </span>
                    </div>

                    <div className="relative w-full sm:w-auto">
                      <select
                        value={selectedBusType}
                        onChange={(e) => setSelectedBusType(e.target.value)}
                        className="appearance-none w-full sm:min-w-[140px] px-3 py-2 pr-8 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 cursor-pointer shadow-sm"
                      >
                        <option value="all">
                          {language === 'fa' ? 'همه انواع' : language === 'ps' ? 'ټول ډولونه' : 'All Types'}
                        </option>
                        {allBusTypes.map((type) => (
                          <option key={type} value={type}>
                            {type === 'VIP' ? 'VIP 🏆' : type === '580' ? '580 ✨' : type}
                          </option>
                        ))}
                      </select>

                      <div className={`pointer-events-none absolute inset-y-0 ${language === 'en' ? 'right-0' : 'left-0'} flex items-center px-2 text-gray-500`}>
                        <FaChevronRight className="text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Company Filter */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <FaBuilding className="text-gray-600" />
                      <span className="font-semibold text-gray-700">
                        {language === 'fa' ? 'شرکت:' : language === 'ps' ? 'شرکت:' : 'Company:'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setCompanyFilterModalOpen(true)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-2 shadow-sm ${
                          selectedCompanies.length > 0
                            ? 'border-teal-500 bg-teal-50 text-teal-700 scale-[1.03]'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <FaFilter className="text-xs" />
                        {selectedCompanies.length === 0
                          ? (language === 'fa' ? 'همه شرکت‌ها' : language === 'ps' ? 'ټول شرکتونه' : 'All Companies')
                          : `${selectedCompanies.length} ${language === 'fa' ? 'انتخاب شده' : language === 'ps' ? 'انتخاب شوی' : 'selected'}`}
                      </button>

                      {selectedCompanies.length > 0 && (
                        <button
                          onClick={handleClearAllCompanies}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-all duration-200 flex items-center gap-1 shadow-sm"
                        >
                          <FaTimes className="text-xs" />
                          {language === 'fa' ? 'پاک کردن' : language === 'ps' ? 'پاک کول' : 'Clear'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
                <p className="text-gray-600 text-lg">
                  {language === 'fa' ? 'در حال جستجوی سفرهای موجود...' : language === 'ps' ? 'شته سفرونه پلټل کیږي...' : 'Searching for available trips...'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {language === 'fa' ? 'لطفاً کمی صبر کنید' : language === 'ps' ? 'لطفاً یو څه صبر وکړئ' : 'Please wait a moment'}
                </p>
              </div>
            ) : error ? (
              <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMapMarkerAlt className="text-red-500 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === 'fa' ? 'خطا در جستجو' : language === 'ps' ? 'د پلټنی تېروتنه' : 'Search Error'}
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition shadow-md"
                >
                  {language === 'fa' ? 'بازگشت و جستجوی مجدد' : language === 'ps' ? 'بیرته راغلل او بیا پلټل' : 'Go Back & Search Again'}
                </button>
              </div>
            ) : generateTripCards().length === 0 ? (
              <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBus className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedBusType === 'all' && selectedCompanies.length === 0
                    ? (language === 'fa' ? 'هیچ سفری یافت نشد' : language === 'ps' ? 'هیڅ سفر ونه موندل شو' : 'No trips found')
                    : (language === 'fa' ? 'هیچ سفری با فیلترهای انتخاب شده یافت نشد' : language === 'ps' ? 'د انتخاب شویو فلټرونو سره هیڅ سفر ونه موندل شو' : 'No trips found with selected filters')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedBusType === 'all' && selectedCompanies.length === 0
                    ? (language === 'fa' 
                        ? `متاسفانه هیچ سفر مستقیمی از ${from} به ${to} در تاریخ ${formatDisplayDate(selectedDate)} پیدا نشد.`
                        : language === 'ps'
                        ? `له بده مرغه له ${from} څخه ${to} ته په ${formatDisplayDate(selectedDate)} کې هیڅ مستقیم سفر ونه موندل شو.`
                        : `Unfortunately, no direct trips were found from ${from} to ${to} on ${formatDisplayDate(selectedDate)}.`)
                    : (language === 'fa' 
                        ? `متاسفانه هیچ سفری با فیلترهای انتخاب شده پیدا نشد.`
                        : language === 'ps'
                        ? `له بده مرغه د انتخاب شویو فلټرونو سره هیڅ سفر ونه موندل شو.`
                        : `Unfortunately, no trips were found with the selected filters.`)}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {(selectedBusType !== 'all' || selectedCompanies.length > 0) && (
                    <button 
                      onClick={() => {
                        setSelectedBusType('all');
                        setSelectedCompanies([]);
                      }}
                      className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition shadow-md"
                    >
                      {language === 'fa' ? 'پاک کردن فیلترها' : language === 'ps' ? 'فلټرونه پاک کړئ' : 'Clear Filters'}
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition shadow-md"
                  >
                    {language === 'fa' ? 'تغییر پارامترهای جستجو' : language === 'ps' ? 'د پلټنی پارامترونو بدلول' : 'Change Search Parameters'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generateTripCards()}
              </div> 
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}