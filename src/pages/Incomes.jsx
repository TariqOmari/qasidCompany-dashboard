import React, { useState, useEffect } from 'react'
import CustomTable from '../components/CustomTable'
import DashboardLayout from '../components/DashboardLayout'

// Route configuration for fees
const ROUTE_FEES = {
  "50_AFN_ROUTES": {
    provinces: ["kandahar", "قندهار", "mazar", "مزار", "kunduz", "قندوز", "jozjan", "جوزجان", "faryab", "فاریاب", "sarepul", "سرپل"],
    fee: 50
  },
  "100_AFN_ROUTES": {
    provinces: ["herat", "هرات", "nimroz", "نیمروز", "farah", "فراه", "helmand", "هلمند"],
    fee: 100
  }
};

function Incomes() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [qasedCommission, setQasedCommission] = useState({
    totalCommission: 0,
    ticketCount: 0,
    seatCount: 0
  });
  const [hessabPayStats, setHessabPayStats] = useState({
    totalDiscount: 0,
    ticketCount: 0,
    seatCount: 0
  });
  const [calculationBreakdown, setCalculationBreakdown] = useState({
    grossIncome: 0,
    incomeAfterHessabPay: 0,
    incomeAfterCommission: 0
  });

  useEffect(() => {
    fetchTripsWithTickets();
  }, []);

  const fetchTripsWithTickets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/trips-with-tickets`);
      const data = await response.json();
      setTrips(data.trips || []);
      calculateIncomes(data.trips || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    }
  };

  const calculateRouteFee = (from, to) => {
    if (!from || !to) return 0;
    
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    // Check if route is from Kabul to province or province to Kabul
    const isKabulToProvince = fromLower === 'کابل' || fromLower === 'kabul';
    const isProvinceToKabul = toLower === 'کابل' || toLower === 'kabul';
    
    if (isKabulToProvince || isProvinceToKabul) {
      const province = isKabulToProvince ? toLower : fromLower;
      
      // Check 50 AFN routes
      if (ROUTE_FEES["50_AFN_ROUTES"].provinces.includes(province)) {
        return ROUTE_FEES["50_AFN_ROUTES"].fee;
      }
      
      // Check 100 AFN routes
      if (ROUTE_FEES["100_AFN_ROUTES"].provinces.includes(province)) {
        return ROUTE_FEES["100_AFN_ROUTES"].fee;
      }
    }
    
    return 0;
  };

  // Apply HessabPay discount if payment method is hessabpay
  const applyHessabPayDiscount = (ticket, baseAmount) => {
    const paymentMethod = (ticket.payment_method || "").toLowerCase().trim();
    const isHessabPay = paymentMethod.includes('hessabpay') || paymentMethod.includes('حساب پی');
    
    if (isHessabPay) {
      // Apply 20 AFN discount per ticket (not per seat)
      const discountAmount = 20;
      return {
        finalAmount: Math.max(0, baseAmount - discountAmount),
        discount: discountAmount,
        isHessabPay: true
      };
    }
    
    return {
      finalAmount: baseAmount,
      discount: 0,
      isHessabPay: false
    };
  };

  const calculateIncomes = (tripsData) => {
    let grossIncome = 0; // Total before any deductions
    let incomeAfterHessabPay = 0; // After HessabPay discounts
    let incomeAfterCommission = 0; // After Qased commission
    let total = 0; // Final income after all deductions
    let qasedStats = {
      totalCommission: 0,
      ticketCount: 0,
      seatCount: 0
    };
    let hessabStats = {
      totalDiscount: 0,
      ticketCount: 0,
      seatCount: 0
    };

    tripsData.forEach(trip => {
      trip.tickets?.forEach(ticket => {
        // Only calculate for paid tickets
        if (ticket.payment_status === 'paid') {
          const seatCount = ticket.seat_numbers?.length || 1;
          const ticketPrice = trip.prices?.[ticket.bus_type] || 0;
          const baseAmount = ticketPrice * seatCount;
          
          // Add to gross income (before any deductions)
          grossIncome += baseAmount;
          
          // Apply HessabPay discount
          const { finalAmount: amountAfterHessabPay, discount: hessabDiscount, isHessabPay } = applyHessabPayDiscount(ticket, baseAmount);
          
          // Track HessabPay statistics
          if (isHessabPay) {
            hessabStats.totalDiscount += hessabDiscount;
            hessabStats.ticketCount += 1;
            hessabStats.seatCount += seatCount;
          }
          
          incomeAfterHessabPay += amountAfterHessabPay;
          
          // Calculate fee based on from_website and route
          let fee = 0;
          if (ticket.from_website === 'https://backend.qasid.org') {
            fee = calculateRouteFee(trip.from, trip.to) * seatCount;
            
            // Track Qased commission
            qasedStats.totalCommission += fee;
            qasedStats.ticketCount += 1;
            qasedStats.seatCount += seatCount;
          }
          
          const finalAmount = amountAfterHessabPay - fee;
          incomeAfterCommission += finalAmount;
          total += finalAmount;
        }
      });
    });

    // Calculate 2% tax on the amount AFTER HessabPay and Commission
    const tax = incomeAfterCommission * 0.02;
    const net = incomeAfterCommission - tax;

    setTotalIncome(total);
    setTaxAmount(tax);
    setNetIncome(net);
    setQasedCommission(qasedStats);
    setHessabPayStats(hessabStats);
    setCalculationBreakdown({
      grossIncome,
      incomeAfterHessabPay,
      incomeAfterCommission
    });
  };

  // Prepare table data with trip information included
  const tableData = trips.flatMap(trip => 
    trip.tickets?.map(ticket => ({
      ...ticket,
      _trip: trip // Include the entire trip object
    })) || []
  );

  const tableColumns = [
    {
      header: "شماره بلیت",
      accessor: "ticket_number"
    },
    {
      header: "مسافر",
      accessor: "name",
      render: (row) => `${row.name} ${row.last_name}`
    },
    {
      header: "تلفون",
      accessor: "phone"
    },
    {
      header: "مسیر",
      accessor: "route",
      render: (row) => `${row._trip?.from || 'نامشخص'} → ${row._trip?.to || 'نامشخص'}`
    },
    {
      header: "تعداد صندلی",
      accessor: "seats",
      render: (row) => row.seat_numbers?.length || 1
    },
    {
      header: "قیمت",
      accessor: "price",
      render: (row) => {
        const seatCount = row.seat_numbers?.length || 1;
        const price = row._trip?.prices?.[row.bus_type] || 0;
        const baseAmount = price * seatCount;
        
        // Apply HessabPay discount for display
        const paymentMethod = (row.payment_method || "").toLowerCase().trim();
        const isHessabPay = paymentMethod.includes('hessabpay') || paymentMethod.includes('حساب پی');
        
        if (isHessabPay) {
          const finalAmount = Math.max(0, baseAmount - 20);
          return (
            <div className="text-left">
              <div className="text-gray-600">{finalAmount.toLocaleString()} AFN</div>
              <div className="text-xs text-red-500 line-through">{baseAmount.toLocaleString()} AFN</div>
              <div className="text-xs text-green-600">تخفیف HessabPay: 20 AFN</div>
            </div>
          );
        }
        
        return `${baseAmount.toLocaleString()} AFN`;
      }
    },
    {
      header: "وضعیت پرداخت",
      accessor: "payment_status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.payment_status === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.payment_status === 'paid' ? 'پرداخت شده' : 'پرداخت نشده'}
        </span>
      )
    },
    {
      header: "روش پرداخت",
      accessor: "payment_method",
      render: (row) => {
        const paymentMethod = (row.payment_method || "").toLowerCase().trim();
        const isHessabPay = paymentMethod.includes('hessabpay') || paymentMethod.includes('حساب پی');
        
        if (isHessabPay) {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              💳 HessabPay
            </span>
          );
        }
        return row.payment_method || 'نامشخص';
      }
    },
    {
      header: "منبع",
      accessor: "from_website",
      render: (row) => {
        if (row.from_website === 'http://localhost:5174') {
          return <span className="text-blue-600 font-semibold">از قاصد</span>;
        }
        return row.from_website || 'داخلی';
      }
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Income Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Gross Income Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">درآمد ناخالص</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {calculationBreakdown.grossIncome.toLocaleString()} AFN
                </p>
                <p className="text-xs text-gray-400 mt-1">قبل از هرگونه کسر</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Qased Commission Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">کمیسیون قاصد</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {qasedCommission.totalCommission.toLocaleString()} AFN
                </p>
                <div className="text-xs text-gray-400 mt-1">
                  <div>{qasedCommission.ticketCount} بلیت</div>
                  <div>{qasedCommission.seatCount} صندلی</div>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* HessabPay Discount Card */}
          {hessabPayStats.ticketCount > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-pink-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm mb-2">تخفیف HessabPay</h3>
                  <p className="text-2xl font-bold text-pink-600">
                    {hessabPayStats.totalDiscount.toLocaleString()} AFN
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    <div>{hessabPayStats.ticketCount} بلیت</div>
                    <div>{hessabPayStats.seatCount} صندلی</div>
                  </div>
                </div>
                <div className="bg-pink-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Tax Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">مالیات (۲٪)</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {taxAmount.toLocaleString()} AFN
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Net Income Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-r-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">عواید خالص</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {netIncome.toLocaleString()} AFN
                </p>
                <p className="text-xs text-gray-400 mt-1">بعد از کسر همه هزینه‌ها</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* HessabPay Information Banner */}
        {hessabPayStats.ticketCount > 0 && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-pink-800 font-bold text-lg mb-2 flex items-center">
                  💳 اطلاعات پرداخت‌های HessabPay
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-pink-700">
                    <span className="font-medium">تعداد بلیت های HessabPay: </span>
                    <span className="font-bold">{hessabPayStats.ticketCount} بلیط</span>
                  </div>
                  <div className="text-pink-700">
                    <span className="font-medium">مجموع تخفیف اعمال شده: </span>
                    <span className="font-bold">{hessabPayStats.totalDiscount.toLocaleString()} افغانی</span>
                  </div>
                  <div className="text-pink-700">
                    <span className="font-medium">میانگین تخفیف هر بلیط: </span>
                    <span className="font-bold">20 افغانی</span>
                  </div>
                </div>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
            </div>
            <p className="text-pink-600 text-xs mt-2">
              * برای پرداخت های HessabPay مبلغ 20 افغانی از هر بلیط کسر شده است
            </p>
          </div>
        )}

        {/* Tickets Table */}
        <CustomTable
          columns={tableColumns}
          data={tableData}
          title="لیست بلیت‌ها و عواید"
          onView={(row) => console.log('View:', row)}
          onEdit={(row) => console.log('Edit:', row)}
          onDelete={(row) => console.log('Delete:', row)}
        />

        {/* Summary Section */}
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">خلاصه محاسبات</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">درآمد ناخالص:</span>
                <span className="font-medium">{calculationBreakdown.grossIncome.toLocaleString()} AFN</span>
              </div>
              {hessabPayStats.ticketCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">کسر تخفیف HessabPay:</span>
                  <span className="font-medium text-red-600">- {hessabPayStats.totalDiscount.toLocaleString()} AFN</span>
                </div>
              )}
              {qasedCommission.ticketCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">کسر کمیسیون قاصد:</span>
                  <span className="font-medium text-red-600">- {qasedCommission.totalCommission.toLocaleString()} AFN</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">درآمد قبل از مالیات:</span>
                <span className="font-medium">{calculationBreakdown.incomeAfterCommission.toLocaleString()} AFN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">کسر مالیات (۲٪):</span>
                <span className="font-medium text-red-600">- {taxAmount.toLocaleString()} AFN</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span className="text-gray-800">عواید خالص نهایی:</span>
                <span className="text-green-600">{netIncome.toLocaleString()} AFN</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">تعداد کل بلیت‌ها:</span>
                <span className="font-medium">{tableData.filter(ticket => ticket.payment_status === 'paid').length} بلیط</span>
              </div>
              {hessabPayStats.ticketCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">بلیت‌های HessabPay:</span>
                  <span className="font-medium text-purple-600">{hessabPayStats.ticketCount} بلیط</span>
                </div>
              )}
              {qasedCommission.ticketCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">بلیت‌های از قاصد:</span>
                  <span className="font-medium text-blue-600">{qasedCommission.ticketCount} بلیط</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">درصد HessabPay:</span>
                <span className="font-medium">
                  {((hessabPayStats.ticketCount / tableData.filter(ticket => ticket.payment_status === 'paid').length) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">درصد قاصد:</span>
                <span className="font-medium">
                  {((qasedCommission.ticketCount / tableData.filter(ticket => ticket.payment_status === 'paid').length) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Incomes