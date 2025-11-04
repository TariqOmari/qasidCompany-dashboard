import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomTable from "../components/CustomTable";
import '../components/Set.css'
import TicketPrint from "../components/TicketPrint";
import { 
  RiUserAddLine, 
  RiBusLine, 
  RiUserStarLine, 
  RiRoadsterLine,
  RiCalendarEventLine,
  RiFilterLine,
  RiCheckLine,
  RiCloseLine,
  RiMapPinLine,
  RiTimeLine,
  RiPrinterLine,
  RiUserLine,
  RiPhoneLine,
  RiAlertLine,
  RiSearchLine,
  RiMoneyDollarCircleLine,
  RiPlayCircleLine,
  RiStopCircleLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiHistoryLine,
  RiCheckDoubleLine,
  RiFileListLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine
} from 'react-icons/ri';
import { GiSteeringWheel } from "react-icons/gi";
import DashboardLayout from "../components/DashboardLayout";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "./locales/translations";

// Chalan API service - UPDATED with updateChalan
const chalanAPI = {
  createChalan: async (ticketIds) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chalans`, {
        ticket_ids: ticketIds
      });
      return response.data;
    } catch (error) {
      console.error("Error creating chalan:", error);
      throw error;
    }
  },

  getChalans: async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chalans`);
      return response.data;
    } catch (error) {
      console.error("Error fetching chalans:", error);
      throw error;
    }
  },

  updateChalan: async (chalanId, updateData) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await axios.put(`${API_BASE_URL}/api/chalans/${chalanId}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating chalan:", error);
      throw error;
    }
  },

  deleteChalan: async (chalanId) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/chalans/${chalanId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting chalan:", error);
      throw error;
    }
  }
};

// Separate SeatModal component
const SeatModal = ({ 
  isOpen, 
  onClose, 
  selectedTrip, 
  selectedBusType, 
  onBusTypeChange 
}) => {
  const [seatsData, setSeatsData] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch seats only when modal opens or bus type changes
  useEffect(() => {
    const fetchSeats = async () => {
      if (!isOpen || !selectedTrip || !selectedBusType) return;
      
      try {
        setSeatsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/trips/${selectedTrip.id}/seats`, {
          params: { bus_type: selectedBusType }
        });
        setSeatsData(response.data.seats || []);
      } catch (error) {
        console.error("Error fetching seats:", error);
      } finally {
        setSeatsLoading(false);
      }
    };

    fetchSeats();
  }, [isOpen, selectedTrip, selectedBusType]);

  const renderVipLayout = () => {
    if (seatsLoading) return <div className="text-center py-10">{language === 'fa' ? 'در حال بارگذاری چوکیها...' : 'د چوکیو د پورته کولو په حال کې...'}</div>;
    
    // VIP layout logic
    const leftSeats = seatsData.filter((s) =>
      [3, 6, 9, 12, 15, 16, 17, 20, 23, 26, 29, 32, 35].includes(s.seat_number)
    );

    const rightSeatNumbers = [2, 1, 5, 4, 8, 7, 11, 10, 14, 13, 19, 18, 22, 21, 25, 24, 28, 27, 31, 30, 34, 33];
    const rightSeats = [];
    const doorRowIndex = 5;

    for (let i = 0; i < rightSeatNumbers.length; i += 2) {
      if (i / 2 === doorRowIndex) {
        rightSeats.push(["door"]);
      }
      const seat1 = seatsData.find((s) => s.seat_number === rightSeatNumbers[i]);
      const seat2 = seatsData.find((s) => s.seat_number === rightSeatNumbers[i + 1]);
      if (seat1 && seat2) {
        rightSeats.push([seat1, seat2]);
      }
    }

    return (
      <div className="flex flex-col items-center p-4 bg-white" dir="ltr">
        <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-gray-700">
          <div className="flex mb-4 items-center">
            <GiSteeringWheel className="text-4xl text-gray-700 ml-2" />
            <h1 className="ml-[100px] text-lg font-semibold">{language === 'fa' ? 'دروازه' : 'دروازه'}</h1>
          </div>

          <div className="flex">
            {/* Left side */}
            <div className="flex flex-col">
              {leftSeats.map((seat) => (
                <div
                  key={seat.seat_number}
                  className={`w-12 h-12 flex items-center justify-center rounded-md border border-gray-300 m-1 ${
                    seat.status === "booked"
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  {seat.seat_number}
                </div>
              ))}
            </div>

            <div className="mx-8"></div>

            {/* Right side */}
            <div className="flex flex-col">
              {rightSeats.map((row, i) => (
                <div key={i} className="flex mb-1">
                  {row[0] === "door" ? (
                    <div className="w-[95px] h-[75px] flex items-center justify-center bg-gray-200 text-gray-700 rounded-md border border-gray-400">
                      {language === 'fa' ? 'دروازه' : 'دروازه'}
                    </div>
                  ) : (
                    row.map((seat) => (
                      <div
                        key={seat.seat_number}
                        className={`w-12 h-12 flex items-center justify-center rounded-md border border-gray-300 m-1 ${
                          seat.status === "booked"
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gray-800 text-white"
                        }`}
                      >
                        {seat.seat_number}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const render580Layout = () => {
    if (seatsLoading) return <div className="text-center py-10">{language === 'fa' ? 'در حال بارگذاری چوکیها...' : 'د چوکیو د پورته کولو په حال کې...'}</div>;

    const seatLayout = [
      [1, 2, null, 3, 4],
      [5, 6, null, 7, 8],
      [9, 10, null, 11, 12],
      [13, 14, null, 15, 16],
      [17, 18, null, 19, 20],
      ["WC", null, 21, 22],
      ["DOOR", null, 23, 24],
      [null, null, null, 25, 26],
      [27, 28, null, 29, 30],
      [31, 32, null, 33, 34],
      [35, 36, null, 37, 38],
      [39, 40, null, 41, 42],
      [43, 44, null, 45, 46],
      [47, 48, 49, 50, 51],
    ];

    return (
      <div className="bus-container">
        {/* Legend */}
        <div className="legend">
          <span className="legend-box selected"></span> {language === 'fa' ? 'انتخاب شده' : 'ټاکل شوی'}
          <span className="legend-box empty"></span> {language === 'fa' ? 'خالی' : 'تش'}
          <span className="legend-box occupied"></span> {language === 'fa' ? 'پُر' : 'ډک'}
        </div>

        {/* Bus Layout */}
        <div className="bus-layout">
          <div className="driver-door-row">
            <div className="door1">{language === 'fa' ? 'دروازه' : 'دروازه'}</div>
            <div className="driver"><GiSteeringWheel /></div>
          </div>

          {seatLayout.map((row, rowIndex) => (
            <div
              className={`seat-row ${
                row.includes("DOOR") ? "door-row" : ""
              } ${rowIndex === 8 ? "after-door-row" : ""}`}
              key={rowIndex}
            >
              {row.map((seat, i) => {
                if (seat === null) return <div key={i} className="empty-space"></div>;
                if (seat === "WC") return <div key={i} className="wc tall">WC</div>;
                if (seat === "DOOR") return <div key={i} className="door tall">{language === 'fa' ? 'دروازه' : 'دروازه'}</div>;

                const seatData = seatsData.find((s) => s.seat_number === seat);
                const status = seatData ? seatData.status : "free";

                let seatClass = "seat";
                if (status === "booked") seatClass += " occupied";

                return (
                  <div
                    key={i}
                    className={seatClass}
                  >
                    {seat}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen || !selectedTrip) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {language === 'fa' ? 'نمایش چوکی ها -' : 'د چوکیو ښکاره کول -'} {selectedTrip.from} {language === 'fa' ? 'به' : 'ته'} {selectedTrip.to} - {selectedBusType}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => onBusTypeChange('VIP')}
              className={`px-4 py-2 rounded-lg ${
                selectedBusType === 'VIP' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {language === 'fa' ? 'نمایش چوکی های VIP' : 'د VIP چوکیو ښکاره کول'}
            </button>
            <button
              onClick={() => onBusTypeChange('580')}
              className={`px-4 py-2 rounded-lg ${
                selectedBusType === '580' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {language === 'fa' ? 'نمایش چوکی های 580' : 'د 580 چوکیو ښکاره کول'}
            </button>
          </div>
          
          {!selectedBusType ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'fa' ? 'لطفا نوع بس را انتخاب کنید' : 'مهرباني وکړئ د بس ډول وټاکئ'}
            </div>
          ) : selectedBusType === 'VIP' ? renderVipLayout() : 
             selectedBusType === '580' ? render580Layout() : 
             <div>{language === 'fa' ? 'نوع بس انتخاب نشده است' : 'د بس ډول نه دی ټاکل شوی'}</div>}
        </div>
      </div>
    </div>
  );
};

// Chalan History Modal Component
const ChalanHistoryModal = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterChange,
  arrivedChalans 
}) => {
  const [filteredHistory, setFilteredHistory] = useState([]);
  const { language } = useLanguage();
  const t = translations[language];

  // Afghan month names in Dari
  const afghanMonths = {
    1: 'حمل', 2: 'ثور', 3: 'جوزا', 4: 'سرطان',
    5: 'اسد', 6: 'سنبله', 7: 'میزان', 8: 'عقرب',
    9: 'قوس', 10: 'جدی', 11: 'دلو', 12: 'حوت'
  };

  // Generate Persian year options
  const generatePersianYears = () => {
    const currentYear = 1403;
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute options (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  const yearOptions = generatePersianYears();

  // Convert time to 12-hour Persian format
  const convertTo12HourPersian = (time) => {
    if (!time) return "";
    
    // If already in Persian format, return as is
    if (time.includes('ق.ظ') || time.includes('ب.ظ')) {
      return time;
    }
    
    // If already in AM/PM format, convert to Persian
    if (time.includes('AM') || time.includes('PM')) {
      return time.replace('AM', 'ق.ظ').replace('PM', 'ب.ظ');
    }
    
    // Convert 24-hour format to 12-hour Persian format
    try {
      let [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      let minute = minutes || '00';
      
      let period = 'ق.ظ'; // AM
      if (hour >= 12) {
        period = 'ب.ظ'; // PM
      }
      
      if (hour > 12) {
        hour = hour - 12;
      } else if (hour === 0) {
        hour = 12;
      }
      
      return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return time;
    }
  };

  // Group arrived tickets by trip and bus type for history display
  useEffect(() => {
    // Group tickets by trip_id and bus_type
    const groupedChalans = {};
    
    arrivedChalans.forEach(ticket => {
      const key = `${ticket.trip?.id}-${ticket.bus_type}`;
      if (!groupedChalans[key]) {
        groupedChalans[key] = {
          id: key,
          trip_id: ticket.trip?.id,
          from: ticket.trip?.from || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          to: ticket.trip?.to || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          bus_type: ticket.bus_type,
          tickets: [],
          total_price: 0,
          ticket_count: 0,
          arrived_at: ticket.updated_at || ticket.created_at,
          departure_time: convertTo12HourPersian(ticket.trip?.departure_time) || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          departure_date: ticket.departure_date || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          driver_name: ticket.driver ? `${ticket.driver.name} ${ticket.driver.father_name}` : (language === 'fa' ? 'نامشخص' : 'ناجوت')
        };
      }
      
      groupedChalans[key].tickets.push(ticket);
      groupedChalans[key].total_price += parseFloat(ticket.final_price) || 0;
      groupedChalans[key].ticket_count += 1;
    });

    let filtered = Object.values(groupedChalans);
    
    // Filter by year, month, day using TICKET departure_date
    if (filters.year || filters.month || filters.day) {
      filtered = filtered.filter(chalan => {
        if (!chalan.departure_date) return false;
        
        // Parse the Persian date properly (format: "1404-7-30")
        const dateString = chalan.departure_date.toString();
        const dateParts = dateString.split('-');
        
        // Handle different date formats
        let year, month, day;
        
        if (dateParts.length === 3) {
          // Format: "1404-7-30"
          [year, month, day] = dateParts;
        } else {
          return false;
        }
        
        // Remove any non-numeric characters and pad months/days
        year = year.replace(/\D/g, '');
        month = month.replace(/\D/g, '').padStart(2, '0');
        day = day.replace(/\D/g, '').padStart(2, '0');

        // Check year filter
        if (filters.year && year !== filters.year) return false;
        
        // Check month filter
        if (filters.month && month !== filters.month.padStart(2, '0')) return false;
        
        // Check day filter
        if (filters.day && day !== filters.day.padStart(2, '0')) return false;
        
        return true;
      });
    }
    
    // Filter by from location
    if (filters.from) {
      filtered = filtered.filter(chalan => chalan.from === filters.from);
    }
    
    // Filter by to location
    if (filters.to) {
      filtered = filtered.filter(chalan => chalan.to === filters.to);
    }
    
    // Filter by bus type
    if (filters.busType) {
      filtered = filtered.filter(chalan => chalan.bus_type === filters.busType);
    }
    
    // Filter by time (hour, minute, and period)
    if (filters.hour || filters.minute || filters.period) {
      filtered = filtered.filter(chalan => {
        if (!chalan.departure_time) return false;
        
        const tripTime = chalan.departure_time.toString();
        
        // Parse the time string - handle multiple formats
        const time = tripTime.toUpperCase();
        
        // Extract hour, minute, and period from Persian format
        let hour, minute, period;
        
        // Handle Persian format: "8:30 ق.ظ" or "8:30 ب.ظ"
        if (time.includes('ق.ظ') || time.includes('ب.ظ')) {
          const timeWithoutPeriod = time.replace(/\s?(ق\.ظ|ب\.ظ)/gi, '').trim();
          const [h, m] = timeWithoutPeriod.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = time.includes('ب.ظ') ? 'PM' : 'AM';
        }
        // Handle English format: "8:30 AM" or "8:30 PM"
        else if (time.includes('AM') || time.includes('PM')) {
          const timeWithoutPeriod = time.replace(/\s?(AM|PM)/gi, '').trim();
          const [h, m] = timeWithoutPeriod.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = time.includes('PM') ? 'PM' : 'AM';
        }
        // Handle 24-hour format: "14:30"
        else {
          const [h, m] = time.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = hour >= 12 ? 'PM' : 'AM';
          
          // Convert to 12-hour format for filtering
          if (hour > 12) hour = hour - 12;
          if (hour === 0) hour = 12;
        }
        
        // Check hour filter
        if (filters.hour) {
          const selectedHourInt = parseInt(filters.hour);
          if (hour !== selectedHourInt) return false;
        }
        
        // Check minute filter
        if (filters.minute) {
          const selectedMinuteInt = parseInt(filters.minute);
          if (minute !== selectedMinuteInt) return false;
        }
        
        // Check period filter
        if (filters.period) {
          if (period !== filters.period) return false;
        }
        
        return true;
      });
    }
    
    setFilteredHistory(filtered);
  }, [filters, arrivedChalans, language]);

  const resetFilters = () => {
    onFilterChange({
      year: '',
      month: '',
      day: '',
      from: '',
      to: '',
      busType: '',
      hour: '',
      minute: '',
      period: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">{language === 'fa' ? 'تاریخچه تکت‌های رسیده' : 'رسیدلی تکتونو تاریخ'}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-bold mb-3">{language === 'fa' ? 'فیلترها' : 'فیلترونه'}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Year Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'سال' : 'کال'}</label>
                <select
                  value={filters.year}
                  onChange={(e) => onFilterChange({...filters, year: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">{language === 'fa' ? 'همه سال‌ها' : 'ټول کالونه'}</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {/* Month Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'ماه' : 'میاشت'}</label>
                <select
                  value={filters.month}
                  onChange={(e) => onFilterChange({...filters, month: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">{language === 'fa' ? 'همه ماه‌ها' : 'ټولې میاشتې'}</option>
                  {Object.entries(afghanMonths).map(([num, name]) => (
                    <option key={num} value={num}>{name}</option>
                  ))}
                </select>
              </div>
              
              {/* Day Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'روز' : 'ورځ'}</label>
                <input
                  type="number"
                  value={filters.day}
                  onChange={(e) => onFilterChange({...filters, day: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                  placeholder={language === 'fa' ? 'روز' : 'ورځ'}
                  min="1"
                  max="31"
                />
              </div>
              
              {/* Bus Type Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'نوع بس' : 'د بس ډول'}</label>
                <select
                  value={filters.busType}
                  onChange={(e) => onFilterChange({...filters, busType: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">{language === 'fa' ? 'همه انواع' : 'ټول ډولونه'}</option>
                  <option value="VIP">VIP</option>
                  <option value="580">580</option>
                </select>
              </div>

              {/* From Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'مبدا' : 'سرچینه'}</label>
                <select
                  value={filters.from}
                  onChange={(e) => onFilterChange({...filters, from: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">{language === 'fa' ? 'همه مبداها' : 'ټولې سرچینې'}</option>
                  {[...new Set(arrivedChalans.map(t => t.trip?.from).filter(Boolean))].map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* To Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'مقصد' : 'منزل'}</label>
                <select
                  value={filters.to}
                  onChange={(e) => onFilterChange({...filters, to: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">{language === 'fa' ? 'همه مقصدها' : 'ټول منزلونه'}</option>
                  {[...new Set(arrivedChalans.map(t => t.trip?.to).filter(Boolean))].map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Filter - Hour */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'ساعت' : 'ساعت'}</label>
                <select
                  value={filters.hour}
                  onChange={(e) => onFilterChange({...filters, hour: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">{language === 'fa' ? 'ساعت' : 'ساعت'}</option>
                  {hourOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter - Minute */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'دقیقه' : 'دقیقې'}</label>
                <select
                  value={filters.minute}
                  onChange={(e) => onFilterChange({...filters, minute: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">{language === 'fa' ? 'دقیقه' : 'دقیقې'}</option>
                  {minuteOptions.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter - Period */}
              <div>
                <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'قسمت روز' : 'د ورځې برخه'}</label>
                <select
                  value={filters.period}
                  onChange={(e) => onFilterChange({...filters, period: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">{language === 'fa' ? 'همه' : 'ټول'}</option>
                  <option value="AM">{language === 'fa' ? 'صبح (ق.ظ)' : 'سهار (ق.ظ)'}</option>
                  <option value="PM">{language === 'fa' ? 'شب (ب.ظ)' : 'ماښام (ب.ظ)'}</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-600">
                {filteredHistory.length} {language === 'fa' ? 'چالان یافت شد' : 'چالان وموندل شو'}
              </span>
              <button
                onClick={resetFilters}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
              >
                {language === 'fa' ? 'حذف فیلترها' : 'فیلترونه لرې کړئ'}
              </button>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {filteredHistory.map((chalan, index) => (
              <div key={chalan.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[#0B2A5B]">
                    {chalan.from} → {chalan.to} - {chalan.bus_type}
                  </h4>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {language === 'fa' ? 'رسیده' : 'رسیدلی'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{language === 'fa' ? 'تاریخ حرکت:' : 'د تګ نېټه:'}</span>
                    <div>{chalan.departure_date}</div>
                  </div>
                  <div>
                    <span className="font-medium">{language === 'fa' ? 'زمان حرکت:' : 'د تګ وخت:'}</span>
                    <div>{chalan.departure_time}</div>
                  </div>
                  <div>
                    <span className="font-medium">{language === 'fa' ? 'تعداد مسافرین:' : 'د مسافرو شمېر:'}</span>
                    <div>{chalan.ticket_count} {language === 'fa' ? 'نفر' : 'کسان'}</div>
                  </div>
                  <div>
                    <span className="font-medium">{language === 'fa' ? 'مجموع مبلغ:' : 'ټوله پیسې:'}</span>
                    <div>{chalan.total_price?.toLocaleString()} {language === 'fa' ? 'افغانی' : 'افغانۍ'}</div>
                  </div>
                </div>
                
                {chalan.driver_name && chalan.driver_name !== (language === 'fa' ? 'نامشخص' : 'ناجوت') && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">{language === 'fa' ? 'راننده:' : 'چلوونکی:'}</span> {chalan.driver_name}
                  </div>
                )}
              </div>
            ))}
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {language === 'fa' ? 'هیچ چالانی یافت نشد' : 'هیڅ چالان ونه موندل شو'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// NEW: Update Chalan Modal Component
const UpdateChalanModal = ({ 
  isOpen, 
  onClose, 
  chalan, 
  onUpdate,
  allTickets 
}) => {
  const [selectedTicketsToAdd, setSelectedTicketsToAdd] = useState([]);
  const [selectedTicketsToRemove, setSelectedTicketsToRemove] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [availableTickets, setAvailableTickets] = useState([]);
  const { language } = useLanguage();
  const t = translations[language];

  // Filter available tickets (tickets not in current chalan)
  useEffect(() => {
    if (chalan && allTickets) {
      const currentTicketIds = chalan.ticket_ids || [];
      const filtered = allTickets.filter(ticket => 
        !currentTicketIds.includes(ticket.id)
      );
      setAvailableTickets(filtered);
    }
  }, [chalan, allTickets]);

  const showToast = (message, type = "success") => {
    // This should be implemented in parent component
    console.log(`${type}: ${message}`);
  };

  const handleAddTickets = async () => {
    if (selectedTicketsToAdd.length === 0) {
      showToast(language === 'fa' ? "لطفا تکت‌هایی برای اضافه کردن انتخاب کنید" : "مهرباني وکړئ د اضافه کولو لپاره تکتونه وټاکئ", "error");
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        add_ticket_ids: selectedTicketsToAdd
      };
      
      await chalanAPI.updateChalan(chalan.id, updateData);
      showToast(language === 'fa' ? "تکت‌ها با موفقیت اضافه شدند" : "تکتونه په بریالیتوب سره اضافه شول");
      setSelectedTicketsToAdd([]);
      onUpdate(); // Refresh chalans
    } catch (error) {
      console.error("Error adding tickets to chalan:", error);
      showToast(language === 'fa' ? "خطا در اضافه کردن تکت‌ها" : "په تکتونو د اضافه کولو کې تېروتنه", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveTickets = async () => {
    if (selectedTicketsToRemove.length === 0) {
      showToast(language === 'fa' ? "لطفا تکت‌هایی برای حذف کردن انتخاب کنید" : "مهرباني وکړئ د حذف کولو لپاره تکتونه وټاکئ", "error");
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        remove_ticket_ids: selectedTicketsToRemove
      };
      
      await chalanAPI.updateChalan(chalan.id, updateData);
      showToast(language === 'fa' ? "تکت‌ها با موفقیت حذف شدند" : "تکتونه په بریالیتوب سره حذف شول");
      setSelectedTicketsToRemove([]);
      onUpdate(); // Refresh chalans
    } catch (error) {
      console.error("Error removing tickets from chalan:", error);
      showToast(language === 'fa' ? "خطا در حذف کردن تکت‌ها" : "په تکتونو د حذف کولو کې تېروتنه", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleTicketAddSelection = (ticketId) => {
    setSelectedTicketsToAdd(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  const handleTicketRemoveSelection = (ticketId) => {
    setSelectedTicketsToRemove(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  const selectAllAddTickets = () => {
    if (selectedTicketsToAdd.length === availableTickets.length) {
      setSelectedTicketsToAdd([]);
    } else {
      setSelectedTicketsToAdd(availableTickets.map(ticket => ticket.id));
    }
  };

  const selectAllRemoveTickets = () => {
    if (selectedTicketsToRemove.length === chalan.tickets.length) {
      setSelectedTicketsToRemove([]);
    } else {
      setSelectedTicketsToRemove(chalan.tickets.map(ticket => ticket.id));
    }
  };

  if (!isOpen || !chalan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {language === 'fa' ? 'به‌روزرسانی چالان #' : 'چالان تازه کول #'}{chalan.chalan_number}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Current Tickets in Chalan */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-[#0B2A5B]">
                {language === 'fa' ? 'تکت‌های فعلی در چالان' : 'اوسني تکتونه په چالان کې'} ({chalan.tickets?.length || 0})
              </h4>
              {chalan.tickets && chalan.tickets.length > 0 && (
                <button
                  onClick={selectAllRemoveTickets}
                  className="text-blue-600 text-sm flex items-center gap-1"
                >
                  <RiCheckLine />
                  {selectedTicketsToRemove.length === chalan.tickets.length ? 
                    (language === 'fa' ? 'لغو انتخاب همه' : 'ټول انتخابونه لغوه کړئ') : 
                    (language === 'fa' ? 'انتخاب همه' : 'ټول وټاکئ')
                  }
                </button>
              )}
            </div>
            
            {chalan.tickets && chalan.tickets.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-right">{language === 'fa' ? 'انتخاب' : 'ټاکل'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'شناسه تکت' : 'د تکت پېژندښت'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'نام مسافر' : 'د مسافر نوم'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'شماره تماس' : 'د اړیکې شمېره'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'نوع بس' : 'د بس ډول'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'قیمت' : 'بیه'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'سیت' : 'چوکۍ'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chalan.tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-t border-gray-200">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTicketsToRemove.includes(ticket.id)}
                            onChange={() => handleTicketRemoveSelection(ticket.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2">{ticket.id}</td>
                        <td className="p-2">{ticket.name} {ticket.last_name}</td>
                        <td className="p-2">{ticket.phone}</td>
                        <td className="p-2">{ticket.bus_type}</td>
                        <td className="p-2">{parseFloat(ticket.final_price || 0).toLocaleString()} {language === 'fa' ? 'افغانی' : 'افغانۍ'}</td>
                        <td className="p-2">
                          {Array.isArray(ticket.seat_numbers) 
                            ? ticket.seat_numbers.join(', ') 
                            : ticket.seat_number || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {language === 'fa' ? 'هیچ تکت‌ای در این چالان وجود ندارد' : 'په دې چالان کې هیڅ تکت نشته'}
              </div>
            )}
            
            {chalan.tickets && chalan.tickets.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={handleRemoveTickets}
                  disabled={selectedTicketsToRemove.length === 0 || updating}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2"
                >
                  {updating ? 
                    (language === 'fa' ? "در حال حذف..." : "د حذف کولو په حال کې...") : 
                    `${language === 'fa' ? 'حذف' : 'حذف'} ${selectedTicketsToRemove.length} ${language === 'fa' ? 'تکت' : 'تکت'}`
                  }
                  <RiDeleteBinLine />
                </button>
              </div>
            )}
          </div>

          {/* Available Tickets to Add */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-[#0B2A5B]">
                {language === 'fa' ? 'تکت‌های قابل اضافه کردن' : 'د اضافه کولو وړ تکتونه'} ({availableTickets.length})
              </h4>
              {availableTickets.length > 0 && (
                <button
                  onClick={selectAllAddTickets}
                  className="text-blue-600 text-sm flex items-center gap-1"
                >
                  <RiCheckLine />
                  {selectedTicketsToAdd.length === availableTickets.length ? 
                    (language === 'fa' ? 'لغو انتخاب همه' : 'ټول انتخابونه لغوه کړئ') : 
                    (language === 'fa' ? 'انتخاب همه' : 'ټول وټاکئ')
                  }
                </button>
              )}
            </div>
            
            {availableTickets.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-right">{language === 'fa' ? 'انتخاب' : 'ټاکل'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'شناسه تکت' : 'د تکت پېژندښت'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'نام مسافر' : 'د مسافر نوم'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'شماره تماس' : 'د اړیکې شمېره'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'نوع بس' : 'د بس ډول'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'قیمت' : 'بیه'}</th>
                      <th className="p-2 text-right">{language === 'fa' ? 'سیت' : 'چوکۍ'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-t border-gray-200">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTicketsToAdd.includes(ticket.id)}
                            onChange={() => handleTicketAddSelection(ticket.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2">{ticket.id}</td>
                        <td className="p-2">{ticket.name} {ticket.last_name}</td>
                        <td className="p-2">{ticket.phone}</td>
                        <td className="p-2">{ticket.bus_type}</td>
                        <td className="p-2">{parseFloat(ticket.final_price || 0).toLocaleString()} {language === 'fa' ? 'افغانی' : 'افغانۍ'}</td>
                        <td className="p-2">
                          {Array.isArray(ticket.seat_numbers) 
                            ? ticket.seat_numbers.join(', ') 
                            : ticket.seat_number || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {language === 'fa' ? 'هیچ تکت دیگری برای اضافه کردن وجود ندارد' : 'د اضافه کولو لپاره نور تکتونه نشته'}
              </div>
            )}
            
            {availableTickets.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={handleAddTickets}
                  disabled={selectedTicketsToAdd.length === 0 || updating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2"
                >
                  {updating ? 
                    (language === 'fa' ? "در حال اضافه کردن..." : "د اضافه کولو په حال کې...") : 
                    `${language === 'fa' ? 'اضافه کردن' : 'اضافه کول'} ${selectedTicketsToAdd.length} ${language === 'fa' ? 'تکت' : 'تکت'}`
                  }
                  <RiAddLine />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function ReadyTrips() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedBusType, setSelectedBusType] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayTickets: 0,
    totalTickets: 0,
    totalTrips: 0,
    vipChalan: false,
    bus580Chalan: false,
    tripTicketsBreakdown: ""
  });

  const [selectedTickets, setSelectedTickets] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedBus, setSelectedBus] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [assigning, setAssigning] = useState(false);
  const [uniqueFromLocations, setUniqueFromLocations] = useState([]);
  const [uniqueToLocations, setUniqueToLocations] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [busSearch, setBusSearch] = useState("");
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [updatingTicket, setUpdatingTicket] = useState(null);
  const [printTicketModal, setPrintTicketModal] = useState(false);
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState(null);
  
  // New states for seat modal
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [selectedTripForSeats, setSelectedTripForSeats] = useState(null);
  const [selectedBusTypeForSeats, setSelectedBusTypeForSeats] = useState('');

  // New states for arrived tickets and chalan history
  const [arrivedChalans, setArrivedChalans] = useState([]);
  const [showChalanHistory, setShowChalanHistory] = useState(false);
  const [chalanHistoryFilters, setChalanHistoryFilters] = useState({
    year: '',
    month: '',
    day: '',
    from: '',
    to: '',
    busType: '',
    hour: '',
    minute: '',
    period: ''
  });
  const [markingArrived, setMarkingArrived] = useState(null);

  // NEW STATES FOR DYNAMIC CHALAN MANAGEMENT
  const [chalans, setChalans] = useState([]);
  const [creatingChalan, setCreatingChalan] = useState(false);
  const [showChalanManager, setShowChalanManager] = useState(false);
  
  // NEW: State for update chalan modal
  const [showUpdateChalanModal, setShowUpdateChalanModal] = useState(false);
  const [selectedChalanForUpdate, setSelectedChalanForUpdate] = useState(null);
  const [allTickets, setAllTickets] = useState([]);

  // NEW: State for tickets selected for adding to existing chalan
  const [selectedTicketsForExistingChalan, setSelectedTicketsForExistingChalan] = useState({});

  // Create a ref for the table to print
  const tableRef = useRef();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { language } = useLanguage();
  const t = translations[language];

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Fetch chalans from API
  const fetchChalans = async () => {
    try {
      const data = await chalanAPI.getChalans();
      
      // Check if data is in the expected format
      const chalansArray = data.chalans || data || [];
      
      // Get all tickets from trips-with-tickets to populate chalan tickets
      const allTicketsFromTrips = getAllTicketsFromTrips();
      
      const chalansWithTickets = chalansArray.map((chalan) => {
        // Find tickets from our main tickets data
        const tickets = allTicketsFromTrips.filter(ticket => 
          chalan.ticket_ids.includes(ticket.id)
        );
        
        return {
          ...chalan,
          tickets: tickets,
          // Add fallback properties for the UI
          id: chalan.id,
          chalan_number: chalan.chalan_number,
          created_at: chalan.created_at,
          updated_at: chalan.updated_at
        };
      });

      setChalans(chalansWithTickets);
    } catch (error) {
      console.error("Error fetching chalans:", error);
      showToast(language === 'fa' ? "خطا در بارگذاری چالان‌ها" : "په چالانونو د پورته کولو کې تېروتنه", "error");
      // Set empty array to prevent crashes
      setChalans([]);
    }
  };

  // NEW: Get all tickets from trips data (from /api/trips-with-tickets)
  const getAllTicketsFromTrips = () => {
    return allTrips.flatMap(trip => 
      trip.tickets?.map(ticket => ({
        ...ticket,
        trip: {
          id: trip.id,
          from: trip.from,
          to: trip.to,
          departure_time: trip.departure_time
        }
      })) || []
    );
  };

  // NEW: Fetch all tickets for update modal - using trips data
  const fetchAllTickets = async () => {
    const tickets = getAllTicketsFromTrips();
    setAllTickets(tickets);
  };

  // Handle selection change
  const handleSelectionChange = (selectedItems) => {
    const selectedIds = selectedItems.map(item => item.id);
    setSelectedTickets(selectedIds);
  };

  // Handle individual ticket selection for mobile
  const handleTicketSelection = (ticketId) => {
    setSelectedTickets(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  // Handle print ticket
  const handlePrintTicket = (ticket) => {
    setSelectedTicketForPrint(ticket);
    setPrintTicketModal(true);
  };

  // Select all tickets for mobile
  const handleSelectAllMobile = () => {
    if (selectedTickets.length === mobileTableData.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(mobileTableData.map(ticket => ticket.id));
    }
  };

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Afghan month names in Dari
  const afghanMonths = {
    1: 'حمل', 2: 'ثور', 3: 'جوزا', 4: 'سرطان',
    5: 'اسد', 6: 'سنبله', 7: 'میزان', 8: 'عقرب',
    9: 'قوس', 10: 'جدی', 11: 'دلو', 12: 'حوت'
  };

  // Generate Persian year options
  const generatePersianYears = () => {
    const currentYear = 1403;
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  const yearOptions = generatePersianYears();
  
  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute options (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  // Get today's Persian date
  const getTodayPersianDate = () => {
    const today = new Date();
    return today.toLocaleDateString('fa-IR-u-nu-latn').replace(/\//g, '-');
  };

  // Humanize time difference
  const humanizeTimeDifference = (dateString) => {
    if (!dateString) return language === 'fa' ? "نامشخص" : "ناجوت";
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return language === 'fa' ? 'همین الان' : 'همدا اوس';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return language === 'fa' ? `${minutes} دقیقه قبل` : `${minutes} دقيقې وړاندې`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return language === 'fa' ? `${hours} ساعت قبل` : `${hours} ساعت وړاندې`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return language === 'fa' ? `${days} روز قبل` : `${days} ورځې وړاندې`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return language === 'fa' ? `${months} ماه قبل` : `${months} مياشتې وړاندې`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return language === 'fa' ? `${years} سال قبل` : `${years} کاله وړاندې`;
    }
  };

  // Calculate chalan details for a specific trip and bus type
  const getChalanDetailsForTrip = (trip, busType) => {
    const filteredTickets = trip.tickets?.filter(t => t.bus_type === busType && t.status !== 'arrived') || [];
    
    const totalSeats = filteredTickets.reduce((total, ticket) => {
      const seatCount = Array.isArray(ticket.seat_numbers) 
        ? ticket.seat_numbers.length 
        : (ticket.seat_number ? 1 : 0);
      return total + seatCount;
    }, 0);
    
    const totalPrice = filteredTickets.reduce((total, ticket) => {
      return total + (parseFloat(ticket.final_price) || 0);
    }, 0);
    
    const safiChalan = totalPrice * 0.02;
    const netAmount = totalPrice - safiChalan;
    
    const hasChalan = totalSeats > 0;
    
    return {
      hasChalan,
      totalSeats,
      totalPrice,
      safiChalan,
      netAmount,
      tickets: filteredTickets
    };
  };

  // NEW: Create chalan from selected tickets with validation
  const handleCreateChalan = async () => {
    if (selectedTickets.length === 0) {
      showToast(language === 'fa' ? "لطفا حداقل یک تکت انتخاب کنید" : "مهرباني وکړئ لږ تر لږه یو تکت وټاکئ", "error");
      return;
    }

    // Validate that all selected tickets have the same bus type
    const selectedTicketData = tableData.filter(ticket => selectedTickets.includes(ticket.id));
    const busTypes = [...new Set(selectedTicketData.map(ticket => ticket.bus_type))];
    
    if (busTypes.length > 1) {
      showToast(language === 'fa' 
        ? "خطا: نمی‌توانید تکت‌های VIP و 580 را با هم مخلوط کنید. لطفا تکت‌های هم نوع را انتخاب کنید." 
        : "تېروتنه: تاسې نشئ کولی د VIP او 580 تکتونه سره ګډ کړئ. مهرباني وکړئ د ورته ډول تکتونه وټاکئ.", 
        "error"
      );
      return;
    }

    setCreatingChalan(true);
    
    try {
      const result = await chalanAPI.createChalan(selectedTickets);
      showToast(language === 'fa' 
        ? `چالان شماره ${result.chalan?.chalan_number} با موفقیت ایجاد شد` 
        : `چالان شمېره ${result.chalan?.chalan_number} په بریالیتوب سره جوړ شو`
      );
      
      // Refresh chalans list
      await fetchChalans();
      
      // Clear selection
      setSelectedTickets([]);
      
    } catch (error) {
      console.error("Error creating chalan:", error);
      if (error.response?.data?.message) {
        showToast(error.response.data.message, "error");
      } else {
        showToast(language === 'fa' ? "خطا در ایجاد چالان" : "په چالان د جوړولو کې تېروتنه", "error");
      }
    } finally {
      setCreatingChalan(false);
    }
  };

  // NEW: Delete chalan
  const handleDeleteChalan = async (chalanId) => {
    const confirmMessage = language === 'fa' 
      ? "آیا از حذف این چالان اطمینان دارید؟"
      : "آیا تاسې ډاډه یاست چې غواړئ دا چالان ړنګ کړئ؟";
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await chalanAPI.deleteChalan(chalanId);
      showToast(language === 'fa' ? "چالان با موفقیت حذف شد" : "چالان په بریالیتوب سره ړنګ شو");
      
      // Refresh chalans list
      await fetchChalans();
      
    } catch (error) {
      console.error("Error deleting chalan:", error);
      showToast(language === 'fa' ? "خطا در حذف چالان" : "په چالان د ړنګولو کې تېروتنه", "error");
    }
  };

  // NEW: Handle update chalan
  const handleUpdateChalan = (chalan) => {
    setSelectedChalanForUpdate(chalan);
    setShowUpdateChalanModal(true);
  };

  // NEW: Handle chalan update success
  const handleChalanUpdateSuccess = () => {
    fetchChalans(); // Refresh chalans list
    setShowUpdateChalanModal(false);
    setSelectedChalanForUpdate(null);
  };

  // NEW: Add tickets to existing chalan
  const handleAddTicketsToChalan = async (chalanId) => {
    const ticketIds = selectedTicketsForExistingChalan[chalanId] || [];
    
    if (ticketIds.length === 0) {
      showToast(language === 'fa' ? "لطفا تکت‌هایی برای اضافه کردن انتخاب کنید" : "مهرباني وکړئ د اضافه کولو لپاره تکتونه وټاکئ", "error");
      return;
    }

    try {
      const updateData = {
        add_ticket_ids: ticketIds
      };
      
      await chalanAPI.updateChalan(chalanId, updateData);
      showToast(language === 'fa' ? "تکت‌ها با موفقیت به چالان اضافه شدند" : "تکتونه په بریالیتوب سره چالان ته اضافه شول");
      
      // Refresh chalans list
      await fetchChalans();
      
      // Clear selection for this chalan
      setSelectedTicketsForExistingChalan(prev => ({
        ...prev,
        [chalanId]: []
      }));
      
    } catch (error) {
      console.error("Error adding tickets to chalan:", error);
      showToast(language === 'fa' ? "خطا در اضافه کردن تکت‌ها به چالان" : "په چالان کې د تکتونو د اضافه کولو کې تېروتنه", "error");
    }
  };

  // NEW: Handle ticket selection for existing chalan
  const handleTicketSelectionForChalan = (chalanId, ticketId) => {
    setSelectedTicketsForExistingChalan(prev => {
      const currentSelected = prev[chalanId] || [];
      
      if (currentSelected.includes(ticketId)) {
        return {
          ...prev,
          [chalanId]: currentSelected.filter(id => id !== ticketId)
        };
      } else {
        return {
          ...prev,
          [chalanId]: [...currentSelected, ticketId]
        };
      }
    });
  };

  // NEW: Select all tickets for a chalan
  const handleSelectAllForChalan = (chalanId) => {
    const allTicketIds = tableData.map(ticket => ticket.id);
    const currentSelected = selectedTicketsForExistingChalan[chalanId] || [];
    
    if (currentSelected.length === allTicketIds.length) {
      setSelectedTicketsForExistingChalan(prev => ({
        ...prev,
        [chalanId]: []
      }));
    } else {
      setSelectedTicketsForExistingChalan(prev => ({
        ...prev,
        [chalanId]: allTicketIds
      }));
    }
  };

  // Calculate statistics based on current filtered trips
  const calculateStats = (tripsData) => {
    // Flatten all tickets from filtered trips (excluding arrived tickets)
    const allTickets = tripsData.flatMap(trip => 
      trip.tickets?.filter(ticket => ticket.status !== 'arrived') || []
    );
    
    // Get today's Persian date
    const todayPersian = getTodayPersianDate();
    
    // Count today's tickets
    const todayTickets = allTickets.filter(ticket => {
      if (!ticket.created_at) return false;
      try {
        const createdDate = new Date(ticket.created_at);
        const createdPersian = createdDate.toLocaleDateString('fa-IR-u-nu-latn').replace(/\//g, '-');
        return createdPersian === todayPersian;
      } catch (error) {
        return false;
      }
    }).length;

    // Calculate chalans PER TRIP and PER BUS TYPE
    let hasAnyVipChalan = false;
    let hasAnyBus580Chalan = false;

    tripsData.forEach(trip => {
      if (trip.tickets && trip.tickets.length > 0) {
        // Count SEATS by bus type for THIS SPECIFIC TRIP (excluding arrived tickets)
        let vipSeats = 0;
        let bus580Seats = 0;

        trip.tickets.forEach(ticket => {
          if (ticket.status === 'arrived') return;
          
          const seatCount = Array.isArray(ticket.seat_numbers) 
            ? ticket.seat_numbers.length 
            : (ticket.seat_number ? 1 : 0);
          
          if (ticket.bus_type === 'VIP') {
            vipSeats += seatCount;
          } else if (ticket.bus_type === '580') {
            bus580Seats += seatCount;
          }
        });

        // Check if THIS TRIP meets chalan conditions for each bus type
        if (vipSeats >= 35) {
          hasAnyVipChalan = true;
        }
        if (bus580Seats >= 51) {
          hasAnyBus580Chalan = true;
        }
      }
    });

    // Create trip breakdown string
    const tripBreakdown = tripsData.map(trip => {
      const vipCount = trip.tickets?.filter(t => t.bus_type === 'VIP' && t.status !== 'arrived').length || 0;
      const bus580Count = trip.tickets?.filter(t => t.bus_type === '580' && t.status !== 'arrived').length || 0;
      const totalCount = trip.tickets?.filter(t => t.status !== 'arrived').length || 0;
      return `${trip.from}-${trip.to}: ${totalCount} ${language === 'fa' ? 'تکت' : 'تکت'} (VIP: ${vipCount}, 580: ${bus580Count})`;
    }).join(' | ');

    return {
      todayTickets,
      totalTickets: allTickets.length,
      totalTrips: tripsData.length,
      vipChalan: hasAnyVipChalan,
      bus580Chalan: hasAnyBus580Chalan,
      tripTicketsBreakdown: tripBreakdown
    };
  };

  // Convert 24-hour time to 12-hour format with Persian AM/PM
  const convertTo12Hour = (time24) => {
    if (!time24) return "";
    
    // If already in Persian format, return as is
    if (time24.includes('صبح') || time24.includes('شب') || time24.includes('ق.ظ') || time24.includes('ب.ظ')) {
      return time24;
    }
    
    // If already in AM/PM format, convert to Persian
    if (time24.includes('AM') || time24.includes('PM')) {
      return time24.replace('AM', 'ق.ظ').replace('PM', 'ب.ظ');
    }
    
    // Convert 24-hour format to 12-hour Persian format
    try {
      let [hours, minutes] = time24.split(':');
      let hour = parseInt(hours);
      let minute = minutes || '00';
      
      let period = 'ق.ظ'; // AM
      if (hour >= 12) {
        period = 'ب.ظ'; // PM
      }
      
      if (hour > 12) {
        hour = hour - 12;
      } else if (hour === 0) {
        hour = 12;
      }
      
      return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return time24;
    }
  };

  // Convert Gregorian date to Persian date
  const convertToPersianDate = (gregorianDate) => {
    if (!gregorianDate) return "";
    
    try {
      // If already in Persian format, return as is
      if (gregorianDate.includes('/')) {
        const parts = gregorianDate.split('/');
        if (parts.length === 3) {
          return gregorianDate; // Assume it's already Persian
        }
      }
      
      // Convert Gregorian to Persian
      const date = new Date(gregorianDate);
      const persianDate = date.toLocaleDateString('fa-IR');
      return persianDate;
    } catch (error) {
      return gregorianDate;
    }
  };

  // Convert Gregorian datetime to Persian date and time
  const convertToPersianDateTime = (gregorianDateTime) => {
    if (!gregorianDateTime) return "";
    
    try {
      const date = new Date(gregorianDateTime);
      const persianDate = date.toLocaleDateString('fa-IR');
      const time = date.toLocaleTimeString('fa-IR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return `${persianDate} - ${time}`;
    } catch (error) {
      return gregorianDateTime;
    }
  };

  // Filter drivers based on search
  useEffect(() => {
    if (driverSearch) {
      const filtered = drivers.filter(driver => 
        driver.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
        driver.father_name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
        driver.phone?.includes(driverSearch)
      );
      setFilteredDrivers(filtered);
    } else {
      setFilteredDrivers(drivers);
    }
  }, [driverSearch, drivers]);

  // Filter buses based on search
  useEffect(() => {
    if (busSearch) {
      const filtered = buses.filter(bus => 
        bus.number_plate?.includes(busSearch)
      );
      setFilteredBuses(filtered);
    } else {
      setFilteredBuses(buses);
    }
  }, [busSearch, buses]);

  // NEW: Auto-assign bus when driver is selected (if driver has bus_number_plate)
  useEffect(() => {
    if (selectedDriver) {
      const selectedDriverData = drivers.find(d => d.id === selectedDriver);
      if (selectedDriverData && selectedDriverData.bus_number_plate) {
        // Find the bus with this number plate
        const matchingBus = buses.find(b => b.number_plate === selectedDriverData.bus_number_plate);
        if (matchingBus) {
          setSelectedBus(matchingBus.id);
          showToast(
            language === 'fa' 
              ? `بس ${matchingBus.number_plate} به صورت خودکار انتساب داده شد` 
              : `بس ${matchingBus.number_plate} په اتوماتيک ډول وټاکل شو`, 
            "success"
          );
        }
      }
    }
  }, [selectedDriver, drivers, buses, language]);

  // Fetch arrived tickets for history
  const fetchArrivedTickets = async () => {
    try {
      // Get all trips data and filter arrived tickets
      const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
      let allTripsData = res.data.trips || [];
      
      // Extract all tickets with status 'arrived' and use ticket departure_date
      const allArrivedTickets = allTripsData.flatMap(trip => 
        trip.tickets?.filter(ticket => ticket.status === 'arrived').map(ticket => ({
          ...ticket,
          trip: { // Add trip info to each ticket for history
            id: trip.id,
            from: trip.from,
            to: trip.to,
            departure_time: trip.departure_time
          }
        })) || []
      );
      
      setArrivedChalans(allArrivedTickets);
    } catch (error) {
      console.error("Error fetching trips for arrived tickets:", error);
      // Fallback: filter from current allTrips state
      const allArrivedTickets = allTrips.flatMap(trip => 
        trip.tickets?.filter(ticket => ticket.status === 'arrived').map(ticket => ({
          ...ticket,
          trip: {
            id: trip.id,
            from: trip.from,
            to: trip.to,
            departure_time: trip.departure_time
          }
        })) || []
      );
      setArrivedChalans(allArrivedTickets);
    }
  };

  // Fetch all trips to get all from/to locations for filters
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
        let allTripsData = res.data.trips || [];
        
        // Sort trips by created_at in descending order (newest first)
        allTripsData = allTripsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setAllTrips(allTripsData);
        
        // Extract unique from and to locations from ALL trips
        const fromLocations = [...new Set(allTripsData.map(trip => trip.from))];
        const toLocations = [...new Set(allTripsData.map(trip => trip.to))];
        setUniqueFromLocations(fromLocations);
        setUniqueToLocations(toLocations);
        
        // Filter out arrived tickets
        const tripsWithActiveTickets = allTripsData.map(trip => ({
          ...trip,
          tickets: (trip.tickets || []).filter(ticket => ticket.status !== 'arrived')
        })).filter(trip => trip.tickets.length > 0); // Only remove trips with no active tickets at all
        
        setTrips(tripsWithActiveTickets);
        setFilteredTrips(tripsWithActiveTickets);
        
        // Calculate new statistics
        const newStats = calculateStats(tripsWithActiveTickets);
        setStats(newStats);
        
        // Fetch arrived tickets for history
        fetchArrivedTickets();
        
        // Fetch existing chalans
        await fetchChalans();
        
        // Fetch all tickets for update modal
        await fetchAllTickets();
        
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // Function to mark tickets as arrived for a specific trip and bus type
  const handleMarkChalanAsArrived = async (tripId, busType) => {
    setMarkingArrived(`${tripId}-${busType}`);
    
    try {
      // Get all tickets for this trip and bus type that are not already arrived
      const trip = trips.find(t => t.id === tripId);
      if (!trip) {
        showToast(language === 'fa' ? "سفر یافت نشد" : "سفر ونه موندل شو", "error");
        return;
      }

      const ticketsToMark = trip.tickets?.filter(ticket => 
        ticket.bus_type === busType && ticket.status !== 'arrived'
      ) || [];

      if (ticketsToMark.length === 0) {
        showToast(
          language === 'fa' 
            ? `هیچ تکت ${busType} برای علامت گذاری یافت نشد` 
            : `هیڅ ${busType} تکت د نښه کولو لپاره ونه موندل شو`, 
          "error"
        );
        return;
      }

      // Extract ticket IDs
      const ticketIds = ticketsToMark.map(ticket => ticket.id);

      // Mark all tickets as arrived in one API call
      await axios.post(`${API_BASE_URL}/api/tickets/arrived`, {
        ticket_ids: ticketIds
      });
      
      showToast(
        language === 'fa' 
          ? `تمام تکت‌های ${busType} با موفقیت به وضعیت رسیده تغییر کردند` 
          : `ټول ${busType} تکتونه په بریالیتوب سره رسیدلي حالت ته بدل شول`
      );
      
      // Refresh trips data to remove arrived tickets
      const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
      let allTripsData = res.data.trips || [];
      
      // Sort trips by created_at in descending order (newest first)
      allTripsData = allTripsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setAllTrips(allTripsData);
      
      // Filter out arrived tickets
      const tripsWithActiveTickets = allTripsData.map(trip => ({
        ...trip,
        tickets: (trip.tickets || []).filter(ticket => ticket.status !== 'arrived')
      })).filter(trip => trip.tickets.length > 0);
      
      setTrips(tripsWithActiveTickets);
      setFilteredTrips(tripsWithActiveTickets);
      
      // Update stats
      const newStats = calculateStats(tripsWithActiveTickets);
      setStats(newStats);
      
      // Refresh arrived tickets for history
      fetchArrivedTickets();
      
    } catch (error) {
      console.error("Error marking tickets as arrived:", error);
      showToast(language === 'fa' ? "خطا در تغییر وضعیت تکت‌ها" : "په تکتونو کې د حالت د بدلولو کې تېروتنه", "error");
    } finally {
      setMarkingArrived(null);
    }
  };

  // FIXED: Filter trips based on selected criteria
  useEffect(() => {
    let filtered = [...trips];
    
    // Filter by year, month and day using ticket's departure_date
    if (selectedYear || selectedMonth || selectedDay) {
      filtered = filtered.map(trip => ({
        ...trip,
        tickets: trip.tickets?.filter(ticket => {
          if (!ticket.departure_date) return false;
          
          // Parse the Persian date properly (format: "1404-7-30")
          const dateString = ticket.departure_date.toString();
          const dateParts = dateString.split('-');
          
          // Handle different date formats
          let year, month, day;
          
          if (dateParts.length === 3) {
            // Format: "1404-7-30"
            [year, month, day] = dateParts;
          } else {
            // Try other formats or skip
            return false;
          }
          
          // Remove any non-numeric characters and pad months/days
          year = year.replace(/\D/g, '');
          month = month.replace(/\D/g, '').padStart(2, '0');
          day = day.replace(/\D/g, '').padStart(2, '0');

          // Check year filter
          if (selectedYear && year !== selectedYear) return false;
          
          // Check month filter
          if (selectedMonth && month !== selectedMonth.padStart(2, '0')) return false;
          
          // Check day filter
          if (selectedDay && day !== selectedDay.padStart(2, '0')) return false;
          
          return true;
        }) || []
      })).filter(trip => trip.tickets.length > 0);
    }
    
    // Filter by from location
    if (selectedFrom) {
      filtered = filtered.filter(trip => trip.from === selectedFrom);
    }
    
    // Filter by to location
    if (selectedTo) {
      filtered = filtered.filter(trip => trip.to === selectedTo);
    }
    
    // Filter by bus type
    if (selectedBusType) {
      filtered = filtered.map(trip => ({
        ...trip,
        tickets: trip.tickets?.filter(ticket => ticket.bus_type === selectedBusType) || []
      })).filter(trip => trip.tickets.length > 0);
    }
    
    // Filter by payment status - UPDATED with in_processing
    if (selectedPaymentStatus) {
      filtered = filtered.map(trip => ({
        ...trip,
        tickets: trip.tickets?.filter(ticket => {
          if (selectedPaymentStatus === 'paid') return ticket.payment_status === 'paid';
          if (selectedPaymentStatus === 'unpaid') return ticket.payment_status === 'unpaid';
          if (selectedPaymentStatus === 'pending') return ticket.payment_status === 'pending';
          if (selectedPaymentStatus === 'in_processing') return ticket.payment_status === 'in_processing';
          return true;
        }) || []
      })).filter(trip => trip.tickets.length > 0);
    }
    
    // Filter by payment method
    if (selectedPaymentMethod) {
      filtered = filtered.map(trip => ({
        ...trip,
        tickets: trip.tickets?.filter(ticket => ticket.payment_method === selectedPaymentMethod) || []
      })).filter(trip => trip.tickets.length > 0);
    }
    
    // Filter by time (hour, minute, and period) - using trip departure_time
    if (selectedHour || selectedMinute || selectedPeriod) {
      filtered = filtered.filter(trip => {
        if (!trip.departure_time) return false;
        
        const tripTime = trip.departure_time.toString();
        
        // Parse the time string - handle multiple formats
        const time = tripTime.toUpperCase();
        
        // Extract hour, minute, and period
        let hour, minute, period;
        
        // Handle Persian format: "8:30 ق.ظ" or "8:30 ب.ظ"
        if (time.includes('ق.ظ') || time.includes('ب.ظ')) {
          const timeWithoutPeriod = time.replace(/\s?(ق\.ظ|ب\.ظ)/gi, '').trim();
          const [h, m] = timeWithoutPeriod.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = time.includes('ب.ظ') ? 'PM' : 'AM';
        }
        // Handle English format: "8:30 AM" or "8:30 PM"
        else if (time.includes('AM') || time.includes('PM')) {
          const timeWithoutPeriod = time.replace(/\s?(AM|PM)/gi, '').trim();
          const [h, m] = timeWithoutPeriod.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = time.includes('PM') ? 'PM' : 'AM';
        }
        // Handle 24-hour format: "14:30"
        else {
          const [h, m] = time.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = hour >= 12 ? 'PM' : 'AM';
          
          // Convert to 12-hour format for filtering
          if (hour > 12) hour = hour - 12;
          if (hour === 0) hour = 12;
        }
        
        // Check hour filter
        if (selectedHour) {
          const selectedHourInt = parseInt(selectedHour);
          if (hour !== selectedHourInt) return false;
        }
        
        // Check minute filter
        if (selectedMinute) {
          const selectedMinuteInt = parseInt(selectedMinute);
          if (minute !== selectedMinuteInt) return false;
        }
        
        // Check period filter
        if (selectedPeriod) {
          if (period !== selectedPeriod) return false;
        }
        
        return true;
      });
    }
    
    setFilteredTrips(filtered);
    
    // Update stats whenever filtered trips change
    const newStats = calculateStats(filtered);
    setStats(newStats);
  }, [
    selectedYear, selectedMonth, selectedDay, selectedFrom, selectedTo, 
    selectedBusType, selectedHour, selectedMinute, selectedPeriod, 
    selectedPaymentStatus, selectedPaymentMethod, trips
  ]);

  // Fetch buses
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/buses`);
        setBuses(res.data);
      } catch (error) {
        console.error("Error fetching buses:", error);
        showToast(language === 'fa' ? "خطا در بارگذاری بس ها" : "په بسونو د پورته کولو کې تېروتنه", "error");
      }
    };
    fetchBuses();
  }, []);

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/drivers`);
        setDrivers(res.data);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        showToast(language === 'fa' ? "خطا در بارگذاری راننده ها" : "په چلوونکو د پورته کولو کې تېروتنه", "error");
      }
    };
    fetchDrivers();
  }, []);

  // Handle assignment of both bus and driver
  const handleAssignBusAndDriver = async () => {
    if (!selectedBus && !selectedDriver) {
      showToast(language === 'fa' ? "لطفا حداقل یک بس یا راننده انتخاب کنید" : "مهرباني وکړئ لږ تر لږه یو بس یا چلوونکی وټاکئ", "error");
      return;
    }

    if (selectedTickets.length === 0) {
      showToast(language === 'fa' ? "لطفا حداقل یک تکت انتخاب کنید" : "مهرباني وکړئ لږ تر لږه یو تکت وټاکئ", "error");
      return;
    }

    setAssigning(true);
    
    try {
      // Process each selected ticket individually
      const assignmentPromises = selectedTickets.map(ticketId => {
        const assignmentData = {};
        if (selectedBus) assignmentData.bus_id = selectedBus;
        if (selectedDriver) assignmentData.driver_id = selectedDriver;
        
        return axios.put(`${API_BASE_URL}/api/tickets/${ticketId}/assign`, assignmentData);
      });
      
      await Promise.all(assignmentPromises);
      
      showToast(language === 'fa' ? "انتساب با موفقیت انجام شد" : "ټاکل په بریالیتوب سره ترسره شو");
      setSelectedBus("");
      setSelectedDriver("");
      setDriverSearch("");
      setBusSearch("");
      
      // Refresh trips data
      const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
      let allTripsData = res.data.trips || [];
      
      // Sort trips by created_at in descending order (newest first)
      allTripsData = allTripsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setAllTrips(allTripsData);
      
      // Filter out arrived tickets
      const tripsWithActiveTickets = allTripsData.map(trip => ({
        ...trip,
        tickets: (trip.tickets || []).filter(ticket => ticket.status !== 'arrived')
      })).filter(trip => trip.tickets.length > 0);
      
      setTrips(tripsWithActiveTickets);
      setFilteredTrips(tripsWithActiveTickets);
      
      // Update stats
      const newStats = calculateStats(tripsWithActiveTickets);
      setStats(newStats);
      
    } catch (error) {
      console.error("Error assigning bus and driver:", error);
      if (error.response && error.response.status === 404) {
        showToast(language === 'fa' ? "یک یا چند تکت یافت نشد" : "یو یا څو تکتونه ونه موندل شول", "error");
      } else {
        showToast(language === 'fa' ? "خطا در انتساب" : "په ټاکلو کې تېروتنه", "error");
      }
    } finally {
      setAssigning(false);
    }
  };

  // Handle ticket status update
  const handleTicketStatusUpdate = async (ticketId, status) => {
    setUpdatingTicket(ticketId);
    
    try {
      let endpoint = '';
      switch (status) {
        case 'paid':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/mark-paid`;
          break;
        case 'processing':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/processing`;
          break;
        case 'riding':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/riding`;
          break;
        case 'cancel':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/cancel`;
          break;
        default:
          return;
      }
      
      await axios.post(endpoint);
      showToast(
        language === 'fa' 
          ? `وضعیت تکت با موفقیت به ${getStatusText(status)} تغییر کرد` 
          : `د تکت حالت په بریالیتوب سره ${getStatusText(status)} ته بدل شو`
      );
      
      // Refresh trips data
      const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
      let allTripsData = res.data.trips || [];
      
      allTripsData = allTripsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAllTrips(allTripsData);
      
      const tripsWithActiveTickets = allTripsData.map(trip => ({
        ...trip,
        tickets: (trip.tickets || []).filter(ticket => ticket.status !== 'arrived')
      })).filter(trip => trip.tickets.length > 0);
      
      setTrips(tripsWithActiveTickets);
      setFilteredTrips(tripsWithActiveTickets);
      
    } catch (error) {
      console.error(`Error updating ticket status to ${status}:`, error);
      showToast(language === 'fa' ? "خطا در تغییر وضعیت تکت" : "په تکت کې د حالت د بدلولو کې تېروتنه", "error");
    } finally {
      setUpdatingTicket(null);
    }
  };

  // Get status text for display - UPDATED with in_processing
  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی';
      case 'processing': return language === 'fa' ? 'در حال پردازش' : 'په پروسس کې';
      case 'riding': return language === 'fa' ? 'در حال سفر' : 'په سفر کې';
      case 'cancel': return language === 'fa' ? 'لغو شده' : 'لغوه شوی';
      case 'arrived': return language === 'fa' ? 'رسیده' : 'رسیدلی';
      case 'in_processing': return language === 'fa' ? 'در حال پردازش' : 'په پروسس کې';
      default: return status;
    }
  };

  // Helper function to get bus details by ID
  const getBusDetails = (busId) => {
    if (!busId) return language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
    const bus = buses.find(b => b.id === busId);
    return bus ? `${bus.bus_no} (${bus.number_plate})` : `${language === 'fa' ? 'بس' : 'بس'} ${busId}`;
  };

  // Helper function to get driver details by ID
  const getDriverDetails = (driverId) => {
    if (!driverId) return language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.name} ${driver.father_name}` : `${language === 'fa' ? 'راننده' : 'چلوونکی'} ${driverId}`;
  };

  // Helper function to get driver phone by ID
  const getDriverPhone = (driverId) => {
    if (!driverId) return language === 'fa' ? "نامشخص" : "ناجوت";
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.phone : language === 'fa' ? "نامشخص" : "ناجوت";
  };

  // Helper function to get bus number plate by ID
  const getBusNumberPlate = (busId) => {
    if (!busId) return language === 'fa' ? "نامشخص" : "ناجوت";
    const bus = buses.find(b => b.id === busId);
    return bus ? bus.number_plate : language === 'fa' ? "نامشخص" : "ناجوت";
  };

  // Format time to display in Persian/Dari
  const formatTimeForDisplay = (time) => {
    return convertTo12Hour(time);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedYear('');
    setSelectedMonth('');
    setSelectedDay('');
    setSelectedFrom('');
    setSelectedTo('');
    setSelectedBusType('');
    setSelectedHour('');
    setSelectedMinute('');
    setSelectedPeriod('');
    setSelectedPaymentStatus('');
    setSelectedPaymentMethod('');
  };

  // Print specific chalan for VIP or 580
  const handlePrintChalan = (chalan) => {
    if (!chalan.tickets || chalan.tickets.length === 0) {
      showToast(language === 'fa' ? "هیچ تکت برای چاپ وجود ندارد" : "د چاپ لپاره هیڅ تکت نشته", "error");
      return;
    }

    // Get ticket details from the first ticket
    const firstTicket = chalan.tickets[0];
    const busType = firstTicket.bus_type;
    
    // Calculate chalan details
    const totalSeats = chalan.tickets.reduce((total, ticket) => {
      const seatCount = Array.isArray(ticket.seat_numbers) 
        ? ticket.seat_numbers.length 
        : (ticket.seat_number ? 1 : 0);
      return total + seatCount;
    }, 0);
    
    const totalPrice = chalan.tickets.reduce((total, ticket) => {
      return total + (parseFloat(ticket.final_price) || 0);
    }, 0);
    
    const safiChalan = totalPrice * 0.02;
    const netAmount = totalPrice - safiChalan;

    // Get assigned bus and driver details
    const assignedBusId = firstTicket.bus_id;
    const assignedDriverId = firstTicket.driver_id;
    
    const busNumberPlate = getBusNumberPlate(assignedBusId);
    const driverPhone = getDriverPhone(assignedDriverId);
    const driver = drivers.find(d => d.id === assignedDriverId);
    const driverName = driver ? `${driver.name} ` : language === 'fa' ? 'نامشخص' : 'ناجوت';
    const driverFathername = driver ? `${driver.father_name}` : language === 'fa' ? "نامشخص" : "ناجوت";

    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>${language === 'fa' ? 'چاپ چالان' : 'د چالان چاپ'} ${busType} - ${firstTicket.trip?.from || (language === 'fa' ? 'نامشخص' : 'ناجوت')} ${language === 'fa' ? 'به' : 'ته'} ${firstTicket.trip?.to || (language === 'fa' ? 'نامشخص' : 'ناجوت')}</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 8px;
            color: #333;
            background: white;
            font-size: 11px;
            line-height: 1.2;
          }
          .chalan-header {
            text-align: center;
            margin-bottom: 5px;
            border-bottom: 2px solid #0B2A5B;
            padding-bottom: 5px;
          }
          .chalan-header h1 {
            color: #0B2A5B;
            margin: 0;
            font-size: 16px;
          }
          .header-subtitle {
            font-size: 11px;
            color: #666;
            margin-top: 2px;
          }
          .chalan-number {
            position: absolute;
            left: 10px;
            top: 10px;
            background: #0B2A5B;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .trip-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3px;
            margin: 5px 0;
            background: #f8f9fa;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          .trip-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1px 0;
          }
          .trip-info-strong {
            color: #0B2A5B;
            font-weight: bold;
            font-size: 10px;
          }
          .trip-info-value {
            font-size: 10px;
          }
          .chalan-type-banner {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            color: #d63384;
            margin: 4px 0;
            padding: 4px;
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 3px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 4px 0;
            font-size: 9px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 3px 2px;
            text-align: center;
            height: 20px;
          }
          th {
            background-color: #0B2A5B;
            color: white;
            font-weight: bold;
            padding: 4px 2px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .price-summary {
            background: #e7f3ff;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #b3d9ff;
            margin: 6px 0;
          }
          .price-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 10px;
          }
          .price-total {
            border-top: 1px solid #b3d9ff;
            padding-top: 4px;
            font-size: 11px;
            font-weight: bold;
          }
          .signature-fingerprint-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 8px;
            align-items: start;
          }
          .signature-box, .fingerprint-box {
            border: 1px solid #333;
            text-align: center;
            height: 70px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 5px;
          }
          .signature-title, .fingerprint-title {
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 2px;
          }
          .signature-bottom, .fingerprint-bottom {
            font-size: 9px;
            color: #666;
            margin-top: auto;
          }
          .print-footer {
            margin-top: 8px;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 4px;
          }
          .compact-spacing {
            margin: 2px 0;
          }
          @media print {
            body {
              padding: 5px;
              font-size: 10px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="chalan-header" style="position: relative;">
          <div class="chalan-number">${chalan.chalan_number}</div>
          <h1>💼 ${language === 'fa' ? 'چالان مسافرتی -' : 'د مسافر چالان -'} ${busType}</h1>
          <div class="header-subtitle">${language === 'fa' ? 'لیست مسافرین' : 'د مسافرو لیست'}</div>
        </div>
        
        <!-- Trip Information - COMPACT -->
        <div class="trip-info-grid">
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'مبدا:' : 'سرچینه:'}</span>
            <span class="trip-info-value">${firstTicket.trip?.from || (language === 'fa' ? 'نامشخص' : 'ناجوت')}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'مقصد:' : 'منزل:'}</span>
            <span class="trip-info-value">${firstTicket.trip?.to || (language === 'fa' ? 'نامشخص' : 'ناجوت')}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'تاریخ:' : 'نېټه:'}</span>
            <span class="trip-info-value">${firstTicket.departure_date || (language === 'fa' ? 'نامشخص' : 'ناجوت')}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'زمان حرکت:' : 'د تګ وخت:'}</span>
            <span class="trip-info-value">${formatTimeForDisplay(firstTicket.trip?.departure_time)}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'نوع بس:' : 'د بس ډول:'}</span>
            <span class="trip-info-value">${busType}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'نمبر پلیت بس:' : 'د بس د پلیټ نمبر:'}</span>
            <span class="trip-info-value">${busNumberPlate}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'نام راننده:' : 'د چلوونکی نوم:'}</span>
            <span class="trip-info-value">${driverName}</span>
          </div>
            <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'نلم پدر راننده:' : 'د چلوونکی د پلار نوم:'}</span>
            <span class="trip-info-value">${driverFathername}</span>
          </div>

          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'شماره تماس راننده:' : 'د چلوونکی د اړیکې شمېره:'}</span>
            <span class="trip-info-value">${driverPhone}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'تعداد مسافرین:' : 'د مسافرو شمېر:'}</span>
            <span class="trip-info-value">${chalan.tickets.length} ${language === 'fa' ? 'نفر' : 'کسان'}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">${language === 'fa' ? 'تعداد چوکی‌ها:' : 'د چوکیو شمېر:'}</span>
            <span class="trip-info-value">${totalSeats} ${language === 'fa' ? 'چوکی' : 'چوکۍ'}</span>
          </div>
        </div>
        
        <!-- Chalan Type Banner -->
        <div class="chalan-type-banner">
          🚌 ${language === 'fa' ? 'چالان' : 'چالان'} ${busType} - ${totalSeats} ${language === 'fa' ? 'چوکی' : 'چوکۍ'}      </div>
        
        <!-- Passengers Table -->
        <table>
          <thead>
            <tr>
              <th>${language === 'fa' ? 'شماره' : 'شمېره'}</th>
              <th>${language === 'fa' ? 'نام مسافر' : 'د مسافر نوم'}</th>
              <th>${language === 'fa' ? 'تخلص' : 'تخلص'}</th>
              <th>${language === 'fa' ? 'شماره تماس' : 'د اړیکې شمېره'}</th>
              <th>${language === 'fa' ? 'نمبر سیت' : 'د چوکۍ نمبر'}</th>
              <th>${language === 'fa' ? 'قیمت (افغانی)' : 'بیه (افغانۍ)'}</th>
            </tr>
          </thead>
          <tbody>
            ${chalan.tickets.map((ticket, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${ticket.name || ''}</td>
                <td>${ticket.last_name || ''}</td>
                <td>${ticket.phone || ''}</td>
                <td>${Array.isArray(ticket.seat_numbers) ? ticket.seat_numbers.join(', ') : ticket.seat_number || ''}</td>
                <td>${(parseFloat(ticket.final_price) || 0).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Price Summary -->
        <div class="price-summary">
          <div class="price-row">
            <strong>${language === 'fa' ? 'مجموع کل مبلغ:' : 'ټوله مجموعه:'}</strong>
            <span>${totalPrice.toLocaleString()} ${language === 'fa' ? 'افغانی' : 'افغانۍ'}</span>
          </div>
          <div class="price-row">
            <strong>${language === 'fa' ? 'مجموع 2% کمیشن شرکت(۲٪):' : 'د شرکت د 2٪ کمیسیون مجموعه:'}</strong>
            <span>${safiChalan.toLocaleString()} ${language === 'fa' ? 'افغانی' : 'افغانۍ'}</span>
          </div>
          <div class="price-row price-total">
            <strong>${language === 'fa' ? 'صافی چالان' : 'پاک چالان'}</strong>
            <span>${netAmount.toLocaleString()} ${language === 'fa' ? 'افغانی' : 'افغانۍ'}</span>
          </div>
        </div>
        
        <!-- Signature & Fingerprint - EQUAL HEIGHT AND ALIGNED -->
        <div class="signature-fingerprint-section">
          <!-- Signature Box -->
          <div class="signature-box">
            <div class="signature-title">${language === 'fa' ? 'امضای مسئول' : 'د مسئول لاسلیک'}</div>
            <div class="signature-bottom">${language === 'fa' ? 'مسئول شرکت' : 'د شرکت مسئول'}</div>
          </div>
          
          <!-- Fingerprint Box -->
          <div class="fingerprint-box">
            <div class="fingerprint-title">${language === 'fa' ? 'انگشت شست راننده' : 'د چلوونکی د ګوتې نښه'}</div>
            <div class="fingerprint-bottom">${language === 'fa' ? 'محل انگشت گذاری' : 'د ګوټې نښې ځای'}</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="print-footer">
        
          <p>${language === 'fa' ? 'این سند به صورت خودکار تولید شده است' : 'دا سند په اتوماتيک ډول تولید شوی دی'}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Print the tickets table
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Get trip information for the header
    const tripInfo = filteredTrips.length > 0 ? filteredTrips[0] : null;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>${language === 'fa' ? 'چاپ تکت‌ها' : 'د تکتونو چاپ'}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #0B2A5B;
            padding-bottom: 15px;
          }
          .print-header h1 {
            color: #0B2A5B;
            margin: 0 0 10px 0;
          }
          .trip-info {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin-bottom: 15px;
          }
          .trip-info div {
            margin: 5px 15px;
          }
          .trip-info strong {
            color: #0B2A5B;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f2f2f2;
            color: #0B2A5B;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .print-footer {
            margin-top: 20px;
            text-align: left;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              padding: 15px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${language === 'fa' ? 'لیست تکت‌های بس‌ها' : 'د بسونو د تکتونو لیست'}</h1>
          ${tripInfo ? `
            <div class="trip-info">
              <div><strong>${language === 'fa' ? 'مبدا:' : 'سرچینه:'}</strong> ${tripInfo.from}</div>
              <div><strong>${language === 'fa' ? 'مقصد:' : 'منزل:'}</strong> ${tripInfo.to}</div>
              <div><strong>${language === 'fa' ? 'تاریخ حرکت:' : 'د تګ نېټه:'}</strong> ${tripInfo.departure_date}</div>
              <div><strong>${language === 'fa' ? 'زمان حرکت:' : 'د تګ وخت:'}</strong> ${formatTimeForDisplay(tripInfo.departure_time)}</div>
            </div>
          ` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>${language === 'fa' ? 'نام' : 'نوم'}</th>
              <th>${language === 'fa' ? 'تخلص' : 'تخلص'}</th>
              <th>${language === 'fa' ? 'شماره تماس' : 'د اړیکې شمېره'}</th>
              <th>${language === 'fa' ? 'نمبر سیت' : 'د چوکۍ نمبر'}</th>
              <th>${language === 'fa' ? 'نوع بس' : 'د بس ډول'}</th>
              <th>${language === 'fa' ? 'قیمت' : 'بیه'}</th>
              <th>${language === 'fa' ? 'روش پرداخت' : 'د پیسو ورکولو طریقه'}</th>
              <th>${language === 'fa' ? 'وضعیت پرداخت' : 'د پیسو ورکولو حالت'}</th>
              <th>${language === 'fa' ? 'بس' : 'بس'}</th>
              <th>${language === 'fa' ? 'راننده' : 'چلوونکی'}</th>
            </tr>
          </thead>
          <tbody>
            ${tableData.map(ticket => `
              <tr>
                <td>${ticket.name || ''}</td>
                <td>${ticket.last_name || ''}</td>
                <td>${ticket.phone || ''}</td>
                <td>${ticket.seat_numbers || ''}</td>
                <td>${ticket.bus_type || ''}</td>
                <td>${ticket.price ? `${ticket.price.toLocaleString()} ${language === 'fa' ? 'افغانی' : 'افغانۍ'}` : (language === 'fa' ? 'نامشخص' : 'ناجوت')}</td>
                <td>${ticket.payment_method || ''}</td>
                <td>${ticket.payment_status}</td>
                <td>${ticket.bus_details || ''}</td>
                <td>${ticket.driver_details || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="print-footer">
          <p>${language === 'fa' ? 'تعداد تکت‌ها:' : 'د تکتونو شمېر:'} ${tableData.length}</p>
          <p>${language === 'fa' ? 'تاریخ چاپ:' : 'د چاپ نېټه:'} ${new Date().toLocaleDateString('fa-IR')}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Table columns - FIXED for CustomTable component
  const columns = [
    { 
      header: t.from, 
      accessor: "from",
      render: (row) => row.from
    },
    { 
      header: t.to, 
      accessor: "to",
      render: (row) => row.to
    },
    { 
      header: language === 'fa' ? "تاریخ حرکت" : "د تګ نېټه", 
      accessor: "ticket_departure_date",
      render: (row) => row.ticket_departure_date
    },
    { 
      header: language === 'fa' ? "زمان حرکت" : "د تګ وخت", 
      accessor: "departure_time",
      render: (row) => formatTimeForDisplay(row.departure_time)
    },
    { 
      header: language === 'fa' ? "تاریخ ایجاد" : "د جوړیدو نېټه", 
      accessor: "created_at_humanized",
      render: (row) => (
        <div className="text-xs">
          <div>{row.created_at_humanized}</div>
          <div className="text-gray-500">{row.created_at_time}</div>
        </div>
      )
    },

    { 
      header: t.name, 
      accessor: "name",
      render: (row) => row.name
    },
    { 
      header: language === 'fa' ? "تخلص" : "تخلص", 
      accessor: "last_name",
      render: (row) => row.last_name
    },
    { 
      header: t.phone, 
      accessor: "phone",
      render: (row) => row.phone
    },
    { 
      header: language === 'fa' ? "نوع بس" : "د بس ډول", 
      accessor: "bus_type",
      render: (row) => row.bus_type
    },
    { 
      header: language === 'fa' ? "قیمت" : "بیه", 
      accessor: "price",
      render: (row) => (
        <span className="font-medium text-green-600">
          {row.price ? `${row.price.toLocaleString()} ${language === 'fa' ? 'افغانی' : 'افغانۍ'}` : (language === 'fa' ? 'نامشخص' : 'ناجوت')}
        </span>
      )
    },
    { 
      header: language === 'fa' ? "نمبر سیت" : "د چوکۍ نمبر", 
      accessor: "seat_numbers",
      render: (row) => row.seat_numbers
    },
    { 
      header: language === 'fa' ? "روش پرداخت" : "د پیسو ورکولو طریقه", 
      accessor: "payment_method",
      render: (row) => row.payment_method
    },
    { 
      header: language === 'fa' ? "وضعیت پرداخت" : "د پیسو ورکولو حالت", 
      accessor: "payment_status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.payment_status === (language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی') ? 'bg-green-100 text-green-800' : 
          row.payment_status === (language === 'fa' ? 'در انتظار پرداخت' : 'د پیسو ورکولو په تمه') ? 'bg-yellow-100 text-yellow-800' : 
          row.payment_status === (language === 'fa' ? 'در حال پردازش' : 'په پروسس کې') ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.payment_status}
        </span>
      )
    },
    { 
    header: language === 'fa' ? "کد تخفیف" : "د تخفیف کوډ", 
    accessor: "coupon_code",
    render: (row) => (
      <div className="text-center">
        {row.coupon_code ? (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
            {row.coupon_code}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">{language === 'fa' ? 'ندارد' : 'نلري'}</span>
        )}
      </div>
    )
  },
    { 
      header: language === 'fa' ? "وضعیت تکت" : "د تکت حالت", 
      accessor: "ticket_status",
      render: (row) => row.ticket_status
    },
    { 
      header: language === 'fa' ? "بس" : "بس", 
      accessor: "bus_details",
      render: (row) => row.bus_details
    },
    { 
      header: language === 'fa' ? "راننده" : "چلوونکی", 
      accessor: "driver_details",
      render: (row) => row.driver_details
    },
   {
  header: t.operations,
  accessor: "actions",
  render: (row) => (
    <div className="flex flex-col gap-2 min-w-[150px]">
      <div className="flex gap-1">
        {row.payment_status !== (language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی') && (
          <button
            onClick={() => handleTicketStatusUpdate(row.id, 'paid')}
            disabled={updatingTicket === row.id}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
            title={language === 'fa' ? "علامت گذاری به عنوان پرداخت شده" : "د ورکړل شوي په توګه نښه کول"}
          >
            <RiMoneyDollarCircleLine />
            <span>{language === 'fa' ? 'پرداخت' : 'ورکړل'}</span>
          </button>
        )}
        <button
          onClick={() => handleTicketStatusUpdate(row.id, 'processing')}
          disabled={updatingTicket === row.id}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
          title={language === 'fa' ? "در حال پردازش" : "په پروسس کې"}
        >
          <RiPlayCircleLine />
          <span>{language === 'fa' ? 'پردازش' : 'پروسس'}</span>
        </button>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => handleTicketStatusUpdate(row.id, 'riding')}
          disabled={updatingTicket === row.id}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
          title={language === 'fa' ? "در حال سفر" : "په سفر کې"}
        >
          <RiBusLine />
          <span>{language === 'fa' ? 'سفر' : 'سفر'}</span>
        </button>
        <button
          onClick={() => handleTicketStatusUpdate(row.id, 'cancel')}
          disabled={updatingTicket === row.id}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
          title={language === 'fa' ? "لغو تکت" : "تکت لغوه کول"}
        >
          <RiCloseCircleLine />
          <span>{language === 'fa' ? 'لغو' : 'لغوه'}</span>
        </button>
      </div>
      {/* Add Print Ticket Button */}
      <div className="flex gap-1 mt-1">
        <button
          onClick={() => handlePrintTicket(row)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
          title={language === 'fa' ? "چاپ تکت" : "تکت چاپول"}
        >
          <RiPrinterLine />
          <span>{language === 'fa' ? 'چاپ تکت' : 'تکت چاپول'}</span>
        </button>
      </div>
    </div>
  )
},
  ];

  // Prepare table data (flatten trips+tickets) - UPDATED with in_processing
  const tableData = filteredTrips.flatMap((trip) =>
    trip.tickets?.map((ticket) => {
      // Use final_price from ticket
      const ticketPrice = parseFloat(ticket.final_price) || 0;
      
      // Convert created_at to Persian date and time
      const created_at_persian = convertToPersianDateTime(ticket.created_at);
      const created_at_date = convertToPersianDate(ticket.created_at);
      const created_at_time = ticket.created_at ? new Date(ticket.created_at).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) : '';
      const created_at_humanized = humanizeTimeDifference(ticket.created_at);
      
      // FIXED: Better status mapping with fallback - UPDATED with in_processing
      const getTicketStatusText = (status) => {
        if (!status) return language === 'fa' ? 'نامشخص' : 'ناجوت';
        
        const statusMap = {
          'stopped': language === 'fa' ? 'متوقف شده' : 'درېدلی',
          'processing': language === 'fa' ? 'در حال پردازش' : 'په پروسس کې',
          'riding': language === 'fa' ? 'در حال سفر' : 'په سفر کې',
          'cancel': language === 'fa' ? 'لغو شده' : 'لغوه شوی',
          'paid': language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی',
          'unpaid': language === 'fa' ? 'پرداخت نشده' : 'نه دی ورکړل شوی',
          'pending': language === 'fa' ? 'در انتظار پرداخت' : 'د پیسو ورکولو په تمه',
          'in_processing': language === 'fa' ? 'در حال پردازش' : 'په پروسس کې',
          'completed': language === 'fa' ? 'تکمیل شده' : 'بشپړ شوی',
          'active': language === 'fa' ? 'فعال' : 'فعال',
          'inactive': language === 'fa' ? 'غیرفعال' : 'غیر فعال',
          'arrived': language === 'fa' ? 'رسیده' : 'رسیدلی'
        };
        
        // Check both exact match and case-insensitive match
        return statusMap[status] || 
               statusMap[status.toLowerCase()] || 
               status || (language === 'fa' ? 'نامشخص' : 'ناجوت');
      };

      // UPDATED: Payment status mapping with in_processing
      const getPaymentStatusText = (status) => {
        if (!status) return language === 'fa' ? 'نامشخص' : 'ناجوت';
        
        const statusMap = {
          'paid': language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی',
          'unpaid': language === 'fa' ? 'پرداخت نشده' : 'نه دی ورکړل شوی',
          'pending': language === 'fa' ? 'در انتظار پرداخت' : 'د پیسو ورکولو په تمه',
          'in_processing': language === 'fa' ? 'در حال پردازش' : 'په پروسس کې'
        };
        
        return statusMap[status] || statusMap[status.toLowerCase()] || status || (language === 'fa' ? 'نامشخص' : 'ناجوت');
      };
      
      return {
        id: ticket.id,
        from: trip.from,
        to: trip.to,
        ticket_departure_date: ticket.departure_date || trip.departure_date,
        departure_time: trip.departure_time,
        created_at_persian: created_at_persian,
        created_at_date: created_at_date,
        created_at_time: created_at_time,
        created_at_humanized: created_at_humanized,
        name: ticket.name,
        last_name: ticket.last_name,
        phone: ticket.phone,
         coupon_code: ticket.coupon_code || ticket.coupon?.code || null,
        bus_type: ticket.bus_type,
        price: ticketPrice,
        seat_numbers: Array.isArray(ticket.seat_numbers) 
          ? ticket.seat_numbers.join(', ') 
          : ticket.seat_number || '',
        payment_method: ticket.payment_method === 'hessabpay' ? (language === 'fa' ? 'حساب پی' : 'حساب پی') : 
                       ticket.payment_method === 'doorpay' ? (language === 'fa' ? ' حضوری ' : 'حضوري') : 
                       ticket.payment_method || '',
        payment_status: getPaymentStatusText(ticket.payment_status),
        // FIXED: Better status handling
        ticket_status: getTicketStatusText(ticket.status),
        bus_details: getBusDetails(ticket.bus_id),
        driver_details: getDriverDetails(ticket.driver_id),
        created_at: ticket.created_at,
        // Add raw status for debugging
        raw_status: ticket.status
      };
    }) || []
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Mobile card data
  const mobileTableData = tableData;

  // Card data with new statistics
  const cardData = [
    {
      title: language === 'fa' ? 'تکت های امروز' : 'ننني تکتونه',
      value: stats.todayTickets,
      icon: <RiCalendarEventLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-700',
    },
    {
      title: language === 'fa' ? 'مجموع تکت ها' : 'ټول تکتونه',
      value: stats.totalTickets,
      icon: <RiFilterLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-green-500 to-green-700',
    },
    {
      title: language === 'fa' ? 'تعداد سفرها' : 'د سفرونو شمېر',
      value: stats.totalTrips,
      icon: <RiBusLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
    },
    
  ];

  // Mobile Ticket Card Component
  const MobileTicketCard = ({ ticket, isSelected, onSelect }) => (
    <div 
      className={`bg-white rounded-lg shadow-md border-2 p-4 mb-4 transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {/* Selection checkbox */}
      <div className="flex justify-between items-start mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(ticket.id)}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 rounded-full text-xs ${
            ticket.payment_status === (language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی') ? 'bg-green-100 text-green-800' : 
            ticket.payment_status === (language === 'fa' ? 'در انتظار پرداخت' : 'د پیسو ورکولو په تمه') ? 'bg-yellow-100 text-yellow-800' : 
            ticket.payment_status === (language === 'fa' ? 'در حال پردازش' : 'په پروسس کې') ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
          }`}>
            {ticket.payment_status}
          </span>
          <span className="text-green-600 font-bold text-sm mt-1">
            {ticket.price ? `${ticket.price.toLocaleString()} ${language === 'fa' ? 'افغانی' : 'افغانۍ'}` : (language === 'fa' ? 'نامشخص' : 'ناجوت')}
          </span>
        </div>
      </div>

      {/* Route Information */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
        <div className="text-center flex-1">
          <RiMapPinLine className="text-red-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-gray-800">{ticket.from}</div>
          <div className="text-xs text-gray-600">{language === 'fa' ? 'مبدا' : 'سرچینه'}</div>
        </div>
        <div className="mx-2">
          <RiRoadsterLine className="text-blue-500" />
        </div>
        <div className="text-center flex-1">
          <RiMapPinLine className="text-green-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-gray-800">{ticket.to}</div>
          <div className="text-xs text-gray-600">{language === 'fa' ? 'مقصد' : 'منزل'}</div>
        </div>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <RiCalendarEventLine className="text-purple-500" />
          <span>{ticket.ticket_departure_date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <RiTimeLine className="text-orange-500" />
          <span>{formatTimeForDisplay(ticket.departure_time)}</span>
        </div>
      </div>

      {/* Created at information */}
      <div className="bg-blue-50 p-2 rounded mb-3">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <RiCalendarEventLine />
          <span>{language === 'fa' ? 'ایجاد شده:' : 'جوړ شوی:'} {ticket.created_at_humanized}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-700 mt-1">
          <RiTimeLine />
          <span>{language === 'fa' ? 'ساعت:' : 'وخت:'} {ticket.created_at_time}</span>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <RiUserLine className="text-gray-500" />
          <span className="text-sm">{ticket.name} {ticket.last_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <RiPhoneLine className="text-gray-500" />
          <span className="text-sm">{ticket.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <RiUserAddLine className="text-gray-500" />
          <span className="text-sm">{language === 'fa' ? 'سیت:' : 'چوکۍ:'} {ticket.seat_numbers}</span>
        </div>
        <div className="flex items-center gap-2">
          <RiBusLine className="text-gray-500" />
          <span className="text-sm">{language === 'fa' ? 'نوع:' : 'ډول:'} {ticket.bus_type}</span>
        </div>
      </div>

      {/* Assignment Status */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className={`p-2 rounded text-center ${
          ticket.bus_details !== (language === 'fa' ? 'انتساب نشده' : 'نه دی ټاکل شوی') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div>{language === 'fa' ? 'بس' : 'بس'}</div>
          <div className="font-bold">{ticket.bus_details}</div>
        </div>
        <div className={`p-2 rounded text-center ${
          ticket.driver_details !== (language === 'fa' ? 'انتساب نشده' : 'نه دی ټاکل شوی') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div>{language === 'fa' ? 'راننده' : 'چلوونکی'}</div>
          <div className="font-bold">{ticket.driver_details}</div>
        </div>
      </div>

      {/* Action Buttons for Mobile */}
      <div className="flex flex-wrap gap-2">
        {ticket.payment_status !== (language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی') && (
          <button
            onClick={() => handleTicketStatusUpdate(ticket.id, 'paid')}
            disabled={updatingTicket === ticket.id}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
          >
            <RiMoneyDollarCircleLine />
            {language === 'fa' ? 'پرداخت' : 'ورکړل'}
          </button>
        )}
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'processing')}
          disabled={updatingTicket === ticket.id}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
          >
          <RiPlayCircleLine />
          {language === 'fa' ? 'پردازش' : 'پروسس'}
        </button>
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'riding')}
          disabled={updatingTicket === ticket.id}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
        >
          <RiBusLine />
          {language === 'fa' ? 'سفر' : 'سفر'}
        </button>
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'cancel')}
          disabled={updatingTicket === ticket.id}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
        >
          <RiCloseCircleLine />
          {language === 'fa' ? 'لغو' : 'لغوه'}
        </button>
      </div>
    </div>
  );

  // Modal handlers
  const handleOpenSeatModal = (trip) => {
    setSelectedTripForSeats(trip);
    setSelectedBusTypeForSeats('');
    setSeatModalOpen(true);
  };

  const handleCloseSeatModal = () => {
    setSeatModalOpen(false);
    setSelectedTripForSeats(null);
    setSelectedBusTypeForSeats('');
  };

  const handleBusTypeChange = (busType) => {
    setSelectedBusTypeForSeats(busType);
  };

  return (
    <>
      <DashboardLayout>
        {/* Main container with proper scrolling */}
        
        <div className="min-h-screen bg-gray-50">
          <div className="p-4 md:p-6 space-y-6 w-full" dir="rtl">
            {/* Toast Notification */}
            {toast.show && (
              <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
                toast.type === "error" ? "bg-red-500" : "bg-green-500"
              } text-white`}>
                {toast.type === "error" ? (
                  <RiCloseLine className="text-xl" />
                ) : (
                  <RiCheckLine className="text-xl" />
                )}
                <span>{toast.message}</span>
              </div>
            )}

            {/* Enhanced Filter Section - Made scrollable */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[#0B2A5B] text-lg flex items-center gap-2">
                  <RiFilterLine />
                  {language === 'fa' ? 'فیلتر تکت‌ها' : 'د تکتونو فیلتر'}
                </h2>
                
                <div className="flex gap-2">
                  {/* Chalan Manager Button */}
                  <button
                    onClick={() => setShowChalanManager(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <RiFileListLine />
                    {language === 'fa' ? 'مدیریت چالان‌ها' : 'د چالانونو مدیریت'} ({chalans.length})
                  </button>
                  
                  {/* Chalan History Button */}
                  <button
                    onClick={() => setShowChalanHistory(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <RiHistoryLine />
                    {language === 'fa' ? 'تاریخچه چالان‌ها' : 'د چالانونو تاریخ'}
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <div className="flex flex-nowrap gap-3 pb-2 min-w-max">
                  {/* Year Filter */}
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'سال' : 'کال'}</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'همه سال‌ها' : 'ټول کالونه'}</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Month Filter */}
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'ماه' : 'میاشت'}</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'همه ماه‌ها' : 'ټولې میاشتې'}</option>
                      {Object.entries(afghanMonths).map(([num, name]) => (
                        <option key={num} value={num.padStart(2, '0')}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Day Filter */}
                  <div className="flex flex-col min-w-[100px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'روز' : 'ورځ'}</label>
                    <input
                      type="number"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                      placeholder={language === 'fa' ? 'روز' : 'ورځ'}
                      min="1"
                      max="31"
                    />
                  </div>
                  
                  {/* From Filter */}
                  <div className="flex flex-col min-w-[150px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'مبدا' : 'سرچینه'}</label>
                    <select
                      value={selectedFrom}
                      onChange={(e) => setSelectedFrom(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'همه مبداها' : 'ټولې سرچینې'}</option>
                      {uniqueFromLocations.map((location, index) => (
                        <option key={index} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* To Filter */}
                  <div className="flex flex-col min-w-[150px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'مقصد' : 'منزل'}</label>
                    <select
                      value={selectedTo}
                      onChange={(e) => setSelectedTo(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'همه مقصدها' : 'ټول منزلونه'}</option>
                      {uniqueToLocations.map((location, index) => (
                        <option key={index} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Bus Type Filter */}
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'نوع بس' : 'د بس ډول'}</label>
                    <select
                      value={selectedBusType}
                      onChange={(e) => setSelectedBusType(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'همه انواع' : 'ټول ډولونه'}</option>
                      <option value="VIP">VIP</option>
                      <option value="580">580</option>
                    </select>
                  </div>
                  
                  {/* Payment Status Filter - UPDATED with in_processing */}
                  <div className="flex flex-col min-w-[140px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'وضعیت پرداخت' : 'د پیسو ورکولو حالت'}</label>
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'همه وضعیت‌ها' : 'ټول حالتونه'}</option>
                      <option value="paid">{language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی'}</option>
                      <option value="unpaid">{language === 'fa' ? 'پرداخت نشده' : 'نه دی ورکړل شوی'}</option>
                      <option value="pending">{language === 'fa' ? 'در انتظار پرداخت' : 'د پیسو ورکولو په تمه'}</option>
                      <option value="in_processing">{language === 'fa' ? 'در حال پردازش' : 'په پروسس کې'}</option>
                    </select>
                  </div>
                  
                  {/* Payment Method Filter */}
                  <div className="flex flex-col min-w-[140px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'روش پرداخت' : 'د پیسو ورکولو طریقه'}</label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'همه روش‌ها' : 'ټولې طریقي'}</option>
                      <option value="hessabpay">{language === 'fa' ? 'حساب پی' : 'حساب پی'}</option>
                      <option value="doorpay">{language === 'fa' ? 'پرداخت درب' : 'دربار پرداخت'}</option>
                    </select>
                  </div>
                  
                  {/* Time Filter - Hour */}
                  <div className="flex flex-col min-w-[100px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'ساعت' : 'ساعت'}</label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'ساعت' : 'ساعت'}</option>
                      {hourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Time Filter - Minute */}
                  <div className="flex flex-col min-w-[100px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'دقیقه' : 'دقیقې'}</label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'دقیقه' : 'دقیقې'}</option>
                      {minuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Time Filter - Period */}
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'قسمت روز' : 'د ورځې برخه'}</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">{language === 'fa' ? 'همه' : 'ټول'}</option>
                      <option value="AM">{language === 'fa' ? 'صبح (ق.ظ)' : 'سهار (ق.ظ)'}</option>
                      <option value="PM">{language === 'fa' ? 'شب (ب.ظ)' : 'ماښام (ب.ظ)'}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                <div className="text-sm text-[#0B2A5B]">
                  {filteredTrips.length} {language === 'fa' ? 'سفر یافت شد •' : 'سفر وموندل شو •'} {tableData.length} {language === 'fa' ? 'تکت •' : 'تکت •'} {selectedTickets.length} {language === 'fa' ? 'تکت انتخاب شده' : 'تکت ټاکل شوی'}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={resetFilters}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 text-sm justify-center"
                  >
                    <RiCloseLine />
                    {language === 'fa' ? 'حذف همه فیلترها' : 'ټول فیلترونه لرې کړئ'}
                  </button>
                  
                  {/* NEW: Create Chalan Button */}
                  {selectedTickets.length > 0 && (
                    <button
                      onClick={handleCreateChalan}
                      disabled={creatingChalan}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 justify-center"
                    >
                      {creatingChalan ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {language === 'fa' ? 'در حال ایجاد...' : 'د جوړولو په حال کې...'}
                        </>
                      ) : (
                        <>
                          <RiAddLine />
                          {language === 'fa' ? 'ایجاد چالان' : 'چالان جوړول'} ({selectedTickets.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cards Section - Made scrollable */}
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4 min-w-max">
                {cardData.map((card, index) => (
                  <div key={index} className={`rounded-xl shadow-lg text-white p-4 ${card.color} transition-transform hover:scale-105 min-w-[200px]`}>
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold mb-2">{card.value}</h3>
                        <p className="text-xs opacity-90">{card.title}</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-2 rounded-full flex-shrink-0 ml-2">
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Combined Assignment Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-blue-500 w-full">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                  <RiUserStarLine className="text-xl md:text-2xl text-blue-600" />
                </div>
                <h3 className="font-bold text-base md:text-lg text-[#0B2A5B]">{language === 'fa' ? 'انتساب راننده و بس' : 'د چلوونکی او بس ټاکل'}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                {/* Driver Selection with Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'fa' ? 'راننده' : 'چلوونکی'}</label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <RiSearchLine />
                    </div>
                    <input
                      type="text"
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      placeholder={language === 'fa' ? 'جستجوی راننده...' : 'د چلوونکی لټون...'}
                      className="w-full border p-2 md:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10"
                    />
                  </div>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full border p-2 md:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mt-2"
                  >
                    <option value="">{language === 'fa' ? 'انتخاب راننده (اختیاری)' : 'د چلوونکی ټاکل (اختیاري)'}</option>
                    {filteredDrivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} {driver.father_name} - {driver.phone} {driver.bus_number_plate ? `(${driver.bus_number_plate})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Bus Selection with Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'fa' ? 'بس' : 'بس'}</label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <RiSearchLine />
                    </div>
                    <input
                      type="text"
                      value={busSearch}
                      onChange={(e) => setBusSearch(e.target.value)}
                      placeholder={language === 'fa' ? 'جستجوی نمبر پلیت...' : 'د پلیټ نمبر لټون...'}
                      className="w-full border p-2 md:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10"
                    />
                  </div>
                  <select
                    value={selectedBus}
                    onChange={(e) => setSelectedBus(e.target.value)}
                    className="w-full border p-2 md:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mt-2"
                  >
                    <option value="">{language === 'fa' ? 'انتخاب بس (اختیاری)' : 'د بس ټاکل (اختیاري)'}</option>
                    {filteredBuses.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.number_plate}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-gray-600 text-sm">
                  {selectedTickets.length} {language === 'fa' ? 'تکت انتخاب شده است' : 'تکت ټاکل شوی دی'}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <button 
                    onClick={handlePrint}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center w-full sm:w-auto"
                  >
                    {language === 'fa' ? 'چاپ تکت‌ها' : 'تکتونه چاپول'}
                    <RiPrinterLine />
                  </button>
                  
                  <button 
                    onClick={handleAssignBusAndDriver}
                    disabled={assigning || (!selectedBus && !selectedDriver) || selectedTickets.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg text-sm transition flex items-center gap-2 justify-center w-full sm:w-auto"
                  >
                    {assigning ? (language === 'fa' ? "در حال انتساب..." : "د ټاکلو په حال کې...") : (language === 'fa' ? "انتساب" : "ټاکل")}
                    <RiCheckLine />
                  </button>
                </div>
              </div>
            </div>

            {/* Chalan Print Section - Show fetched chalans instead of static ones */}
            {chalans.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-purple-500 w-full">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                    <RiPrinterLine className="text-xl md:text-2xl text-purple-600" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-[#0B2A5B]">{language === 'fa' ? 'چاپ چالان‌ها' : 'د چالانونو چاپ'} ({chalans.length})</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chalans.map((chalan) => {
                    // Check if tickets are loaded and not empty
                    const hasTickets = chalan.tickets && chalan.tickets.length > 0;
                    
                    if (!hasTickets) {
                      return (
                        <div key={chalan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-[#0B2A5B]">
                              {language === 'fa' ? 'چالان #' : 'چالان #'}{chalan.chalan_number}
                            </h4>
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              {language === 'fa' ? 'در حال بارگذاری...' : 'د پورته کولو په حال کې...'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{language === 'fa' ? 'تعداد تکت‌ها:' : 'د تکتونو شمېر:'} {chalan.ticket_ids?.length || 0}</p>
                            <p>{language === 'fa' ? 'در حال بارگذاری اطلاعات تکت‌ها...' : 'د تکتونو معلومات په پورته کولو کې...'}</p>
                          </div>
                        </div>
                      );
                    }
                    
                    const firstTicket = chalan.tickets[0];
                    const busType = firstTicket.bus_type;
                    
                    // Calculate chalan details
                    const totalSeats = chalan.tickets.reduce((total, ticket) => {
                      const seatCount = Array.isArray(ticket.seat_numbers) 
                        ? ticket.seat_numbers.length 
                        : (ticket.seat_number ? 1 : 0);
                      return total + seatCount;
                    }, 0);
                    
                    const totalPrice = chalan.tickets.reduce((total, ticket) => {
                      return total + (parseFloat(ticket.final_price) || 0);
                    }, 0);
                    
                    return (
                      <div key={chalan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-[#0B2A5B]">
                            {firstTicket.trip?.from || (language === 'fa' ? 'نامشخص' : 'ناجوت')} - {firstTicket.trip?.to || (language === 'fa' ? 'نامشخص' : 'ناجوت')}
                          </h4>
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                              {chalan.chalan_number}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              busType === 'VIP' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {busType}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex justify-between">
                            <span>{language === 'fa' ? 'تاریخ:' : 'نېټه:'}</span>
                            <span>{firstTicket.departure_date || (language === 'fa' ? 'نامشخص' : 'ناجوت')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === 'fa' ? 'زمان:' : 'وخت:'}</span>
                            <span>{formatTimeForDisplay(firstTicket.trip?.departure_time)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === 'fa' ? 'مسافرین:' : 'مسافرین:'}</span>
                            <span>{chalan.tickets.length} {language === 'fa' ? 'نفر' : 'کسان'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === 'fa' ? 'چوکی‌ها:' : 'چوکۍ:'}</span>
                            <span>{totalSeats} {language === 'fa' ? 'چوکی' : 'چوکۍ'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === 'fa' ? 'مجموع مبلغ:' : 'ټوله مجموعه:'}</span>
                            <span>{totalPrice.toLocaleString()} {language === 'fa' ? 'افغانی' : 'افغانۍ'}</span>
                          </div>
                        </div>

                        {/* NEW: Add tickets to existing chalan section */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-sm text-gray-700">{language === 'fa' ? 'افزودن تکت به این چالان' : 'په دې چالان کې تکت اضافه کول'}</h5>
                            <button
                              onClick={() => handleSelectAllForChalan(chalan.id)}
                              className="text-blue-600 text-xs flex items-center gap-1"
                            >
                              <RiCheckLine />
                              {selectedTicketsForExistingChalan[chalan.id]?.length === tableData.length ? 
                                (language === 'fa' ? 'لغو انتخاب همه' : 'ټول انتخابونه لغوه کړئ') : 
                                (language === 'fa' ? 'انتخاب همه' : 'ټول وټاکئ')
                              }
                            </button>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2">
                            {selectedTicketsForExistingChalan[chalan.id]?.length || 0} {language === 'fa' ? 'تکت انتخاب شده' : 'تکت ټاکل شوی'}
                          </div>
                          
                          <button
                            onClick={() => handleAddTicketsToChalan(chalan.id)}
                            disabled={!selectedTicketsForExistingChalan[chalan.id]?.length}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-1 px-3 rounded text-xs transition flex items-center gap-1 justify-center w-full"
                          >
                            <RiAddLine />
                            {language === 'fa' ? 'افزودن تکت‌های انتخاب شده' : 'ټاکل شوي تکتونه اضافه کړئ'}
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handlePrintChalan(chalan)}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center"
                          >
                            <RiPrinterLine />
                            {language === 'fa' ? 'چاپ' : 'چاپ'}
                          </button>
                          
                          <button
                            onClick={() => handleUpdateChalan(chalan)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center"
                          >
                            <RiEditLine />
                            {language === 'fa' ? 'ویرایش' : 'سمون'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteChalan(chalan.id)}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center"
                          >
                            <RiDeleteBinLine />
                            {language === 'fa' ? 'حذف' : 'ړنګول'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {chalans.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'fa' ? 'هیچ چالانی ایجاد نشده است' : 'هیڅ چالان نه دی جوړ شوی'}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Cards View */}
            {isMobile ? (
              <div className="bg-white rounded-lg shadow-md p-4 w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-[#0B2A5B]">{language === 'fa' ? 'تکت‌ها' : 'تکتونه'} ({mobileTableData.length})</h3>
                  <button
                    onClick={handleSelectAllMobile}
                    className="text-blue-600 text-sm flex items-center gap-1"
                  >
                    <RiCheckLine />
                    {selectedTickets.length === mobileTableData.length ? 
                      (language === 'fa' ? 'لغو انتخاب همه' : 'ټول انتخابونه لغوه کړئ') : 
                      (language === 'fa' ? 'انتخاب همه' : 'ټول وټاکئ')
                    }
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 mt-2">{language === 'fa' ? 'در حال بارگذاری تکت‌ها...' : 'تکتونه په پورته کولو کې...'}</p>
                  </div>
                ) : mobileTableData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'fa' ? 'هیچ تکتی یافت نشد' : 'هیڅ تکت ونه موندل شو'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mobileTableData.map((ticket) => (
                      <MobileTicketCard
                        key={ticket.id}
                        ticket={ticket}
                        isSelected={selectedTickets.includes(ticket.id)}
                        onSelect={handleTicketSelection}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Table View - Made scrollable */
              <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-x-auto">
                <div ref={tableRef} className="min-w-[1400px]">
                  <CustomTable
                    title={`${language === 'fa' ? 'تکت‌های بس‌ها' : 'د بسونو تکتونه'} (${tableData.length})`}
                    columns={columns}
                    data={tableData}
                    selectable={true}
                    onSelectionChange={handleSelectionChange}
                    onView={(row) => console.log("View", row)}
                    onEdit={(row) => console.log("Assign Driver/Bus", row)}
                    onDelete={(row) => console.log("Delete", row)}
                  /> 
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seat Modal */}
        <SeatModal 
          isOpen={seatModalOpen}
          onClose={handleCloseSeatModal}
          selectedTrip={selectedTripForSeats}
          selectedBusType={selectedBusTypeForSeats}
          onBusTypeChange={handleBusTypeChange}
        />

        {/* Chalan History Modal */}
        <ChalanHistoryModal
          isOpen={showChalanHistory}
          onClose={() => setShowChalanHistory(false)}
          filters={chalanHistoryFilters}
          onFilterChange={setChalanHistoryFilters}
          arrivedChalans={arrivedChalans}
        />

        {/* Print Ticket Modal */}
        <TicketPrint 
          isOpen={printTicketModal}
          onClose={() => setPrintTicketModal(false)}
          ticket={selectedTicketForPrint}
        />

        {/* NEW: Update Chalan Modal */}
        <UpdateChalanModal
          isOpen={showUpdateChalanModal}
          onClose={() => {
            setShowUpdateChalanModal(false);
            setSelectedChalanForUpdate(null);
          }}
          chalan={selectedChalanForUpdate}
          onUpdate={handleChalanUpdateSuccess}
          allTickets={allTickets}
        />

        {/* Chalan Manager Modal */}
        {showChalanManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">{language === 'fa' ? 'مدیریت چالان‌ها' : 'د چالانونو مدیریت'} ({chalans.length})</h3>
                <button
                  onClick={() => setShowChalanManager(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  {chalans.map((chalan) => {
                    const hasTickets = chalan.tickets && chalan.tickets.length > 0;
                    
                    return (
                      <div key={chalan.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-[#0B2A5B]">{language === 'fa' ? 'چالان شماره:' : 'چالان شمېره:'} {chalan.chalan_number}</h4>
                            <p className="text-sm text-gray-600">
                              {language === 'fa' ? 'ایجاد شده در:' : 'په کې جوړ شوی:'} {convertToPersianDateTime(chalan.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {hasTickets && (
                              <button
                                onClick={() => handlePrintChalan(chalan)}
                                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg text-sm transition"
                                title={language === 'fa' ? "چاپ چالان" : "چالان چاپول"}
                              >
                                <RiPrinterLine />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateChalan(chalan)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-sm transition"
                              title={language === 'fa' ? "ویرایش چالان" : "چالان سمول"}
                              >
                              <RiEditLine />
                            </button>
                            <button
                              onClick={() => handleDeleteChalan(chalan.id)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm transition"
                              title={language === 'fa' ? "حذف چالان" : "چالان ړنګول"}
                            >
                              <RiDeleteBinLine />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p>{language === 'fa' ? 'تعداد تکت‌ها:' : 'د تکتونو شمېر:'} {chalan.ticket_ids?.length || 0}</p>
                          <p>{language === 'fa' ? 'شناسه تکت‌ها:' : 'د تکتونو پېژندښتونه:'} {chalan.ticket_ids?.join(', ') || (language === 'fa' ? 'نامشخص' : 'ناجوت')}</p>
                          {hasTickets ? (
                            <>
                              <p>{language === 'fa' ? 'مسافرین:' : 'مسافرین:'} {chalan.tickets.map(t => `${t.name} ${t.last_name}`).join(', ')}</p>
                              <p>{language === 'fa' ? 'مبلغ کل:' : 'ټوله مجموعه:'} {chalan.tickets.reduce((sum, t) => sum + (parseFloat(t.final_price) || 0), 0).toLocaleString()} {language === 'fa' ? 'افغانی' : 'افغانۍ'}</p>
                            </>
                          ) : (
                            <p className="text-yellow-600">{language === 'fa' ? 'در حال بارگذاری اطلاعات تکت‌ها...' : 'د تکتونو معلومات په پورته کولو کې...'}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {chalans.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {language === 'fa' ? 'هیچ چالانی ایجاد نشده است' : 'هیڅ چالان نه دی جوړ شوی'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

export default ReadyTrips;