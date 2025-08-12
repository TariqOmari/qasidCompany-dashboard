// src/pages/Tripa.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import CustomFormModal from '../components/modals/CustomFormModal';
import CustomTable from '../components/CustomTable';
import Loader from '../components/Loader';
import Done from '../components/Done';
import { FaMapMarkerAlt, FaMoneyBill, FaClock, FaBus, FaCalendarAlt } from 'react-icons/fa';

export default function Tripa() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [trips, setTrips] = useState([
    {
      from: 'کابل',
      to: 'مزار شریف',
      time: '08:00 صبح',
      cost: '۵۰۰ افغانی',
      date: '۱۴۰۴/۰۵/۲۰',
      bookedSeats: 35
    },
    {
      from: 'هرات',
      to: 'قندهار',
      time: '10:00 صبح',
      cost: '۴۰۰ افغانی',
      date: '۱۴۰۴/۰۵/۲۵',
      bookedSeats: 20
    }
  ]);

  const columns = [
    { header: 'از', accessor: 'from' },
    { header: 'به', accessor: 'to' },
    { header: 'تاریخ', accessor: 'date' },
    { header: 'زمان حرکت', accessor: 'time' },
    { header: 'قیمت تکت', accessor: 'cost' }
  ];

  const fields = useMemo(() => [
    { label: 'از کجا', name: 'from', type: 'text', placeholder: 'مثال: کابل', icon: <FaMapMarkerAlt />, required: true },
    { label: 'به کجا', name: 'to', type: 'text', placeholder: 'مثال: مزار شریف', icon: <FaMapMarkerAlt />, required: true },
    { label: 'زمان حرکت', name: 'time', type: 'text', placeholder: 'مثال: 08:00 صبح', icon: <FaClock />, required: true },
    { label: 'قیمت تکت', name: 'cost', type: 'text', placeholder: 'مثال: ۵۰۰ افغانی', icon: <FaMoneyBill />, required: true }
  ], []);

  const handleAddTrip = (formData) => {
    setIsModalOpen(false);
    setIsLoading(true);
    const newTrip = { ...formData, date: selectedDate, bookedSeats: 0 };
    setTimeout(() => {
      setTrips((prev) => [...prev, newTrip]);
      setIsLoading(false);
      setIsDone(true);
    }, 2000);
  };

  if (isLoading) return <Loader />;
  if (isDone) return <Done />;

  return (
    <DashboardLayout>
      <div className="p-4 font-vazir text-right">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#0B2A5B]">لیست سفرها</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F37021] text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            افزودن سفر جدید
          </button>
        </div>

        <CustomTable
          data={trips}
          columns={columns}
          onView={(trip) => navigate('/tripdetails', { state: trip })}
        />

        {isModalOpen && (
          <div className="relative z-50">
            <CustomFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddTrip}
              title="افزودن سفر جدید"
              titleIcon={<FaBus />}
              fields={fields}
            >
              <div className="sm:col-span-2">
                <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2">
                  <FaCalendarAlt className="text-orange-500" />
                  تاریخ سفر
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </CustomFormModal>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
