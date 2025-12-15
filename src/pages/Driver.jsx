import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CustomTable from '../components/CustomTable';
import CustomFormModal from '../components/modals/CustomFormModal';
import axios from 'axios';
import { MdPersonAdd, MdRefresh } from 'react-icons/md';
import { useToast } from '../components/ToastContext';
import Loader from '../components/Loader';
import moment from 'jalali-moment';
import { useLanguage } from '../contexts/LanguageContext.jsX';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DRIVER_API = `${API_BASE_URL}/api/drivers`;

// Translation objects
const translations = {
  fa: {
    // Page titles
    manageDrivers: 'مدیریت رانندگان',
    drivers: 'رانندگان',
    addDriver: 'افزودن راننده',
    editDriver: 'ویرایش راننده',
    refresh: 'تازه‌سازی',
    search: 'جستجو...',
    
    // Table columns
    columns: [
      { header: 'نام', accessor: 'name' },
      { header: 'نام پدر', accessor: 'father_name' },
      { header: 'تلفن', accessor: 'phone' },
      { header: 'نمبر لایسنس', accessor: 'license_number' },
      {
        header: 'پلېټ نمبر',
        accessor: 'bus_number_plate',
        render: (row) => row.bus_number_plate || '-',
      },
      {
        header: 'تاریخ ایجاد',
        accessor: 'created_at',
        render: (row) =>
          row.created_at
            ? moment(row.created_at).locale('fa').format('jYYYY/jM/jD')
            : '-',
      },
    ],
    
    // Form fields
    fields: [
      { name: 'name', label: 'نام', type: 'text', placeholder: 'نام راننده', required: true },
      { name: 'father_name', label: 'نام پدر', type: 'text', placeholder: 'نام پدر' },
      { name: 'phone', label: 'تلفن', type: 'number', placeholder: 'شماره تلفن' },
      { name: 'license_number', label: 'نمبر لایسنس', type: 'text', placeholder: 'نمبر لایسنس', required: true },
      { name: 'bus_number_plate', label: 'نمبر پلېټ', type: 'text', placeholder: 'پلېټ نمبر' },
    ],
    
    // Messages
    messages: {
      fetchError: 'خطا در دریافت رانندگان: ',
      saveSuccess: 'راننده با موفقیت ذخیره شد!',
      editSuccess: 'راننده با موفقیت ویرایش شد!',
      deleteSuccess: 'راننده با موفقیت حذف شد!',
      deleteError: 'خطا در حذف راننده: ',
      saveError: 'خطا در ذخیره راننده: ',
      confirmDelete: 'آیا از حذف راننده مطمئن هستید؟',
      viewInfo: (driver) => `راننده: ${driver.name}\nنام پدر: ${driver.father_name}\nنمبر پلېټ: ${driver.bus_number_plate || '-'}`
    }
  },
  ps: {
    // Page titles
    manageDrivers: 'د چلوونکو مدیریت',
    drivers: 'چلوونکي',
    addDriver: 'چلوونکی اضافه کړئ',
    editDriver: 'د چلوونکي سمون',
    refresh: 'نوی کول',
    search: 'پلټنه...',
    
    // Table columns
    columns: [
      { header: 'نوم', accessor: 'name' },
      { header: 'د پلار نوم', accessor: 'father_name' },
      { header: 'تلیفون', accessor: 'phone' },
      { header: 'د لایسنس نمبر', accessor: 'license_number' },
      {
        header: 'د نمبر پلېټ',
        accessor: 'bus_number_plate',
        render: (row) => row.bus_number_plate || '-',
      },
      {
        header: 'د جوړیدو نېټه',
        accessor: 'created_at',
        render: (row) =>
          row.created_at
            ? moment(row.created_at).locale('fa').format('jYYYY/jM/jD')
            : '-',
      },
    ],
    
    // Form fields
    fields: [
      { name: 'name', label: 'نوم', type: 'text', placeholder: 'د چلوونکي نوم', required: true },
      { name: 'father_name', label: 'د پلار نوم', type: 'text', placeholder: 'د پلار نوم' },
      { name: 'phone', label: 'تلیفون', type: 'number', placeholder: 'د تلیفون شمېره' },
      { name: 'license_number', label: 'د لایسنس نمبر', type: 'text', placeholder: 'د لایسنس نمبر', required: true },
      { name: 'bus_number_plate', label: 'د نمبر پلېټ', type: 'text', placeholder: 'د نمبر پلېټ' },
    ],
    
    // Messages
    messages: {
      fetchError: 'د چلوونکو په ترلاسه کولو کې تېروتنه: ',
      saveSuccess: 'چلوونکی په بریالیتوب سره خوندي شو!',
      editSuccess: 'چلوونکی په بریالیتوب سره سم شو!',
      deleteSuccess: 'چلوونکی په بریالیتوب سره ړنګ شو!',
      deleteError: 'د چلوونکی په ړنګولو کې تېروتنه: ',
      saveError: 'د چلوونکی په خوندي کولو کې تېروتنه: ',
      confirmDelete: 'آیا تاسې د چلوونکی د ړنګولو څخه ډاډه یاست؟',
      viewInfo: (driver) => `چلوونکی: ${driver.name}\nد پلار نوم: ${driver.father_name}\nپلېټ نمبر: ${driver.bus_number_plate || '-'}`
    }
  }
};

const Driver = () => {
  const toast = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Fetch drivers
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(DRIVER_API);
      const sortedDrivers = [...res.data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setDrivers(sortedDrivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error(t.messages.fetchError + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // ✅ Save or update driver
  const handleSaveDriver = async (data) => {
    setModalLoading(true);
    try {
      const submitData = { ...data, father_name: data.father_name || '' };

      if (editingDriver) {
        await axios.put(`${DRIVER_API}/${editingDriver.id}`, submitData);
        toast.success(t.messages.editSuccess);
      } else {
        await axios.post(DRIVER_API, submitData);
        toast.success(t.messages.saveSuccess);
      }

      await fetchDrivers();
      setEditingDriver(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving driver:', err);
      toast.error(t.messages.saveError + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ Delete driver
  const handleDeleteDriver = async (id) => {
    if (!window.confirm(t.messages.confirmDelete)) return;

    setLoading(true);
    try {
      await axios.delete(`${DRIVER_API}/${id}`);
      toast.success(t.messages.deleteSuccess);
      await fetchDrivers();
    } catch (err) {
      console.error('Error deleting driver:', err);
      toast.error(t.messages.deleteError + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtered search
  const filteredDrivers = drivers.filter((d) =>
    [d.name, d.father_name, d.phone, d.license_number, d.bus_number_plate]
      .some((val) => val?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#0B2A5B]">
          {t.manageDrivers}
        </h1>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <button
            onClick={fetchDrivers}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1"
          >
            <MdRefresh /> {t.refresh}
          </button>

          <button
            className="px-4 py-2 bg-[#F37021] text-white rounded hover:bg-orange-600 transition flex items-center gap-2"
            onClick={() => {
              setEditingDriver(null);
              setIsModalOpen(true);
            }}
          >
            <MdPersonAdd />
            {t.addDriver}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <CustomTable
        columns={t.columns}
        data={filteredDrivers}
        title={t.drivers}
        language={language}
    
        onEdit={(driver) => {
          setEditingDriver(driver);
          setIsModalOpen(true);
        }}
        onDelete={(driver) => handleDeleteDriver(driver.id)}
         // Add this line to pass the language prop
      />

      {/* Modal */}
      <CustomFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDriver(null);
        }}
        onSubmit={handleSaveDriver}
        initialData={editingDriver}
        title={editingDriver ? t.editDriver : t.addDriver}
        fields={t.fields}
        existingDrivers={drivers}
        editingDriver={editingDriver}
         language={language} // Add this line
        isLoading={modalLoading}
      />
    </DashboardLayout>
  );
};

export default Driver;