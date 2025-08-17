// src/pages/Tripa.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import CustomFormModal from '../components/modals/CustomFormModal';
import CustomTable from '../components/CustomTable';
import Loader from '../components/Loader';
import { useToast } from '../components/ToastContext';
import { FaMapMarkerAlt, FaMoneyBill, FaClock, FaBus, FaCalendarAlt } from 'react-icons/fa';

export default function Tripa() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  const token = sessionStorage.getItem('auth_token');

  const columns = [
    { header: 'از', accessor: 'from' },
    { header: 'به', accessor: 'to' },
    { header: 'تاریخ', accessor: 'departure_date' },
    { header: 'زمان حرکت', accessor: 'departure_time' },
    { header: 'ترمینال حرکت', accessor: 'departure_terminal' },
    { header: 'ترمینال رسید', accessor: 'arrival_terminal' },
  ];

  const fields = useMemo(() => [
    { label: 'از کجا', name: 'from', type: 'text', placeholder: 'مثال: کابل', icon: <FaMapMarkerAlt />, required: true },
    { label: 'به کجا', name: 'to', type: 'text', placeholder: 'مثال: هرات', icon: <FaMapMarkerAlt />, required: true },
    { label: 'زمان حرکت', name: 'departure_time', type: 'time', icon: <FaClock />, required: true },
    { label: 'ترمینال حرکت', name: 'departure_terminal', type: 'text', icon: <FaBus />, required: true },
    { label: 'ترمینال رسید', name: 'arrival_terminal', type: 'text', icon: <FaBus />, required: true },
  ], []);

  // Fetch trips from API
  const fetchTrips = async () => {
    if (!token) {
      toast.error('توکن معتبر موجود نیست. لطفاً دوباره وارد شوید.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://127.0.0.1:8001/api/trips', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedTrips = res.data.map(trip => ({
        ...trip,
        departure_date: new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(trip.departure_date)),
        departure_time: trip.departure_time, // keep as HH:mm
      }));

      setTrips(formattedTrips);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'خطا در دریافت لیست سفرها.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Add new trip
  const handleAddTrip = async (formData) => {
    if (!token) {
      toast.error('توکن معتبر موجود نیست. لطفاً دوباره وارد شوید.');
      return;
    }

    if (!selectedDate) {
      toast.error('تاریخ سفر را وارد کنید.');
      return;
    }

    try {
      const payload = { ...formData, departure_date: selectedDate };
      const res = await axios.post('http://127.0.0.1:8001/api/trips', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newTrip = res.data.trip;
      newTrip.departure_date = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(newTrip.departure_date));

      setTrips(prev => [...prev, newTrip]);
      setIsModalOpen(false);
      toast.success('سفر جدید با موفقیت اضافه شد.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'خطا در ایجاد سفر.');
    }
  };

  if (isLoading) return <Loader />;

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

        {/* Always render the modal to prevent input locking */}
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
    </DashboardLayout>
  );
}
