import React, { useState, useEffect } from 'react'
import CustomTable from '../components/CustomTable'
import DashboardLayout from '../components/DashboardLayout'
import { useLanguage } from '../contexts/LanguageContext.jsX';

// Route configuration for fees
const ROUTE_FEES = {
  "50_AFN_ROUTES": {
    provinces: ["kandahar", "قندهار", "mazar", "مزار", "kunduz", "قندوز", "jozjan", "جوزجان", "faryab", "فاریاب", "sarepul", "سرپل"],
    fee: 50
  },
  "100_AFN_ROUTES": {
    provinces: ["herat", "هرات", "nimroz", "نیمروز", "farah", "فراه", "helmand", "هلمند"],
    fee: 100
  }
};

// Persian/Afghan months
const PERSIAN_MONTHS = [
  { value: 1, name: { fa: "حمل", ps: "وری" } },
  { value: 2, name: { fa: "ثور", ps: "غويی" } },
  { value: 3, name: { fa: "جوزا", ps: "غبرګولی" } },
  { value: 4, name: { fa: "سرطان", ps: "چنګاښ" } },
  { value: 5, name: { fa: "اسد", ps: "زمری" } },
  { value: 6, name: { fa: "سنبله", ps: "وږی" } },
  { value: 7, name: { fa: "میزان", ps: "تله" } },
  { value: 8, name: { fa: "عقرب", ps: "لړم" } },
  { value: 9, name: { fa: "قوس", ps: "ليندۍ" } },
  { value: 10, name: { fa: "جدی", ps: "مرغومی" } },
  { value: 11, name: { fa: "دلو", ps: "سلواغه" } },
  { value: 12, name: { fa: "حوت", ps: "كب" } }
];

// Translation objects
const translations = {
  fa: {
    tableColumns: [
      {
        header: "شماره تکت",
        accessor: "ticket_number"
      },
      {
        header: "مسافر",
        accessor: "name",
        render: (row) => `${row.name}`
      },
      {
        header: "نام پدر",
        accessor: "father_name",
        render: (row) => `${row.father_name}`
      },
      {
        header: "تلفون",
        accessor: "phone"
      },
      {
        header: "مسیر",
        accessor: "route",
        render: (row) => `${row._trip?.from || 'نامشخص'} الی ${row._trip?.to || 'نامشخص'}`
      },
      {
        header: "تعدادچوکی",
        accessor: "seats",
        render: (row) => row.seat_numbers?.length || 1
      },
      {
        header: "قیمت",
        accessor: "price",
        render: (row) => {
          const baseAmount = parseFloat(row.final_price) || 0;
          
          // Apply HessabPay discount for display
          const paymentMethod = (row.payment_method || "").toLowerCase().trim();
          const isHessabPay = paymentMethod.includes('hessabpay') || paymentMethod.includes('حساب پی');
          
          if (isHessabPay) {
            const finalAmount = Math.max(0, baseAmount - 20);
            return (
              <div className="text-left">
                <div className="text-gray-600">{finalAmount.toLocaleString()} AFN</div>
                <div className="text-xs text-red-500 line-through">{baseAmount.toLocaleString()} AFN</div>
                <div className="text-xs text-green-600">تخفیف HessabPay: 20 AFN</div>
              </div>
            );
          }
          
          return `${baseAmount.toLocaleString()} AFN`;
        }
      },
      {
        header: "وضعیت پرداخت",
        accessor: "payment_status",
        render: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.payment_status === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {row.payment_status === 'paid' ? 'پرداخت شده' : 'پرداخت نشده'}
          </span>
        )
      },
      {
        header: "روش پرداخت",
        accessor: "payment_method",
        render: (row) => {
          const paymentMethod = (row.payment_method || "").toLowerCase().trim();
          const isHessabPay = paymentMethod.includes('hessabpay') || paymentMethod.includes('حساب پی');
          const isDoorPay = paymentMethod.includes('doorpay') || paymentMethod.includes('حضوری');
          
          if (isHessabPay) {
            return (
              <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                💳 حساب پی
              </span>
            );
          }
          if (isDoorPay) {
            return (
              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                حضوری
              </span>
            );
          }
          return row.payment_method || 'نامشخص';
        }
      },
      {
        header: "منبع",
        accessor: "from_website",
        render: (row) => {
          const website = (row.from_website || "").toLowerCase().trim();
          const normalized = website.replace(/^https?:\/\//, "");

          if (normalized === "qasid.org") {
            return <span className="text-blue-600 font-semibold">از قاصد</span>;
          }

          return row.from_website || "داخلی";
        }
      }
    ],
    filters: {
      year: "سال",
      month: "ماه",
      day: "روز",
      all: "همه",
      selectYear: "انتخاب سال",
      selectMonth: "انتخاب ماه",
      selectDay: "انتخاب روز"
    },
    cards: {
      grossIncome: "درآمد ناخالص",
      qasedCommission: "کمیسیون قاصد",
      hessabPayDiscount: "تخفیف HessabPay",
      tax: "مالیات (۲٪)",
      netIncome: "عواید خالص",
      beforeDeductions: "قبل از هرگونه کسر",
      afterAllDeductions: "بعد از کسر همه هزینه‌ها"
    },
    banners: {
      hessabPayInfo: "💳 اطلاعات پرداخت‌های HessabPay",
      hessabPayTickets: "تعداد تکتهای HessabPay:",
      totalDiscount: "مجموع تخفیف اعمال شده:",
      averageDiscount: "میانگین تخفیف هر تکت:",
      hessabPayNote: "* برای پرداخت های HessabPay مبلغ 20 افغانی از هر تکت کسر شده است"
    },
    summary: {
      title: "خلاصه محاسبات",
      grossIncome: "درآمد ناخالص:",
      hessabPayDeduction: "کسر تخفیف HessabPay:",
      qasedCommissionDeduction: "کسر کمیسیون قاصد:",
      incomeBeforeTax: "درآمد قبل از مالیات:",
      taxDeduction: "کسر مالیات (۲٪):",
      finalNetIncome: "عواید خالص نهایی:",
      totalTickets: "تعداد کل تکت ها:",
      hessabPayTickets: "تکت های HessabPay:",
      qasedTickets: "تکت های از قاصد:",
      hessabPayPercentage: "درصد HessabPay:",
      qasedPercentage: "درصد قاصد:"
    },
    tableTitle: "لیست تکت ها و عواید",
    loading: "در حال بارگذاری..."
  },
  ps: {
    tableColumns: [
      {
        header: "د ټکټ نمبر",
        accessor: "ticket_number"
      },
      {
        header: "مسافر",
        accessor: "name",
        render: (row) => `${row.name} `
      },
      {
        header: "د پلار نوم",
        accessor: "father_name",
        render: (row) => `${row.father_name} `
      },
      {
        header: "تلیفون",
        accessor: "phone"
      },
      {
        header: "لار",
        accessor: "route",
        render: (row) => `${row._trip?.from || 'ناجوت'} → ${row._trip?.to || 'ناجوت'}`
      },
      {
        header: "د چوکیو شمیر",
        accessor: "seats",
        render: (row) => row.seat_numbers?.length || 1
      },
      {
        header: "قیمت",
        accessor: "price", 
        render: (row) => {
          const baseAmount = parseFloat(row.final_price) || 0;
          
          const paymentMethod = (row.payment_method || "").toLowerCase().trim();
          const isHessabPay = paymentMethod.includes('hessabpay') || paymentMethod.includes('حساب پی');
          
          if (isHessabPay) {
            const finalAmount = Math.max(0, baseAmount - 20);
            return (
              <div className="text-left">
                <div className="text-gray-600">{finalAmount.toLocaleString()} AFN</div>
                <div className="text-xs text-red-500 line-through">{baseAmount.toLocaleString()} AFN</div>
                <div className="text-xs text-green-600">د HessabPay تخفیف: 20 AFN</div>
              </div>
            );
          }
          
          return `${baseAmount.toLocaleString()} AFN`;
        }
      },
      {
        header: "د پرداخت حالت",
        accessor: "payment_status",
        render: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.payment_status === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {row.payment_status === 'paid' ? 'ورکړ شوی' : 'ورکړ نه شوی'}
          </span>
        )
      },
      {
        header: "د پرداخت طریقه",
        accessor: "payment_method",
        render: (row) => {
          const paymentMethod = (row.payment_method || "").toLowerCase().trim();
          const isHessabPay = paymentMethod.includes('hessabpay') || paymentMethod.includes('حساب پی');
          const isDoorPay = paymentMethod.includes('doorpay') || paymentMethod.includes('حضوری');
          
          if (isHessabPay) {
            return (
              <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                💳 حساب پی
              </span>
            );
          }
          if (isDoorPay) {
            return (
              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                حضوری
              </span>
            );
          }
          return row.payment_method || 'ناجوت';
        }
      },
      {
        header: "سرچینه",
        accessor: "from_website", 
        render: (row) => {
          const website = (row.from_website || "").toLowerCase().trim();
          if (website === "https://qaisd.org" || website === "http://qasid.org") {
            return <span className="text-blue-600 font-semibold">له قاصد څخه</span>;
          }
          return row.from_website || "کورنی";
        }
      }
    ],
    filters: {
      year: "کال",
      month: "میاشت",
      day: "ورځ",
      all: "ټول",
      selectYear: "کال انتخاب کړئ",
      selectMonth: "میاشت انتخاب کړئ",
      selectDay: "ورځ انتخاب کړئ"
    },
    cards: {
      grossIncome: "ناخالص عواید",
      qasedCommission: "د قاصد کمیسیون",
      hessabPayDiscount: "د HessabPay تخفیف",
      tax: "مالیه (۲٪)",
      netIncome: "صافي عواید",
      beforeDeductions: "د هر ډول تخفیف څخه مخکې",
      afterAllDeductions: "د ټولو لګښتونو څخه وروسته"
    },
    banners: {
      hessabPayInfo: "💳 د HessabPay پرداختونو معلومات",
      hessabPayTickets: "د HessabPay د ټکټونو شمیر:",
      totalDiscount: "د پلي شوي تخفیف مجموعه:",
      averageDiscount: "د هر ټکټ اوسط تخفیف:",
      hessabPayNote: "* د HessabPay پرداختونو لپاره د هر ټکټ څخه 20 افغانی تخفیف شوی"
    },
    summary: {
      title: "د محاسبو لنډیز",
      grossIncome: "ناخالص عواید:",
      hessabPayDeduction: "د HessabPay تخفیف کمول:",
      qasedCommissionDeduction: "د قاصد کمیسیون کمول:",
      incomeBeforeTax: "د مالیې څخه مخکې عواید:",
      taxDeduction: "د مالیې کمول (۲٪):",
      finalNetIncome: "د پایلي صافي عواید:",
      totalTickets: "د ټولو ټکټونو شمیر:",
      hessabPayTickets: "د HessabPay ټکټونه:",
      qasedTickets: "د قاصد څخه ټکټونه:",
      hessabPayPercentage: "د HessabPay سلنه:",
      qasedPercentage: "د قاصد سلنه:"
    },
    tableTitle: "د ټکټونو او عوایدو لیست",
    loading: "په بار کېږي..."
  }
};

function Incomes() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [qasedCommission, setQasedCommission] = useState({
    totalCommission: 0,
    ticketCount: 0,
    seatCount: 0
  });
  const [hessabPayStats, setHessabPayStats] = useState({
    totalDiscount: 0,
    ticketCount: 0,
    seatCount: 0
  });
  const [calculationBreakdown, setCalculationBreakdown] = useState({
    grossIncome: 0,
    incomeAfterHessabPay: 0,
    incomeAfterCommission: 0
  });

  // Filter states
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');

  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetchTripsWithTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trips, selectedYear, selectedMonth, selectedDay]);

  const fetchTripsWithTickets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/trips-with-tickets`);
      const data = await response.json();
      
      setTrips(data.trips || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    }
  };

  // Function to convert Gregorian date to Persian date
  const toPersianDate = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    // Simple conversion - in production, use a proper library like jalali-js
    const persianDate = {
      year: 1403 + Math.floor(Math.random() * 2), // Random between 1403-1404 for demo
      month: (date.getMonth() % 12) + 1,
      day: (date.getDate() % 28) + 1
    };
    
    return persianDate;
  };

  // Apply filters based on selected year, month, and day
  const applyFilters = () => {
    let filtered = trips;

    if (selectedYear !== 'all' || selectedMonth !== 'all' || selectedDay !== 'all') {
      filtered = trips.map(trip => {
        const filteredTickets = trip.tickets?.filter(ticket => {
          if (!isValidTicket(ticket) || ticket.payment_status !== 'paid') return false;

          const departureDate = ticket.departure_date || trip.departure_date;
          const persianDate = toPersianDate(departureDate);
          
          if (!persianDate) return false;

          if (selectedYear !== 'all' && persianDate.year !== parseInt(selectedYear)) return false;
          if (selectedMonth !== 'all' && persianDate.month !== parseInt(selectedMonth)) return false;
          if (selectedDay !== 'all' && persianDate.day !== parseInt(selectedDay)) return false;

          return true;
        });

        return {
          ...trip,
          tickets: filteredTickets
        };
      }).filter(trip => trip.tickets && trip.tickets.length > 0);
    }

    setFilteredTrips(filtered);
    calculateIncomes(filtered);
  };

  const calculateRouteFee = (from, to) => {
    if (!from || !to) return 0;
    
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    const isKabulToProvince = fromLower === 'کابل' || fromLower === 'kabul';
    const isProvinceToKabul = toLower === 'کابل' || toLower === 'kabul';
    
    if (isKabulToProvince || isProvinceToKabul) {
      const province = isKabulToProvince ? toLower : fromLower;
      
      if (ROUTE_FEES["50_AFN_ROUTES"].provinces.includes(province)) {
        return ROUTE_FEES["50_AFN_ROUTES"].fee;
      }
      
      if (ROUTE_FEES["100_AFN_ROUTES"].provinces.includes(province)) {
        return ROUTE_FEES["100_AFN_ROUTES"].fee;
      }
    }
    
    return 0;
  };

  const applyHessabPayDiscount = (ticket, baseAmount) => {
    const paymentMethod = (ticket.payment_method || "").toLowerCase().trim();
    const isHessabPay = paymentMethod.includes('hessabpay') || paymentMethod.includes('حساب پی');
    
    if (isHessabPay) {
      const discountAmount = 20;
      return {
        finalAmount: Math.max(0, baseAmount - discountAmount),
        discount: discountAmount,
        isHessabPay: true
      };
    }
    
    return {
      finalAmount: baseAmount,
      discount: 0,
      isHessabPay: false
    };
  };

  const isValidTicket = (ticket) => {
    return ticket.status !== 'cancelled';
  };

  const calculateIncomes = (tripsData) => {
    let grossIncome = 0;
    let incomeAfterHessabPay = 0;
    let incomeAfterCommission = 0;
    let total = 0;
    let qasedStats = {
      totalCommission: 0,
      ticketCount: 0,
      seatCount: 0
    };
    let hessabStats = {
      totalDiscount: 0,
      ticketCount: 0,
      seatCount: 0
    };

    tripsData.forEach(trip => {
      trip.tickets?.forEach(ticket => {
        if (ticket.payment_status === 'paid' && isValidTicket(ticket)) {
          const seatCount = ticket.seat_numbers?.length || 1;
          const baseAmount = parseFloat(ticket.final_price) || 0;
          
          grossIncome += baseAmount;
          
          const { finalAmount: amountAfterHessabPay, discount: hessabDiscount, isHessabPay } = applyHessabPayDiscount(ticket, baseAmount);
          
          if (isHessabPay) {
            hessabStats.totalDiscount += hessabDiscount;
            hessabStats.ticketCount += 1;
            hessabStats.seatCount += seatCount;
          }
          
          incomeAfterHessabPay += amountAfterHessabPay;
          
          let fee = 0;
          const website = (ticket.from_website || "").toLowerCase().trim();
          const normalized = website.replace(/^https?:\/\//, "");

          if (normalized === "qasid.org") {
            fee = calculateRouteFee(trip.from, trip.to) * seatCount;

            qasedStats.totalCommission += fee;
            qasedStats.ticketCount += 1;
            qasedStats.seatCount += seatCount;
          }
          
          const finalAmount = amountAfterHessabPay - fee;
          incomeAfterCommission += finalAmount;
          total += finalAmount;
        }
      });
    });

    const tax = incomeAfterCommission * 0.02;
    const net = incomeAfterCommission - tax;

    setTotalIncome(total);
    setTaxAmount(tax);
    setNetIncome(net);
    setQasedCommission(qasedStats);
    setHessabPayStats(hessabStats);
    setCalculationBreakdown({
      grossIncome,
      incomeAfterHessabPay,
      incomeAfterCommission
    });
  };

  // Generate years (1403-1405 for demo)
  const years = [1403, 1404, 1405];
  
  // Generate days 1-31
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const tableData = filteredTrips.flatMap(trip => 
    trip.tickets
      ?.filter(ticket => isValidTicket(ticket))
      .map(ticket => ({
        ...ticket,
        _trip: trip
      })) || []
  ).sort((a, b) => {
    return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
  });

  const getValidPaidTicketsCount = () => {
    return tableData.filter(ticket => ticket.payment_status === 'paid').length;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{t.loading}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">فیلتر بر اساس تاریخ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.filters.year}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t.filters.all} {t.filters.year}</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.filters.month}
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t.filters.all} {t.filters.month}</option>
                {PERSIAN_MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.name[language]}
                  </option>
                ))}
              </select>
            </div>

            {/* Day Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.filters.day}
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t.filters.all} {t.filters.day}</option>
                {days.map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active Filters Info */}
          {(selectedYear !== 'all' || selectedMonth !== 'all' || selectedDay !== 'all') && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>فیلترهای فعال:</strong>
                {selectedYear !== 'all' && ` سال ${selectedYear}`}
                {selectedMonth !== 'all' && `، ماه ${PERSIAN_MONTHS.find(m => m.value === parseInt(selectedMonth))?.name[language]}`}
                {selectedDay !== 'all' && `، روز ${selectedDay}`}
                {` (${getValidPaidTicketsCount()} تکت پیدا شده)`}
              </p>
            </div>
          )}
        </div>

        {/* Rest of the component remains the same */}
        {/* Income Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Gross Income Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">{t.cards.grossIncome}</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {calculationBreakdown.grossIncome.toLocaleString()} AFN
                </p>
                <p className="text-xs text-gray-400 mt-1">{t.cards.beforeDeductions}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Qased Commission Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">{t.cards.qasedCommission}</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {qasedCommission.totalCommission.toLocaleString()} AFN
                </p>
                <div className="text-xs text-gray-400 mt-1">
                  <div>{qasedCommission.ticketCount} تکت</div>
                  <div>{qasedCommission.seatCount} چوکی</div>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* HessabPay Discount Card */}
          {hessabPayStats.ticketCount > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-pink-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm mb-2">{t.cards.hessabPayDiscount}</h3>
                  <p className="text-2xl font-bold text-pink-600">
                    {hessabPayStats.totalDiscount.toLocaleString()} AFN
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    <div>{hessabPayStats.ticketCount} تکت</div>
                    <div>{hessabPayStats.seatCount} چوکی</div>
                  </div>
                </div>
                <div className="bg-pink-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Tax Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">{t.cards.tax}</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {taxAmount.toLocaleString()} AFN
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Net Income Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">{t.cards.netIncome}</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {netIncome.toLocaleString()} AFN
                </p>
                <p className="text-xs text-gray-400 mt-1">{t.cards.afterAllDeductions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* HessabPay Information Banner */}
        {hessabPayStats.ticketCount > 0 && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-pink-800 font-bold text-lg mb-2 flex items-center">
                  {t.banners.hessabPayInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-pink-700">
                    <span className="font-medium">{t.banners.hessabPayTickets} </span>
                    <span className="font-bold">{hessabPayStats.ticketCount} تکت</span>
                  </div>
                  <div className="text-pink-700">
                    <span className="font-medium">{t.banners.totalDiscount} </span>
                    <span className="font-bold">{hessabPayStats.totalDiscount.toLocaleString()} افغانی</span>
                  </div>
                  <div className="text-pink-700">
                    <span className="font-medium">{t.banners.averageDiscount} </span>
                    <span className="font-bold">20 افغانی</span>
                  </div>
                </div>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
            </div>
            <p className="text-pink-600 text-xs mt-2">
              {t.banners.hessabPayNote}
            </p>
          </div>
        )}

        {/* Tickets Table */}
        <CustomTable
          columns={t.tableColumns}
          data={tableData}
       
     
           title={language === 'fa' ? "عواید تکت ها " : "د ټکټونو عوایدو"}
                     language={language}
          
        />

        {/* Summary Section */}
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t.summary.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.summary.grossIncome}</span>
                <span className="font-medium">{calculationBreakdown.grossIncome.toLocaleString()} AFN</span>
              </div>
              {hessabPayStats.ticketCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.summary.hessabPayDeduction}</span>
                  <span className="font-medium text-red-600">- {hessabPayStats.totalDiscount.toLocaleString()} AFN</span>
                </div>
              )}
              {qasedCommission.ticketCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.summary.qasedCommissionDeduction}</span>
                  <span className="font-medium text-red-600">- {qasedCommission.totalCommission.toLocaleString()} AFN</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t.summary.incomeBeforeTax}</span>
                <span className="font-medium">{calculationBreakdown.incomeAfterCommission.toLocaleString()} AFN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.summary.taxDeduction}</span>
                <span className="font-medium text-red-600">- {taxAmount.toLocaleString()} AFN</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span className="text-gray-800">{t.summary.finalNetIncome}</span>
                <span className="text-green-600">{netIncome.toLocaleString()} AFN</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.summary.totalTickets}</span>
                <span className="font-medium">{getValidPaidTicketsCount()} تکت</span>
              </div>
              {hessabPayStats.ticketCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.summary.hessabPayTickets}</span>
                  <span className="font-medium text-purple-600">{hessabPayStats.ticketCount} تکت</span>
                </div>
              )}
              {qasedCommission.ticketCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.summary.qasedTickets}</span>
                  <span className="font-medium text-blue-600">{qasedCommission.ticketCount} تکت</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t.summary.hessabPayPercentage}</span>
                <span className="font-medium">
                  {hessabPayStats.ticketCount > 0 ? 
                    ((hessabPayStats.ticketCount / getValidPaidTicketsCount()) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.summary.qasedPercentage}</span>
                <span className="font-medium">
                  {qasedCommission.ticketCount > 0 ? 
                    ((qasedCommission.ticketCount / getValidPaidTicketsCount()) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Incomes