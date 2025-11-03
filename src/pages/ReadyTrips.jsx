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
  RiDeleteBinLine
} from 'react-icons/ri';
import { GiSteeringWheel } from "react-icons/gi";
import DashboardLayout from "../components/DashboardLayout";

// Chalan API service
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

  updateChalan: async (chalanId, ticketIds) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await axios.put(`${API_BASE_URL}/api/chalans/${chalanId}`, {
        ticket_ids: ticketIds
      });
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
    if (seatsLoading) return <div className="text-center py-10">در حال بارگذاری چوکیها...</div>;
    
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
            <h1 className="ml-[100px] text-lg font-semibold">دروازه</h1>
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
                      دروازه
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
    if (seatsLoading) return <div className="text-center py-10">در حال بارگذاری چوکیها...</div>;

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
          <span className="legend-box selected"></span> انتخاب شده
          <span className="legend-box empty"></span> خالی
          <span className="legend-box occupied"></span> پُر
        </div>

        {/* Bus Layout */}
        <div className="bus-layout">
          <div className="driver-door-row">
            <div className="door1">دروازه</div>
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
                if (seat === "DOOR") return <div key={i} className="door tall">دروازه</div>;

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
            نمایش چوکی ها - {selectedTrip.from} به {selectedTrip.to} - {selectedBusType}
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
              نمایش چوکی   های   VIP
            </button>
            <button
              onClick={() => onBusTypeChange('580')}
              className={`px-4 py-2 rounded-lg ${
                selectedBusType === '580' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              نمایش چوکی های 580
            </button>
          </div>
          
          {!selectedBusType ? (
            <div className="text-center py-8 text-gray-500">
              لطفا نوع بس را انتخاب کنید
            </div>
          ) : selectedBusType === 'VIP' ? renderVipLayout() : 
             selectedBusType === '580' ? render580Layout() : 
             <div>نوع بس انتخاب نشده است</div>}
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
          from: ticket.trip?.from || 'نامشخص',
          to: ticket.trip?.to || 'نامشخص',
          bus_type: ticket.bus_type,
          tickets: [],
          total_price: 0,
          ticket_count: 0,
          arrived_at: ticket.updated_at || ticket.created_at,
          departure_time: convertTo12HourPersian(ticket.trip?.departure_time) || 'نامشخص',
          departure_date: ticket.departure_date || 'نامشخص',
          driver_name: ticket.driver ? `${ticket.driver.name} ${ticket.driver.father_name}` : 'نامشخص'
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
        
        // Parse the time string - handle Persian format
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
  }, [filters, arrivedChalans]);

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
          <h3 className="text-lg font-bold">تاریخچه تکت‌های رسیده</h3>
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
            <h4 className="font-bold mb-3">فیلترها</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Year Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">سال</label>
                <select
                  value={filters.year}
                  onChange={(e) => onFilterChange({...filters, year: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">همه سال‌ها</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {/* Month Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">ماه</label>
                <select
                  value={filters.month}
                  onChange={(e) => onFilterChange({...filters, month: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">همه ماه‌ها</option>
                  {Object.entries(afghanMonths).map(([num, name]) => (
                    <option key={num} value={num}>{name}</option>
                  ))}
                </select>
              </div>
              
              {/* Day Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">روز</label>
                <input
                  type="number"
                  value={filters.day}
                  onChange={(e) => onFilterChange({...filters, day: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                  placeholder="روز"
                  min="1"
                  max="31"
                />
              </div>
              
              {/* Bus Type Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">نوع بس</label>
                <select
                  value={filters.busType}
                  onChange={(e) => onFilterChange({...filters, busType: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">همه انواع</option>
                  <option value="VIP">VIP</option>
                  <option value="580">580</option>
                </select>
              </div>

              {/* From Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">مبدا</label>
                <select
                  value={filters.from}
                  onChange={(e) => onFilterChange({...filters, from: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">همه مبداها</option>
                  {[...new Set(arrivedChalans.map(t => t.trip?.from).filter(Boolean))].map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* To Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-1">مقصد</label>
                <select
                  value={filters.to}
                  onChange={(e) => onFilterChange({...filters, to: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">همه مقصدها</option>
                  {[...new Set(arrivedChalans.map(t => t.trip?.to).filter(Boolean))].map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Filter - Hour */}
              <div>
                <label className="text-sm text-gray-600 mb-1">ساعت</label>
                <select
                  value={filters.hour}
                  onChange={(e) => onFilterChange({...filters, hour: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">ساعت</option>
                  {hourOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter - Minute */}
              <div>
                <label className="text-sm text-gray-600 mb-1">دقیقه</label>
                <select
                  value={filters.minute}
                  onChange={(e) => onFilterChange({...filters, minute: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">دقیقه</option>
                  {minuteOptions.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter - Period */}
              <div>
                <label className="text-sm text-gray-600 mb-1">قسمت روز</label>
                <select
                  value={filters.period}
                  onChange={(e) => onFilterChange({...filters, period: e.target.value})}
                  className="border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">همه</option>
                  <option value="AM">صبح (ق.ظ)</option>
                  <option value="PM">شب (ب.ظ)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-600">
                {filteredHistory.length} چالان یافت شد
              </span>
              <button
                onClick={resetFilters}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
              >
                حذف فیلترها
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
                    رسیده
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">تاریخ حرکت:</span>
                    <div>{chalan.departure_date}</div>
                  </div>
                  <div>
                    <span className="font-medium">زمان حرکت:</span>
                    <div>{chalan.departure_time}</div>
                  </div>
                  <div>
                    <span className="font-medium">تعداد مسافرین:</span>
                    <div>{chalan.ticket_count} نفر</div>
                  </div>
                  <div>
                    <span className="font-medium">مجموع مبلغ:</span>
                    <div>{chalan.total_price?.toLocaleString()} افغانی</div>
                  </div>
                </div>
                
                {chalan.driver_name && chalan.driver_name !== 'نامشخص' && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">راننده:</span> {chalan.driver_name}
                  </div>
                )}
              </div>
            ))}
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                هیچ چالانی یافت نشد
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

  // Create a ref for the table to print
  const tableRef = useRef();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      setChalans(data.chalans || []);
    } catch (error) {
      console.error("Error fetching chalans:", error);
      showToast("خطا در بارگذاری چالان‌ها", "error");
    }
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
    if (!dateString) return "نامشخص";
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'همین الان';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} دقیقه قبل`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ساعت قبل`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} روز قبل`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ماه قبل`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} سال قبل`;
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
      showToast("لطفا حداقل یک تکت انتخاب کنید", "error");
      return;
    }

    // Validate that all selected tickets have the same bus type
    const selectedTicketData = tableData.filter(ticket => selectedTickets.includes(ticket.id));
    const busTypes = [...new Set(selectedTicketData.map(ticket => ticket.bus_type))];
    
    if (busTypes.length > 1) {
      showToast("خطا: نمی‌توانید تکت‌های VIP و 580 را با هم مخلوط کنید. لطفا تکت‌های هم نوع را انتخاب کنید.", "error");
      return;
    }

    setCreatingChalan(true);
    
    try {
      const result = await chalanAPI.createChalan(selectedTickets);
      showToast(`چالان شماره ${result.chalan?.chalan_number} با موفقیت ایجاد شد`);
      
      // Refresh chalans list
      await fetchChalans();
      
      // Clear selection
      setSelectedTickets([]);
      
    } catch (error) {
      console.error("Error creating chalan:", error);
      if (error.response?.data?.message) {
        showToast(error.response.data.message, "error");
      } else {
        showToast("خطا در ایجاد چالان", "error");
      }
    } finally {
      setCreatingChalan(false);
    }
  };

  // NEW: Delete chalan
  const handleDeleteChalan = async (chalanId) => {
    if (!window.confirm("آیا از حذف این چالان اطمینان دارید؟")) {
      return;
    }

    try {
      await chalanAPI.deleteChalan(chalanId);
      showToast("چالان با موفقیت حذف شد");
      
      // Refresh chalans list
      await fetchChalans();
      
    } catch (error) {
      console.error("Error deleting chalan:", error);
      showToast("خطا در حذف چالان", "error");
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
      return `${trip.from}-${trip.to}: ${totalCount} تکت (VIP: ${vipCount}, 580: ${bus580Count})`;
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
        showToast("سفر یافت نشد", "error");
        return;
      }

      const ticketsToMark = trip.tickets?.filter(ticket => 
        ticket.bus_type === busType && ticket.status !== 'arrived'
      ) || [];

      if (ticketsToMark.length === 0) {
        showToast(`هیچ تکت ${busType} برای علامت گذاری یافت نشد`, "error");
        return;
      }

      // Extract ticket IDs
      const ticketIds = ticketsToMark.map(ticket => ticket.id);

      // Mark all tickets as arrived in one API call
      await axios.post(`${API_BASE_URL}/api/tickets/arrived`, {
        ticket_ids: ticketIds
      });
      
      showToast(`تمام تکت‌های ${busType} با موفقیت به وضعیت رسیده تغییر کردند`);
      
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
      showToast("خطا در تغییر وضعیت تکت‌ها", "error");
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
    
    // Filter by payment status
    if (selectedPaymentStatus) {
      filtered = filtered.map(trip => ({
        ...trip,
        tickets: trip.tickets?.filter(ticket => {
          if (selectedPaymentStatus === 'paid') return ticket.payment_status === 'paid';
          if (selectedPaymentStatus === 'unpaid') return ticket.payment_status === 'unpaid';
          if (selectedPaymentStatus === 'pending') return ticket.payment_status === 'pending';
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
        showToast("خطا در بارگذاری بس ها", "error");
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
        showToast("خطا در بارگذاری راننده ها", "error");
      }
    };
    fetchDrivers();
  }, []);

  // Handle assignment of both bus and driver
  const handleAssignBusAndDriver = async () => {
    if (!selectedBus && !selectedDriver) {
      showToast("لطفا حداقل یک بس یا راننده انتخاب کنید", "error");
      return;
    }

    if (selectedTickets.length === 0) {
      showToast("لطفا حداقل یک تکت انتخاب کنید", "error");
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
      
      showToast("انتساب با موفقیت انجام شد");
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
        showToast("یک یا چند تکت یافت نشد", "error");
      } else {
        showToast("خطا در انتساب", "error");
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
      showToast(`وضعیت تکت با موفقیت به ${getStatusText(status)} تغییر کرد`);
      
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
      showToast("خطا در تغییر وضعیت تکت", "error");
    } finally {
      setUpdatingTicket(null);
    }
  };

  // Get status text for display
  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'پرداخت شده';
      case 'processing': return 'در حال پردازش';
      case 'riding': return 'در حال سفر';
      case 'cancel': return 'لغو شده';
      case 'arrived': return 'رسیده';
      default: return status;
    }
  };

  // Helper function to get bus details by ID
  const getBusDetails = (busId) => {
    if (!busId) return "انتساب نشده";
    const bus = buses.find(b => b.id === busId);
    return bus ? `${bus.bus_no} (${bus.number_plate})` : `بس ${busId}`;
  };

  // Helper function to get driver details by ID
  const getDriverDetails = (driverId) => {
    if (!driverId) return "انتساب نشده";
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.name} ${driver.father_name}` : `راننده ${driverId}`;
  };

  // Helper function to get driver phone by ID
  const getDriverPhone = (driverId) => {
    if (!driverId) return "نامشخص";
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.phone : "نامشخص";
  };

  // Helper function to get bus number plate by ID
  const getBusNumberPlate = (busId) => {
    if (!busId) return "نامشخص";
    const bus = buses.find(b => b.id === busId);
    return bus ? bus.number_plate : "نامشخص";
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
  const handlePrintChalan = (trip, busType) => {
    const chalanDetails = getChalanDetailsForTrip(trip, busType);
    
    if (chalanDetails.totalSeats === 0) {
      showToast(`هیچ تکت ${busType} برای چاپ وجود ندارد`, "error");
      return;
    }

    // Get assigned bus and driver details
    const assignedBusId = trip.tickets?.find(t => t.bus_type === busType)?.bus_id;
    const assignedDriverId = trip.tickets?.find(t => t.bus_type === busType)?.driver_id;
    
    const busNumberPlate = getBusNumberPlate(assignedBusId);
    const driverPhone = getDriverPhone(assignedDriverId);
    const driver = drivers.find(d => d.id === assignedDriverId);
    const driverName = driver ? `${driver.name} ` : 'نامشخص';
    const driverFathername = driver ? `${driver.father_name}` : "نامشخص"

    // Find chalan for this trip and bus type
    const chalanForTrip = chalans.find(chalan => 
      chalan.tickets && chalan.tickets.some(ticket => 
        ticket.trip_id === trip.id && ticket.bus_type === busType
      )
    );

    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>چاپ چالان ${busType} - ${trip.from} به ${trip.to}</title>
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
          ${chalanForTrip ? `<div class="chalan-number">${chalanForTrip.chalan_number}</div>` : ''}
          <h1>💼 چالان مسافرتی - ${busType}</h1>
          <div class="header-subtitle">لیست مسافرین</div>
        </div>
        
        <!-- Trip Information - COMPACT -->
        <div class="trip-info-grid">
          <div class="trip-info-row">
            <span class="trip-info-strong">مبدا:</span>
            <span class="trip-info-value">${trip.from}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">مقصد:</span>
            <span class="trip-info-value">${trip.to}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">تاریخ:</span>
            <span class="trip-info-value">${trip.tickets?.[0]?.departure_date || 'نامشخص'}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">زمان حرکت:</span>
            <span class="trip-info-value">${formatTimeForDisplay(trip.departure_time)}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">نوع بس:</span>
            <span class="trip-info-value">${busType}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">نمبر پلیت بس:</span>
            <span class="trip-info-value">${busNumberPlate}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">نام راننده:</span>
            <span class="trip-info-value">${driverName}</span>
          </div>
            <div class="trip-info-row">
            <span class="trip-info-strong">نلم پدر راننده:</span>
            <span class="trip-info-value">${driverFathername}</span>
          </div>

          <div class="trip-info-row">
            <span class="trip-info-strong">شماره تماس راننده:</span>
            <span class="trip-info-value">${driverPhone}</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">تعداد مسافرین:</span>
            <span class="trip-info-value">${chalanDetails.tickets.length} نفر</span>
          </div>
          <div class="trip-info-row">
            <span class="trip-info-strong">تعداد چوکی‌ها:</span>
            <span class="trip-info-value">${chalanDetails.totalSeats}  چوکی</span>
          </div>
        </div>
        
        <!-- Chalan Type Banner -->
        <div class="chalan-type-banner">
          🚌 چالان ${busType} - ${chalanDetails.totalSeats} چوکی      </div>
        
        <!-- Passengers Table -->
        <table>
          <thead>
            <tr>
              <th>شماره</th>
              <th>نام مسافر</th>
              <th>تخلص</th>
              <th>شماره تماس</th>
              <th>نمبر سیت</th>
              <th>قیمت (افغانی)</th>
            </tr>
          </thead>
          <tbody>
            ${chalanDetails.tickets.map((ticket, index) => `
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
            <strong>مجموع کل مبلغ:</strong>
            <span>${chalanDetails.totalPrice.toLocaleString()} افغانی</span>
          </div>
          <div class="price-row">
            <strong>مجموع 2% کمیشن شرکت(۲٪):</strong>
            <span>${chalanDetails.safiChalan.toLocaleString()} افغانی</span>
          </div>
          <div class="price-row price-total">
            <strong>صافی چالان</strong>
            <span>${chalanDetails.netAmount.toLocaleString()} افغانی</span>
          </div>
        </div>
        
        <!-- Signature & Fingerprint - EQUAL HEIGHT AND ALIGNED -->
        <div class="signature-fingerprint-section">
          <!-- Signature Box -->
          <div class="signature-box">
            <div class="signature-title">امضای مسئول</div>
            <div class="signature-bottom">مسئول شرکت</div>
          </div>
          
          <!-- Fingerprint Box -->
          <div class="fingerprint-box">
            <div class="fingerprint-title">انگشت شست راننده</div>
            <div class="fingerprint-bottom">محل انگشت گذاری</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="print-footer">
        
          <p>این سند به صورت خودکار تولید شده است</p>
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
        <title>چاپ تکت‌ها</title>
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
          <h1>لیست تکت‌های بس</h1>
          ${tripInfo ? `
            <div class="trip-info">
              <div><strong>مبدا:</strong> ${tripInfo.from}</div>
              <div><strong>مقصد:</strong> ${tripInfo.to}</div>
              <div><strong>تاریخ حرکت:</strong> ${tripInfo.departure_date}</div>
              <div><strong>زمان حرکت:</strong> ${formatTimeForDisplay(tripInfo.departure_time)}</div>
            </div>
          ` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>نام</th>
              <th>تخلص</th>
              <th>شماره تماس</th>
              <th>نمبر سیت</th>
              <th>نوع بس</th>
              <th>قیمت</th>
              <th>روش پرداخت</th>
              <th>وضعیت پرداخت</th>
              <th>بس</th>
              <th>راننده</th>
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
                <td>${ticket.price ? `${ticket.price.toLocaleString()} افغانی` : 'نامشخص'}</td>
                <td>${ticket.payment_method || ''}</td>
                <td>${ticket.payment_status}</td>
                <td>${ticket.bus_details || ''}</td>
                <td>${ticket.driver_details || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="print-footer">
          <p>تعداد تکت‌ها: ${tableData.length}</p>
          <p>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</p>
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
      header: "از", 
      accessor: "from",
      render: (row) => row.from
    },
    { 
      header: "به", 
      accessor: "to",
      render: (row) => row.to
    },
    { 
      header: "تاریخ حرکت", 
      accessor: "ticket_departure_date",
      render: (row) => row.ticket_departure_date
    },
    { 
      header: "زمان حرکت", 
      accessor: "departure_time",
      render: (row) => formatTimeForDisplay(row.departure_time)
    },
    { 
      header: "تاریخ ایجاد", 
      accessor: "created_at_humanized",
      render: (row) => (
        <div className="text-xs">
          <div>{row.created_at_humanized}</div>
          <div className="text-gray-500">{row.created_at_time}</div>
        </div>
      )
    },

    { 
      header: "نام", 
      accessor: "name",
      render: (row) => row.name
    },
    { 
      header: "تخلص", 
      accessor: "last_name",
      render: (row) => row.last_name
    },
    { 
      header: "شماره تماس", 
      accessor: "phone",
      render: (row) => row.phone
    },
    { 
      header: "نوع بس", 
      accessor: "bus_type",
      render: (row) => row.bus_type
    },
    { 
      header: "قیمت", 
      accessor: "price",
      render: (row) => (
        <span className="font-medium text-green-600">
          {row.price ? `${row.price.toLocaleString()} افغانی` : 'نامشخص'}
        </span>
      )
    },
    { 
      header: "نمبر سیت", 
      accessor: "seat_numbers",
      render: (row) => row.seat_numbers
    },
    { 
      header: "روش پرداخت", 
      accessor: "payment_method",
      render: (row) => row.payment_method
    },
    { 
      header: "وضعیت پرداخت", 
      accessor: "payment_status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.payment_status === 'پرداخت شده' ? 'bg-green-100 text-green-800' : 
          row.payment_status === 'در انتظار پرداخت' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.payment_status}
        </span>
      )
    },
    { 
    header: "کد تخفیف", 
    accessor: "coupon_code",
    render: (row) => (
      <div className="text-center">
        {row.coupon_code ? (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
            {row.coupon_code}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">ندارد</span>
        )}
      </div>
    )
  },
    { 
      header: "وضعیت تکت", 
      accessor: "ticket_status",
      render: (row) => row.ticket_status
    },
    { 
      header: "بس", 
      accessor: "bus_details",
      render: (row) => row.bus_details
    },
    { 
      header: "راننده", 
      accessor: "driver_details",
      render: (row) => row.driver_details
    },
   {
  header: "عملیات",
  accessor: "actions",
  render: (row) => (
    <div className="flex flex-col gap-2 min-w-[150px]">
      <div className="flex gap-1">
        {row.payment_status !== 'پرداخت شده' && (
          <button
            onClick={() => handleTicketStatusUpdate(row.id, 'paid')}
            disabled={updatingTicket === row.id}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
            title="علامت گذاری به عنوان پرداخت شده"
          >
            <RiMoneyDollarCircleLine />
            <span>پرداخت</span>
          </button>
        )}
        <button
          onClick={() => handleTicketStatusUpdate(row.id, 'processing')}
          disabled={updatingTicket === row.id}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
          title="در حال پردازش"
        >
          <RiPlayCircleLine />
          <span>پردازش</span>
        </button>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => handleTicketStatusUpdate(row.id, 'riding')}
          disabled={updatingTicket === row.id}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
          title="در حال سفر"
        >
          <RiBusLine />
          <span>سفر</span>
        </button>
        <button
          onClick={() => handleTicketStatusUpdate(row.id, 'cancel')}
          disabled={updatingTicket === row.id}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
          title="لغو تکت"
        >
          <RiCloseCircleLine />
          <span>لغو</span>
        </button>
      </div>
      {/* Add Print Ticket Button */}
      <div className="flex gap-1 mt-1">
        <button
          onClick={() => handlePrintTicket(row)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 flex-1 justify-center transition-colors"
          title="چاپ تکت"
        >
          <RiPrinterLine />
          <span>چاپ تکت</span>
        </button>
      </div>
    </div>
  )
},
  ];

  // Prepare table data (flatten trips+tickets)
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
      
      // FIXED: Better status mapping with fallback
      const getTicketStatusText = (status) => {
        if (!status) return 'نامشخص';
        
        const statusMap = {
          'stopped': 'متوقف شده',
          'processing': 'در حال پردازش',
          'riding': 'در حال سفر',
          'cancel': 'لغو شده',
          'paid': 'پرداخت شده',
          'unpaid': 'پرداخت نشده',
          'pending': 'در انتظار پرداخت',
          'completed': 'تکمیل شده',
          'active': 'فعال',
          'inactive': 'غیرفعال',
          'arrived': 'رسیده'
        };
        
        // Check both exact match and case-insensitive match
        return statusMap[status] || 
               statusMap[status.toLowerCase()] || 
               status || 'نامشخص';
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
        payment_method: ticket.payment_method === 'hessabpay' ? 'حساب پی' : 
                       ticket.payment_method === 'doorpay' ? ' حضوری ' : 
                       ticket.payment_method || '',
        payment_status: ticket.payment_status === 'paid' ? 'پرداخت شده' : 
                       ticket.payment_status === 'pending' ? 'در انتظار پرداخت' : 'پرداخت نشده',
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
      title: 'تکت های امروز',
      value: stats.todayTickets,
      icon: <RiCalendarEventLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-700',
    },
    {
      title: 'مجموع تکت ها',
      value: stats.totalTickets,
      icon: <RiFilterLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-green-500 to-green-700',
    },
    {
      title: 'تعداد سفرها',
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
            ticket.payment_status === 'پرداخت شده' ? 'bg-green-100 text-green-800' : 
            ticket.payment_status === 'در انتظار پرداخت' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {ticket.payment_status}
          </span>
          <span className="text-green-600 font-bold text-sm mt-1">
            {ticket.price ? `${ticket.price.toLocaleString()} افغانی` : 'نامشخص'}
          </span>
        </div>
      </div>

      {/* Route Information */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
        <div className="text-center flex-1">
          <RiMapPinLine className="text-red-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-gray-800">{ticket.from}</div>
          <div className="text-xs text-gray-600">مبدا</div>
        </div>
        <div className="mx-2">
          <RiRoadsterLine className="text-blue-500" />
        </div>
        <div className="text-center flex-1">
          <RiMapPinLine className="text-green-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-gray-800">{ticket.to}</div>
          <div className="text-xs text-gray-600">مقصد</div>
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
          <span>ایجاد شده: {ticket.created_at_humanized}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-700 mt-1">
          <RiTimeLine />
          <span>ساعت: {ticket.created_at_time}</span>
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
          <span className="text-sm">سیت: {ticket.seat_numbers}</span>
        </div>
        <div className="flex items-center gap-2">
          <RiBusLine className="text-gray-500" />
          <span className="text-sm">نوع: {ticket.bus_type}</span>
        </div>
      </div>

      {/* Assignment Status */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className={`p-2 rounded text-center ${
          ticket.bus_details !== 'انتساب نشده' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div>بس</div>
          <div className="font-bold">{ticket.bus_details}</div>
        </div>
        <div className={`p-2 rounded text-center ${
          ticket.driver_details !== 'انتساب نشده' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div>راننده</div>
          <div className="font-bold">{ticket.driver_details}</div>
        </div>
      </div>

      {/* Action Buttons for Mobile */}
      <div className="flex flex-wrap gap-2">
        {ticket.payment_status !== 'پرداخت شده' && (
          <button
            onClick={() => handleTicketStatusUpdate(ticket.id, 'paid')}
            disabled={updatingTicket === ticket.id}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
          >
            <RiMoneyDollarCircleLine />
            پرداخت
          </button>
        )}
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'processing')}
          disabled={updatingTicket === ticket.id}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
        >
          <RiPlayCircleLine />
          پردازش
        </button>
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'riding')}
          disabled={updatingTicket === ticket.id}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
        >
          <RiBusLine />
          سفر
        </button>
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'cancel')}
          disabled={updatingTicket === ticket.id}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
        >
          <RiCloseCircleLine />
          لغو
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
                  فیلتر تکت‌ها
                </h2>
                
                <div className="flex gap-2">
                  {/* Chalan Manager Button */}
                  <button
                    onClick={() => setShowChalanManager(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <RiFileListLine />
                    مدیریت چالان‌ها ({chalans.length})
                  </button>
                  
                  {/* Chalan History Button */}
                  <button
                    onClick={() => setShowChalanHistory(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <RiHistoryLine />
                    تاریخچه چالان‌ها
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <div className="flex flex-nowrap gap-3 pb-2 min-w-max">
                  {/* Year Filter */}
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-sm text-gray-600 mb-1">سال</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">همه سال‌ها</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Month Filter */}
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-sm text-gray-600 mb-1">ماه</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">همه ماه‌ها</option>
                      {Object.entries(afghanMonths).map(([num, name]) => (
                        <option key={num} value={num.padStart(2, '0')}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Day Filter */}
                  <div className="flex flex-col min-w-[100px]">
                    <label className="text-sm text-gray-600 mb-1">روز</label>
                    <input
                      type="number"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                      placeholder="روز"
                      min="1"
                      max="31"
                    />
                  </div>
                  
                  {/* From Filter */}
                  <div className="flex flex-col min-w-[150px]">
                    <label className="text-sm text-gray-600 mb-1">مبدا</label>
                    <select
                      value={selectedFrom}
                      onChange={(e) => setSelectedFrom(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">همه مبداها</option>
                      {uniqueFromLocations.map((location, index) => (
                        <option key={index} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* To Filter */}
                  <div className="flex flex-col min-w-[150px]">
                    <label className="text-sm text-gray-600 mb-1">مقصد</label>
                    <select
                      value={selectedTo}
                      onChange={(e) => setSelectedTo(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">همه مقصدها</option>
                      {uniqueToLocations.map((location, index) => (
                        <option key={index} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Bus Type Filter */}
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-sm text-gray-600 mb-1">نوع بس</label>
                    <select
                      value={selectedBusType}
                      onChange={(e) => setSelectedBusType(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">همه انواع</option>
                      <option value="VIP">VIP</option>
                      <option value="580">580</option>
                    </select>
                  </div>
                  
                  {/* Payment Status Filter */}
                  <div className="flex flex-col min-w-[140px]">
                    <label className="text-sm text-gray-600 mb-1">وضعیت پرداخت</label>
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">همه وضعیت‌ها</option>
                      <option value="paid">پرداخت شده</option>
                      <option value="unpaid">پرداخت نشده</option>
                      <option value="pending">در انتظار پرداخت</option>
                    </select>
                  </div>
                  
                  {/* Payment Method Filter */}
                  <div className="flex flex-col min-w-[140px]">
                    <label className="text-sm text-gray-600 mb-1">روش پرداخت</label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">همه روش‌ها</option>
                      <option value="hessabpay">حساب پی</option>
                      <option value="doorpay">پرداخت درب</option>
                    </select>
                  </div>
                  
                  {/* Time Filter - Hour */}
                  <div className="flex flex-col min-w-[100px]">
                    <label className="text-sm text-gray-600 mb-1">ساعت</label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">ساعت</option>
                      {hourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Time Filter - Minute */}
                  <div className="flex flex-col min-w-[100px]">
                    <label className="text-sm text-gray-600 mb-1">دقیقه</label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">دقیقه</option>
                      {minuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Time Filter - Period */}
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-sm text-gray-600 mb-1">قسمت روز</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    >
                      <option value="">همه</option>
                      <option value="AM">صبح (ق.ظ)</option>
                      <option value="PM">شب (ب.ظ)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                <div className="text-sm text-[#0B2A5B]">
                  {filteredTrips.length} سفر یافت شد • {tableData.length} تکت • {selectedTickets.length} تکت انتخاب شده
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={resetFilters}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 text-sm justify-center"
                  >
                    <RiCloseLine />
                    حذف همه فیلترها
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
                          در حال ایجاد...
                        </>
                      ) : (
                        <>
                          <RiAddLine />
                          ایجاد چالان ({selectedTickets.length})
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
                <h3 className="font-bold text-base md:text-lg text-[#0B2A5B]">انتساب راننده و بس</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                {/* Driver Selection with Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">راننده</label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <RiSearchLine />
                    </div>
                    <input
                      type="text"
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      placeholder="جستجوی راننده..."
                      className="w-full border p-2 md:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10"
                    />
                  </div>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full border p-2 md:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mt-2"
                  >
                    <option value="">انتخاب راننده (اختیاری)</option>
                    {filteredDrivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} {driver.father_name} - {driver.phone}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Bus Selection with Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">بس</label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <RiSearchLine />
                    </div>
                    <input
                      type="text"
                      value={busSearch}
                      onChange={(e) => setBusSearch(e.target.value)}
                      placeholder="جستجوی نمبر پلیت..."
                      className="w-full border p-2 md:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10"
                    />
                  </div>
                  <select
                    value={selectedBus}
                    onChange={(e) => setSelectedBus(e.target.value)}
                    className="w-full border p-2 md:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mt-2"
                  >
                    <option value="">انتخاب بس (اختیاری)</option>
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
                  {selectedTickets.length} تکت انتخاب شده است
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <button 
                    onClick={handlePrint}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center w-full sm:w-auto"
                  >
                    چاپ تکت‌ها
                    <RiPrinterLine />
                  </button>
                  
                  <button 
                    onClick={handleAssignBusAndDriver}
                    disabled={assigning || (!selectedBus && !selectedDriver) || selectedTickets.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg text-sm transition flex items-center gap-2 justify-center w-full sm:w-auto"
                  >
                    {assigning ? "در حال انتساب..." : "انتساب"}
                    <RiCheckLine />
                  </button>
                </div>
              </div>
            </div>

            {/* Chalan Print Section - Only show when there are filtered trips */}
            {filteredTrips.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-purple-500 w-full">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                    <RiPrinterLine className="text-xl md:text-2xl text-purple-600" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-[#0B2A5B]">چاپ چالان</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTrips.map((trip) => {
                    const vipChalan = getChalanDetailsForTrip(trip, 'VIP');
                    const bus580Chalan = getChalanDetailsForTrip(trip, '580');
                    
                    // Find chalans for this trip
                    const vipChalanData = chalans.find(chalan => 
                      chalan.tickets && chalan.tickets.some(ticket => 
                        ticket.trip_id === trip.id && ticket.bus_type === 'VIP'
                      )
                    );
                    const bus580ChalanData = chalans.find(chalan => 
                      chalan.tickets && chalan.tickets.some(ticket => 
                        ticket.trip_id === trip.id && ticket.bus_type === '580'
                      )
                    );
                    
                    return (
                      <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-[#0B2A5B]">{trip.from} - {trip.to}</h4>
                          <div className="flex flex-col gap-1">
                            {vipChalan.hasChalan && (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {vipChalanData ? `چالن ${vipChalanData.chalan_number}` : 'چالن VIP'}
                              </span>
                            )}
                            {bus580Chalan.hasChalan && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {bus580ChalanData ? `چالن ${bus580ChalanData.chalan_number}` : 'چالن 580'}
                              </span>
                            )}
                            {!vipChalan.hasChalan && !bus580Chalan.hasChalan && (
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                چالن ندارد
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                           <div className="flex justify-between">
      <span>تاریخ:</span>
      <span>
        {trip.tickets?.[0]?.departure_date || trip.departure_date || 'نامشخص'}
      </span>
    </div>
                          <div className="flex justify-between">
                            <span>زمان:</span>
                            <span>{formatTimeForDisplay(trip.departure_time)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>مسافرین کل:</span>
                            <span>{trip.tickets?.length || 0} نفر</span>
                          </div>
                          <div className="flex justify-between">
                            <span>  چوکیVIP:</span>
                            <span>{vipChalan.totalSeats} / 35</span>
                          </div>
                          <div className="flex justify-between">
                            <span>چوکی580:</span>
                            <span>{bus580Chalan.totalSeats} / 51</span>
                          </div>
                        </div>

                        {/* Show Seats Button */}
                        <div className="mb-3">
                          <button
                            onClick={() => handleOpenSeatModal(trip)}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center"
                          >
                            <RiSearchLine />
                       نمایش چوکی
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handlePrintChalan(trip, 'VIP')}
                            disabled={!vipChalan.hasChalan}
                            className={`py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center ${
                              vipChalan.hasChalan 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <RiPrinterLine />
                            چالن VIP
                          </button>
                          
                          <button
                            onClick={() => handlePrintChalan(trip, '580')}
                            disabled={!bus580Chalan.hasChalan}
                            className={`py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center ${
                              bus580Chalan.hasChalan 
                                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <RiPrinterLine />
                            چالن 580
                          </button>
                        </div>

                        {/* Mark Tickets as Arrived Buttons */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">علامت گذاری تکت‌ها به عنوان رسیده:</h5>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleMarkChalanAsArrived(trip.id, 'VIP')}
                              disabled={markingArrived === `${trip.id}-VIP` || !vipChalan.hasChalan}
                              className={`py-2 px-3 rounded-lg text-sm transition flex items-center gap-2 justify-center ${
                                vipChalan.hasChalan
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {markingArrived === `${trip.id}-VIP` ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  در حال پردازش...
                                </>
                              ) : (
                                <>
                                  <RiCheckDoubleLine />
                                  تکت‌های VIP رسیده
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleMarkChalanAsArrived(trip.id, '580')}
                              disabled={markingArrived === `${trip.id}-580` || !bus580Chalan.hasChalan}
                              className={`py-2 px-3 rounded-lg text-sm transition flex items-center gap-2 justify-center ${
                                bus580Chalan.hasChalan
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {markingArrived === `${trip.id}-580` ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  در حال پردازش...
                                </>
                              ) : (
                                <>
                                  <RiCheckDoubleLine />
                                  تکت‌های 580 رسیده
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {filteredTrips.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    هیچ سفری برای نمایش یافت نشد
                  </div>
                )}
              </div>
            )}

            {/* Mobile Cards View */}
            {isMobile ? (
              <div className="bg-white rounded-lg shadow-md p-4 w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-[#0B2A5B]">تکت‌ها ({mobileTableData.length})</h3>
                  <button
                    onClick={handleSelectAllMobile}
                    className="text-blue-600 text-sm flex items-center gap-1"
                  >
                    <RiCheckLine />
                    {selectedTickets.length === mobileTableData.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 mt-2">در حال بارگذاری تکت‌ها...</p>
                  </div>
                ) : mobileTableData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    هیچ تکتی یافت نشد
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
                    title={`تکت‌های بس‌ها (${tableData.length})`}
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

        {/* NEW: Chalan Manager Modal */}
        {showChalanManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">مدیریت چالان‌ها</h3>
                <button
                  onClick={() => setShowChalanManager(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  {chalans.map((chalan) => (
                    <div key={chalan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-[#0B2A5B]">چالان شماره: {chalan.chalan_number}</h4>
                          <p className="text-sm text-gray-600">
                            ایجاد شده در: {convertToPersianDateTime(chalan.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteChalan(chalan.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm transition"
                            title="حذف چالان"
                          >
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>تعداد تکت‌ها: {chalan.tickets?.length || 0}</p>
                        <p>شناسه تکت‌ها: {chalan.ticket_ids?.join(', ') || 'نامشخص'}</p>
                      </div>
                    </div>
                  ))}
                  
                  {chalans.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      هیچ چالانی ایجاد نشده است
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