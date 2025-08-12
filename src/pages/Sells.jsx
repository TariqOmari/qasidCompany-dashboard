import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const Sells = () => {
  const data = [
    { name: 'هرات پیما', value: 450 },
    { name: 'احمد شاه ابدالی', value: 300 },
    { name: 'وردک بابا', value: 150 },
  ];

  const COLORS = ['#0B2A5B', '#F37021', '#4CAF50']; // dark blue, orange, green

  return (
    <>
    <DashboardLayout>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6" dir="rtl">
        <h2 className="text-2xl font-bold text-[#0B2A5B] mb-2 text-center">
          آمار فروش تکت‌ها در هفته جاری
        </h2>
        <p className="text-gray-500 text-center mb-6">
          شرکت هرات پیما بیشترین فروش را داشته است
        </p>

        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    </DashboardLayout>
    </>
    

  );
};

export default Sells;
