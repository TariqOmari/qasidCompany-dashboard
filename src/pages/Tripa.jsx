import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import CustomFormModal from "../components/modals/CustomFormModal";
import CustomTable from "../components/CustomTable";
import Loader from "../components/Loader";
import { useToast } from "../components/ToastContext";
import { FaMapMarkerAlt, FaClock, FaBus, FaCalendarAlt } from "react-icons/fa";

// ✅ Vite: use import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Tripa() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [editingTrip, setEditingTrip] = useState(null);

  const token = sessionStorage.getItem("auth_token");

  // Table columns
  const columns = [
    { header: "از", accessor: "from" },
    { header: "به", accessor: "to" },
    { header: "تاریخ", accessor: "departure_date" },
    { header: "زمان حرکت", accessor: "departure_time" },
    { header: "ترمینال حرکت", accessor: "departure_terminal" },
    { header: "ترمینال رسید", accessor: "arrival_terminal" },
  ];

  // Form fields
  const fields = useMemo(
    () => [
      {
        label: "از کجا",
        name: "from",
        type: "text",
        placeholder: "مثال: کابل",
        icon: <FaMapMarkerAlt />,
        required: true,
      },
      {
        label: "به کجا",
        name: "to",
        type: "text",
        placeholder: "مثال: هرات",
        icon: <FaMapMarkerAlt />,
        required: true,
      },
      {
        label: "زمان حرکت",
        name: "departure_time",
        type: "time",
        icon: <FaClock />,
        required: true,
      },
      {
        label: "ترمینال حرکت",
        name: "departure_terminal",
        type: "text",
        icon: <FaBus />,
        required: true,
      },
      {
        label: "ترمینال رسید",
        name: "arrival_terminal",
        type: "text",
        icon: <FaBus />,
        required: true,
      },
    ],
    []
  );

  // Fetch trips
  const fetchTrips = async () => {
    if (!token) {
      toast.error("توکن معتبر موجود نیست. لطفاً دوباره وارد شوید.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/public/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedTrips = res.data.map((trip) => ({
        ...trip,
        departure_date_raw: trip.departure_date, // raw for edit
        departure_date: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(trip.departure_date)),
      }));

      setTrips(formattedTrips);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در دریافت لیست سفرها.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Add trip
  const handleAddTrip = async (formData) => {
    if (!token) return toast.error("توکن معتبر موجود نیست.");
    if (!selectedDate) return toast.error("تاریخ سفر را وارد کنید.");

    try {
      const payload = { ...formData, departure_date: selectedDate };
      const res = await axios.post(`${API_BASE_URL}/api/trips`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newTrip = res.data.trip;
      newTrip.departure_date_raw = newTrip.departure_date;
      newTrip.departure_date = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(newTrip.departure_date));

      setTrips((prev) => [...prev, newTrip]);
      setIsModalOpen(false);
      setSelectedDate("");
      toast.success("سفر جدید با موفقیت اضافه شد.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در ایجاد سفر.");
    }
  };

  // Edit trip (open modal with prefilled values)
  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setSelectedDate(trip.departure_date_raw || "");
    setIsModalOpen(true);
  };

  // Update trip
  const handleUpdateTrip = async (formData) => {
    if (!token) return toast.error("توکن معتبر موجود نیست.");
    if (!editingTrip) return;

    try {
      const payload = { ...formData, departure_date: selectedDate };
      const res = await axios.put(
        `${API_BASE_URL}/api/trips/${editingTrip.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTrip = res.data.trip;
      updatedTrip.departure_date_raw = updatedTrip.departure_date;
      updatedTrip.departure_date = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(updatedTrip.departure_date));

      setTrips((prev) =>
        prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
      );
      setIsModalOpen(false);
      setEditingTrip(null);
      setSelectedDate("");
      toast.success("سفر با موفقیت ویرایش شد.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در ویرایش سفر.");
    }
  };

  // Delete trip
  const handleDeleteTrip = async (trip) => {
    if (!trip || !trip.id) return toast.error("شناسه سفر معتبر نیست.");
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این سفر را حذف کنید؟"))
      return;

    if (!token) {
      toast.error("توکن معتبر موجود نیست. لطفاً دوباره وارد شوید.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      toast.success("سفر با موفقیت حذف شد.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "خطا در حذف سفر.");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <DashboardLayout>
      <div className="p-4 font-vazir text-right">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#0B2A5B]">لیست سفرها</h1>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setEditingTrip(null);
              setSelectedDate("");
            }}
            className="bg-[#F37021] text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            افزودن سفر جدید
          </button>
        </div>

        <CustomTable
          data={trips}
          columns={columns}
          onView={(trip) => navigate("/tripdetails", { state: trip })}
          onEdit={handleEditTrip}
          onDelete={handleDeleteTrip}
        />

        {/* Modal for Add/Edit */}
        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTrip(null);
            setSelectedDate("");
          }}
          onSubmit={editingTrip ? handleUpdateTrip : handleAddTrip}
          title={editingTrip ? "ویرایش سفر" : "افزودن سفر جدید"}
          titleIcon={<FaBus />}
          fields={fields}
          initialData={editingTrip || {}}
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