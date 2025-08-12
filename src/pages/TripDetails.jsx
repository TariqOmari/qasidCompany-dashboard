// src/pages/TripDetails.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaMoneyBill, FaBus } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import Sets from '../components/Sets';

export default function TripDetails() {
  const { state: trip } = useLocation();
  const navigate = useNavigate();
  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!trip) {
    return (
      <DashboardLayout>
        <div className="p-4 font-vazir text-center">
          <p>هیچ سفری انتخاب نشده است.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
          >
            بازگشت
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 font-vazir text-right">
        <h1 className="text-2xl font-bold text-[#0B2A5B] mb-6">جزئیات سفر</h1>

        {/* Trip Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCard icon={<FaMapMarkerAlt />} label={`از: ${trip.from}`} />
          <InfoCard icon={<FaMapMarkerAlt />} label={`به: ${trip.to}`} />
          <InfoCard icon={<FaCalendarAlt />} label={`تاریخ: ${trip.date}`} />
          <InfoCard icon={<FaClock />} label={`زمان حرکت: ${trip.time}`} />
          <InfoCard icon={<FaMoneyBill />} label={`قیمت تکت: ${trip.cost}`} />
          <InfoCard icon={<FaBus />} label={`تعداد رزرو: ${trip.bookedSeats}`} />
        </div>

        {/* Seat Layout */}
        <h2 className="text-xl font-bold text-[#0B2A5B] mb-4">انتخاب صندلی / مشاهده وضعیت</h2>
        <Sets selectedSeat={selectedSeat} setSelectedSeat={setSelectedSeat} />

        {/* Assign Driver Button */}
        <div className="mt-6">
          <button
            disabled={trip.bookedSeats !== 35}
            className={`px-6 py-3 rounded text-white font-semibold ${
              trip.bookedSeats === 35
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            تعیین بس
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ icon, label }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex items-center gap-3 border-r-4 border-orange-500">
      <div className="text-orange-500 text-xl">{icon}</div>
      <span>{label}</span>
    </div>
  );
}
