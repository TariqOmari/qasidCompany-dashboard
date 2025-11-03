import React from "react";

const TicketPrint = ({ isOpen, onClose, ticket }) => {
  if (!isOpen || !ticket) return null;
  // Format time to Persian AM/PM
  const formatTimeWithPersianAmPm = (time) => {
    if (!time) return "";
    
    // If already in Persian format, return as is
    if (time.includes('ق.ظ') || time.includes('ب.ظ')) {
      return time;
    }
    
    // If already in AM/PM format, convert to Persian
    if (time.includes('AM') || time.includes('PM')) {
      return time.replace('AM', 'قبل از ظهر').replace('PM', 'بعد از ظهر');
    }
    
    // Convert 24-hour format to 12-hour Persian format
    try {
      let [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      let minute = minutes || '00';
      
      let persianAmPm = 'قبل از ظهر';
      if (hour >= 12) {
        persianAmPm = 'بعد از ظهر';
      }
      
      if (hour > 12) {
        hour = hour - 12;
      } else if (hour === 0) {
        hour = 12;
      }
      
      return `${hour}:${minute.toString().padStart(2, '0')} ${persianAmPm}`;
    } catch (error) {
      return time;
    }
  };

  // Calculate seat count and format seat numbers
  const getSeatInfo = () => {
    const seatNumbers = ticket.seat_numbers || '';
    const seatsArray = Array.isArray(ticket.seat_numbers) 
      ? ticket.seat_numbers 
      : (seatNumbers ? seatNumbers.split(', ') : []);
    
    return {
      seats: seatsArray.join(', '),
      seatCount: seatsArray.length || 1
    };
  };

  const { seats, seatCount } = getSeatInfo();
  const totalPrice = parseFloat(ticket.final_price) || parseFloat(ticket.price) || 0;
  const isDoorPay = ticket.payment_method === 'doorpay';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">چاپ تکت مسافر</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              چاپ تکت
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              بستن
            </button>
          </div>
        </div>
        
        {/* Ticket Content - This will be printed */}
        <div className="p-6 print:p-0">
          <div className="w-full max-w-[980px] mx-auto bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden relative print:shadow-none print:border-2">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-200 to-orange-200"></div>

            {/* Top Slanted Bars */}
            <div className="relative">
              <div className="w-full h-[22px] bg-blue-900 rotate-1 origin-left"></div>
              <div className="w-full h-[22px] bg-orange-500 -rotate-1 origin-right -mt-2"></div>
            </div>

            {/* Ticket Body */}
            <div dir="rtl" className="p-6 border-t border-gray-300 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="w-20 h-20 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-sm text-center">
             وردگ
                </div>

                <h1 className="text-[20px] font-extrabold text-blue-900 text-center flex-1">
                 وردگ، اولین و بزرگترین پلتفرم فروش آنلاین تکت در افغانستان{" "}
                  <span className="text-blue-700 block">(www.wardak.af)</span>
                </h1>
              </div>

              {/* Company Info */}
              <div className="border-b border-gray-400 my-3"></div>
              <div className="flex justify-between text-sm font-semibold text-gray-700 px-2">
                <span className="ml-4">نام شرکت مسافربری:وردگ</span>
                <span className="mr-4">شماره تماس شرکت مسافربری: 0797-105-105</span>
              </div>
              <div className="border-b border-gray-400 mt-1 mb-4"></div>

              {/* Trip Info Title */}
              <h2 className="text-center font-bold text-gray-900 text-[17px] mb-3 underline underline-offset-4">
                مشخصات سفر و مسافر
              </h2>

              <div className="flex">
                {/* Left Side - QR Code Placeholder */}
                <div className="w-[30%] flex flex-col items-center justify-start pt-2">
                  <div className="w-36 h-36 mb-4 rounded-lg shadow-md border-2 border-dashed border-gray-400 flex items-center justify-center">
                    <span className="text-gray-500 text-sm text-center">QR Code<br />مسافر</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    شماره تکت: {ticket.id || `TKT-${ticket.name?.substring(0, 3)}${Date.now().toString().slice(-4)}`}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">برای اسکن استفاده نمایید</p>
                  
                  {/* Payment Method Indicator */}
                  {isDoorPay && (
                    <div className="mt-3 px-3 py-1 bg-yellow-100 border border-yellow-400 rounded-md">
                      <p className="text-xs font-bold text-yellow-700">پرداخت درب منزل</p>
                    </div>
                  )}
                </div>

                {/* Right Side - Passenger Info */}
                <div className="w-[70%] grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] border border-gray-400 rounded-md p-4 bg-white/80">
                  <p>
                    <strong>اسم:</strong> {ticket.name || 'نامشخص'}
                  </p>
                  <p>
                    <strong>تخلص:</strong> {ticket.last_name || 'نامشخص'}
                  </p>
                  <p>
                    <strong>شماره تماس:</strong> {ticket.phone || 'نامشخص'}
                  </p>
                  <p>
                    <strong>شماره تکت:</strong> {ticket.id || 'نامشخص'}
                  </p>
                  <p>
                    <strong>تعداد چوکی:</strong> {seatCount}
                  </p>
                  <p>
                    <strong>نمبر چوکی:</strong> {seats || 'نامشخص'}
                  </p>
                  <p>
                    <strong>کرایه فی نفر:</strong> {((totalPrice / seatCount) || 0).toLocaleString()} AFN
                  </p>
                  <p>
                    <strong>مبلغ کل:</strong> {totalPrice.toLocaleString()} AFN
                  </p>

                   <p>
                    <strong>کد تخفیف</strong> {ticket.coupon_code|| 'نامشخص'}
                  </p>
                  <p>
                    <strong>مبدا:</strong> {ticket.from || 'نامشخص'}
                  </p>
                  <p>
                    <strong>مقصد:</strong> {ticket.to || 'نامشخص'}
                  </p>
                  <p>
                    <strong>تاریخ حرکت:</strong> {ticket.ticket_departure_date || 'نامشخص'}
                  </p>
                  <p>
                    <strong>ساعت حرکت:</strong> {formatTimeWithPersianAmPm(ticket.departure_time) || 'نامشخص'}
                  </p>
                  <p>
                    <strong>نوع بس:</strong> {ticket.bus_type || 'نامشخص'}
                  </p>
                  <p>
                    <strong>وضعیت پرداخت:</strong> 
                    <span className={`mr-2 ${
                      ticket.payment_status === 'پرداخت شده' ? 'text-green-600' : 
                      ticket.payment_status === 'در انتظار پرداخت' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {ticket.payment_status || 'نامشخص'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-400 my-5"></div>

              {/* Notes Section */}
              <div>
                <h3 className="font-bold text-gray-900 text-[15px] mb-2 underline">
                  نکات ضروری
                </h3>
                <ul className="text-[13px] text-gray-800 leading-7 font-bold list-disc pr-5 space-y-1">
                  <li>
                    از مسافرین محترم تقاضا به عمل می‌آید تا حداقل نیم ساعت قبل از حرکت
                    بس در ترمینال حاضر باشند.
                  </li>
                  <li>
                    اگر به هر دلیلی از سفر خود منصرف شدید، می‌توانید تا شش ساعت قبل از حرکت
                    بس، تکت خود را بدون هیچ‌گونه جرمانه لغو کنید.
                  </li>
                  <li>
                    بعد از لغو یکی ازوردگ ما به زودترین فرصت پول شما را به درب منزل شما
                    می‌آورد.
                  </li>
                  <li>تغیر دادن تاریخ یا ساعت حرکت و تاشش ساعت قبل از ساعت حرکت بس با تماس تلفنی امکان پزیر نیست</li>
                  <li>
                  در صورت عدم رعایت موارد فوق الذکر مسولیت آن به دوش خود تان میباشد.
                  </li>
                  <li className="font-semibold">
                    شماره تماس خدمات مشتریانوردگ:{" "}
                    <span className="text-blue-800">0797-105-105</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Slanted Bars */}
            <div className="relative mt-4">
              <div className="w-full h-[22px] bg-orange-500 rotate-1 origin-right"></div>
              <div className="w-full h-[22px] bg-blue-900 -rotate-1 origin-left -mt-2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
          }
          .fixed > div,
          .fixed > div > * {
            visibility: visible;
          }
          .fixed {
            overflow: visible;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketPrint;