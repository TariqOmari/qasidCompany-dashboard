import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomTable from "../components/CustomTable";
import logo from "../assets/qlogo.jfif";
import '../components/Sets.css'
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
  RiDeleteBinLine,RiArrowDownSLine,
  RiEditLine
} from 'react-icons/ri';
import { GiSteeringWheel } from "react-icons/gi";
import DashboardLayout from "../components/DashboardLayout";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "./locales/translations";

// Chalan API service
const api_for_logo= import.meta.env.VITE_VITE_API_BASE_URL_For_logo;
const chalanAPI = {
  createChalan: async (ticketIds, chalanNumber) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chalans`, {
        ticket_ids: ticketIds,
        chalan_number: chalanNumber // Add custom chalan number
      });
      return response.data;
    } catch (error) {
      console.error("Error creating chalan:", error);
      throw error;
    }
  },
    
  markUnpaid: async (ticketId) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tickets/${ticketId}/mark-unpaid`);
    return response.data;
  } catch (error) {
    console.error("Error marking ticket as unpaid:", error);
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
  arrivedChalans,
  chalans,
  drivers,
  cleaners
 }) => {
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [allChalans, setAllChalans] = useState([]);
  const { language } = useLanguage();
  const t = translations[language];

  // Fetch ALL chalans for history (including arrived ones)
  useEffect(() => {
    const fetchAllChalansForHistory = async () => {
      try {
        const data = await chalanAPI.getChalans();
        const allChalansArray = data.chalans || data || [];
        
        // Sort by creation date (newest first)
        const sortedChalans = allChalansArray.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setAllChalans(sortedChalans);
      } catch (error) {
        console.error("Error fetching all chalans for history:", error);
        setAllChalans([]);
      }
    };

    if (isOpen) {
      fetchAllChalansForHistory();
    }
  }, [isOpen]);

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
// Convert time to 12-hour Pashto format
// Convert time to 12-hour format based on language
const convertTo12HourPersian = (time) => {
  if (!time) return "";
  
  // If already in correct format for current language, return as is
  if (language === 'fa' && (time.includes('ق.ظ') || time.includes('ب.ظ'))) {
    return time;
  }
  if (language !== 'fa' && (time.includes('م:غ') || time.includes('و:غ'))) {
    return time;
  }
  
  try {
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    let minute = minutes || '00';
    
    let period = language === 'fa' ? 'ق.ظ' : 'م:غ';
    if (hour >= 12) {
      period = language === 'fa' ? 'ب.ظ' : 'و:غ';
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
  // Helper function to get driver details by ID
  const getDriverDetails = (driverId) => {
    if (!driverId) return language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
    const driver = drivers.find(d => d.id === parseInt(driverId));
    return driver ? `${driver.name} ${driver.father_name}` : language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
  };

  // Helper function to get driver phone by ID
  const getDriverPhone = (driverId) => {
    if (!driverId) return language === 'fa' ? "نامشخص" : "ناجوت";
    const driver = drivers.find(d => d.id === parseInt(driverId));
    return driver ? driver.phone : language === 'fa' ? "نامشخص" : "ناجوت";
  };

  // Helper function to get bus number plate - CHECK TICKET DATA FIRST
  const getBusNumberPlate = (driverId, tickets = []) => {
    // FIRST: Check if any ticket in the chalan has bus_number_plate directly
    const ticketWithBusPlate = tickets.find(t => t.bus_number_plate);
    if (ticketWithBusPlate && ticketWithBusPlate.bus_number_plate) {
      return ticketWithBusPlate.bus_number_plate;
    }
    
    // SECOND: Fallback to driver data
    if (!driverId) return language === 'fa' ? "تعیین نشده" : "نه دی ټاکل شوی";
    const driver = drivers.find(d => d.id === parseInt(driverId));
    return driver ? (driver.bus_number_plate || language === 'fa' ? "تعیین نشده" : "نه دی ټاکل شوی") : language === 'fa' ? "تعیین نشده" : "نه دی ټاکل شوی";
  };

  // Helper function to get cleaner details by ID
  const getCleanerDetails = (cleanerId) => {
    if (!cleanerId) return language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
    const cleaner = cleaners.find(c => c.id === parseInt(cleanerId));
    return cleaner ? `${cleaner.cleaner_name}` : language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
  };

  // Helper function to get cleaner phone by ID
  const getCleanerPhone = (cleanerId) => {
    if (!cleanerId) return language === 'fa' ? "نامشخص" : "ناجوت";
    const cleaner = cleaners.find(c => c.id === parseInt(cleanerId));
    return cleaner ? cleaner.cleaner_phone : language === 'fa' ? "نامشخص" : "ناجوت";
  };

  // Group arrived tickets by chalan number for history display
  useEffect(() => {
    if (allChalans.length === 0) {
      setFilteredHistory([]);
      return;
    }

    // Create a map of ALL chalan_id to chalan data
    const chalanDataMap = {};
    allChalans.forEach(chalan => {
      if (chalan.id && chalan.chalan_number) {
        chalanDataMap[chalan.id] = {
          chalan_number: chalan.chalan_number,
          tickets: chalan.tickets || [],
          ticket_ids: chalan.ticket_ids || [],
          created_at: chalan.created_at
        };
      }
    });

    // Group tickets by chalan ID and get chalan_number from chalanDataMap
    const groupedChalans = {};
    
    // First, get all unique chalan IDs from arrived tickets
    const chalanIds = [...new Set(arrivedChalans
      .filter(ticket => ticket.chalan_id)
      .map(ticket => ticket.chalan_id)
    )];
    
    // Group tickets by chalan ID and get chalan_number from chalanDataMap
    chalanIds.forEach(chalanId => {
      const ticketsInChalan = arrivedChalans.filter(ticket => ticket.chalan_id === chalanId);
      
      if (ticketsInChalan.length > 0) {
        const firstTicket = ticketsInChalan[0];
        
        // Get chalan data from the chalanDataMap
        const chalanData = chalanDataMap[chalanId];
        
        // Use the REAL chalan_number from the chalan data
        const chalanNumber = chalanData ? chalanData.chalan_number : `CH-${chalanId}`;

        // Get driver and cleaner info from the first ticket that has them
        let driverName = language === 'fa' ? 'نامشخص' : 'ناجوت';
        let driverPhone = language === 'fa' ? 'نامشخص' : 'ناجوت';
        let busNumberPlate = language === 'fa' ? 'تعیین نشده' : 'نه دی ټاکل شوی';
        let cleanerName = language === 'fa' ? 'نامشخص' : 'ناجوت';
        let cleanerPhone = language === 'fa' ? 'نامشخص' : 'ناجوت';

        // Find the first ticket that has driver/cleaner assigned
        const ticketWithDriver = ticketsInChalan.find(ticket => ticket.driver_id);
        if (ticketWithDriver) {
          driverName = getDriverDetails(ticketWithDriver.driver_id);
          driverPhone = getDriverPhone(ticketWithDriver.driver_id);
          busNumberPlate = getBusNumberPlate(ticketWithDriver.driver_id, ticketsInChalan);
        }

        const ticketWithCleaner = ticketsInChalan.find(ticket => ticket.cleaner_id);
        if (ticketWithCleaner) {
          cleanerName = getCleanerDetails(ticketWithCleaner.cleaner_id);
          cleanerPhone = getCleanerPhone(ticketWithCleaner.cleaner_id);
        }
        
        const departureDate = firstTicket.departure_date || 
                             firstTicket.trip?.departure_date || 
                             (language === 'fa' ? 'نامشخص' : 'ناجوت');
        
        groupedChalans[chalanId] = {
          id: chalanId,
          chalan_number: chalanNumber,
          from: firstTicket.trip?.from || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          to: firstTicket.trip?.to || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          bus_type: firstTicket.bus_type,
          tickets: ticketsInChalan,
          total_price: ticketsInChalan.reduce((sum, ticket) => sum + (parseFloat(ticket.final_price) || 0), 0),
          ticket_count: ticketsInChalan.length,
          arrived_at: firstTicket.updated_at || firstTicket.created_at,
          departure_time: convertTo12HourPersian(firstTicket.trip?.departure_time) || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          departure_date: departureDate,
          driver_name: driverName,
          driver_phone: driverPhone,
          bus_number_plate: busNumberPlate,
          cleaner_name: cleanerName,
          cleaner_phone: cleanerPhone,
          created_at: chalanData?.created_at || firstTicket.created_at
        };
      }
    });

    // Also include tickets without chalan number grouped by trip
    const ticketsWithoutChalan = arrivedChalans.filter(ticket => !ticket.chalan_id);
    
    // Group tickets without chalan by trip and bus type
    const ticketsByTrip = {};
    ticketsWithoutChalan.forEach(ticket => {
      const key = `${ticket.trip?.id}-${ticket.bus_type}`;
      if (!ticketsByTrip[key]) {
        ticketsByTrip[key] = {
          tickets: [],
          trip: ticket.trip
        };
      }
      ticketsByTrip[key].tickets.push(ticket);
    });

    // Create chalan entries for tickets without chalan number
    Object.entries(ticketsByTrip).forEach(([key, data]) => {
      if (data.tickets.length > 0) {
        const firstTicket = data.tickets[0];
        
        const departureDate = firstTicket.departure_date || 
                             data.trip?.departure_date || 
                             (language === 'fa' ? 'نامشخص' : 'ناجوت');
        
        groupedChalans[key] = {
          id: key,
          chalan_number: language === 'fa' ? 'بدون چالان' : 'پرته له چالان',
          from: data.trip?.from || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          to: data.trip?.to || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          bus_type: firstTicket.bus_type,
          tickets: data.tickets,
          total_price: data.tickets.reduce((sum, ticket) => sum + (parseFloat(ticket.final_price) || 0), 0),
          ticket_count: data.tickets.length,
          arrived_at: firstTicket.updated_at || firstTicket.created_at,
          departure_time: convertTo12HourPersian(data.trip?.departure_time) || (language === 'fa' ? 'نامشخص' : 'ناجوت'),
          departure_date: departureDate,
          driver_name: language === 'fa' ? 'نامشخص' : 'ناجوت',
          driver_phone: language === 'fa' ? 'نامشخص' : 'ناجوت',
          bus_number_plate: language === 'fa' ? 'تعیین نشده' : 'نه دی ټاکل شوی',
          cleaner_name: language === 'fa' ? 'نامشخص' : 'ناجوت',
          cleaner_phone: language === 'fa' ? 'نامشخص' : 'ناجوت',
          created_at: firstTicket.created_at
        };
      }
    });

    let filtered = Object.values(groupedChalans);
    
    // Sort by creation date (newest first)
    filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Filter by chalan number
    if (filters.chalanNumber) {
      filtered = filtered.filter(chalan => 
        chalan.chalan_number.toString().includes(filters.chalanNumber)
      );
    }
    
    // Filter by year, month, day using TICKET departure_date
    if (filters.year || filters.month || filters.day) {
      filtered = filtered.filter(chalan => {
        if (!chalan.departure_date || chalan.departure_date === (language === 'fa' ? 'نامشخص' : 'ناجوت')) return false;
        
        const dateString = chalan.departure_date.toString();
        const dateParts = dateString.split('-');
        
        let year, month, day;
        
        if (dateParts.length === 3) {
          [year, month, day] = dateParts;
        } else {
          return false;
        }
        
        year = year.replace(/\D/g, '');
        month = month.replace(/\D/g, '').padStart(2, '0');
        day = day.replace(/\D/g, '').padStart(2, '0');

        if (filters.year && year !== filters.year) return false;
        if (filters.month && month !== filters.month.padStart(2, '0')) return false;
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
        const time = tripTime.toUpperCase();
        
        let hour, minute, period;
        
        if (time.includes('ق.ظ') || time.includes('ب.ظ')) {
          const timeWithoutPeriod = time.replace(/\s?(ق\.ظ|ب\.ظ)/gi, '').trim();
          const [h, m] = timeWithoutPeriod.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = time.includes('ب.ظ') ? 'PM' : 'AM';
        }
        else if (time.includes('AM') || time.includes('PM')) {
          const timeWithoutPeriod = time.replace(/\s?(AM|PM)/gi, '').trim();
          const [h, m] = timeWithoutPeriod.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = time.includes('PM') ? 'PM' : 'AM';
        }
        else {
          const [h, m] = time.split(':');
          hour = parseInt(h);
          minute = parseInt(m) || 0;
          period = hour >= 12 ? 'PM' : 'AM';
          
          if (hour > 12) hour = hour - 12;
          if (hour === 0) hour = 12;
        }
        
        if (filters.hour) {
          const selectedHourInt = parseInt(filters.hour);
          if (hour !== selectedHourInt) return false;
        }
        
        if (filters.minute) {
          const selectedMinuteInt = parseInt(filters.minute);
          if (minute !== selectedMinuteInt) return false;
        }
        
        if (filters.period) {
          if (period !== filters.period) return false;
        }
        
        return true;
      });
    }
    
    setFilteredHistory(filtered);
  }, [filters, arrivedChalans, allChalans, language, drivers, cleaners]);

  // Print chalan from history
  const handlePrintChalanFromHistory = (chalan) => {
    if (!chalan.tickets || chalan.tickets.length === 0) {
      showToast(language === 'fa' ? "هیچ تکت برای چاپ وجود ندارد" : "د چاپ لپاره هیڅ تکت نشته", "error");
      return;
    }

    // Get company data from session storage
    const getCompanyData = () => {
      try {
        const companyData = sessionStorage.getItem('company');
        if (companyData) {
          const parsedData = JSON.parse(companyData);
          return {
            name: parsedData.name || 'شرکت تراسپورتی',
            phone: parsedData.phone || 'نامشخص'
          };
        }
      } catch (error) {
        console.error("Error getting company data:", error);
      }
      return {
        name: 'شرکت تراسپورتی',
        phone: 'نامشخص'
      };
    };

    const companyData = getCompanyData();
    const busImageUrl = "data:image/jpeg;base64,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";

    // Get company logo
    const getCompanyLogo = () => {
      try {
        const companyData = sessionStorage.getItem('company');
        if (companyData) {
          const parsedData = JSON.parse(companyData);
          if (parsedData.logo_url) {
            return `${import.meta.env.VITE_API_BASE_URL_For_logo}/public/${parsedData.logo_url}`;
          }
        }
        
        const logoUrl = sessionStorage.getItem('company_logo_url');
        if (logoUrl) {
          return `${import.meta.env.VITE_API_BASE_URL_For_logo}/public/${logoUrl}`;
        }
      } catch (error) {
        console.error("Error getting company logo:", error);
      }
      return logo;
    };

    const companyLogoUrl = getCompanyLogo();

    // Sort tickets by seat number in ascending order
    const sortedTickets = [...chalan.tickets].sort((a, b) => {
      const seatA = Array.isArray(a.seat_numbers) ? parseInt(a.seat_numbers[0]) : parseInt(a.seat_number);
      const seatB = Array.isArray(b.seat_numbers) ? parseInt(b.seat_numbers[0]) : parseInt(b.seat_number);
      
      return (seatA || 0) - (seatB || 0);
    });

    // Get the first ticket from the sorted tickets
    const firstTicket = sortedTickets[0];

    // Calculate chalan details using sorted tickets
    const totalSeats = sortedTickets.reduce((total, ticket) => {
      const seatCount = Array.isArray(ticket.seat_numbers) 
        ? ticket.seat_numbers.length 
        : (ticket.seat_number ? 1 : 0);
      return total + seatCount;
    }, 0);
      
    const totalPrice = sortedTickets.reduce((total, ticket) => {
      return total + (parseFloat(ticket.final_price) || 0);
    }, 0);
      
    const safiChalan = totalPrice * 0.02;
    const netAmount = totalPrice - safiChalan;

    // Create a map of seat numbers to tickets for easier lookup
    const seatToTicketMap = {};
    sortedTickets.forEach(ticket => {
      if (Array.isArray(ticket.seat_numbers)) {
        ticket.seat_numbers.forEach(seat => {
          seatToTicketMap[seat] = ticket;
        });
      } else if (ticket.seat_number) {
        seatToTicketMap[ticket.seat_number] = ticket;
      }
    });

    const driverName = chalan.driver_name || (language === 'fa' ? 'نامشخص' : 'ناجوت');
    const driverPhone = chalan.driver_phone || (language === 'fa' ? 'نامشخص' : 'ناجوت');
    const busNumberPlate = chalan.bus_number_plate || (language === 'fa' ? 'تعیین نشده' : 'نه دی ټاکل شوی');
    const cleanerName = chalan.cleaner_name || (language === 'fa' ? 'نامشخص' : 'ناجوت');
    const cleanerPhone = chalan.cleaner_phone || (language === 'fa' ? 'نامشخص' : 'ناجوت');

    // Get current date in Persian format
    const currentDate = new Date().toLocaleDateString('fa-IR-u-nu-latn');
    
    // Use ticket departure_date
    const departureDate = firstTicket.departure_date || currentDate;

    // Always show departure time
    const departureTime = chalan.departure_time || '';

    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        @font-face {
        font-family: 'Nazanin';
        src: url('${window.location.origin}/fonts/B-NAZANIN.TTF') format('truetype'),
             url('${window.location.origin}/fonts/B-NAZANIN.woff') format('woff'),
             url('${window.location.origin}/fonts/B-NAZANIN.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
      }
      
      /* Fallback for Nazanin font */
      @font-face {
        font-family: 'Nazanin';
        src: local('B Nazanin'),
             local('BNazanin'),
             local('B-Nazanin'),
             local('Nazanin');
        font-weight: normal;
        font-style: normal;
      }

      * {
        font-family: 'Nazanin' !important;
      }
        body {
           font-family: 'Nazanin' !important;
          direction: rtl;
          margin: 10px;
          background: white;
          font-size: 9px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          font-size: 8px;
        }
        th, td {
          border: 1px solid #000;
          text-align: center;
          padding: 3px;
        }
        .header-table td {
          border: none;
          text-align: right;
          padding: 4px;
        }
        .highlight {
          background-color: #ffea00;
          font-weight: bold;
          text-align: center;
          font-size: 12px;
        }
        .blue-header {
          background-color: #b6d7f0;
          font-weight: bold;
        }
        .footer td {
          border: 1px solid #000;
          text-align: right;
          padding: 4px 6px;
        }
        
        /* Equal column widths for left and right sections */
        .seat { width: 5%; }
        .name { width: 10%; }
        .father { width: 8%; }
        .province { width: 7%; }
        .fare { width: 7%; }
        .phone { width: 10%; }
        .cargo { width: 5%; }
        
        .logo-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 8px;
        }
        .logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <h3 style="text-align: center; margin: 5px 0; font-size: 10px;">ضمیمه شماره (10)</h3>
      
      <div class="logo-container">
        <div class="logo-container">
          <img src="${companyLogoUrl}" alt="لوگوی شرکت" class="logo">
          <img src="${busImageUrl}" alt="بس" class="logo">
        </div>
      </div>
      
      <table style="text-align: right; margin-bottom: 8px;">
        <tr>
          <td style="text-align: right;">نمبر چالان</td>
          <td style="width: 12%;">${chalan.chalan_number}</td>
          <td colspan="4" class="highlight">شرکت ترانسپورتی ${companyData.name}</td>
          <td></td>
        </tr>
        <tr>
          <td style="text-align: right;">نمبر پلیت موتر</td>
          <td>${busNumberPlate}</td>
          <td style="text-align: right;">اسم راننده</td>
          <td style="width:15%;">${driverName}</td>
          <td style="text-align: right;">تاریخ حرکت</td>
          <td colspan="2">${departureDate}</td>
        </tr>
        <tr>
          <td style="text-align: right;" rowspan="2">نوعیت موتر</td>
          <td style="text-align: right;" rowspan="2">${chalan.bus_type}</td>
          <td style="text-align: right;">نمبر تماس راننده</td>
          <td>${driverPhone}</td>
          <td style="text-align: right;">وقت حرکت</td>
          <td colspan="2">${departureTime || ''}</td>
        </tr>
        <tr>
          <td style="text-align: right;">نمبر تماس نماینده</td>
          <td>${cleanerPhone}</td>
          <td style="text-align: right;">مبدا و مقصد</td>
          <td colspan="2">از ${chalan.from} الی ${chalan.to}</td>
        </tr>
      </table>

      <table>
        <tr class="blue-header">
          <!-- Left Section Headers -->
          <th class="seat">نمبر چوکی</th>
          <th class="name">اسم مسافر</th>
          <th class="father">ولد</th>
          <th class="province">ولایت</th>
          <th class="fare">کرایه</th>
          <th class="phone">شماره تماس مسافر و اقارب</th>
          <th class="cargo">شماره بار</th>

          <!-- Right Section Headers (EXACTLY same structure) -->
          <th class="seat">نمبر چوکی</th>
          <th class="name">اسم مسافر</th>
          <th class="father">ولد</th>
          <th class="province">ولایت</th>
          <th class="fare">کرایه</th>
          <th class="phone">شماره تماس مسافر و اقارب</th>
          <th class="cargo">شماره بار</th>
        </tr>

        <tbody>
          ${Array.from({ length: 27 }, (_, i) => {
            const leftSeat = i + 1;
            const rightSeat = i + 28;
            
            // Use the seat map for lookup
            const leftTicket = seatToTicketMap[leftSeat];
            const rightTicket = seatToTicketMap[rightSeat];

            return `
              <tr>
                <!-- Left Side Data -->
                <td>${leftSeat}</td>
                <td>${leftTicket?.name || ''}</td>
                <td>${leftTicket?.father_name || ''}</td>
                <td>${leftTicket?.province || ''}</td>
                <td>${leftTicket ? (parseFloat(leftTicket.final_price) || 0).toLocaleString() : ''}</td>
                <td>${leftTicket?.phone || ''}</td>
                <td></td>
                
                <!-- Right Side Data (EXACTLY same structure) -->
                <td>${rightSeat}</td>
                <td>${rightTicket?.name || ''}</td>
                <td>${rightTicket?.father_name || ''}</td>
                <td>${rightTicket?.province || ''}</td>
                <td>${rightTicket ? (parseFloat(rightTicket.final_price) || 0).toLocaleString() : ''}</td>
                <td>${rightTicket?.phone || ''}</td>
                <td></td>
              </tr>
            `;
          }).join('')}
        </tbody>

        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right; padding-right:8px;">مجموع مسافر</td>
            <td colspan="11">${totalSeats} نفر</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align:right; padding-right:8px;">مجموع کرایه به افغانی</td>
            <td colspan="11">${totalPrice.toLocaleString()} افغانی</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align:right; padding-right:8px;">مجموع %2 کمیشن شرکت به افغانی</td>
            <td colspan="11">${safiChalan.toLocaleString()} افغانی</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align:right; padding-right:8px;">صافی چالان (بعد از کسر %2)</td>
            <td colspan="11">${netAmount.toLocaleString()} افغانی</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

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
      period: '',
      chalanNumber: ''
    });
  };

  // Show toast function
  const showToast = (message, type = "success") => {
    console.log(`${type}: ${message}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">{language === 'fa' ? 'تاریخچه چالان‌های رسیده' : 'رسیدلی چالانونو تاریخ'}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Loading state */}
          {allChalans.length === 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">{language === 'fa' ? 'در حال بارگذاری اطلاعات چالان‌ها...' : 'د چالانونو معلومات په پورته کولو کې...'}</p>
            </div>
          )}

          {/* Filters */}
          {allChalans.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-bold mb-3">{language === 'fa' ? 'فیلترها' : 'فیلترونه'}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Chalan Number Filter */}
                <div>
                  <label className="text-sm text-gray-600 mb-1">{language === 'fa' ? 'شماره چالان' : 'د چالان شمېره'}</label>
                  <input
                    type="text"
                    value={filters.chalanNumber}
                    onChange={(e) => onFilterChange({...filters, chalanNumber: e.target.value})}
                    className="border p-2 rounded-lg w-full text-sm"
                    placeholder={language === 'fa' ? 'جستجوی شماره چالان' : 'د چالان د شمېرې لټون'}
                  />
                </div>
                
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
          )}

          {/* History List */}
          <div className="space-y-3">
            {filteredHistory.map((chalan, index) => (
              <div key={chalan.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-[#0B2A5B]">
                      {chalan.from} {" الی "}{chalan.to} - {chalan.bus_type}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'fa' ? 'شماره چالان:' : 'د چالان شمېره:'} <strong className="text-blue-600">{chalan.chalan_number}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {language === 'fa' ? 'رسیده' : 'رسیدلی'}
                    </span>
                    {/* Print button for each chalan in history */}
                    <button
                      onClick={() => handlePrintChalanFromHistory(chalan)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1 transition"
                      title={language === 'fa' ? 'چاپ چالان' : 'چالان چاپول'}
                    >
                      <RiPrinterLine />
                      {language === 'fa' ? 'چاپ' : 'چاپ'}
                    </button>
                  </div>
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
              </div>
            ))}
            
            {filteredHistory.length === 0 && allChalans.length > 0 && (
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

// Update Chalan Modal Component
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
  const [clearTableSelection, setClearTableSelection] = useState(false);

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
    console.log(`${type}: ${message}`);
  };

  const handleAddTickets = async () => {
    if (selectedTicketsToAdd.length === 0) {
      showToast(language === 'fa' ? "لطفا تکت‌هایی برای اضافه کردن انتخاب کنید" : "مهرباني وکړئ د اضافه کولو لپاره تکتونه وټاکئ", "error");
      return;
    }

    // Validate bus type consistency
    const selectedTicketData = availableTickets.filter(ticket => 
      selectedTicketsToAdd.includes(ticket.id)
    );
    const busTypes = [...new Set(selectedTicketData.map(ticket => ticket.bus_type))];
    
    // Check if adding mixed bus types to chalan
    if (busTypes.length > 1) {
      showToast(language === 'fa' 
        ? "خطا: نمی‌توانید تکت‌های VIP و 580 را با هم مخلوط کنید. لطفا تکت‌های هم نوع را انتخاب کنید." 
        : "تېروتنه: تاسې نشئ کولی د VIP او 580 تکتونه سره ګډ کړئ. مهرباني وکړئ د ورته ډول تکتونه وټاکئ.", 
        "error"
      );
      return;
    }

    // Check if bus type matches existing chalan tickets
    if (chalan.tickets && chalan.tickets.length > 0) {
      const existingBusType = chalan.tickets[0].bus_type;
      if (busTypes[0] && busTypes[0] !== existingBusType) {
        showToast(language === 'fa' 
          ? `خطا: نمی‌توانید تکت‌های ${busTypes[0]} را به چالان ${existingBusType} اضافه کنید.` 
          : `تېروتنه: تاسې نشئ کولی د ${busTypes[0]} تکتونه د ${existingBusType} چالان ته اضافه کړئ.`, 
          "error"
        );
        return;
      }
    }

    setUpdating(true);
    try {
      const updateData = {
        add_ticket_ids: selectedTicketsToAdd
      };
      
      await chalanAPI.updateChalan(chalan.id, updateData);
      showToast(language === 'fa' ? "تکت‌ها با موفقیت اضافه شدند" : "تکتونه په بریالیتوب سره اضافه شول");
      setSelectedTicketsToAdd([]);
      onUpdate();
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
      onUpdate();
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
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFrom, setSelectedFrom] = useState('');
    const [customChalanNumber, setCustomChalanNumber] = useState('');
  const [showChalanNumberModal, setShowChalanNumberModal] = useState(false);
  const [selectedTo, setSelectedTo] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedBusType, setSelectedBusType] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [clearTableSelection, setClearTableSelection] = useState(false);
  const [selectedTicketStatuses, setSelectedTicketStatuses] = useState('stopped');
  const [assigningChalans, setAssigningChalans] = useState({});
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
  const [cleaners, setCleaners] = useState([]);
  const [selectedBus, setSelectedBus] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedCleaner, setSelectedCleaner] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [assigning, setAssigning] = useState(false);
  const [uniqueFromLocations, setUniqueFromLocations] = useState([]);
  const [uniqueToLocations, setUniqueToLocations] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [busSearch, setBusSearch] = useState("");
  const [cleanerSearch, setCleanerSearch] = useState("");
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [filteredCleaners, setFilteredCleaners] = useState([]);
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
    period: '',
    chalanNumber: ''
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

  // Create a ref for the table to print
  const tableRef = useRef();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { language } = useLanguage();
  const t = translations[language];

  // Ticket status options - REMOVED in_processing and riding
  const ticketStatusOptions = [
    { value: 'stopped', label: language === 'fa' ? 'متوقف شده' : 'درېدلی' },
    { value: 'arrived', label: language === 'fa' ? 'رسیده' : 'رسیدلی' },
    { value: 'cancelled', label: language === 'fa' ? 'لغو شده' : 'لغوه شوی' }
  ];

  // Handle ticket status checkbox change
  const handleTicketStatusChange = (status) => {
    setSelectedTicketStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Select all ticket statuses
  const handleSelectAllTicketStatuses = () => {
    if (selectedTicketStatuses.length === ticketStatusOptions.length) {
      setSelectedTicketStatuses([]);
    } else {
      setSelectedTicketStatuses(ticketStatusOptions.map(option => option.value));
    }
  };

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
      const chalansArray = data.chalans || data || [];
      
      const chalansWithTickets = chalansArray.map((chalan) => {
        if (chalan.tickets && chalan.tickets.length > 0) {
          return {
            ...chalan,
            tickets: chalan.tickets,
            id: chalan.id,
            chalan_number: chalan.chalan_number || chalan.id,
            created_at: chalan.created_at,
            updated_at: chalan.updated_at,
            assignedDriver: '',
            assignedCleaner: '',
            assignedDriverData: null
          };
        }
        
        const allTicketsFromAllTrips = allTrips.flatMap(trip => 
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
        
        const tickets = allTicketsFromAllTrips.filter(ticket => 
          chalan.ticket_ids && chalan.ticket_ids.includes(ticket.id)
        );
        
        return {
          ...chalan,
          tickets: tickets,
          id: chalan.id,
          chalan_number: chalan.chalan_number || chalan.id,
          created_at: chalan.created_at,
          updated_at: chalan.updated_at, 
          assignedDriver: '',
          assignedCleaner: '',
          assignedDriverData: null
        };
      });

 

      // Filter out chalans where ALL tickets have status 'arrived' AND chalans with no tickets
      const activeChalans = chalansWithTickets.filter(chalan => {
        // Filter out chalans with no tickets
        if (!chalan.tickets || chalan.tickets.length === 0) {
          return false;
        }
        
        // Filter out chalans with empty ticket_ids array
        if (!chalan.ticket_ids || chalan.ticket_ids.length === 0) {
          return false;
        }
        
        // Check if ALL tickets in this chalan have status 'arrived'
        const allTicketsArrived = chalan.tickets.every(ticket => ticket.status === 'arrived');
        
        // If all tickets are arrived, add to history and exclude from active chalans
        if (allTicketsArrived) {
          return false;
        }
        
        return true;
      });

      setChalans(activeChalans);
    } catch (error) {
      console.error("Error fetching chalans:", error);
      showToast(language === 'fa' ? "خطا در بارگذاری چالان‌ها" : "په چالانونو د پورته کولو کې تېروتنه", "error");
      setChalans([]);
    }
  };

  // Handle assignment of driver and cleaner to ALL tickets in a chalan
  const handleAssignDriverAndCleanerToChalan = async (chalanId, driverId, cleanerId) => {
    if (!driverId && !cleanerId) {
      showToast(language === 'fa' ? "لطفا حداقل یک راننده یا نماینده انتخاب کنید" : "مهرباني وکړئ لږ تر لږه یو چلوونکی یا نماینده وټاکئ", "error");
      return;
    }

    // Find the chalan
    const chalan = chalans.find(c => c.id === chalanId);
    if (!chalan || !chalan.tickets || chalan.tickets.length === 0) {
      showToast(language === 'fa' ? "چالان یا تکت‌های آن یافت نشد" : "چالان یا د هغه تکتونه ونه موندل شول", "error");
      return;
    }

    const ticketIds = chalan.tickets.map(ticket => ticket.id);

    // Set loading state for THIS chalan only
    setAssigningChalans(prev => ({ ...prev, [chalanId]: true }));
    
    try {
      // Get driver data to include bus_number_plate in assignment
      const selectedDriverData = drivers.find(d => d.id === parseInt(driverId));
      
      // Process each ticket in the chalan individually
      const assignmentPromises = ticketIds.map(ticketId => {
        const assignmentData = {};
        if (driverId) assignmentData.driver_id = driverId;
        if (cleanerId) assignmentData.cleaner_id = cleanerId;
        
        // Add bus_number_plate from driver if available
        if (selectedDriverData && selectedDriverData.bus_number_plate) {
          assignmentData.bus_number_plate = selectedDriverData.bus_number_plate;
        }
        
        return axios.put(`${API_BASE_URL}/api/tickets/${ticketId}/assign`, assignmentData);
      });
      
      await Promise.all(assignmentPromises);
      
      showToast(
        language === 'fa' 
          ? `راننده و نماینده با موفقیت به ${ticketIds.length} تکت در چالان انتساب داده شد` 
          : `چلوونکی او نماینده په بریالیتوب سره ${ticketIds.length} تکتونو ته په چالان کې وټاکل شول`
      );
      
      // Clear the assignment for this specific chalan after successful assignment
      setChalans(prev => prev.map(c => 
        c.id === chalanId 
          ? { ...c, assignedDriver: '', assignedCleaner: '', assignedDriverData: null }
          : c
      ));
      
      // Refresh data
      await fetchChalans();
      
    } catch (error) {
      console.error("Error assigning driver and cleaner to chalan tickets:", error);
      showToast(language === 'fa' ? "خطا در انتساب به تکت‌های چالان" : "په چالان تکتونو کې د ټاکلو کې تېروتنه", "error");
    } finally {
      // Clear loading state for THIS chalan only
      setAssigningChalans(prev => ({ ...prev, [chalanId]: false }));
    }
  };

   const handleCloseSeatModal = () => {
    setSeatModalOpen(false);
    setSelectedTripForSeats(null);
    setSelectedBusTypeForSeats('');
  };

  const handleBusTypeChange = (busType) => {
  setSelectedBusTypeForSeats(busType);
};

 // Chalan Number Input Modal
const ChalanNumberModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  chalanNumber, 
  onChalanNumberChange,
  creatingChalan,
  selectedTicketsCount 
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {language === 'fa' ? 'ایجاد چالان جدید' : 'نوی چالان جوړول'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={creatingChalan}
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-600 mb-3">
              {language === 'fa' 
                ? `شما در حال ایجاد چالان برای ${selectedTicketsCount} تکت هستید. لطفاً شماره چالان را وارد کنید:`
                : `تاسې د ${selectedTicketsCount} ټکیټونو لپاره چالان جوړوئ. مهرباني وکړئ د چالان شمېره ولیکئ:`
              }
            </p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fa' ? 'شماره چالان' : 'د چالان شمېره'} *
            </label>
            <input
              type="text"
              value={chalanNumber}
              onChange={(e) => onChalanNumberChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'fa' ? 'مثال: ABC-120' : 'بېلګه: ABC-120'}
              disabled={creatingChalan}
              autoFocus
            />
            
            <p className="text-xs text-gray-500 mt-2">
              {language === 'fa' 
                ? 'شماره چالان باید منحصر به فرد باشد'
                : 'د چالان شمېره باید ځانګړې وي'
              }
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={creatingChalan}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              {language === 'fa' ? 'لغو' : 'لغوه'}
            </button>
            <button
              onClick={onConfirm}
              disabled={creatingChalan || !chalanNumber.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creatingChalan ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {language === 'fa' ? 'در حال ایجاد...' : 'د جوړولو په حال کې...'}
                </>
              ) : (
                <>
                  <RiCheckLine />
                  {language === 'fa' ? 'تأیید و ایجاد' : 'تأیید او جوړول'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
  // Get all tickets from trips data
  // Get all tickets from trips data with qasid filter
const getAllTicketsFromTrips = () => {
  return allTrips.flatMap(trip => 
    trip.tickets?.filter(ticket => {
      // Check if ticket is from qasid website
      const isFromQasid = ticket.from_website && 
        ticket.from_website.includes('qasid.org');
      
      if (isFromQasid) {
        // Only exclude qasid tickets if payment_status is NOT 'paid'
        return ticket.payment_status === 'paid';
      }
      
      // Include all other tickets
      return true;
    }).map(ticket => ({
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

  // Fetch all tickets for update modal
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

  // Add selected tickets to existing chalan with proper validation
  const handleAddTicketsToChalan = async (chalanId) => {
    if (selectedTickets.length === 0) {
      showToast(language === 'fa' ? "لطفا تکت‌هایی برای اضافه کردن انتخاب کنید" : "مهرباني وکړئ د اضافه کولو لپاره تکتونه وټاکئ", "error");
      return;
    }

    // Validate bus type consistency
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

    // Find the target chalan
    const targetChalan = chalans.find(c => c.id === chalanId);
    if (!targetChalan) {
      showToast(language === 'fa' ? "چالان مورد نظر یافت نشد" : "هدف چالان ونه موندل شو", "error");
      return;
    }

    // Check if bus type matches existing chalan tickets
    if (targetChalan.tickets && targetChalan.tickets.length > 0) {
      const existingBusType = targetChalan.tickets[0].bus_type;
      if (busTypes[0] && busTypes[0] !== existingBusType) {
        showToast(language === 'fa' 
          ? `خطا: نمی‌توانید تکت‌های ${busTypes[0]} را به چالان ${existingBusType} اضافه کنید.` 
          : `تېروتنه: تاسې نشئ کولی د ${busTypes[0]} تکتونه د ${existingBusType} چالان ته اضافه کړئ.`, 
          "error"
        );
        return;
      }
    }

    try {
      const updateData = {
        add_ticket_ids: selectedTickets
      };
      
      await chalanAPI.updateChalan(chalanId, updateData);
      showToast(language === 'fa' ? "تکت‌ها با موفقیت به چالان اضافه شدند" : "تکتونه په بریالیتوب سره چالان ته اضافه شول");
      
      // Refresh chalans list
      await fetchChalans();
      clearSelectedTickets(); 
      // Clear selection
      setSelectedTickets([]);
      
    } catch (error) {
      console.error("Error adding tickets to chalan:", error);
      showToast(language === 'fa' ? "خطا در اضافه کردن تکت‌ها به چالان" : "په چالان کې د تکتونو د اضافه کولو کې تېروتنه", "error");
    }
  };

  // Mark chalan as arrived (mark all tickets in chalan as arrived)
  const handleMarkChalanAsArrived = async (chalanId) => {
    setMarkingArrived(chalanId);
    
    try {
      // Find the chalan
      const chalan = chalans.find(c => c.id === chalanId);
      if (!chalan || !chalan.tickets || chalan.tickets.length === 0) {
        showToast(language === 'fa' ? "چالان یا تکت‌های آن یافت نشد" : "چالان یا د هغه تکتونه ونه موندل شول", "error");
        return;
      }

      // Extract ticket IDs from chalan
      const ticketIds = chalan.tickets.map(ticket => ticket.id);

      // Mark all tickets as arrived
      await axios.post(`${API_BASE_URL}/api/tickets/arrived`, {
        ticket_ids: ticketIds
      });
      
      showToast(
        language === 'fa' 
          ? `تمام تکت‌های چالان با موفقیت به وضعیت رسیده تغییر کردند` 
          : `ټول چالان تکتونه په بریالیتوب سره رسیدلي حالت ته بدل شول`
      );
      
      // Refresh data
      await fetchChalans();
      await fetchArrivedTickets();
      
      // Refresh trips data
      const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
      let allTripsData = res.data.trips || [];
      allTripsData = allTripsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAllTrips(allTripsData);
      
      // Don't filter out arrived tickets - let the filter handle it
      const tripsWithActiveTickets = allTripsData.map(trip => ({
        ...trip,
        tickets: trip.tickets || []
      }));
      
      setTrips(tripsWithActiveTickets);
      setFilteredTrips(tripsWithActiveTickets);
      
    } catch (error) {
      console.error("Error marking chalan tickets as arrived:", error);
      showToast(language === 'fa' ? "خطا در تغییر وضعیت تکت‌های چالان" : "په چالان تکتونو کې د حالت د بدلولو کې تېروتنه", "error");
    } finally {
      setMarkingArrived(null);
    }
  };

  // Create chalan from selected tickets with validation
 const handleCreateChalan = async () => {
    if (selectedTickets.length === 0) {
      showToast(language === 'fa' ? "لطفا حداقل یک تکت انتخاب کنید" : "مهرباني وکړئ لږ تر لږه یو تکت وټاکئ", "error");
      return;
    }

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

    // Show modal to enter chalan number
    setShowChalanNumberModal(true);
  };

  // NEW: Function to confirm chalan creation with custom number
  const confirmCreateChalan = async () => {
    if (!customChalanNumber.trim()) {
      showToast(language === 'fa' ? "لطفا شماره چالان را وارد کنید" : "مهرباني وکړئ د چالان شمېره ولیکئ", "error");
      return;
    }

    setCreatingChalan(true);
    
    try {
      const result = await chalanAPI.createChalan(selectedTickets, customChalanNumber.trim());
      showToast(language === 'fa' 
        ? `چالان شماره ${result.chalan?.chalan_number} با موفقیت ایجاد شد` 
        : `چالان شمېره ${result.chalan?.chalan_number} په بریالیتوب سره جوړ شو`
      );
      
      await fetchChalans();
      setSelectedTickets([]);
      clearSelectedTickets();
      setCustomChalanNumber(''); // Reset chalan number
      setShowChalanNumberModal(false); // Close modal
      
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

  // Delete chalan
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
      
      await fetchChalans();
      
    } catch (error) {
      console.error("Error deleting chalan:", error);
      showToast(language === 'fa' ? "خطا در حذف چالان" : "په چالان د ړنګولو کې تېروتنه", "error");
    }
  };

  // Handle update chalan
  const handleUpdateChalan = (chalan) => {
    setSelectedChalanForUpdate(chalan);
    setShowUpdateChalanModal(true);
  };

  // Handle chalan update success
  const handleChalanUpdateSuccess = () => {
    fetchChalans();
    setShowUpdateChalanModal(false);
    setSelectedChalanForUpdate(null);
  };

  // Calculate statistics based on current filtered trips
  const calculateStats = (tripsData) => {
    // Flatten all tickets from filtered trips (excluding arrived tickets for active stats)
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

  // Filter cleaners based on search
  useEffect(() => {
    if (cleanerSearch) {
      const filtered = cleaners.filter(cleaner => 
        cleaner.cleaner_name?.toLowerCase().includes(cleanerSearch.toLowerCase()) ||
        cleaner.cleaner_phone?.includes(cleanerSearch)
      );
      setFilteredCleaners(filtered);
    } else {
      setFilteredCleaners(cleaners);
    }
  }, [cleanerSearch, cleaners]);

  // Fetch cleaners
  useEffect(() => {
    const fetchCleaners = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/cleaners`);
        setCleaners(res.data);
      } catch (error) {
        console.error("Error fetching cleaners:", error);
        showToast(language === 'fa' ? "خطا در بارگذاری کلینرها" : "په کلینرونو د پورته کولو کې تېروتنه", "error");
      }
    };
    fetchCleaners();
  }, []);

  // Fetch arrived tickets for history - Include ALL tickets including arrived
  const fetchArrivedTickets = async () => {
    try {
      // Get all trips data and include arrived tickets
      const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
      let allTripsData = res.data.trips || [];
      
      // Extract ALL tickets including arrived ones for history
      const allTickets = allTripsData.flatMap(trip => 
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
      
      // For history, we want tickets with status 'arrived'
      const arrivedTickets = allTickets.filter(ticket => ticket.status === 'arrived');
      setArrivedChalans(arrivedTickets);
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
// Replace the trips filtering logic with this:

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
    
    // Filter tickets in each trip based on your criteria
    const filteredTripsData = allTripsData.map(trip => {
      // Filter tickets in this trip
      const filteredTickets = (trip.tickets || []).filter(ticket => {
        // Check if ticket is from qasid website
        const isFromQasid = ticket.from_website && 
          ticket.from_website.includes('qasid.org');
        
        if (isFromQasid) {
          // Only exclude qasid tickets if payment_status is NOT 'paid'
          return ticket.payment_status === 'paid';
        }
        
        // Include all other tickets (non-qasid AND qasid paid tickets)
        return true;
      });
      
      return {
        ...trip,
        tickets: filteredTickets
      };
    }).filter(trip => trip.tickets.length > 0); // Only keep trips that have tickets after filtering
    
    // Set trips with filtered tickets
    setTrips(filteredTripsData);
    setFilteredTrips(filteredTripsData);
    
    // Calculate new statistics
    const newStats = calculateStats(filteredTripsData);
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

  // Filter trips based on selected criteria - Properly handle arrived tickets
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
    
    // Filter by ticket status - Handle empty selection (show all)
    if (selectedTicketStatuses.length > 0) {
      filtered = filtered.map(trip => ({
        ...trip,
        tickets: trip.tickets?.filter(ticket => selectedTicketStatuses.includes(ticket.status)) || []
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
    selectedPaymentStatus, selectedPaymentMethod, selectedTicketStatuses, trips
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

  // Handle assignment of both driver and cleaner
  const handleAssignDriverAndCleaner = async () => {
    if (!selectedDriver) {
      showToast(language === 'fa' ? "لطفا یک راننده انتخاب کنید" : "مهرباني وکړئ یو چلوونکی وټاکئ", "error");
      return;
    }

    if (selectedTickets.length === 0) {
      showToast(language === 'fa' ? "لطفا حداقل یک تکت انتخاب کنید" : "مهرباني وکړئ لږ تر لږه یو تکت وټاکئ", "error");
      return;
    }

    setAssigning(true);
    
    try {
      // Get driver data to include bus_number_plate in assignment
      const selectedDriverData = drivers.find(d => d.id === parseInt(selectedDriver));
      
      // Process each selected ticket individually
      const assignmentPromises = selectedTickets.map(ticketId => {
        const assignmentData = {
          driver_id: selectedDriver
        };
        
        // Add cleaner if selected
        if (selectedCleaner) {
          assignmentData.cleaner_id = selectedCleaner;
        }
        
        // Add bus_number_plate from driver if available
        if (selectedDriverData && selectedDriverData.bus_number_plate) {
          assignmentData.bus_number_plate = selectedDriverData.bus_number_plate;
        }
        
        return axios.put(`${API_BASE_URL}/api/tickets/${ticketId}/assign`, assignmentData);
      });
      
      await Promise.all(assignmentPromises);
      
      showToast(language === 'fa' ? "انتساب با موفقیت انجام شد" : "ټاکل په بریالیتوب سره ترسره شو");
      clearSelectedTickets();
       setTimeout(() => setClearTableSelection(false), 100);
      setSelectedDriver("");
      setSelectedCleaner("");
      setDriverSearch("");
      setCleanerSearch("");
      
      // Refresh trips data
      const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
      let allTripsData = res.data.trips || [];
      
      // Sort trips by created_at in descending order (newest first)
      allTripsData = allTripsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setAllTrips(allTripsData);
      
      // Don't filter out arrived tickets
      const tripsWithAllTickets = allTripsData.map(trip => ({
        ...trip,
        tickets: trip.tickets || []
      }));
      
      setTrips(tripsWithAllTickets);
      setFilteredTrips(tripsWithAllTickets);
      
      // Update stats
      const newStats = calculateStats(tripsWithAllTickets);
      setStats(newStats);
      
    } catch (error) {
      console.error("Error assigning driver and cleaner:", error);
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
      let payload = {};
      
      switch (status) {
        case 'paid':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/mark-paid`;
          break;
        case 'unpaid':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/mark-unpaid`;
          break;
        case 'stopped':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/stop`;
          break;
        case 'arrived':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/arrived`;
          break;
        case 'cancelled':
          endpoint = `${API_BASE_URL}/api/tickets/${ticketId}/cancel`;
          break;
        default:
          return;
      }
      
      await axios.post(endpoint, payload);
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
      
      const tripsWithAllTickets = allTripsData.map(trip => ({
        ...trip,
        tickets: trip.tickets || []
      }));
      
      setTrips(tripsWithAllTickets);
      setFilteredTrips(tripsWithAllTickets);
      
    } catch (error) {
      console.error(`Error updating ticket status to ${status}:`, error);
      showToast(language === 'fa' ? "خطا در تغییر وضعیت تکت" : "په تکت کې د حالت د بدلولو کې تېروتنه", "error");
    } finally {
      setUpdatingTicket(null);
    }
  };

  // Get status text for display - UPDATED: removed in_processing and riding
  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی';
      case 'stopped': return language === 'fa' ? 'متوقف شده' : 'درېدلی';
      case 'cancelled': return language === 'fa' ? 'لغو شده' : 'لغوه شوی';
      case 'arrived': return language === 'fa' ? 'رسیده' : 'رسیدلی';
      case 'unpaid': return language === 'fa' ? 'پرداخت نشده' : 'نه دی ورکړل شوی';
      case 'in_processing': return language === 'fa' ? 'در حال پردازش' : 'د پیسو ورکولو په تمه';
      default: return status;
    }
  };

  // Helper function to get driver details by ID
  const getDriverDetails = (driverId) => {
    if (!driverId) return language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
    const driver = drivers.find(d => d.id === parseInt(driverId));
    return driver ? `${driver.name} ${driver.father_name}` : language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
  };

  // Helper function to get driver phone by ID
  const getDriverPhone = (driverId) => {
    if (!driverId) return language === 'fa' ? "نامشخص" : "ناجوت";
    const driver = drivers.find(d => d.id === parseInt(driverId));
    return driver ? driver.phone : language === 'fa' ? "نامشخص" : "ناجوت";
  };

  // Helper function to get bus number plate by driver ID
  const getBusNumberPlate = (driverId) => {
    if (!driverId) return language === 'fa' ? "تعیین نشده" : "نه دی ټاکل شوی";
    const driver = drivers.find(d => d.id === parseInt(driverId));
    return driver ? (driver.bus_number_plate || language === 'fa' ? "تعیین نشده" : "نه دی ټاکل شوی") : language === 'fa' ? "تعیین نشده" : "نه دی ټاکل شوی";
  };

  // Helper function to get cleaner details by ID
  const getCleanerDetails = (cleanerId) => {
    if (!cleanerId) return language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
    const cleaner = cleaners.find(c => c.id === parseInt(cleanerId));
    return cleaner ? `${cleaner.cleaner_name}` : language === 'fa' ? "انتساب نشده" : "نه دی ټاکل شوی";
  };

  // Helper function to get cleaner phone by ID
  const getCleanerPhone = (cleanerId) => {
    if (!cleanerId) return language === 'fa' ? "نامشخص" : "ناجوت";
    const cleaner = cleaners.find(c => c.id === parseInt(cleanerId));
    return cleaner ? cleaner.cleaner_phone : language === 'fa' ? "نامشخص" : "ناجوت";
  };

  const formatTimeForChalan = (time) => {
  if (!time) return "";
  
  // If already in correct format for current language, return as is
  if (language === 'fa' && (time.includes('ق.ظ') || time.includes('ب.ظ'))) {
    return time;
  }
  if (language !== 'fa' && (time.includes('م:غ') || time.includes('و:غ'))) {
    return time;
  }
  
  // Handle 24-hour format
  try {
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    let minute = minutes || '00';
    
    let period = language === 'fa' ? 'ق.ظ' : 'م:غ';
    if (hour >= 12) {
      period = language === 'fa' ? 'ب.ظ' : 'و:غ';
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

  // Format time to display in Persian/Dari
 // Format time to display in Persian/Dari or Pashto
// Format time to display in Persian/Dari or Pashto
const formatTimeForDisplay = (time) => {
  if (!time) return "";
  
  // If already in the correct format for current language, return as is
  if (language === 'fa' && (time.includes('ق.ظ') || time.includes('ب.ظ'))) {
    return time;
  }
  if (language !== 'fa' && (time.includes('م:غ') || time.includes('و:غ'))) {
    return time;
  }
  
  // Convert to current language format
  try {
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    let minute = minutes || '00';
    
    let period = language === 'fa' ? 'ق.ظ' : 'م:غ'; // AM
    if (hour >= 12) {
      period = language === 'fa' ? 'ب.ظ' : 'و:غ'; // PM
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
 const handleClearTableSelection = () => {
  setClearTableSelection(true);
  setTimeout(() => setClearTableSelection(false), 100);
};

const clearSelectedTickets = () => {
  setSelectedTickets([]);
  handleClearTableSelection();
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
    setSelectedTicketStatuses([]);
  };

  // Print specific chalan for VIP or 580
  const handlePrintChalan = (chalan) => {
    if (!chalan.tickets || chalan.tickets.length === 0) {
      showToast(language === 'fa' ? "هیچ تکت برای چاپ وجود ندارد" : "د چاپ لپاره هیڅ تکت نشته", "error");
      return;
    }

    // Get company data from session storage
    const getCompanyData = () => {
      try {
        const companyData = sessionStorage.getItem('company');
        if (companyData) {
          const parsedData = JSON.parse(companyData);
          return {
            name: parsedData.name || 'شرکت تراسپورتی',
            phone: parsedData.phone || 'نامشخص'
          };
        }
      } catch (error) {
        console.error("Error getting company data:", error);
      }
      return {
        name: 'شرکت تراسپورتی',
        phone: 'نامشخص'
      };
    };

    const companyData = getCompanyData();

    // Get company logo
    const getCompanyLogo = () => {
      try {
        const companyData = sessionStorage.getItem('company');
        if (companyData) {
          const parsedData = JSON.parse(companyData);
          if (parsedData.logo_url) {
            return `${import.meta.env.VITE_API_BASE_URL_For_logo}/public/${parsedData.logo_url}`;
          }
        }
        
        const logoUrl = sessionStorage.getItem('company_logo_url');
        if (logoUrl) {
          return `${import.meta.env.VITE_API_BASE_URL_For_logo}/public/${logoUrl}`;
        }
      } catch (error) {
        console.error("Error getting company logo:", error);
      }
      return logo;
    };

    const companyLogoUrl = getCompanyLogo();

    // Get ticket details from the first ticket
    const firstTicket = chalan.tickets[0];
    const busType = firstTicket.bus_type;
    
    // Sort tickets by seat number in ascending order
    const sortedTickets = [...chalan.tickets].sort((a, b) => {
      // Get first seat number from array or use single seat number
      const seatA = Array.isArray(a.seat_numbers) ? parseInt(a.seat_numbers[0]) : parseInt(a.seat_number);
      const seatB = Array.isArray(b.seat_numbers) ? parseInt(b.seat_numbers[0]) : parseInt(b.seat_number);
      
      return (seatA || 0) - (seatB || 0);
    });

    // Calculate chalan details using sorted tickets
    const totalSeats = sortedTickets.reduce((total, ticket) => {
      const seatCount = Array.isArray(ticket.seat_numbers) 
        ? ticket.seat_numbers.length 
        : (ticket.seat_number ? 1 : 0);
      return total + seatCount;
    }, 0);
      
    const totalPrice = sortedTickets.reduce((total, ticket) => {
      return total + (parseFloat(ticket.final_price) || 0);
    }, 0);
      
    const safiChalan = totalPrice * 0.02;
    const netAmount = totalPrice - safiChalan;

    // Create a map of seat numbers to tickets for easier lookup
    const seatToTicketMap = {};
    sortedTickets.forEach(ticket => {
      if (Array.isArray(ticket.seat_numbers)) {
        ticket.seat_numbers.forEach(seat => {
          seatToTicketMap[seat] = ticket;
        });
      } else if (ticket.seat_number) {
        seatToTicketMap[ticket.seat_number] = ticket;
      }
    });

    const parentTrip = allTrips.find(trip => 
      trip.id === firstTicket.trip_id || 
      trip.tickets?.some(t => t.id === firstTicket.id)
    );
    
    // Get trip information
    let fromLocation = language === 'fa' ? 'نامشخص' : 'ناجوت';
    let toLocation = language === 'fa' ? 'نامشخص' : 'ناجوت';
    let departureTime = formatTimeForChalan(firstTicket.trip?.departure_time) || 
                       formatTimeForChalan(parentTrip?.departure_time) || 
                       (language === 'fa' ? 'نامشخص' : 'ناجوت');
    
    if (parentTrip) {
      fromLocation = parentTrip.from || fromLocation;
      toLocation = parentTrip.to || toLocation;
      departureTime = formatTimeForDisplay(parentTrip.departure_time) || departureTime;
    }

    // Get driver information - Check ALL tickets for driver assignment
    let driverName = language === 'fa' ? 'نامشخص' : 'ناجوت';
    let driverPhone = language === 'fa' ? 'نامشخص' : 'ناجوت';
    let busNumberPlate = language === 'fa' ? 'تعیین نشده' : 'نه دی ټاکل شوی';

    // Find the first ticket that has a driver assigned
    const ticketWithDriver = sortedTickets.find(ticket => ticket.driver_id);
    
    if (ticketWithDriver && ticketWithDriver.driver_id) {
      const driver = drivers.find(d => d.id === parseInt(ticketWithDriver.driver_id));
      
      if (driver) {
        driverName = `${driver.name || ''} ${driver.father_name || ''}`.trim() || driverName;
        driverPhone = driver.phone || driverPhone;
        busNumberPlate = driver.bus_number_plate || busNumberPlate;
      }
    }

    // Get cleaner information - Check ALL tickets and use cleaner data from ticket
    let cleanerPhone = language === 'fa' ? 'نامشخص' : 'ناجوت';
    let cleanerName = language === 'fa' ? 'نامشخص' : 'ناجوت';

    // Find the first ticket that has a cleaner assigned
    const ticketWithCleaner = sortedTickets.find(ticket => ticket.cleaner_id);
    
    if (ticketWithCleaner && ticketWithCleaner.cleaner_id) {
      // First try to get cleaner data from the ticket itself (if it includes cleaner relationship)
      if (ticketWithCleaner.cleaner) {
        cleanerName = ticketWithCleaner.cleaner.cleaner_name || cleanerName;
        cleanerPhone = ticketWithCleaner.cleaner.cleaner_phone || cleanerPhone;
      } 
      // If not, try to find cleaner in the cleaners list
      else {
        const cleaner = cleaners.find(c => c.id === parseInt(ticketWithCleaner.cleaner_id));
        
        if (cleaner) {
          cleanerName = cleaner.cleaner_name || cleanerName;
          cleanerPhone = cleaner.cleaner_phone || cleanerPhone;
        }
      }
    }

    // Get current date in Persian format
    const currentDate = new Date().toLocaleDateString('fa-IR-u-nu-latn');
    
    // Use ticket departure_date
    const departureDate = firstTicket.departure_date || currentDate;
    const busImageUrl = "data:image/jpeg;base64,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";

    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
            @font-face {
        font-family: 'Nazanin';
        src: url('${window.location.origin}/fonts/B-NAZANIN.TTF') format('truetype'),
             url('${window.location.origin}/fonts/B-NAZANIN.woff') format('woff'),
             url('${window.location.origin}/fonts/B-NAZANIN.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
      }
      
      /* Fallback for Nazanin font */
      @font-face {
        font-family: 'Nazanin';
        src: local('B Nazanin'),
             local('BNazanin'),
             local('B-Nazanin'),
             local('Nazanin');
        font-weight: normal;
        font-style: normal;
      }

      * {
        font-family: 'Nazanin' !important;
      }
          body {
            font-family: 'Nazanin' !important;
            direction: rtl;
            margin: 10px;
            background: white;
            font-size: 9px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            font-size: 8px;
          }
          th, td {
            border: 1px solid #000;
            text-align: center;
            padding: 3px;
          }
          .header-table td {
            border: none;
            text-align: right;
            padding: 4px;
          }
          .highlight {
            background-color: #ffea00;
            font-weight: bold;
            text-align: center;
            font-size: 12px;
          }
          .blue-header {
            background-color: #b6d7f0;
            font-weight: bold;
          }
          .footer td {
            border: 1px solid #000;
            text-align: right;
            padding: 4px 6px;
          }
          
          /* Equal column widths for left and right sections */
          .seat { width: 5%; }
          .name { width: 10%; }
          .father { width: 8%; }
          .province { width: 7%; }
          .fare { width: 7%; }
          .phone { width: 10%; }
          .cargo { width: 5%; }
          
          .logo-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 8px;
          }
          .logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <h3 style="text-align: center; margin: 5px 0; font-size: 10px;">ضمیمه شماره (10)</h3>
        
        <div class="logo-container">
          <div class="logo-container">
            <img src="${companyLogoUrl}" alt="لوگوی شرکت" class="logo">
            <img src="${busImageUrl}" alt="بس" class="logo">
          </div>
        </div>
        
        <table style="text-align: right; margin-bottom: 8px;">
          <tr>
            <td style="text-align: right;">نمبر چالان</td>
            <td style="width: 12%;">${chalan.chalan_number}</td>
            <td colspan="4" class="highlight">شرکت ترانسپورتی ${companyData.name}</td>
            <td></td>
          </tr>
          <tr>
            <td style="text-align: right;">نمبر پلیت موتر</td>
            <td>${busNumberPlate}</td>
            <td style="text-align: right;">اسم راننده</td>
            <td style="width:15%;">${driverName}</td>
            <td style="text-align: right;">تاریخ حرکت</td>
            <td colspan="2">${departureDate}</td>
          </tr>
          <tr>
            <td style="text-align: right;" rowspan="2">نوعیت موتر</td>
            <td style="text-align: right;" rowspan="2">${busType}</td>
            <td style="text-align: right;">نمبر تماس راننده</td>
            <td>${driverPhone}</td>
            <td style="text-align: right;">وقت حرکت</td>
            <td colspan="2">${departureTime || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right;">نمبر تماس نماینده</td>
            <td>${cleanerPhone}</td>
            <td style="text-align: right;">مبدا و مقصد</td>
            <td colspan="2">از ${fromLocation} الی ${toLocation}</td>
          </tr>
        </table>

        <table>
          <tr class="blue-header">
            <!-- Left Section Headers -->
            <th class="seat">نمبر چوکی</th>
            <th class="name">اسم مسافر</th>
            <th class="father">ولد</th>
            <th class="province">ولایت</th>
            <th class="fare">کرایه</th>
            <th class="phone">شماره تماس مسافر و اقارب</th>
            <th class="cargo">شماره بار</th>

            <!-- Right Section Headers (EXACTLY same structure) -->
            <th class="seat">نمبر چوکی</th>
            <th class="name">اسم مسافر</th>
            <th class="father">ولد</th>
            <th class="province">ولایت</th>
            <th class="fare">کرایه</th>
            <th class="phone">شماره تماس مسافر و اقارب</th>
            <th class="cargo">شماره بار</th>
          </tr>

          <tbody>
            ${Array.from({ length: 27 }, (_, i) => {
              const leftSeat = i + 1;
              const rightSeat = i + 28;
              
              // Use the seat map for lookup
              const leftTicket = seatToTicketMap[leftSeat];
              const rightTicket = seatToTicketMap[rightSeat];

              return `
                <tr>
                  <!-- Left Side Data -->
                  <td>${leftSeat}</td>
                  <td>${leftTicket?.name || ''}</td>
                  <td>${leftTicket?.father_name || ''}</td>
                  <td>${leftTicket?.province || ''}</td>
                  <td>${leftTicket ? (parseFloat(leftTicket.final_price) || 0).toLocaleString() : ''}</td>
                  <td>${leftTicket?.phone || ''}</td>
                  <td></td>
                  
                  <!-- Right Side Data (EXACTLY same structure) -->
                  <td>${rightSeat}</td>
                  <td>${rightTicket?.name || ''}</td>
                  <td>${rightTicket?.father_name || ''}</td>
                  <td>${rightTicket?.province || ''}</td>
                  <td>${rightTicket ? (parseFloat(rightTicket.final_price) || 0).toLocaleString() : ''}</td>
                  <td>${rightTicket?.phone || ''}</td>
                  <td></td>
                </tr>
              `;
            }).join('')}
          </tbody>

          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right; padding-right:8px;">مجموع مسافر</td>
              <td colspan="11">${totalSeats} نفر</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right; padding-right:8px;">مجموع کرایه به افغانی</td>
              <td colspan="11">${totalPrice.toLocaleString()} افغانی</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right; padding-right:8px;">مجموع %2 کمیشن شرکت به افغانی</td>
              <td colspan="11">${safiChalan.toLocaleString()} افغانی</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right; padding-right:8px;">صافی چالان (بعد از کسر %2)</td>
              <td colspan="11">${netAmount.toLocaleString()} افغانی</td>
            </tr>
          </tfoot>
        </table>
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
              <th>${language === 'fa' ? 'نمبر چوکی' : 'د چوکۍ نمبر'}</th>
              <th>${language === 'fa' ? 'نوع بس' : 'د بس ډول'}</th>
              <th>${language === 'fa' ? 'قیمت' : 'بیه'}</th>
              <th>${language === 'fa' ? 'روش پرداخت' : 'د پیسو ورکولو طریقه'}</th>
              <th>${language === 'fa' ? 'وضعیت پرداخت' : 'د پیسو ورکولو حالت'}</th>
              <th>${language === 'fa' ? 'راننده' : 'چلوونکی'}</th>
              <th>${language === 'fa' ? 'نماینده' : 'نماینده'}</th>
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
                <td>${ticket.driver_details || ''}</td>
                <td>${ticket.cleaner_details || ''}</td>
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

  // Table columns
  const columns = [
    { 
    header: language === 'fa' ? "شماره تکت" : "د تکت شمېره", 
    accessor: "ticket_number",
    render: (row) => (
      <div className="text-center">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
          {row.ticket_number}
        </span>
      </div>
    )
  },
    
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
    header: language === 'fa' ? "نام پدر" : "د پلار نوم", 
    accessor: "father_name",
    render: (row) => row.father_name || ''
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
      header: language === 'fa' ? "نمبرچوکی" : "د چوکۍ نمبر", 
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
          row.payment_status === (language === 'fa' ? 'در حال پردازش' : 'د پیسو ورکولو په تمه') ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
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
      header: language === 'fa' ? "راننده" : "چلوونکی", 
      accessor: "driver_details",
      render: (row) => row.driver_details
    },
    { 
      header: language === 'fa' ? "نماینده" : "نماینده", 
      accessor: "cleaner_details",
      render: (row) => row.cleaner_details
    },
{
  header: t.operations,
  accessor: "actions",
  render: (row) => (
    <div className="flex flex-col gap-2 min-w-[150px]">
      {/* Status Dropdown - INCLUDING PAYMENT STATUS */}
      <div className="relative">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              handleTicketStatusUpdate(row.id, e.target.value);
              e.target.value = ""; // Reset selection
            }
          }}
          disabled={updatingTicket === row.id}
          className="w-full bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm flex items-center gap-2 justify-center transition-colors appearance-none cursor-pointer pr-8 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="" disabled selected className="text-gray-500">
            {updatingTicket === row.id ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                {language === 'fa' ? 'در حال پردازش...' : 'په پروسس کې...'}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-gray-700">
                <RiPlayCircleLine className="text-gray-600" />
                {language === 'fa' ? 'تغییر وضعیت' : 'حالت بدلول'}
              </span>
            )}
          </option>
          
          {/* TICKET STATUS OPTIONS */}
          <optgroup label={language === 'fa' ? 'وضعیت تکت' : 'د تکت حالت'}>
            <option value="stopped" className="text-gray-700 hover:bg-orange-50">
              {language === 'fa' ? 'متوقف شده' : 'درېدلی'}
            </option>
            <option value="arrived" className="text-gray-700 hover:bg-green-50">
              {language === 'fa' ? 'رسیده' : 'رسیدلی'}
            </option>
            <option value="cancelled" className="text-gray-700 hover:bg-red-50">
              {language === 'fa' ? 'لغو شده' : 'لغوه شوی'}
            </option>
          </optgroup>
          
          {/* PAYMENT STATUS OPTIONS */}
          <optgroup label={language === 'fa' ? 'وضعیت پرداخت' : 'د پیسو ورکولو حالت'}>
            <option value="paid" className="text-gray-700 hover:bg-green-50">
              {language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی'}
            </option>
            <option value="unpaid" className="text-gray-700 hover:bg-red-50">
              {language === 'fa' ? 'پرداخت نشده' : 'نه دی ورکړل شوی'}
            </option>
          </optgroup>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
          <RiArrowDownSLine className="text-lg" />
        </div>
      </div>

      {/* Print Ticket Button */}
      <div className="flex gap-1">
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
}
  ];

  // Prepare table data (flatten trips+tickets) - UPDATED: removed in_processing and riding
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
      
      // Better status mapping with fallback - UPDATED: removed in_processing and riding
      const getTicketStatusText = (status) => {
        if (!status) return language === 'fa' ? 'نامشخص' : 'ناجوت';
        
        const statusMap = {
          'stopped': language === 'fa' ? 'متوقف شده' : 'درېدلی',
          'cancelled': language === 'fa' ? 'لغو شده' : 'لغوه شوی',
          'paid': language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی',
          'unpaid': language === 'fa' ? 'پرداخت نشده' : 'نه دی ورکړل شوی',
          'pending': language === 'fa' ? 'در انتظار پرداخت' : 'د پیسو ورکولو په تمه',
          'arrived': language === 'fa' ? 'رسیده' : 'رسیدلی'
        };
        
        // Check both exact match and case-insensitive match
        return statusMap[status] || 
               statusMap[status.toLowerCase()] || 
               status || (language === 'fa' ? 'نامشخص' : 'ناجوت');
      };

      // Payment status mapping
      const getPaymentStatusText = (status) => {
        if (!status) return language === 'fa' ? 'نامشخص' : 'ناجوت';
        
        const statusMap = {
          'paid': language === 'fa' ? 'پرداخت شده' : 'ورکړل شوی',
          'unpaid': language === 'fa' ? 'پرداخت نشده' : 'نه دی ورکړل شوی',
          'in_processing': language === 'fa' ? 'در حال پردازش' : 'د پروسیس حالت',

        };
        
        return statusMap[status] || statusMap[status.toLowerCase()] || status || (language === 'fa' ? 'نامشخص' : 'ناجوت');
      };
      
      return {
        id: ticket.id,
          ticket_number: ticket.ticket_number,
        from: trip.from,
        to: trip.to,
        ticket_departure_date: ticket.departure_date || trip.departure_date,
        departure_time: trip.departure_time,
        created_at_persian: created_at_persian,
        created_at_date: created_at_date,
        created_at_time: created_at_time,
        created_at_humanized: created_at_humanized,
        name: ticket.name,
        father_name: ticket.father_name || '',
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
        // Better status handling
        ticket_status: getTicketStatusText(ticket.status),
        driver_details: getDriverDetails(ticket.driver_id),
        cleaner_details: getCleanerDetails(ticket.cleaner_id),
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
            'bg-red-100 text-red-800'
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
    <span className="text-sm">${language === 'fa' ? 'نام پدر:' : 'د پلار نوم:'} ${ticket.father_name || ''}</span>
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
          ticket.driver_details !== (language === 'fa' ? 'انتساب نشده' : 'نه دی ټاکل شوی') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div>{language === 'fa' ? 'راننده' : 'چلوونکی'}</div>
          <div className="font-bold">{ticket.driver_details}</div>
        </div>
        <div className={`p-2 rounded text-center ${
          ticket.cleaner_details !== (language === 'fa' ? 'انتساب نشده' : 'نه دی ټاکل شوی') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div>{language === 'fa' ? 'نماینده' : 'نماینده'}</div>
          <div className="font-bold">{ticket.cleaner_details}</div>
        </div>
      </div>

      {/* Action Buttons for Mobile - Only three options */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'stopped')}
          disabled={updatingTicket === ticket.id}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
        >
          <RiStopCircleLine />
          {language === 'fa' ? 'توقف' : 'درېدل'}
        </button>
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'arrived')}
          disabled={updatingTicket === ticket.id}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
        >
          <RiCheckboxCircleLine />
          {language === 'fa' ? 'رسیده' : 'رسیدلی'}
        </button>
        <button
          onClick={() => handleTicketStatusUpdate(ticket.id, 'cancelled')}
          disabled={updatingTicket === ticket.id}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
        >
          <RiCloseCircleLine />
          {language === 'fa' ? 'لغو' : 'لغوه'}
        </button>
      </div>
    </div>
  );

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
                  {/* Chalan History Button */}
                  <button
                    onClick={() => setShowChalanHistory(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <RiHistoryLine />
                    {language === 'fa' ? 'تاریخچه چالان‌ها' : '  د چالانونو تاریخچه '}
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
                  
                  {/* Day Filter - Updated with better placeholder */}
                {/* Day Filter - Corrected */}
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
{/* Enhanced Time Picker - Matching Tripa Style */}
<div className="flex flex-col min-w-[160px]">
  <div className="flex items-center justify-between mb-1">
    <label className="text-sm text-gray-600 flex items-center ml-[90px] gap-2 justify-end">
      {language === 'fa' ? 'زمان حرکت' : 'د تګ وخت'}
    </label>
    
    {/* Reset Clock Button */}
    {(selectedHour || selectedMinute || selectedPeriod || selectedTime) && (
      <button
        onClick={() => {
          setSelectedTime('');
          setSelectedHour('');
          setSelectedMinute('');
          setSelectedPeriod('');
        }}
        className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
        title={language === 'fa' ? 'بازنشانی زمان' : 'وخت بیا تنظیم کول'}
      >
        <RiCloseLine className="text-xs" />
        {language === 'fa' ? 'بازنشانی' : 'بیا تنظیم'}
      </button>
    )}
  </div>
  
  <div className="relative">
    <input
      type="time"
      value={selectedTime || ''}
      onChange={(e) => {
        const timeValue = e.target.value;
        setSelectedTime(timeValue);
        
        if (timeValue) {
          const [hours, minutes] = timeValue.split(':');
          const hourInt = parseInt(hours);
          const minuteInt = parseInt(minutes);
          
          // Convert to 12-hour format for filtering
          let displayHour = hourInt;
          let period = 'AM';
          
          if (hourInt >= 12) {
            period = 'PM';
            if (hourInt > 12) {
              displayHour = hourInt - 12;
            }
          }
          if (hourInt === 0) {
            displayHour = 12;
          }
          
          setSelectedHour(displayHour.toString());
          setSelectedMinute(minuteInt.toString());
          setSelectedPeriod(period);
        } else {
          setSelectedHour('');
          setSelectedMinute('');
          setSelectedPeriod('');
        }
      }}
      className="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-right direction-ltr"
      dir="ltr"
    />
    <RiTimeLine className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
  </div>
  
  {/* Display selected time in 12-hour format */}
  {selectedTime ? (
    <div className="text-xs text-green-600 mt-1 text-center bg-green-50 py-1 rounded">
      {formatTimeForDisplay(selectedTime)}
    </div>
  ) : (
    <div className="text-xs text-gray-500 mt-1 text-center">
      {language === 'fa' ? 'همه زمان‌ها' : 'ټول وختونه'}
    </div>
  )}
</div>

{/* Hour Filter with All Option */}


                  
                  {/* From Filter */}
                  
                  
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
                  
                  {/* Payment Status Filter */}
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
                      <option value="in_proccissing">{language === 'fa' ? 'در  حال پردازش' : 'د پیسو ورکولو په تمه'}</option>
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
                      <option value="doorpay">{language === 'fa' ? 'حضوری ' : 'په حضوری توگه'}</option>
                    </select>
                  </div>
                  
                  {/* Time Filter - Hour */}
                 {/* Enhanced Time Picker - Matching Tripa Style */}

                </div>
              </div>

              {/* Ticket Status Filter Section */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[#0B2A5B] text-sm flex items-center gap-2">
                    <RiFilterLine />
                    {language === 'fa' ? 'فیلتر وضعیت تکت' : 'د تکت حالت فیلتر'}
                  </h3>
                  <button
                    onClick={handleSelectAllTicketStatuses}
                    className="text-blue-600 text-xs flex items-center gap-1"
                  >
                    <RiCheckLine />
                    {selectedTicketStatuses.length === ticketStatusOptions.length ? 
                      (language === 'fa' ? 'لغو انتخاب همه' : 'ټول انتخابونه لغوه کړئ') : 
                      (language === 'fa' ? 'انتخاب همه' : 'ټول وټاکئ')
                    }
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {ticketStatusOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`status-${option.value}`}
                        checked={selectedTicketStatuses.includes(option.value)}
                        onChange={() => handleTicketStatusChange(option.value)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`status-${option.value}`}
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  {language === 'fa' ? 'انتخاب شده:' : 'ټاکل شوي:'} {selectedTicketStatuses.length} {language === 'fa' ? 'وضعیت' : 'حالت'}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={resetFilters}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 text-sm justify-center"
                  >
                    <RiCloseLine />
                    {language === 'fa' ? 'حذف همه فیلترها' : 'ټول فیلترونه لرې کړئ'}
                  </button>
                  
                  {/* Create Chalan Button */}
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

           
            

            {/* Chalan Print Section */}
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

        // Get current assignment status for this chalan
        const ticketsInChalan = chalan.tickets || [];
        const hasAssignedDriver = ticketsInChalan.some(t => t.driver_id);
        const hasAssignedCleaner = ticketsInChalan.some(t => t.cleaner_id);
        
        // Get currently assigned driver and cleaner
        const currentAssignedDriver = drivers.find(d => 
          chalan.tickets.some(t => t.driver_id === d.id)
        );
        const currentAssignedCleaner = cleaners.find(c => 
          chalan.tickets.some(t => t.cleaner_id === c.id)
        );
        
        // Get departure time from multiple sources
        const getDepartureTime = () => {
          // Try multiple sources for departure time
          const departureTime = 
            firstTicket.trip?.departure_time || 
            firstTicket.departure_time ||
            (allTrips.find(trip => 
              trip.id === firstTicket.trip_id || 
              trip.tickets?.some(t => t.id === firstTicket.id)
            )?.departure_time);
          
          return departureTime ? formatTimeForDisplay(departureTime) : (language === 'fa' ? 'نامشخص' : 'ناجوت');
        };
        
        return (
          <div key={chalan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-[#0B2A5B]">
                {(() => {
                  const trip = allTrips.find(t => t.id === firstTicket.trip_id);
                  return trip ? `${trip.from} الی ${trip.to}` : (language === 'fa' ? 'نامشخص - نامشخص' : 'ناجوت - ناجوت');
                })()}
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
            
            {/* Departure Time Display */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>{language === 'fa' ? 'تاریخ:' : 'نېټه:'}</span>
                <span>{firstTicket.departure_date || firstTicket.trip?.departure_date || (language === 'fa' ? 'نامشخص' : 'ناجوت')}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'fa' ? 'زمان:' : 'وخت:'}</span>
                <span>{getDepartureTime()}</span>
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
              
              {/* Assignment Status */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span>{language === 'fa' ? 'وضعیت انتساب:' : 'د ټاکلو حالت:'}</span>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    hasAssignedDriver ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {language === 'fa' ? 'راننده' : 'چلوونکی'} 
                    {hasAssignedDriver ? ' ✓' : ' ✗'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    hasAssignedCleaner ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {language === 'fa' ? 'نماینده' : 'نماینده'} 
                    {hasAssignedCleaner ? ' ✓' : ' ✗'}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment Section - ALWAYS show inputs for reassignment */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-sm text-blue-800 mb-2">
                {language === 'fa' ? 'انتساب به تکت‌های این چالان' : 'د دې چالان تکتونو ته ټاکل'}
              </h5>
              
              {/* Show current assignment status */}
              <div className="space-y-2 mb-3 p-2 bg-white rounded border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{language === 'fa' ? 'راننده فعلی:' : 'اوسنی چلوونکی:'}</span>
                  <span className="text-sm">
                    {hasAssignedDriver ? (
                      <span className="text-green-600 font-medium">
                        {currentAssignedDriver ? 
                          `${currentAssignedDriver.name} ${currentAssignedDriver.father_name}` : 
                          (language === 'fa' ? 'انتساب شده' : 'ټاکل شوی')}
                      </span>
                    ) : (
                      <span className="text-yellow-600">{language === 'fa' ? 'انتساب نشده' : 'نه دی ټاکل شوی'}</span>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{language === 'fa' ? 'نماینده فعلی:' : 'اوسنی نماینده:'}</span>
                  <span className="text-sm">
                    {hasAssignedCleaner ? (
                      <span className="text-green-600 font-medium">
                        {currentAssignedCleaner ? 
                          `${currentAssignedCleaner.cleaner_name}` : 
                          (language === 'fa' ? 'انتساب شده' : 'ټاکل شوی')}
                      </span>
                    ) : (
                      <span className="text-yellow-600">{language === 'fa' ? 'انتساب نشده' : 'نه دی ټاکل شوی'}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* ALWAYS show assignment inputs for reassignment */}
              <div className="space-y-2">
                {/* Driver Selection - ALWAYS show */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {language === 'fa' ? 'راننده' : 'چلوونکی'} {hasAssignedDriver && `(${language === 'fa' ? 'تغییر' : 'بدلول'})`}
                  </label>
                  <select
                    value={chalan.assignedDriver || ''}
                    onChange={(e) => {
                      const driverId = e.target.value;
                      const selectedDriverData = drivers.find(d => d.id === parseInt(driverId));
                      
                      setChalans(prev => prev.map(c => 
                        c.id === chalan.id 
                          ? { 
                              ...c, 
                              assignedDriver: driverId, 
                              assignedDriverData: selectedDriverData 
                            }
                          : c
                      ));
                      
                      if (selectedDriverData && selectedDriverData.bus_number_plate) {
                        showToast(
                          language === 'fa' 
                            ? `نمبر پلیت بس: ${selectedDriverData.bus_number_plate}` 
                            : `د بس نمبر پلیټ: ${selectedDriverData.bus_number_plate}`, 
                          "success"
                        );
                      }
                    }}
                    className="w-full border p-2 rounded text-sm"
                  >
                    <option value="">{language === 'fa' ? '-- انتخاب راننده --' : '-- چلوونکی ټاکل --'}</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} {driver.father_name} 
                        {driver.bus_number_plate ? ` - ${driver.bus_number_plate}` : ''}
                      </option>
                    ))}
                  </select>
                  
                  {/* Display selected driver's bus number plate */}
                  {chalan.assignedDriverData && chalan.assignedDriverData.bus_number_plate && (
                    <div className="mt-1 text-xs text-green-600">
                      <strong>{language === 'fa' ? 'نمبر پلیت:' : 'نمبر پلیټ:'}</strong> {chalan.assignedDriverData.bus_number_plate}
                    </div>
                  )}
                </div>
                
                {/* Cleaner Selection - ALWAYS show */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {language === 'fa' ? 'نماینده' : 'نماینده'} {hasAssignedCleaner && `(${language === 'fa' ? 'تغییر' : 'بدلول'})`}
                  </label>
                  <select
                    value={chalan.assignedCleaner || ''}
                    onChange={(e) => {
                      const cleanerId = e.target.value;
                      setChalans(prev => prev.map(c => 
                        c.id === chalan.id 
                          ? { ...c, assignedCleaner: cleanerId }
                          : c
                      ));
                    }}
                    className="w-full border p-2 rounded text-sm"
                  >
                    <option value="">{language === 'fa' ? '-- انتخاب نماینده --' : '-- نماینده ټاکل --'}</option>
                    {cleaners.map((cleaner) => (
                      <option key={cleaner.id} value={cleaner.id}>
                        {cleaner.cleaner_name} - {cleaner.cleaner_phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* ALWAYS show assignment button when driver is selected */}
              <button
                onClick={() => handleAssignDriverAndCleanerToChalan(chalan.id, chalan.assignedDriver, chalan.assignedCleaner)}
                disabled={assigningChalans[chalan.id] || !chalan.assignedDriver}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm transition flex items-center gap-2 justify-center w-full mt-3"
              >
                {assigningChalans[chalan.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {language === 'fa' ? "در حال انتساب..." : "د ټاکلو په حال کې..."}
                  </>
                ) : (
                  <>
                    <RiUserStarLine />
                    {hasAssignedDriver || hasAssignedCleaner ? 
                      (language === 'fa' ? 'تغییر انتساب' : 'ټاکل بدلول') : 
                      (language === 'fa' ? 'انجام انتساب' : 'ټاکل ترسره کول')
                    }
                  </>
                )}
              </button>
            </div>

            {/* Add Tickets Button */}
            <button
              onClick={() => handleAddTicketsToChalan(chalan.id)}
              disabled={selectedTickets.length === 0}
              className={`w-full mb-3 py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center ${
                selectedTickets.length > 0 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <RiAddLine />
              {language === 'fa' ? 'اضافه کردن تکت' : 'تکت اضافه کول'} 
              {selectedTickets.length > 0 && ` (${selectedTickets.length})`}
            </button>

            {/* Action Buttons */}
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

            {/* Mark as Arrived button */}
            <button
              onClick={() => handleMarkChalanAsArrived(chalan.id)}
              disabled={markingArrived === chalan.id}
              className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 justify-center"
            >
              {markingArrived === chalan.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {language === 'fa' ? 'در حال علامت...' : 'د نښه کولو په حال کې...'}
                </>
              ) : (
                <>
                  <RiCheckDoubleLine />
                  {language === 'fa' ? 'علامت رسیده' : 'رسیدلي نښه کول'}
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
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
               
               
                  
                    clearSelection={clearTableSelection} // Add this prop
                      title={language === 'fa' ? "تکت هایی لیست چالان" : "چالان لیست ټکټونو"}
                     language={language}
                    
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
          chalans={chalans}
          drivers={drivers}
          cleaners={cleaners}
        />
           <ChalanNumberModal
          isOpen={showChalanNumberModal}
          onClose={() => {
            setShowChalanNumberModal(false);
            setCustomChalanNumber('');
          }}
          onConfirm={confirmCreateChalan}
          chalanNumber={customChalanNumber}
          onChalanNumberChange={setCustomChalanNumber}
          creatingChalan={creatingChalan}
          selectedTicketsCount={selectedTickets.length}
        />


        {/* Print Ticket Modal */}
        <TicketPrint 
          isOpen={printTicketModal}
          onClose={() => setPrintTicketModal(false)}
          ticket={selectedTicketForPrint}
        />

        {/* Update Chalan Modal */}
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
      
      </DashboardLayout>
    </>
  );
}

export default ReadyTrips;