import React from 'react';
import CustomTable from '../components/CustomTable';
import DashboardLayout from '../components/DashboardLayout';

function Admin() {
  // Static columns and data for admins
  const columns = [
    { header: 'نام', accessor: 'name' },
    { header: 'ایمیل', accessor: 'email' },
    { header: 'نقش', accessor: 'role' },
    { header: 'وضعیت', accessor: 'status' },
  ];

  const data = [
    {
      name: 'تاریق عمری',
      email: 'tariq@example.com',
      role: 'مدیر کل',
      status: 'فعال',
    },
    {
      name: 'فاطمه سادات',
      email: 'fatemeh@example.com',
      role: 'پشتیبانی',
      status: 'غیرفعال',
    },
    {
      name: 'علی رضا',
      email: 'ali@example.com',
      role: 'مدیر محتوا',
      status: 'فعال',
    },
  ];

  return (
    <div>
      <DashboardLayout>
        <CustomTable title="مدیران" columns={columns} data={data} />
      </DashboardLayout>
    </div>
  );
}

export default Admin;
