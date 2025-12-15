import React, { useState, useEffect } from 'react';
import CustomTable from '../components/CustomTable';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';

function Admin() {
  
  
  
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const columns = [
    { header: 'نام', accessor: 'name' },
    { header: 'ایمیل', accessor: 'email' },
    { header: 'نقش', accessor: 'role' },
    { header: 'وضعیت', accessor: 'status' },
  ];

  // Simulate fetching data from API
  useEffect(() => {
    setLoading(true);

    // Replace this with your actual API call
    setTimeout(() => {
      const fetchedData = [
        { name: 'تاریق عمری', email: 'tariq@example.com', role: 'مدیر کل', status: 'فعال' },
        { name: 'فاطمه سادات', email: 'fatemeh@example.com', role: 'پشتیبانی', status: 'غیرفعال' },
        { name: 'علی رضا', email: 'ali@example.com', role: 'مدیر محتوا', status: 'فعال' },
      ];
      setData(fetchedData);
      setLoading(false);
    }, 1500); // simulate network delay
  }, []);

  return (
    <DashboardLayout>
      {loading ? <Loader /> : <CustomTable title="مدیران" columns={columns} data={data} />}
    </DashboardLayout>
  );
}

export default Admin;
