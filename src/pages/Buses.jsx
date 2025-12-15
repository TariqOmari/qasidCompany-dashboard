import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomTable from '../components/CustomTable';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import { RiBusFill, RiNumbersFill } from 'react-icons/ri';
import CustomFormModal from '../components/modals/CustomFormModal';
import { useToast } from '../components/ToastContext';
import moment from 'jalali-moment';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Translation objects
const translations = {
  fa: {
    columns: [
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
    ],
    busTypes: [
      { value: 'vip', label: 'VIP' },
      { value: '580', label: '580' }
    ],
    fields: [
      { name: 'busNo', label: 'شماره بس', placeholder: 'مثلا BUS-101', icon: <RiBusFill />, type: 'text', required: true },
      { name: 'numberPlate', label: 'نمبر پلیت', placeholder: 'مثلا KBL-123', icon: <RiNumbersFill />, type: 'text', required: true },
      { name: 'licenseNumber', label: 'جوازسیر', placeholder: 'مثلا LIC-98765', icon: <RiNumbersFill />, type: 'text', required: true },
      { name: 'type', label: 'نوع بس', type: 'select', options: [], required: true },
    ],
    titles: {
      manageBuses: 'مدیریت بس‌ها',
      busList: 'لیست بس‌ها',
      tableTitle: 'لیست بس‌ها', // Add this for CustomTable
      newBus: 'ثبت بس جدید',
      editBus: 'ویرایش بس',
      save: 'ذخیره',
      cancel: 'لغو',
      delete: 'حذف',
      edit: 'ویرایش'
    },
    messages: {
      tokenNotFound: 'توکن یافت نشد! لطفا دوباره وارد شوید.',
      fetchError: 'دریافت لیست بس‌ها ناموفق بود.',
      saveSuccess: 'بس با موفقیت ذخیره شد.',
      editSuccess: 'بس با موفقیت ویرایش شد.',
      deleteSuccess: 'بس با موفقیت حذف شد.',
      deleteError: 'حذف بس ناموفق بود.',
      saveError: 'ذخیره‌سازی ناموفق بود.',
      confirmDelete: 'آیا مطمئن هستید؟'
    }
  },
  ps: {
    columns: [
      { header: 'بس نمبر', accessor: 'bus_no' },
      { header: 'نمبر پلیټ', accessor: 'number_plate' },
      { header: 'د سفر اجازه', accessor: 'license_number' },
      { header: 'ډول', accessor: 'type' },
      {
        header: 'د جوړیدو نیټه',
        accessor: 'created_at',
        render: (row) =>
          row.created_at
            ? moment(row.created_at).locale('fa').format('jYYYY/jM/jD')
            : '-',
      },
    ],
    busTypes: [
      { value: 'vip', label: 'VIP' },
      { value: '580', label: '580' }
    ],
    fields: [
      { name: 'busNo', label: 'بس نمبر', placeholder: 'لکه BUS-101', icon: <RiBusFill />, type: 'text', required: true },
      { name: 'numberPlate', label: 'نمبر پلیټ', placeholder: 'لکه KBL-123', icon: <RiNumbersFill />, type: 'text', required: true },
      { name: 'licenseNumber', label: 'د سفر اجازه', placeholder: 'لکه LIC-98765', icon: <RiNumbersFill />, type: 'text', required: true },
      { name: 'type', label: 'د بس ډول', type: 'select', options: [], required: true },
    ],
    titles: {
      manageBuses: 'د بسونو مدیریت',
      busList: 'د بسونو لیست',
      tableTitle: 'د بسونو لیست', // Add this for CustomTable
      newBus: 'نوی بس ثبت کړی',
      editBus: 'بس سمول',
      save: 'خوندي کول',
      cancel: 'لغوه',
      delete: 'ړنگول',
      edit: 'سمول'
    },
    messages: {
      tokenNotFound: 'ټوکن ونه موندل شو! مهربانی بیرته ننوځئ.',
      fetchError: 'د بسونو لیست ترلاسه کول ناکام شو.',
      saveSuccess: 'بس په بریالیتوب سره خوندي شو.',
      editSuccess: 'بس په بریالیتوب سره سم شو.',
      deleteSuccess: 'بس په بریالیتوب سره ړنگ شو.',
      deleteError: 'د بس ړنگول ناکام شو.',
      saveError: 'خوندي کول ناکام شو.',
      confirmDelete: 'آیا تاسی ډاډه یاست؟'
    }
  }
};

function Buses() {
  const [busesData, setBusesData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { language } = useLanguage(); // Get current language

  // Get translations based on current language
  const t = translations[language];

  // Update fields with options
  const fields = t.fields.map(field => {
    if (field.name === 'type') {
      return { ...field, options: t.busTypes };
    }
    return field;
  });

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) {
          toast.error(t.messages.tokenNotFound);
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
        toast.error(t.messages.fetchError);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, [language, toast, t.messages.tokenNotFound, t.messages.fetchError]);

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
        toast.error(t.messages.tokenNotFound);
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
        toast.success(t.messages.editSuccess);
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/api/buses`,
          payload,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        setBusesData((prev) => [response.data.bus, ...prev]);
        toast.success(t.messages.saveSuccess);
      }

      setIsModalOpen(false);
      setEditingBus(null);
    } catch (error) {
      console.error('Error saving bus:', error);
      toast.error(t.messages.saveError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBus = async (id) => {
    if (!window.confirm(t.messages.confirmDelete)) return;

    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      await axios.delete(`${API_BASE_URL}/api/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusesData((prev) => prev.filter((bus) => bus.id !== id));
      toast.success(t.messages.deleteSuccess);
    } catch (err) {
      console.error('Delete error:', err.response || err);
      toast.error(t.messages.deleteError);
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
          <h1 className="text-3xl font-bold text-[#0B2A5B]">{t.titles.manageBuses}</h1>
          <button
            onClick={() => { setIsModalOpen(true); setEditingBus(null); }}
            className="bg-[#F37021] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <RiBusFill />
            {t.titles.newBus}
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <CustomTable
            columns={t.columns}
            data={busesData}
            title={t.titles.tableTitle} // Use the proper table title
            language={language} // Pass language prop to CustomTable
          
            onEdit={handleEditBus}
            onDelete={(bus) => handleDeleteBus(bus.id)}
          />
        )}

        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingBus(null); }}
          onSubmit={handleSaveBus}
          title={editingBus ? t.titles.editBus : t.titles.newBus}
          titleIcon={<RiBusFill size={30} />}
          fields={fields}
          initialData={getInitialData()}
          existingBuses={busesData}
          editingBus={editingBus}
            language={language} // Add this line to pass the language prop
        />
      </div>
    </DashboardLayout>
  );
}

export default Buses;