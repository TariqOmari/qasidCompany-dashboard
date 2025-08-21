import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CustomTable from '../components/CustomTable';
import CustomFormModal from '../components/modals/CustomFormModal';
import axios from 'axios';
import { MdPersonAdd } from 'react-icons/md';
import { useToast } from '../components/ToastContext';
import Loader from '../components/Loader';

// ✅ Vite: use import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Full driver endpoint
const DRIVER_API = `${API_BASE_URL}/api/drivers`;

const Driver = () => {
  const toast = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(DRIVER_API);
      setDrivers(res.data);
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
    setLoading(true);
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
      
      fetchDrivers();
      setEditingDriver(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving driver:', err);
      toast.error('خطا در ذخیره راننده: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('آیا از حذف راننده مطمئن هستید؟')) return;
    setLoading(true);
    try {
      await axios.delete(`${DRIVER_API}/${id}`);
      toast.success('راننده با موفقیت حذف شد!');
      fetchDrivers();
    } catch (err) {
      console.error('Error deleting driver:', err);
      toast.error('خطا در حذف راننده: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const columns = [
    { header: 'نام', accessor: 'name' },
    { header: 'نام پدر', accessor: 'father_name' },
    { header: 'تلفن', accessor: 'phone' },
    { header: 'شماره گواهینامه', accessor: 'license_number' },
  ];

  const fields = [
    { name: 'name', label: 'نام', type: 'text', placeholder: 'نام راننده', required: true },
    { name: 'father_name', label: 'نام پدر', type: 'text', placeholder: 'نام پدر', required: true },
    { name: 'phone', label: 'تلفن', type: 'number', placeholder: 'شماره تلفن' },
    { name: 'license_number', label: 'شماره گواهینامه', type: 'text', placeholder: 'شماره گواهینامه', required: true },
  ];

  // Show only loader if any operation is happening
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

      {/* FIXED: Use onSubmit instead of onAdd/onUpdate */}
      <CustomFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDriver(null); }}
        onSubmit={handleSaveDriver}  // ✅ Changed to onSubmit
        initialData={editingDriver}
        title={editingDriver ? 'ویرایش راننده' : 'افزودن راننده'}
        fields={fields}
      />
    </DashboardLayout>
  );
};

export default Driver;