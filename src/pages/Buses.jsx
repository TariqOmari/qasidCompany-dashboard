import React, { useState } from 'react';
import CustomTable from '../components/CustomTable';
import DashboardLayout from '../components/DashboardLayout';
import { RiBusFill, RiMapPin2Fill, RiNumbersFill, RiPhoneFill, RiMailFill, RiImageFill } from 'react-icons/ri';
import CustomFormModal from '../components/modals/CustomFormModal';

const columns = [
  { header: 'شناسه', accessor: 'id' },
  { header: 'نام', accessor: 'name' },
  { header: 'شماره', accessor: 'number' },
  { header: 'ایمیل', accessor: 'email' },
  { header: 'تلفن', accessor: 'phone' },
  { header: 'آدرس', accessor: 'address' },
];

const initialData = [
  { id: 1, name: 'قاصد', number: 'Q-101', email: 'info@qased.com', phone: '0789001122', address: 'کابل، کارته نو' },
  { id: 2, name: 'توفان', number: 'T-202', email: 'support@tofan.af', phone: '0799123456', address: 'هرات، جاده استقلال' },
  { id: 3, name: 'محمد شاه ابدالی', number: 'MSA-303', email: 'contact@abdali.af', phone: '0700112233', address: 'قندهار، شهر نو' },
  { id: 4, name: 'هرات‌پیما', number: 'HP-404', email: 'info@heratpayma.af', phone: '0777000011', address: 'هرات، چهارراهی مولوی' },
];

function Buses() {
  const [busesData, setBusesData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fields = [
    {
      name: 'companyName',
      label: 'نام شرکت',
      placeholder: 'مثلا قاصد',
      icon: <RiBusFill />,
      type: 'text',
      required: true,
    },
    {
      name: 'companyAddress',
      label: 'آدرس شرکت',
      placeholder: 'مثلا کابل، کارته نو',
      icon: <RiMapPin2Fill />,
      type: 'text',
      required: true,
    },
    {
      name: 'totalBuses',
      label: 'تعداد بس‌ها',
      placeholder: 'مثلا 10',
      icon: <RiNumbersFill />,
      type: 'number',
      min: 0,
      required: true,
    },
    {
      name: 'busesReady',
      label: 'بس‌های چالان (آماده سفر)',
      placeholder: 'مثلا 7',
      icon: <RiNumbersFill />,
      type: 'number',
      min: 0,
      required: true,
    },
    {
      name: 'phoneNumber',
      label: 'شماره تلفن شرکت',
      placeholder: 'مثلا 0789001122',
      icon: <RiPhoneFill />,
      type: 'tel',
      required: true,
      pattern: '^\\+?\\d{10,15}$',
    },
    {
      name: 'email',
      label: 'ایمیل شرکت',
      placeholder: 'مثلا info@qased.com',
      icon: <RiMailFill />,
      type: 'email',
      required: true,
    },
    {
      name: 'logoFile',
      label: 'لوگو شرکت (عکس)',
      icon: <RiImageFill />,
      type: 'file',
      required: false,
    },
  ];

  const handleAddBus = (newBus) => {
    const newId = busesData.length ? busesData[busesData.length - 1].id + 1 : 1;

    const newBusEntry = {
      id: newId,
      name: newBus.companyName,
      number: 'N/A',
      email: newBus.email || 'N/A',
      phone: newBus.phoneNumber || 'N/A',
      address: newBus.companyAddress,
      // you can add logo or other fields if needed
    };

    setBusesData((prev) => [...prev, newBusEntry]);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen font-vazir">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#0B2A5B]">شرکت‌های بس</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F37021] text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            افزودن شرکت جدید
          </button>
        </div>

        <CustomTable columns={columns} data={busesData} title="شرکت‌های بس" />

        <CustomFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddBus}
          title="افزودن شرکت جدید"
          titleIcon={<RiBusFill size={30} />}
          fields={fields}
        />
      </div>
    </DashboardLayout>
  );
}

export default Buses;
