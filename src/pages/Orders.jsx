import React from 'react';
import { MdAirlineSeatReclineNormal, MdOutlinePayment, MdLocalAtm } from 'react-icons/md';
import { FaBusAlt, FaUser } from 'react-icons/fa';
import qlogo from '../assets/qlogo.jfif';
import DashboardLayout from '../components/DashboardLayout';
const staticOrders = [
  {
    id: 1,
    name: 'حسیب الله احمدی',
    from: 'کابل',
    to: 'هرات',
    company: 'قاصد',
    ticketNumber: 'QA-55121',
    seat: 'C5',
    total: '1550 افغانی',
    method: 'پرداخت آنلاین',
    methodIcon: <MdOutlinePayment />,
  },
  {
    id: 2,
    name: 'فاطمه یوسفی',
    from: 'مزار',
    to: 'کندهار',
    company: 'هرات‌پیما',
    ticketNumber: 'HP-77889',
    seat: 'B8',
    total: '1400 افغانی',
    method: 'پرداخت درب منزل',
    methodIcon: <MdLocalAtm />,
  },
   {
    id: 2,
    name: 'فاطمه یوسفی',
    from: 'مزار',
    to: 'کندهار',
    company: 'هرات‌پیما',
    ticketNumber: 'HP-77889',
    seat: 'B8',
    total: '1400 افغانی',
    method: 'پرداخت درب منزل',
    methodIcon: <MdLocalAtm />,
  },
   {
    id: 2,
    name: 'فاطمه یوسفی',
    from: 'مزار',
    to: 'کندهار',
    company: 'هرات‌پیما',
    ticketNumber: 'HP-77889',
    seat: 'B8',
    total: '1400 افغانی',
    method: 'پرداخت درب منزل',
    methodIcon: <MdLocalAtm />,
  },
];

function Orders() {
  return (
      <DashboardLayout>
    <div dir="rtl" className="min-h-screen p-6 bg-gray-50 font-vazir">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6 flex items-center gap-2">
          <img src={qlogo} alt="Qased Logo" className="w-8 h-8 rounded-full" />
          لیست تکت‌های رزرو شده
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staticOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow-md rounded-2xl border-t-4 border-[#F37021] p-5 space-y-3 transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <FaUser className="text-[#0B2A5B]" />
                  {order.name}
                </span>
                <span className="font-semibold text-[#0B2A5B]">{order.ticketNumber}</span>
              </div>

              <div className="text-sm flex justify-between">
                <span className="flex gap-2 items-center">
                  <FaBusAlt className="text-[#F37021]" />
                  {order.from} → {order.to}
                </span>
                <span className="text-gray-500">{order.company}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-700">
                <span className="flex gap-2 items-center">
                  <MdAirlineSeatReclineNormal className="text-[#0B2A5B]" />
                  چوکی: {order.seat}
                </span>
                <span className="flex gap-2 items-center">
                  {order.methodIcon}
                  <span>{order.method}</span>
                </span>
              </div>

              <div className="flex justify-between pt-2 mt-2 border-t text-[#F37021] font-bold">
                <span>مجموع</span>
                <span>{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  

    </DashboardLayout>
  );
}

export default Orders;
