import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CustomTable from '../components/CustomTable';
import CustomFormModal from '../components/modals/CustomFormModal';
import axios from 'axios';
import { MdPersonAdd, MdEdit, MdVisibility } from 'react-icons/md';

const Driver = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const API_URL = 'http://localhost:8001/api/drivers'; // your Laravel API

  // Fetch drivers
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Add driver
  const handleAddDriver = async (data) => {
    try {
      await axios.post(API_URL, data);
      fetchDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  // Update driver
  const handleUpdateDriver = async (data) => {
    try {
      await axios.put(`${API_URL}/${editingDriver.id}`, data);
      fetchDrivers();
      setEditingDriver(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete driver
  const handleDeleteDriver = async (id) => {
    if (!window.confirm('آیا از حذف راننده مطمئن هستید؟')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  // Columns for the table
  const columns = [
    { header: 'نام', accessor: 'name' },
    { header: 'نام پدر', accessor: 'father/name' },
    { header: 'تلفن', accessor: 'phone' },
    { header: 'شماره گواهینامه', accessor: 'license_number' },
  ];

  // Fields for the form modal
  const fields = [
    { name: 'name', label: 'نام', type: 'text', placeholder: 'نام راننده' },
    { name: 'father/name', label: 'نام پدر', type: 'text', placeholder: 'نام پدر' },
    { name: 'phone', label: 'تلفن', type: 'text', placeholder: 'شماره تلفن' },
    { name: 'license_number', label: 'شماره گواهینامه', type: 'text', placeholder: 'شماره گواهینامه' },
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#0B2A5B]">مدیریت رانندگان</h1>
        <button
          className="px-4 py-2 bg-[#F37021] text-white rounded hover:bg-orange-600 transition flex items-center gap-2"
          onClick={() => {
            setEditingDriver(null);
            setIsModalOpen(true);
          }}
        >
          <MdPersonAdd /> افزودن راننده
        </button>
      </div>

      <CustomTable
        columns={columns}
        data={drivers}
        title="رانندگان"
        onView={(driver) => alert(`راننده: ${driver.name}\nشماره گواهینامه: ${driver.license_number}`)}
        onEdit={(driver) => {
          setEditingDriver(driver);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteDriver}
      />

      <CustomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDriver}
        onUpdate={handleUpdateDriver}
        initialData={editingDriver}
        title={editingDriver ? 'ویرایش راننده' : 'افزودن راننده'}
        fields={fields}
      />
    </DashboardLayout>
  );
};

export default Driver;
