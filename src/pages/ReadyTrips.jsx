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
  RiFilterLine
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

// Handle selection change
const handleSelectionChange = (selectedItems) => {
  setSelectedTickets(selectedItems);
  console.log("Selected tickets:", selectedItems);
};


  // Afghan month names in Dari
  const afghanMonths = {
    1: 'حمل', 2: 'ثور', 3: 'جوزا', 4: 'سرطان',
    5: 'اسد', 6: 'سنبله', 7: 'میزان', 8: 'عقرب',
    9: 'قوس', 10: 'جدی', 11: 'دلو', 12: 'حوت'
  };

  // Fetch trips with tickets
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://127.0.0.1:8001/api/trips-with-tickets");
        const tripsData = res.data.trips || [];
        setTrips(tripsData);
        setFilteredTrips(tripsData);
        
        // Calculate stats
        const totalTickets = tripsData.reduce((acc, trip) => acc + (trip.tickets?.length || 0), 0);
        setStats({
          totalTrips: tripsData.length,
          totalTickets: totalTickets,
          assignedDrivers: Math.floor(tripsData.length * 0.7), // 70% assigned (example)
          assignedBuses: Math.floor(tripsData.length * 0.6)   // 60% assigned (example)
        });
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
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
  ];

  // Prepare table data (flatten trips+tickets)
  const tableData = filteredTrips.flatMap((trip) =>
    trip.tickets.map((ticket) => ({
      from: trip.from,
      to: trip.to,
      departure_date: trip.departure_date,
      name: ticket.name,
      last_name: ticket.last_name,
      phone: ticket.phone,
      payment_method: ticket.payment_method,
      ticket_status: ticket.status,
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

      {/* Action Cards for Assigning Driver/Bus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assign Driver Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <RiUserAddLine className="text-2xl text-purple-600" />
            </div>
            <h3 className="font-bold text-lg text-[#0B2A5B]">انتساب راننده</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            برای سفرهای برنامه‌ریزی شده راننده انتساب دهید
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg text-sm transition">
            انتساب راننده
          </button>
        </div>

        {/* Assign Bus Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <RiRoadsterLine className="text-2xl text-orange-600" />
            </div>
            <h3 className="font-bold text-lg text-[#0B2A5B]">انتساب بس</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            برای سفرهای برنامه‌ریزی شده وسایط نقلیه انتساب دهید
          </p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-lg text-sm transition">
            انتساب بس
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