// src/pages/Buses.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomTable from '../components/CustomTable';
import DashboardLayout from '../components/DashboardLayout';
import { RiBusFill, RiNumbersFill } from 'react-icons/ri';
import CustomFormModal from '../components/modals/CustomFormModal';
import { useToast } from '../components/ToastContext';// ⬅️ your toast

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

  const toast = useToast(); // ⬅️ init toast

  // Fetch buses
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) {
          toast.error('توکن یافت نشد! لطفا دوباره وارد شوید.');
          return;
        }
        const response = await axios.get('http://127.0.0.1:8001/api/buses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBusesData(response.data);
      } catch (error) {
        console.error('Error fetching buses:', error);
        toast.error('دریافت لیست بس‌ها ناموفق بود.');
      }
    };
    fetchBuses();
  }, []);

  // Form fields
  const fields = [
    { name: 'busNo', label: 'شماره بس', placeholder: 'مثلا BUS-101', icon: <RiBusFill />, type: 'text', required: true },
    { name: 'numberPlate', label: 'پلاک بس', placeholder: 'مثلا KBL-123', icon: <RiNumbersFill />, type: 'text', required: true },
    { name: 'licenseNumber', label: 'شماره مجوز', placeholder: 'مثلا LIC-98765', icon: <RiNumbersFill />, type: 'text', required: true },
    { name: 'type', label: 'نوع بس', placeholder: 'مثلا standard', icon: <RiBusFill />, type: 'text', required: true },
    { name: 'model', label: 'مدل بس', placeholder: 'مثلا 580', icon: <RiBusFill />, type: 'text', required: true },
    { name: 'companyId', label: 'شناسه شرکت', placeholder: 'مثلا 1', icon: <RiBusFill />, type: 'number', required: true },
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
        company_id: formData.companyId,
      };

      if (editingBus) {
        // Update
        const response = await axios.put(
          `http://127.0.0.1:8001/api/buses/${editingBus.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        setBusesData((prev) =>
          prev.map((bus) => (bus.id === editingBus.id ? response.data : bus))
        );
        toast.success('بس با موفقیت ویرایش شد.');
      } else {
        // Create
        const response = await axios.post(
          'http://127.0.0.1:8001/api/buses',
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
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این بس را حذف کنید؟')) return;
    try {
      const token = sessionStorage.getItem('auth_token');
      await axios.delete(`http://127.0.0.1:8001/api/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusesData((prev) => prev.filter((bus) => bus.id !== id));
      toast.success('بس با موفقیت حذف شد.');
    } catch (error) {
      console.error('Error deleting bus:', error);
      toast.error('حذف ناموفق بود.');
    }
  };

  // Edit
  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen font-vazir">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#0B2A5B]">شرکت‌های بس</h1>
          <button
            onClick={() => { setIsModalOpen(true); setEditingBus(null); }}
            className="bg-[#F37021] text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            ثبت بس جدید
          </button>
        </div>

        <CustomTable
          columns={columns}
          data={busesData}
          title="شرکت‌های بس"
          onView={(bus) => console.log("View bus:", bus)}
          onEdit={handleEditBus}
          onDelete={handleDeleteBus}
        />

        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingBus(null); }}
          onAdd={handleSaveBus}
          title={editingBus ? 'ویرایش بس' : 'ثبت بس جدید'}
          titleIcon={<RiBusFill size={30} />}
          fields={fields}
          initialData={editingBus ? {
            busNo: editingBus.bus_no,
            numberPlate: editingBus.number_plate,
            licenseNumber: editingBus.license_number,
            type: editingBus.type,
            model: editingBus.model,
            companyId: editingBus.company_id,
          } : {}}
        />
      </div>
    </DashboardLayout>
  );
}

export default Buses;
