import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CustomTable from '../components/CustomTable';

const columns = [
  { header: 'نام', accessor: 'name' },
  { header: 'ایمیل', accessor: 'email' },
  { header: 'تلفن', accessor: 'phone' },
  { header: 'شماره گواهینامه', accessor: 'licenseNumber' },
  { header: 'شرکت', accessor: 'company' },
];

const data = [
  {
    name: 'احمد احمدی',
    email: 'ahmad@example.com',
    phone: '0700123456',
    licenseNumber: 'AB1234567',
    company: 'Herat Paima',
  },
  {
    name: 'فریدون حسینی',
    email: 'farid@example.com',
    phone: '0700654321',
    licenseNumber: 'CD7654321',
    company: 'Wardak Baba',
  },
  {
    name: 'سارا مهدوی',
    email: 'sara@example.com',
    phone: '0700987654',
    licenseNumber: 'EF9876543',
    company: 'Ahmad Shah Abdali',
  },
];

function Driver() {
  return (
    <DashboardLayout>
      <CustomTable columns={columns} data={data} title="رانندگان" />
    </DashboardLayout>
  );
}

export default Driver;
