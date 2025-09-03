import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomTable from '../components/CustomTable';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import { RiBusFill, RiNumbersFill } from 'react-icons/ri';
import CustomFormModal from '../components/modals/CustomFormModal';
import { useToast } from '../components/ToastContext';
import moment from 'jalali-moment'; // ✅ import jalali-moment

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const columns = [
  { header: 'شماره بس', accessor: 'bus_no' },
  { header: 'نمبر پلیت', accessor: 'number_plate' },
  { header: 'جواز سیر', accessor: 'license_number' },
  { header: 'نوع', accessor: 'type' },
  {
    header: 'تاریخ ایجاد',
    accessor: 'created_at',
    render: (row) =>
      row.created_at
        ? moment(row.created_at).locale('fa').format('jYYYY/jM/jD')
        : '-',
  },
];

function Buses() {
  const [busesData, setBusesData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const busTypes = [
    { value: 'vip', label: 'VIP' },
    { value: '580', label: '580' }
  ];

  const fields = [
    { name: 'busNo', label: 'شماره بس', placeholder: 'مثلا BUS-101', icon: <RiBusFill />, type: 'text', required: true },
    { name: 'numberPlate', label: 'نمبر پلیت', placeholder: 'مثلا KBL-123', icon: <RiNumbersFill />, type: 'text', required: true },
    { name: 'licenseNumber', label: 'جوازسیر', placeholder: 'مثلا LIC-98765', icon: <RiNumbersFill />, type: 'text', required: true },
    { name: 'type', label: 'نوع بس', type: 'select', options: busTypes, required: true },
  ];

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) {
          toast.error('توکن یافت نشد! لطفا دوباره وارد شوید.');
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/buses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Sort buses by created_at DESC
        const sortedBuses = [...response.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setBusesData(sortedBuses);
      } catch (error) {
        console.error('Error fetching buses:', error);
        toast.error('دریافت لیست بس‌ها ناموفق بود.');
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  const getInitialData = () =>
    editingBus
      ? {
          busNo: editingBus.bus_no,
          numberPlate: editingBus.number_plate,
          licenseNumber: editingBus.license_number,
          type: editingBus.type,
        }
      : {};

  const handleSaveBus = async (formData) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        toast.error('توکن یافت نشد!');
        return;
      }

      const payload = {
        bus_no: formData.busNo,
        number_plate: formData.numberPlate,
        license_number: formData.licenseNumber,
        type: formData.type,
      };

      if (editingBus) {
        const response = await axios.put(
          `${API_BASE_URL}/api/buses/${editingBus.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        setBusesData((prev) =>
          prev
            .map((bus) => (bus.id === editingBus.id ? response.data.bus : bus))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
        toast.success('بس با موفقیت ویرایش شد.');
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/api/buses`,
          payload,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        setBusesData((prev) => [response.data.bus, ...prev]);
        toast.success('بس با موفقیت ایجاد شد.');
      }

      setIsModalOpen(false);
      setEditingBus(null);
    } catch (error) {
      console.error('Error saving bus:', error);
      toast.error('ذخیره‌سازی ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBus = async (id) => {
    if (!window.confirm('آیا مطمئن هستید؟')) return;

    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      await axios.delete(`${API_BASE_URL}/api/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusesData((prev) => prev.filter((bus) => bus.id !== id));
      toast.success('بس با موفقیت حذف شد.');
    } catch (err) {
      console.error('Delete error:', err.response || err);
      toast.error('حذف بس ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen font-vazir">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#0B2A5B]">مدیریت بس‌ها</h1>
          <button
            onClick={() => { setIsModalOpen(true); setEditingBus(null); }}
            className="bg-[#F37021] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <RiBusFill />
            ثبت بس جدید
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <CustomTable
            columns={columns}
            data={busesData}
            title="لیست بس‌ها"
            onView={(bus) => console.log("View bus:", bus)}
            onEdit={handleEditBus}
            onDelete={(bus) => handleDeleteBus(bus.id)}
          />
        )}

        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingBus(null); }}
          onSubmit={handleSaveBus}
          title={editingBus ? 'ویرایش بس' : 'ثبت بس جدید'}
          titleIcon={<RiBusFill size={30} />}
          fields={fields}
          initialData={getInitialData()}
          existingBuses={busesData}
          editingBus={editingBus}
        />
      </div>
    </DashboardLayout>
  );
}

export default Buses;
