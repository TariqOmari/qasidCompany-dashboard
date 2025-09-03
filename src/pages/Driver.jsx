import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CustomTable from '../components/CustomTable';
import CustomFormModal from '../components/modals/CustomFormModal';
import axios from 'axios';
import { MdPersonAdd } from 'react-icons/md';
import { useToast } from '../components/ToastContext';
import Loader from '../components/Loader';
import moment from 'jalali-moment'; // ✅ Import jalali-moment

// ✅ Vite: use import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Full driver endpoint
const DRIVER_API = `${API_BASE_URL}/api/drivers`;

const Driver = () => {
  const toast = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading for fetching
  const [modalLoading, setModalLoading] = useState(false); // Loading for add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(DRIVER_API);

      // ✅ Sort by created_at DESC
      const sortedDrivers = [...res.data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setDrivers(sortedDrivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error('خطا در دریافت رانندگان: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSaveDriver = async (data) => {
    setModalLoading(true);
    try {
      const submitData = { ...data, father_name: data.father_name || '' };

      if (editingDriver) {
        // Update
        await axios.put(`${DRIVER_API}/${editingDriver.id}`, submitData);
        toast.success('راننده با موفقیت ویرایش شد!');
      } else {
        // Create
        await axios.post(DRIVER_API, submitData);
        toast.success('راننده با موفقیت اضافه شد!');
      }

      await fetchDrivers();
      setEditingDriver(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving driver:', err);
      toast.error('خطا در ذخیره راننده: ' + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('آیا از حذف راننده مطمئن هستید؟')) return;
    setLoading(true);
    try {
      await axios.delete(`${DRIVER_API}/${id}`);
      toast.success('راننده با موفقیت حذف شد!');
      await fetchDrivers();
    } catch (err) {
      console.error('Error deleting driver:', err);
      toast.error('خطا در حذف راننده: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add created_at column with Persian date
  const columns = [
    { header: 'نام', accessor: 'name' },
    { header: 'نام پدر', accessor: 'father_name' },
    { header: 'تلفن', accessor: 'phone' },
    { header: 'نمبر لیسانس', accessor: 'license_number' },
    {
      header: 'تاریخ ایجاد',
      accessor: 'created_at',
      render: (row) =>
        row.created_at
          ? moment(row.created_at).locale('fa').format('jYYYY/jM/jD')
          : '-',
    },
  ];

  const fields = [
    { name: 'father_name', label: 'نام پدر', type: 'text', placeholder: 'نام پدر', required: true },
    { name: 'name', label: 'نام', type: 'text', placeholder: 'نام راننده', required: true },
    { name: 'phone', label: 'تلفن', type: 'number', placeholder: 'شماره تلفن' },
    { name: 'license_number', label: 'نمبر لیسانس', type: 'text', placeholder: 'نمبر لیسانس', required: true },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#0B2A5B]">مدیریت رانندگان</h1>
        <button
          className="px-4 py-2 bg-[#F37021] text-white rounded hover:bg-orange-600 transition flex items-center gap-2"
          onClick={() => { setEditingDriver(null); setIsModalOpen(true); }}
        >
          <MdPersonAdd /> افزودن راننده
        </button>
      </div>

      <CustomTable
        columns={columns}
        data={drivers}
        title="رانندگان"
        onView={(driver) =>
          toast.info(`راننده: ${driver.name}\nنام پدر: ${driver.father_name}\nشماره گواهینامه: ${driver.license_number}`)
        }
        onEdit={(driver) => { setEditingDriver(driver); setIsModalOpen(true); }}
        onDelete={(driver) => handleDeleteDriver(driver.id)}
      />

      {/* Modal with loader */}
      <CustomFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDriver(null); }}
        onSubmit={handleSaveDriver}
        initialData={editingDriver}
        title={editingDriver ? 'ویرایش راننده' : 'افزودن راننده'}
        fields={fields}
        existingDrivers={drivers}
        editingDriver={editingDriver}
        isLoading={modalLoading} // ✅ Pass modal loader
      />
    </DashboardLayout>
  );
};

export default Driver;
