import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomTable from '../components/CustomTable';
import DashboardLayout from '../components/DashboardLayout';
import { RiBusFill, RiNumbersFill } from 'react-icons/ri';
import CustomFormModal from '../components/modals/CustomFormModal';
import { useToast } from '../components/ToastContext';

// ✅ Vite: use import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const columns = [
  { header: 'شناسه', accessor: 'id' },
  { header: 'شماره بس', accessor: 'bus_no' },
  { header: 'پلاک', accessor: 'number_plate' },
  { header: 'شماره مجوز', accessor: 'license_number' },
  { header: 'نوع', accessor: 'type' },
  { header: 'مدل', accessor: 'model' },
  { header: 'تاریخ ایجاد', accessor: 'created_at' },
];

function Buses() {
  const [busesData, setBusesData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const toast = useToast();

  // Bus types for dropdown
  const busTypes = [
    { value: 'vip', label: 'VIP' },
    { value: 'standard', label: 'استاندارد' },
    { value: 'luxury', label: 'لوکس' },
    { value: 'economy', label: 'اقتصادی' }
  ];

  // Fetch buses
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) {
          toast.error('توکن یافت نشد! لطفا دوباره وارد شوید.');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/buses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBusesData(response.data);
        toast.success('لیست بس‌ها دریافت شد.');
      } catch (error) {
        console.error('Error fetching buses:', error);
        toast.error('دریافت لیست بس‌ها ناموفق بود.');
      }
    };

    fetchBuses();
  }, []);

  // Form fields
  const fields = [
    { 
      name: 'busNo', 
      label: 'شماره بس', 
      placeholder: 'مثلا BUS-101', 
      icon: <RiBusFill />, 
      type: 'text', 
      required: true 
    },
    { 
      name: 'numberPlate', 
      label: 'پلاک بس', 
      placeholder: 'مثلا KBL-123', 
      icon: <RiNumbersFill />, 
      type: 'text', 
      required: true 
    },
    { 
      name: 'licenseNumber', 
      label: 'شماره مجوز', 
      placeholder: 'مثلا LIC-98765', 
      icon: <RiNumbersFill />, 
      type: 'text', 
      required: true 
    },
    { 
      name: 'type', 
      label: 'نوع بس', 
      type: 'select', 
      options: busTypes,
      required: true 
    },
    { 
      name: 'model', 
      label: 'مدل بس', 
      placeholder: 'مثلا 580', 
      icon: <RiBusFill />, 
      type: 'text', 
      required: true 
    },
  ];

  // Save (Create or Update)
  const handleSaveBus = async (formData) => {
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
        model: formData.model,
      };

      if (editingBus) {
        // Update
        const response = await axios.put(
          `${API_BASE_URL}/api/buses/${editingBus.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        setBusesData((prev) => prev.map((bus) => (bus.id === editingBus.id ? response.data : bus)));
        toast.success('بس با موفقیت ویرایش شد.');
      } else {
        // Create
        const response = await axios.post(
          `${API_BASE_URL}/api/buses`,
          payload,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        setBusesData((prev) => [...prev, response.data]);
        toast.success('بس با موفقیت ایجاد شد.');
      }

      setIsModalOpen(false);
      setEditingBus(null);
    } catch (error) {
      console.error('Error saving bus:', error);
      toast.error('ذخیره‌سازی ناموفق بود.');
    }
  };

  // Delete
  const handleDeleteBus = async (id) => {
    console.log('Deleting bus ID:', id);
    if (!window.confirm('آیا مطمئن هستید؟')) return;

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.delete(`${API_BASE_URL}/api/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', response);
      setBusesData((prev) => prev.filter((bus) => bus.id !== id));
      toast.success('بس با موفقیت حذف شد.');
    } catch (err) {
      console.error('Delete error:', err.response || err);
      toast.error('حذف بس ناموفق بود.');
    }
  };

  // Edit
  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setIsModalOpen(true);
  };

  const getInitialData = () => {
    if (!editingBus) return {};
    return {
      busNo: editingBus.bus_no,
      numberPlate: editingBus.number_plate,
      licenseNumber: editingBus.license_number,
      type: editingBus.type,
      model: editingBus.model,
    };
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

        <CustomTable
          columns={columns}
          data={busesData}
          title="لیست بس‌ها"
          onView={(bus) => console.log("View bus:", bus)}
          onEdit={handleEditBus}
          onDelete={(bus) => handleDeleteBus(bus.id)}
        />

        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingBus(null); }}
          onSubmit={handleSaveBus}
          title={editingBus ? 'ویرایش بس' : 'ثبت بس جدید'}
          titleIcon={<RiBusFill size={30} />}
          fields={fields}
          initialData={getInitialData()}
        />
      </div>
    </DashboardLayout>
  );
}

export default Buses;