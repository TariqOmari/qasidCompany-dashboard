import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomTable from "../components/CustomTable";
import { toJalali, fromJalali } from 'jalali-date';
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
  RiPrinterLine
} from 'react-icons/ri';
import DashboardLayout from "../components/DashboardLayout";

function ReadyTrips() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalTickets: 0,
    assignedDrivers: 0,
    assignedBuses: 0
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

  // Create a ref for the table to print
  const tableRef = useRef();

  // Handle selection change
  const handleSelectionChange = (selectedItems) => {
    // Extract just the IDs from the selected items
    const selectedIds = selectedItems.map(item => item.id);
    setSelectedTickets(selectedIds);
    console.log("Selected ticket IDs:", selectedIds);
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
  
  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute options (0-59 in 5-minute intervals)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch trips with tickets
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
        const tripsData = res.data.trips || [];
        setTrips(tripsData);
        setFilteredTrips(tripsData);
        
        // Extract unique from and to locations
        const fromLocations = [...new Set(tripsData.map(trip => trip.from))];
        const toLocations = [...new Set(tripsData.map(trip => trip.to))];
        setUniqueFromLocations(fromLocations);
        setUniqueToLocations(toLocations);
        
        // Calculate stats
        const totalTickets = tripsData.reduce((acc, trip) => acc + (trip.tickets?.length || 0), 0);
        const assignedDriversCount = tripsData.reduce((acc, trip) => 
          acc + (trip.tickets?.filter(ticket => ticket.driver_id).length || 0), 0);
        const assignedBusesCount = tripsData.reduce((acc, trip) => 
          acc + (trip.tickets?.filter(ticket => ticket.bus_id).length || 0), 0);
        
        setStats({
          totalTrips: tripsData.length,
          totalTickets: totalTickets,
          assignedDrivers: assignedDriversCount,
          assignedBuses: assignedBusesCount
        });
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

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

  // Filter trips based on selected criteria
  useEffect(() => {
    let filtered = [...trips];
    
    // Filter by month and day (ignore year)
    if (selectedMonth || selectedDay) {
      filtered = filtered.filter(trip => {
        if (!trip.departure_date) return false;
        
        const [year, month, day] = trip.departure_date.split('-');
        
        // Check month filter
        if (selectedMonth && month !== selectedMonth) return false;
        
        // Check day filter
        if (selectedDay && day !== selectedDay.padStart(2, '0')) return false;
        
        return true;
      });
    }
    
    // Filter by from location
    if (selectedFrom) {
      filtered = filtered.filter(trip => trip.from === selectedFrom);
    }
    
    // Filter by to location
    if (selectedTo) {
      filtered = filtered.filter(trip => trip.to === selectedTo);
    }
    
    // Filter by time (hour, minute, and period)
    if (selectedHour || selectedMinute || selectedPeriod) {
      filtered = filtered.filter(trip => {
        if (!trip.departure_time) return false;
        
        // Parse the time string
        const time = trip.departure_time.toUpperCase();
        const isPM = time.includes('PM') || time.includes('شب');
        const timeWithoutPeriod = time.replace(/\s?(AM|PM|صبح|شب)/i, '');
        const [hours, minutes] = timeWithoutPeriod.split(':').map(part => parseInt(part));
        
        // Convert to 24-hour format for easier comparison
        let hour24 = isPM && hours !== 12 ? hours + 12 : hours;
        if (!isPM && hours === 12) hour24 = 0; // Midnight case
        
        // Check hour filter
        if (selectedHour) {
          const selectedHourInt = parseInt(selectedHour);
          // Convert selected hour to 24-hour format if period is specified
          let compareHour = selectedHourInt;
          if (selectedPeriod === 'PM' && selectedHourInt !== 12) {
            compareHour = selectedHourInt + 12;
          } else if (selectedPeriod === 'AM' && selectedHourInt === 12) {
            compareHour = 0;
          }
          
          if (hour24 !== compareHour) return false;
        }
        
        // Check minute filter
        if (selectedMinute) {
          const selectedMinuteInt = parseInt(selectedMinute);
          if (minutes !== selectedMinuteInt) return false;
        }
        
        // Check period filter (if hour is not selected)
        if (selectedPeriod && !selectedHour) {
          const isTripPM = time.includes('PM') || time.includes('شب');
          if ((selectedPeriod === 'PM' && !isTripPM) || 
              (selectedPeriod === 'AM' && isTripPM)) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    setFilteredTrips(filtered);
  }, [selectedMonth, selectedDay, selectedFrom, selectedTo, selectedHour, selectedMinute, selectedPeriod, trips]);

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
      
      // Refresh trips data
      const res = await axios.get(`${API_BASE_URL}/api/trips-with-tickets`);
      const tripsData = res.data.trips || [];
      setTrips(tripsData);
      setFilteredTrips(tripsData);
      
      // Update stats
      const totalTickets = tripsData.reduce((acc, trip) => acc + (trip.tickets?.length || 0), 0);
      const assignedDriversCount = tripsData.reduce((acc, trip) => 
        acc + (trip.tickets?.filter(ticket => ticket.driver_id).length || 0), 0);
      const assignedBusesCount = tripsData.reduce((acc, trip) => 
        acc + (trip.tickets?.filter(ticket => ticket.bus_id).length || 0), 0);
      
      setStats({
        totalTrips: tripsData.length,
        totalTickets: totalTickets,
        assignedDrivers: assignedDriversCount,
        assignedBuses: assignedBusesCount
      });
      
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

  // Format time to display in Persian/Dari
  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    
    // Check if time already contains Persian text
    if (time.includes('صبح') || time.includes('شب')) {
      return time;
    }
    
    // Convert AM/PM to Persian
    if (time.includes('AM')) {
      return time.replace('AM', 'صبح');
    } else if (time.includes('PM')) {
      return time.replace('PM', 'شب');
    }
    
    return time;
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedMonth('');
    setSelectedDay('');
    setSelectedFrom('');
    setSelectedTo('');
    setSelectedHour('');
    setSelectedMinute('');
    setSelectedPeriod('');
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
              <th>روش پرداخت</th>
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
                <td>${ticket.seat_number || ''}</td>
                <td>${ticket.payment_method || ''}</td>
               
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
      // printWindow.close(); // Uncomment if you want to automatically close after printing
    }, 250);
  };

  // Table columns
  const columns = [
    { header: "از", accessor: "from" },
    { header: "به", accessor: "to" },
    { header: "تاریخ حرکت", accessor: "departure_date" },
    { header: "زمان حرکت", accessor: "departure_time" },
    { header: "نام", accessor: "name" },
    { header: "تخلص", accessor: "last_name" },
    { header: "شماره تماس", accessor: "phone" },
    { header: "روش پرداخت", accessor: "payment_method" },
    { header: "نمبر سیت", accessor: "seat_number" },
 
    { header: "بس", accessor: "bus_details" },
    { header: "راننده", accessor: "driver_details" },
  ];

  // Prepare table data (flatten trips+tickets)
  const tableData = filteredTrips.flatMap((trip) =>
    trip.tickets.map((ticket) => ({
      id: ticket.id,
      from: trip.from,
      to: trip.to,
      departure_date: trip.departure_date,
      departure_time: formatTimeForDisplay(trip.departure_time),
      name: ticket.name,
      last_name: ticket.last_name,
      phone: ticket.phone,
      payment_method: ticket.payment_method,
      seat_number: ticket.seat_number,
    
      bus_details: getBusDetails(ticket.bus_id),
      driver_details: getDriverDetails(ticket.driver_id),
    }))
  );

  // Card data with Persian text
  const cardData = [
    {
      title: 'مجموع سفرها',
      value: stats.totalTrips,
      icon: <RiCalendarEventLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-700',
      action: 'مشاهده همه',
    },
    {
      title: 'تکت های فروخته شده',
      value: stats.totalTickets,
      icon: <RiFilterLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-green-500 to-green-700',
      action: 'گزارش فروش',
    },
    {
      title: 'راننده انتساب داده شده',
      value: stats.assignedDrivers,
      icon: <RiUserStarLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
      action: 'انتساب راننده',
    },
    {
      title: 'بس انتساب داده شده',
      value: stats.assignedBuses,
      icon: <RiBusLine className="text-3xl" />,
      color: 'bg-gradient-to-r from-orange-500 to-orange-700',
      action: 'انتساب بس',
    },
  ];

  return (
    <>
      <DashboardLayout>
        <div className="p-6 space-y-6" dir="rtl">
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

          {/* Enhanced Filter Section */}
          <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold text-[#0B2A5B] text-lg flex items-center gap-2">
              <RiFilterLine />
              فیلتر تکت‌ها
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Month Filter */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">ماه</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">روز</label>
                <input
                  type="number"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="روز"
                  min="1"
                  max="31"
                />
              </div>
              
              {/* From Filter */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">مبدا</label>
                <select
                  value={selectedFrom}
                  onChange={(e) => setSelectedFrom(e.target.value)}
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">مقصد</label>
                <select
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">همه مقصدها</option>
                  {uniqueToLocations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter - Hour */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">ساعت</label>
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">ساعة</option>
                  {hourOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter - Minute */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">دقیقه</label>
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">قسمت روز</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">همه</option>
                  <option value="AM">صبح (AM)</option>
                  <option value="PM">شب (PM)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-[#0B2A5B]">
                {filteredTrips.length} سفر یافت شد
              </div>
              
              <button
                onClick={resetFilters}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
              >
                <RiCloseLine />
                حذف همه فیلترها
              </button>
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardData.map((card, index) => (
              <div key={index} className={`rounded-xl shadow-lg text-white p-6 ${card.color} transition-transform hover:scale-105`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{card.value}</h3>
                    <p className="text-sm opacity-90">{card.title}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    {card.icon}
                  </div>
                </div>
                <button className="mt-4 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 transition py-2 px-4 rounded-full">
                  {card.action}
                </button>
              </div>
            ))}
          </div>

          {/* Combined Assignment Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <RiUserStarLine className="text-2xl text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-[#0B2A5B]">انتساب راننده و بس</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">راننده</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب راننده (اختیاری)</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} 
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">بس</label>
                <select
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب بس (اختیاری)</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      <span className="font-medium">{bus.bus_no}</span>
                      <span className="text-gray-500 text-sm"> - {bus.number_plate}</span>
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                {selectedTickets.length} تکت انتخاب شده است
              </p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center gap-2"
                >
                  چاپ تکت‌ها
                  <RiPrinterLine />
                </button>
                
                <button 
                  onClick={handleAssignBusAndDriver}
                  disabled={assigning || (!selectedBus && !selectedDriver) || selectedTickets.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-8 rounded-lg text-sm transition flex items-center gap-2"
                >
                  {assigning ? "در حال انتساب..." : "انتساب"}
                  <RiCheckLine />
                </button>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div ref={tableRef}>
            <CustomTable
              title="تکت‌های بس‌ها"
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
      </DashboardLayout>
    </>
  );
}

export default ReadyTrips;