import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CustomTable from '../components/CustomTable';
import CustomFormModal from '../components/modals/CustomFormModal';
import axios from 'axios';
import { MdPersonAdd } from 'react-icons/md';
import { useToast } from '../components/ToastContext';
import Loader from '../components/Loader';
import moment from 'jalali-moment';
import { useLanguage } from '../contexts/LanguageContext.jsX';
import { translations } from './locales/translations';

// ✅ Vite: use import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Full driver endpoint
const DRIVER_API = `${API_BASE_URL}/api/drivers`;

const Driver = () => {
  const toast = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  
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
      toast.error(
        language === 'fa' 
          ? 'خطا در دریافت رانندگان: ' + (err.response?.data?.message || err.message)
          : 'د چلوونکو په ترلاسه کولو کې تېروتنه: ' + (err.response?.data?.message || err.message)
      );
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
        toast.success(
          language === 'fa' 
            ? 'راننده با موفقیت ویرایش شد!'
            : 'چلوونکی په بریالیتوب سره سم شو!'
        );
      } else {
        // Create
        await axios.post(DRIVER_API, submitData);
        toast.success(
          language === 'fa' 
            ? 'راننده با موفقیت اضافه شد!'
            : 'چلوونکی په بریالیتوب سره اضافه شو!'
        );
      }

      await fetchDrivers();
      setEditingDriver(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving driver:', err);
      toast.error(
        language === 'fa' 
          ? 'خطا در ذخیره راننده: ' + (err.response?.data?.message || err.message)
          : 'د چلوونکی په خوندي کولو کې تېروتنه: ' + (err.response?.data?.message || err.message)
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteDriver = async (id) => {
    const confirmMessage = language === 'fa' 
      ? 'آیا از حذف راننده مطمئن هستید؟'
      : 'آیا تاسې د چلوونکی د ړنګولو څخه ډاډه یاست؟';
    
    if (!window.confirm(confirmMessage)) return;
    
    setLoading(true);
    try {
      await axios.delete(`${DRIVER_API}/${id}`);
      toast.success(
        language === 'fa' 
          ? 'راننده با موفقیت حذف شد!'
          : 'چلوونکی په بریالیتوب سره ړنګ شو!'
      );
      await fetchDrivers();
    } catch (err) {
      console.error('Error deleting driver:', err);
      toast.error(
        language === 'fa' 
          ? 'خطا در حذف راننده: ' + (err.response?.data?.message || err.message)
          : 'د چلوونکی په ړنګولو کې تېروتنه: ' + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add created_at column with Persian date
  const columns = [
    { header: t.name, accessor: 'name' },
    { header: t.fatherName, accessor: 'father_name' },
    { header: t.phone, accessor: 'phone' },
    { 
      header: language === 'fa' ? 'نمبر لایسنس' : 'د لایسنس نمبر', 
      accessor: 'license_number' 
    },
    {
      header: language === 'fa' ? 'تاریخ ایجاد' : 'د جوړیدو نېټه',
      accessor: 'created_at',
      render: (row) =>
        row.created_at
          ? moment(row.created_at).locale('fa').format('jYYYY/jM/jD')
          : '-',
    },
  ];

  const fields = [
    { 
      name: 'father_name', 
      label: t.fatherName, 
      type: 'text', 
      placeholder: language === 'fa' ? 'نام پدر' : 'د پلار نوم', 
      required: true 
    },
    { 
      name: 'name', 
      label: t.name, 
      type: 'text', 
      placeholder: language === 'fa' ? 'نام راننده' : 'د چلوونکي نوم', 
      required: true 
    },
    { 
      name: 'phone', 
      label: t.phone, 
      type: 'number', 
      placeholder: language === 'fa' ? 'شماره تلفن' : 'د تلیفون شمېره' 
    },
    { 
      name: 'license_number', 
      label: language === 'fa' ? 'نمبر لایسنس' : 'د لایسنس نمبر', 
      type: 'text', 
      placeholder: language === 'fa' ? 'نمبر لایسنس' : 'د لایسنس نمبر', 
      required: true 
    },
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
        <h1 className="text-2xl font-bold text-[#0B2A5B]">
          {language === 'fa' ? 'مدیریت رانندگان' : 'د چلوونکو مدیریت'}
        </h1>
        <button
          className="px-4 py-2 bg-[#F37021] text-white rounded hover:bg-orange-600 transition flex items-center gap-2"
          onClick={() => { setEditingDriver(null); setIsModalOpen(true); }}
        >
          <MdPersonAdd /> 
          {language === 'fa' ? 'افزودن راننده' : 'چلوونکی اضافه کړئ'}
        </button>
      </div>

      <CustomTable
        columns={columns}
        data={drivers}
        title={language === 'fa' ? 'رانندگان' : 'چلوونکي'}
        onView={(driver) =>
          toast.info(
            language === 'fa' 
              ? `راننده: ${driver.name}\nنام پدر: ${driver.father_name}\nشماره گواهینامه: ${driver.license_number}`
              : `چلوونکی: ${driver.name}\nد پلار نوم: ${driver.father_name}\nد لایسنس شمېره: ${driver.license_number}`
          )
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
        title={editingDriver ? 
          (language === 'fa' ? 'ویرایش راننده' : 'د چلوونکي سمون') : 
          (language === 'fa' ? 'افزودن راننده' : 'چلوونکی اضافه کړئ')
        }
        fields={fields}
        existingDrivers={drivers}
        editingDriver={editingDriver}
        isLoading={modalLoading} // ✅ Pass modal loader
      />
    </DashboardLayout>
  );
};

export default Driver;