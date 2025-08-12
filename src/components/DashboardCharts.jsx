import React from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar,
} from 'recharts';
import ChartCard from './ChartCard';

const data = [
  { name: 'شنبه', فروش: 4000, سفارش: 2400 },
  { name: 'یک‌شنبه', فروش: 3000, سفارش: 1398 },
  { name: 'دوشنبه', فروش: 2000, سفارش: 9800 },
  { name: 'سه‌شنبه', فروش: 2780, سفارش: 3908 },
  { name: 'چهارشنبه', فروش: 1890, سفارش: 4800 },
  { name: 'پنج‌شنبه', فروش: 2390, سفارش: 3800 },
  { name: 'جمعه', فروش: 3490, سفارش: 4300 },
];

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <ChartCard title="نمودار خطی فروش در هفته">
        <LineChart width={500} height={200} data={data}>
          <Line type="monotone" dataKey="فروش" stroke="#f97316" strokeWidth={3} />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ChartCard>

      <ChartCard title="نمودار ستونی سفارشات امروز">
        <BarChart width={500} height={200} data={data}>
          <Bar dataKey="سفارش" fill="#0ea5e9" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
        </BarChart>
      </ChartCard>
    </div>
  );
};

export default DashboardCharts;
