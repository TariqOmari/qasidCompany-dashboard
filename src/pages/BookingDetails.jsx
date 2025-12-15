import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sets from '../components/Sets';
import Done from '../components/Done';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWifi, FaToilet, FaPlug, FaTv, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCheck, FaEnvelope, FaMapMarkerAlt, FaTag, FaGift, FaPercentage, FaTimes, FaSearch, FaUser, FaGlobeAsia, FaPhone, FaIdCard, FaMapPin, FaCreditCard, FaCashRegister, FaLock, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from './locales/translations';
import jalaali from 'jalaali-js';

import DashboardLayout from '../components/DashboardLayout';

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
  }
};

// Afghan provinces in Persian/Dari and Pashto
const afghanProvinces = {
  fa: [
    "کابل", "کندهار", "هرات", "بلخ", "ننگرهار", "هلمند", "بدخشان", "فراه", 
    "غزنی", "کندز", "ارزگان", "پکتیا", "بغلان", "کاپیسا", "لغمان", "لوگر",
    "غور", "نیمروز", "دایکندی", "سمنگان", "بامیان", "پروان", "کنر", "بادغیس",
    "تخار", "پکتیکا", "جوزجان", "فاریاب", "سرپل", "وردک", "زابل", "خوست", 
    "میدان وردک", "نورستان", "پنجشیر"
  ],
  ps: [
    "کابل", "کندهار", "هرات", "بلخ", "ننگرهار", "هلمند", "بدخشان", "فراه",
    "غزني", "کندز", "ارزگان", "پکتیا", "بغلان", "کاپیسا", "لغمان", "لوگر",
    "غور", "نیمروز", "دایکندی", "سمنگان", "بامیان", "پروان", "کنړ", "بادغیس",
    "تخار", "پکتیکا", "جوزجان", "فاریاب", "سرپل", "وردک", "زابل", "خوست",
    "میدان وردک", "نورستان", "پنجشیر"
  ]
};

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { 
    from, 
    to, 
    company, 
    price, 
    company_phone, 
    terminal, 
    facilities = {}, 
    trip_id, 
    company_api_url, 
    bus_type, 
    departure_time, 
    arrivaterminal,
    departure_date,
    isDailyTrip = false,
    selectedDate
  } = location.state || {};

  // Form state
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [province, setProvince] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(language === 'fa' ? 'ترمینل' : 'ټرمینل'); // Hardcoded address
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod] = useState('doorpay'); // Always doorpay, removed setter
  const [done, setDone] = useState(false);
  const [finalSelectedDate, setFinalSelectedDate] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Time validation state
  const [canBook, setCanBook] = useState(true);
  const [bookingTimeError, setBookingTimeError] = useState('');

  // Coupon state
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponButtonClicked, setCouponButtonClicked] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [showSeatModal, setShowSeatModal] = useState(false);

  // Price calculation
  const basePrice = (price || 0) * (selectedSeats.length || 0);
  const discountAmount = validatedCoupon ? parseFloat(validatedCoupon.amount) : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Localized text content
  const localizedText = {
    backButton: language === 'fa' ? 'بازگشت به جستجو' : 'بیرته پلټنې ته',
    pageTitle: language === 'fa' ? 'تکمیل اطلاعات رزرو' : 'د ریزرو معلومات بشپړول',
    pageSubtitle: language === 'fa' ? 'لطفا اطلاعات خود را با دقت وارد کنید' : 'مهرباني وکړئ خپل معلومات په پام سره دننه کړئ',
    personalInfo: language === 'fa' ? 'معلومات شخصی' : 'شخصي معلومات',
    fullName: language === 'fa' ? 'نام کامل *' : 'بشپړ نوم *',
    fullNamePlaceholder: language === 'fa' ? 'نام کامل خود را وارد کنید' : 'خپل بشپړ نوم دننه کړئ',
    fatherName: language === 'fa' ? 'نام پدر *' : 'د پلار نوم *',
    fatherNamePlaceholder: language === 'fa' ? 'نام پدر خود را وارد کنید' : 'د خپل پلار نوم دننه کړئ',
    province: language === 'fa' ? 'ولایت *' : 'ولایت *',
    provincePlaceholder: language === 'fa' ? '-- ولایت خود را انتخاب کنید --' : '-- خپل ولایت وټاکئ --',
    phone: language === 'fa' ? 'شماره تماس *' : 'د اړیکې شمېره *',
    phonePlaceholder: language === 'fa' ? 'شماره تماس خود را وارد کنید' : 'خپل د اړیکې شمېره دننه کړئ',
    tripDetails: language === 'fa' ? 'جزئیات سفر' : 'د سفر تفصیلات',
    company: language === 'fa' ? 'شرکت:' : 'شرکت:',
    from: language === 'fa' ? 'مبدا:' : 'له:',
    to: language === 'fa' ? 'مقصد:' : 'ته:',
    seats: language === 'fa' ? 'چوکی‌ها:' : 'چوکۍ:',
    busType: language === 'fa' ? 'نوع بس:' : 'د بس ډول:',
    departureDate: language === 'fa' ? 'تاریخ حرکت:' : 'د تګ نېټه:',
    departureTime: language === 'fa' ? 'ساعت حرکت:' : 'د تګ وخت:',
    facilities: language === 'fa' ? 'امکانات:' : 'اسانتیاوې:',
    discount: language === 'fa' ? 'تخفیف ویژه' : 'ځانګړی تخفیف',
    hasCoupon: language === 'fa' ? 'من کد تخفیف دارم' : 'زه د تخفیف کوډ لرم',
    couponPlaceholder: language === 'fa' ? 'کد تخفیف خود را وارد کنید...' : 'خپل د تخفیف کوډ دننه کړئ...',
    applyCoupon: language === 'fa' ? 'اعمال' : 'تطبیق کول',
    removeCoupon: language === 'fa' ? 'حذف کد' : 'کوډ ړنګول',
    addressTitle: language === 'fa' ? 'آدرس تحویل' : 'د تحویلي پته',
    addressPlaceholder: language === 'fa' ? 'آدرس کامل خود را برای تحویل تکت وارد کنید...' : 'د ټکټ د ترلاسه کولو لپاره خپله بشپړه پته دننه کړئ...',
    addressNote: language === 'fa' ? 'آدرس برای تحویل تکت درب منزل الزامی است' : 'د دروازې د تادیې لپاره پته اړینه ده',
    priceSummary: language === 'fa' ? 'خلاصه قیمت' : 'د بیې لنډیز',
    originalPrice: language === 'fa' ? 'قیمت اصلی:' : 'اصلي بیه:',
    discountAmount: language === 'fa' ? 'تخفیف:' : 'تخفیف:',
    finalPrice: language === 'fa' ? 'قیمت نهایی:' : 'پایلی بیه:',
    savings: language === 'fa' ? '🎉 شما {amount} افغانی صرفه‌جویی کردید!' : '🎉 تاسې {amount} افغانۍ وژغورل!',
    confirmButton: language === 'fa' ? 'تایید و ادامه' : 'تایید او دوام',
    processing: language === 'fa' ? 'در حال پردازش...' : 'په پروسس کې...',
    bookingClosed: language === 'fa' ? 'رزرو بسته است' : 'ریزرو تړل شوی دی',
    securityNote: language === 'fa' ? 'اطلاعات شما با امنیت کامل ذخیره می‌شود' : 'ستاسو معلومات په بشپړه امنیت سره خوندي کیږي',
    selectSeatTitle: language === 'fa' ? 'انتخاب چوکی' : 'د چوکۍ انتخاب',
    selectSeatMessage: language === 'fa' ? 'لطفاً یک چوکی انتخاب کنید' : 'مهرباني وکړئ یوه چوکۍ وټاکئ',
    selectSeatDescription: language === 'fa' ? 'برای ادامه رزرو، باید حداقل یک چوکی انتخاب کنید.' : 'د ریزرو د دوام لپاره، تاسو باید لږترلږه یوه چوکۍ وټاکئ.',
    cancel: language === 'fa' ? 'لغو' : 'لغوه کول',
    selectSeat: language === 'fa' ? 'انتخاب چوکی' : 'چوکۍ انتخاب کړئ'
  };

  // Format Jalali date for display
  const formatJalaliForDisplay = (jalaliDate) => {
    if (!jalaliDate) return '';
    
    const parts = jalaliDate.split('-');
    if (parts.length !== 3) return jalaliDate;
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    return `${day} ${afghanMonths[language][month] || ''} ${year}`;
  };

  // Helper function to convert to Jalali date
  const convertToJalali = (date) => {
    const jalali = jalaali.toJalaali(date);
    return `${jalali.jy}-${String(jalali.jm).padStart(2, '0')}-${String(jalali.jd).padStart(2, '0')}`;
  };

  // Check if booking is allowed based on time
  const checkIfCanBook = () => {
    if (!departure_time || !finalSelectedDate) {
      setCanBook(true);
      setBookingTimeError('');
      return;
    }

    const now = new Date();
    
    // Get current time in Afghanistan timezone
    const currentTime = now.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Kabul',
      hour12: false 
    });
    
    // Get today's date in Jalali format
    const todayJalali = convertToJalali(now);
    
    console.log('Time validation check:', {
      selectedDate: finalSelectedDate,
      today: todayJalali,
      departureTime: departure_time,
      currentTime: currentTime.substring(0, 5)
    });

    // If booking for today AND departure time has passed, block it
    if (finalSelectedDate === todayJalali) {
      if (departure_time <= currentTime.substring(0, 5)) {
        setCanBook(false);
        setBookingTimeError(
          language === 'fa' 
            ? `رزرو برای امروز بسته است. زمان حرکت (${departure_time}) قبلاً گذشته است. زمان فعلی ${currentTime.substring(0, 5)} است. لطفاً یک تاریخ آینده را انتخاب کنید.`
            : `نن لپاره ریزرو تړل شوی دی. د تګ وخت (${departure_time}) لا دمخه تیر شوی. اوسنی وخت ${currentTime.substring(0, 5)} دی. مهرباني وکړئ راتلونکې نېټه وټاکئ.`
        );
      } else {
        setCanBook(true);
        setBookingTimeError('');
      }
    } else {
      setCanBook(true);
      setBookingTimeError('');
    }
  };

  // Initialize date and check booking availability
  useEffect(() => {
    console.log('BookingDetails mounted with:', {
      isDailyTrip,
      selectedDate,
      departure_date
    });

    if (isDailyTrip && selectedDate) {
      console.log('Using selectedDate for all_days trip:', selectedDate);
      setFinalSelectedDate(selectedDate);
    } 
    else if (!isDailyTrip && departure_date) {
      console.log('Using departure_date for regular trip:', departure_date);
      
      const year = parseInt(departure_date.split('-')[0]);
      if (year > 1300) {
        setFinalSelectedDate(departure_date);
      } else {
        const dateObj = new Date(departure_date);
        const jalali = jalaali.toJalaali(dateObj);
        const jalaliDate = `${jalali.jy}-${String(jalali.jm).padStart(2, '0')}-${String(jalali.jd).padStart(2, '0')}`;
        setFinalSelectedDate(jalaliDate);
      }
    }
  }, [isDailyTrip, selectedDate, departure_date]);

  // Check booking availability when date or time changes
  useEffect(() => {
    checkIfCanBook();
  }, [finalSelectedDate, departure_time]);

  // Clear coupon validation when code changes
  useEffect(() => {
    if (couponCode.trim() && couponButtonClicked) {
      setCouponButtonClicked(false);
      setCouponError('');
      setCouponSuccess('');
      setValidatedCoupon(null);
    }
  }, [couponCode]);

  // Validate coupon function with button
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(language === 'fa' ? 'لطفا کد کوپون را وارد کنید' : 'مهرباني وکړئ د تخفیف کوډ دننه کړئ');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponButtonClicked(true);
    setCouponError('');
    setCouponSuccess('');
    setValidatedCoupon(null);

    try {
      const apiurl = (API_BASE_URL|| 'http://127.0.0.1:8001')
        .replace(/^http:\/\//i, 'http://')
        .replace(/\/$/, '');

      console.log('Validating coupon:', {
        url: `${apiurl}/api/coupons`,
        code: couponCode
      });

      const response = await axios.get(
        `${apiurl}/api/coupons`,
        {
          params: { code: couponCode.trim() },
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      console.log('Coupon validation response:', response.data);

      // FIXED: Better coupon matching logic
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        
        // Clean the input code for comparison
        const cleanInputCode = couponCode.trim().toUpperCase();
        
        // Find exact match (case insensitive)
        const exactMatch = response.data.data.find(coupon => {
          const cleanCouponCode = coupon.code.trim().toUpperCase();
          return cleanCouponCode === cleanInputCode;
        });

        console.log('Coupon search results:', {
          inputCode: cleanInputCode,
          availableCodes: response.data.data.map(c => c.code.trim().toUpperCase()),
          foundMatch: !!exactMatch
        });

        if (exactMatch) {
          // Check if coupon is expired
          const today = new Date();
          const expiryDate = new Date(exactMatch.expiry_date);
          
          if (today > expiryDate) {
            setCouponError(language === 'fa' ? 'کد کوپون منقضی شده است' : 'د تخفیف کوډ ختم شوی دی');
            setValidatedCoupon(null);
          } 
          // Check usage limit
          else if (exactMatch.usage_limit <= 0) {
            setCouponError(language === 'fa' ? 'کد کوپون به پایان رسیده است' : 'د تخفیف کوډ پای ته رسېدلی دی');
            setValidatedCoupon(null);
          }
          else {
            setValidatedCoupon(exactMatch);
            setCouponSuccess(
              language === 'fa' 
                ? `کوپون اعمال شد! شما ${exactMatch.amount} افغانی تخفیف خواهید گرفت`
                : `تخفیف تطبیق شو! تاسې به ${exactMatch.amount} افغانۍ تخفیف ترلاسه کړئ`
            );
            setCouponError('');
          }
        } else {
          setCouponError(language === 'fa' ? 'کد کوپون نامعتبر است' : 'د تخفیف کوډ ناباوره دی');
          setValidatedCoupon(null);
        }
      } else {
        setCouponError(language === 'fa' ? 'کد کوپون نامعتبر است' : 'د تخفیف کوډ ناباوره دی');
        setValidatedCoupon(null);
      }

    } catch (err) {
      console.error('Error validating coupon:', err);
      
      // More detailed error handling
      if (err.response?.data?.message) {
        setCouponError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setCouponError(err.response.data.errors[0] || (language === 'fa' ? 'کد کوپون نامعتبر است' : 'د تخفیف کوډ ناباوره دی'));
      } else {
        setCouponError(language === 'fa' ? 'خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.' : 'د سرور سره د اړیکې ستونزه. بیا هڅه وکړئ.');
      }
      setValidatedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setHasCoupon(false);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
    setValidatedCoupon(null);
    setCouponButtonClicked(false);
  };

  const formatTimeWithPersianAmPm = (timeString, timeAmpm) => {
    if (!timeString) return '';
    
    if (timeAmpm) {
      const amPm = timeAmpm.includes('AM') 
        ? (language === 'fa' ? 'قبل از ظهر' : 'غ.م') 
        : (language === 'fa' ? 'بعد از ظهر' : 'غ.و');
      return `${timeString.substring(0,5)} ${amPm}`;
    }
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const amPm = hours >= 12 
      ? (language === 'fa' ? 'بعد از ظهر' : 'و:غ') 
      : (language === 'fa' ? 'قبل از ظهر' : 'م:غ');
    
    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;
    
    const formattedHours = displayHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes} ${amPm}`;
  };

  // SIMPLE phone input handler - NO VALIDATION
  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    
    // Clear any existing phone errors
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!name.trim()) newErrors.name = language === 'fa' ? 'نام الزامی است' : 'نوم اړین دی';
    
    // Father name validation
    if (!fatherName.trim()) newErrors.fatherName = language === 'fa' ? 'نام پدر الزامی است' : 'د پلار نوم اړین دی';
    
    // Province validation
    if (!province.trim()) newErrors.province = language === 'fa' ? 'انتخاب ولایت الزامی است' : 'د ولایت انتخاب اړین دی';
    
    // Phone validation - ONLY CHECK IF EMPTY, NO FORMAT VALIDATION
    if (!phone.trim()) {
      newErrors.phone = language === 'fa' ? 'شماره تماس الزامی است' : 'د اړیکې شمېره اړینه ده';
    }
    
    // Seat validation - show modal instead of error message
    if (!selectedSeats || selectedSeats.length === 0) {
      newErrors.seat = 'seat_required';
    }
    
    // No payment method validation needed since it's always doorpay
    
    // Address validation for doorpay - always required
    if (!address.trim()) {
      newErrors.address = language === 'fa' ? 'آدرس برای پرداخت درب منزل الزامی است' : 'د دروازې د تادیې لپاره پته اړینه ده';
    }
    
    // Coupon validation if checked but no code entered
    if (hasCoupon && !couponCode.trim()) {
      newErrors.coupon = language === 'fa' ? 'لطفا کد کوپون را وارد کنید' : 'مهرباني وکړئ د تخفیف کوډ دننه کړئ';
    }
    
    if (isDailyTrip && !finalSelectedDate) {
      newErrors.date = language === 'fa' ? 'تاریخ حرکت الزامی است' : 'د تګ نېټه اړینه ده';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    // Check if booking is allowed before proceeding
    if (!canBook) {
      setErrors(prev => ({
        ...prev,
        form: bookingTimeError || (language === 'fa' ? 'این سفر قابل رزرو نیست زیرا زمان حرکت گذشته است.' : 'دا سفر د ریزرو وړ ندی ځکه چې د تګ وخت تیر شوی دی.')
      }));
      return;
    }

    if (!validateForm()) {
      // If seat is required, show modal instead of returning
      if (errors.seat === 'seat_required') {
        setShowSeatModal(true);
        return;
      }
      return;
    }

    setIsSubmitting(true);
    setCouponError('');

    try {
      const apiurl = (API_BASE_URL || 'https://127.0.0.1:8001')
        .replace(/^http:\/\//i, 'http://')
        .replace(/\/$/, '');

      const requestData = {
        name,
        father_name: fatherName,
        province: province,
        phone,
        payment_method: paymentMethod, // Always 'doorpay'
        seat_numbers: selectedSeats,
        bus_type: bus_type,
        address: address, // Always include hardcoded address
      };

      // Add coupon code to request data if user has entered one and it's validated
      if (hasCoupon && couponCode.trim() && validatedCoupon) {
        requestData.coupon_code = couponCode;
      }

      if (finalSelectedDate) {
        requestData.departure_date = finalSelectedDate;
      }

      console.log('Sending booking request with new fields:', {
        url: `${apiurl}/api/trips/${trip_id}/book`,
        data: requestData,
        hasFatherName: !!fatherName,
        hasProvince: !!province,
        paymentMethod: paymentMethod,
        address: address
      });

      const response = await axios.post(
        `${apiurl}/api/trips/${trip_id}/book`,
        requestData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      console.log("Booking successful:", response.data);
      
      // Only doorpay (cash) payments
      const actualTicketNumber = response.data.ticket.ticket_number;

      navigate('/done', {
        state: {
          bookingData: {
            name,
            fatherName,
            province,
            phone,
            email,
            address,
            from,
            to,
            company: location.state?.company_name || company,
            price,
            terminal,
            arrivaterminal,
            seat: selectedSeats,
            company_phone,
            ticket_number: actualTicketNumber,
            ticketNumber: actualTicketNumber,
            departure_date: finalSelectedDate,
            departureDate: finalSelectedDate,
            departureTime: departure_time,
            facilities: location.state?.facilities || {},
            trip_id: trip_id,
            company_api_url: company_api_url,
            payment_method: paymentMethod,
            coupon_code: hasCoupon && validatedCoupon ? couponCode : null,
            discount_amount: validatedCoupon ? discountAmount : 0,
            final_price: finalPrice,
          }
        }
      });

    } catch (err) {
      console.error("Error booking:", err);
      
      // Handle coupon-specific errors from backend
      if (err.response?.data?.errors?.coupon_code) {
        setCouponError(err.response.data.errors.coupon_code[0] || (language === 'fa' ? 'کد کوپون نامعتبر است' : 'د تخفیف کوډ ناباوره دی'));
      } 
      else if (err.response?.data?.errors?.address) {
        setErrors(prev => ({
          ...prev,
          address: err.response.data.errors.address[0] || (language === 'fa' ? 'آدرس الزامی است' : 'پته اړینه ده')
        }));
      } else if (err.response?.data?.message) {
        setErrors(prev => ({
          ...prev,
          form: err.response.data.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          form: language === 'fa' ? 'خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.' : 'د سرور سره د اړیکې ستونزه. بیا هڅه وکړئ.'
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) return <Done />;

  return (
    <>
      <Navbar />

      <DashboardLayout>
      <div dir={language === 'en' ? 'ltr' : 'rtl'} className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800 font-vazir py-10 mt-20 pt-[100px] md:pt-10 mt-10">
        <div className="w-full flex justify-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 font-medium hover:text-[#f36f21] transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-slate-200"
          >
            {language === 'en' ? (
              <>
                <FaChevronLeft /> Back to Search
              </>
            ) : (
              <>
                <FaChevronRight className="text-sm" /> {localizedText.backButton}
              </>
            )}
          </button>
        </div>
  <div className="lg:hidden bg-white rounded-2xl p-6 shadow-lg border border-slate-200 seat-section">
                  <Sets 
                    selectedSeats={selectedSeats} 
                    setSelectedSeats={setSelectedSeats} 
                    tripId={trip_id} 
                    apiurl={company_api_url} 
                    busType={bus_type}
                    departureDate={finalSelectedDate}
                    isDailyTrip={isDailyTrip}
                  />
                </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#073B78] to-[#f36f21] p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{localizedText.pageTitle}</h1>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FaLock className="text-xl" />
                  </div>
                </div>
                <p className="text-white/90 text-sm">{localizedText.pageSubtitle}</p>
              </div>
            </div>

            {/* Booking Time Warning */}
            {!canBook && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 mx-6 mt-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FaTimes className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">
                      {language === 'fa' ? 'رزرو در دسترس نیست' : 'ریزرو نشته'}
                    </h4>
                    <p className="text-white/90 text-sm mt-1">
                      {bookingTimeError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 p-6">
              {/* Mobile: Seats First, Desktop: Forms First */}
              <div className="flex-1 space-y-6 order-2 lg:order-1">
                {/* Seats Selection - MOBILE FIRST */}
              
                {/* Personal Information Card */}
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                      <FaIdCard className="text-white text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{localizedText.personalInfo}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FaUser className="text-blue-500 text-sm" />
                        {localizedText.fullName}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={localizedText.fullNamePlaceholder}
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.name 
                              ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                              : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                          }`}
                        />
                        <FaUser className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaTimes className="text-xs" /> {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Father Name Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FaUser className="text-blue-500 text-sm" />
                        {localizedText.fatherName}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          placeholder={localizedText.fatherNamePlaceholder}
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.fatherName 
                              ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                              : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                          }`}
                        />
                        <FaUser className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      </div>
                      {errors.fatherName && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaTimes className="text-xs" /> {errors.fatherName}
                        </p>
                      )}
                    </div>

                    {/* Province Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FaMapPin className="text-green-500 text-sm" />
                        {localizedText.province}
                      </label>
                      <div className="relative">
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                            errors.province 
                              ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                              : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                          }`}
                        >
                          <option value="">{localizedText.provincePlaceholder}</option>
                          {afghanProvinces[language].map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                        <FaGlobeAsia className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.province && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaTimes className="text-xs" /> {errors.province}
                        </p>
                      )}
                    </div>

                    {/* Phone Field - NO VALIDATION */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FaPhone className="text-purple-500 text-sm" />
                        {localizedText.phone}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder={localizedText.phonePlaceholder}
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.phone 
                              ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                              : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                          }`}
                        />
                        <FaPhone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaTimes className="text-xs" /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trip Summary Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-200">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                      <FaCalendarAlt className="text-white text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{localizedText.tripDetails}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-slate-600 font-medium">{localizedText.company}</span>
                        <span className="text-slate-800 font-semibold">{company || '---'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-slate-600 font-medium">{localizedText.from}</span>
                        <span className="text-slate-800 font-semibold">{from || '---'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-slate-600 font-medium">{localizedText.to}</span>
                        <span className="text-slate-800 font-semibold">{to || '---'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-slate-600 font-medium">{localizedText.seats}</span>
                        <span className="text-slate-800 font-semibold bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs">
                          {selectedSeats.join(', ') || '---'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-slate-600 font-medium">{localizedText.busType}</span>
                        <span className="text-slate-800 font-semibold">{bus_type || '---'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-slate-600 font-medium">{localizedText.departureDate}</span>
                        <span className="text-slate-800 font-semibold">
                          {finalSelectedDate ? formatJalaliForDisplay(finalSelectedDate) : '---'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-slate-600 font-medium">{localizedText.departureTime}</span>
                        <span className="text-slate-800 font-semibold">
                          {formatTimeWithPersianAmPm(departure_time, location.state?.departure_time_ampm)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-600 font-medium">{localizedText.facilities}</span>
                        <div className="flex gap-2 text-blue-500">
                          {facilities?.wifi && <FaWifi title={language === 'fa' ? 'وای‌فای' : 'وای فای'} />}
                          {facilities?.toilet && <FaToilet title={language === 'fa' ? 'توالت' : 'تشناب'} />}
                          {facilities?.charging && <FaPlug title={language === 'fa' ? 'شارژر' : 'چارجونکی'} />}
                          {facilities?.tv && <FaTv title={language === 'fa' ? 'تلویزیون' : 'ٹیلیویژن'} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                      <FaGift className="text-white text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{localizedText.discount}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-purple-100">
                      <input
                        type="checkbox"
                        id="hasCoupon"
                        checked={hasCoupon}
                        onChange={(e) => {
                          setHasCoupon(e.target.checked);
                          if (!e.target.checked) {
                            handleRemoveCoupon();
                          }
                        }}
                        className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <label htmlFor="hasCoupon" className="flex items-center gap-2 text-purple-700 font-semibold cursor-pointer">
                        <FaTag className="text-purple-500" />
                        {localizedText.hasCoupon}
                      </label>
                    </div>

                    {hasCoupon && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder={localizedText.couponPlaceholder}
                              className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                couponError 
                                  ? 'border-red-400 focus:ring-red-200' 
                                  : couponSuccess
                                  ? 'border-green-400 focus:ring-green-200'
                                  : 'border-purple-300 focus:ring-purple-200'
                              }`}
                              disabled={isValidatingCoupon}
                            />
                            <FaTag className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
                          </div>
                          
                          <button
                            onClick={validateCoupon}
                            disabled={isValidatingCoupon || !couponCode.trim()}
                            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                              isValidatingCoupon || !couponCode.trim()
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            }`}
                          >
                            {isValidatingCoupon ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ...
                              </>
                            ) : (
                              <>
                                <FaSearch />
                                {localizedText.applyCoupon}
                              </>
                            )}
                          </button>
                        </div>

                        {validatedCoupon && (
                          <div className="flex justify-end">
                            <button
                              onClick={handleRemoveCoupon}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all flex items-center gap-2 text-sm"
                            >
                              <FaTimes />
                              {localizedText.removeCoupon}
                            </button>
                          </div>
                        )}

                        {/* Messages */}
                        {couponError && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fadeIn">
                            <p className="text-red-700 text-sm flex items-center gap-2">
                              <FaTimes className="text-red-500" />
                              {couponError}
                            </p>
                          </div>
                        )}

                        {couponSuccess && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
                            <p className="text-green-700 text-sm flex items-center gap-2">
                              <FaCheck className="text-green-500" />
                              {couponSuccess}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Address for DoorPay - Always Required */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#f36f21] p-2 rounded-lg">
                      <FaMapMarkerAlt className="text-white text-lg" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">{localizedText.addressTitle}</h4>
                  </div>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={localizedText.addressPlaceholder}
                    rows="3"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 resize-none transition-all ${
                      errors.address ? 'border-red-400 focus:ring-red-200' : 'border-orange-300 focus:ring-orange-200'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <FaTimes className="text-xs" /> {errors.address}
                    </p>
                  )}
                  <p className="text-orange-600 text-xs mt-2">
                    {localizedText.addressNote}
                  </p>
                </div>
              </div>

              {/* Right Column - Summary and Seats */}
              <div className="lg:w-96 space-y-6 order-1 lg:order-2">
                {/* Price Summary Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                      <FaPercentage className="text-white text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{localizedText.priceSummary}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="text-slate-600">{localizedText.originalPrice}</span>
                      <span className="text-slate-800 font-semibold">
                        {selectedSeats.length} × {price || 0} {language === 'fa' ? 'افغانی' : 'افغانۍ'}
                      </span>
                    </div>

                    {validatedCoupon && (
                      <div className="flex justify-between items-center py-2 border-b border-green-200">
                        <span className="text-green-600">{localizedText.discountAmount}</span>
                        <span className="text-green-600 font-semibold">- {discountAmount} {language === 'fa' ? 'افغانی' : 'افغانۍ'}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t-2 border-green-300">
                      <span className="text-lg font-bold text-slate-800">{localizedText.finalPrice}</span>
                      <span className="text-2xl font-bold text-[#f36f21]">{finalPrice} {language === 'fa' ? 'افغانی' : 'افغانۍ'}</span>
                    </div>

                    {validatedCoupon && (
                      <div className="bg-green-100 rounded-lg p-3 mt-4 border border-green-300">
                        <p className="text-green-700 text-sm text-center font-semibold">
                          {localizedText.savings.replace('{amount}', discountAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seats Selection - DESKTOP */}
                <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-lg border border-slate-200 seat-section">
                  <Sets 
                    selectedSeats={selectedSeats} 
                    setSelectedSeats={setSelectedSeats} 
                    tripId={trip_id} 
                    apiurl={company_api_url} 
                    busType={bus_type}
                    departureDate={finalSelectedDate}
                    isDailyTrip={isDailyTrip}
                  />
                </div>

                {/* Confirm Button */}
                <div className="sticky bottom-6">
                  {errors.form && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <p className="text-red-700 text-center text-sm">{errors.form}</p>
                    </div>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting || !canBook}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl ${
                      isSubmitting || !canBook
                        ? 'bg-gray-400 cursor-not-allowed opacity-70'
                        : 'bg-gradient-to-r from-[#073B78] to-[#f36f21] hover:from-[#052956] hover:to-[#e65c1a] transform hover:-translate-y-1 hover:shadow-3xl'
                    }`}
                  >
                    {!canBook ? (
                      <>
                        <FaTimes />
                        {localizedText.bookingClosed}
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {localizedText.processing}
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        {localizedText.confirmButton}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-3 text-slate-500 text-xs">
                    <FaLock className="text-green-500" />
                    {localizedText.securityNote}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {showSeatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="bg-gradient-to-r from-[#f36f21] to-[#e65c1a] p-6 rounded-t-2xl">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-white p-3 rounded-full">
                  <FaCheck className="text-[#f36f21] text-xl" />
                </div>
                <h3 className="text-white text-xl font-bold text-center">
                  {localizedText.selectSeatTitle}
                </h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-2">
                  {localizedText.selectSeatMessage}
                </h4>
                <p className="text-slate-600 text-sm">
                  {localizedText.selectSeatDescription}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSeatModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  {localizedText.cancel}
                </button>
                <button
                  onClick={() => {
                    setShowSeatModal(false);
                    document.querySelector('.seat-section')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#073B78] to-[#f36f21] text-white rounded-xl font-semibold hover:from-[#052956] hover:to-[#e65c1a] transition-all shadow-lg"
                >
                  {localizedText.selectSeat}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </DashboardLayout>
    </>
  );
};

export default BookingDetails;