import React, { useState, useEffect } from "react";
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
  RiCloseLine
} from 'react-icons/ri';
import DashboardLayout from "../components/DashboardLayout";

function ReadyTrips() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [selectedJalaliDate, setSelectedJalaliDate] = useState({
    year: '',
    month: '',
    day: ''
  });
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

  // Filter trips by selected Persian date
  useEffect(() => {
    if (!selectedJalaliDate.year || !selectedJalaliDate.month || !selectedJalaliDate.day) {
      setFilteredTrips(trips);
      return;
    }

    // Format the selected date as YYYY-MM-DD
    const jalaliDate = `${selectedJalaliDate.year}-${selectedJalaliDate.month.toString().padStart(2, "0")}-${selectedJalaliDate.day.toString().padStart(2, "0")}`;

    // Filter trips where departure_date matches the selected Jalali date
    const filtered = trips.filter((trip) => trip.departure_date === jalaliDate);
    setFilteredTrips(filtered);
  }, [selectedJalaliDate, trips]);

  // Handle date input changes
  const handleDateChange = (field, value) => {
    setSelectedJalaliDate(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  // Table columns
  const columns = [
    { header: "از", accessor: "from" },
    { header: "به", accessor: "to" },
    { header: "تاریخ حرکت", accessor: "departure_date" },
    { header: "نام", accessor: "name" },
    { header: "تخلص", accessor: "last_name" },
    { header: "شماره تماس", accessor: "phone" },
    { header: "روش پرداخت", accessor: "payment_method" },
    { header: "وضعیت تکت", accessor: "ticket_status" },
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
      name: ticket.name,
      last_name: ticket.last_name,
      phone: ticket.phone,
      payment_method: ticket.payment_method,
      ticket_status: ticket.status,
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

          {/* Persian Date Filter */}
          <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold text-[#0B2A5B] text-lg flex items-center gap-2">
              <RiFilterLine />
              فیلتر براساس تاریخ (تقویم افغانی)
            </h2>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">سال</label>
                <input
                  type="number"
                  value={selectedJalaliDate.year}
                  onChange={(e) => handleDateChange('year', e.target.value)}
                  className="border p-2 rounded-lg w-24 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1403"
                  min="1300"
                  max="1500"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">ماه</label>
                <select
                  value={selectedJalaliDate.month}
                  onChange={(e) => handleDateChange('month', e.target.value)}
                  className="border p-2 rounded-lg w-32 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب ماه</option>
                  {Object.entries(afghanMonths).map(([num, name]) => (
                    <option key={num} value={num}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">روز</label>
                <input
                  type="number"
                  value={selectedJalaliDate.day}
                  onChange={(e) => handleDateChange('day', e.target.value)}
                  className="border p-2 rounded-lg w-20 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                  min="1"
                  max="31"
                />
              </div>
              
              <button
                onClick={() => setSelectedJalaliDate({ year: '', month: '', day: '' })}
                className="mt-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                حذف فیلتر
              </button>
            </div>
            
            {selectedJalaliDate.year && selectedJalaliDate.month && selectedJalaliDate.day && (
              <div className="mt-2 text-sm text-[#0B2A5B]">
                نمایش سفرهای تاریخ: {selectedJalaliDate.year}/{selectedJalaliDate.month}/{selectedJalaliDate.day} - {afghanMonths[selectedJalaliDate.month]}
              </div>
            )}
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

          {/* Tickets Table */}
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
      </DashboardLayout>
    </>
  );
}

export default ReadyTrips;