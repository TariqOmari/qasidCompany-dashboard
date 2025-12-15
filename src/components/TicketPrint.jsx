import React from "react";
import { QRCode } from "react-qrcode-logo";

const TicketPrint = ({ isOpen, onClose, ticket }) => {
  if (!isOpen || !ticket) return null;

  const getCompanyData = () => {
    try {
      const companyData = sessionStorage.getItem('company');
      if (companyData) {
        return JSON.parse(companyData);
      }
    } catch (error) {
      console.error('Error parsing company data from session storage:', error);
    }
    return null;
  };

  const company = getCompanyData();
  
  const logo_url = import.meta.env.VITE_API_BASE_URL_For_logo;

  const formatAfghanDate = (dateString) => {
    if (!dateString) return "نامشخص";

    const months = [
      "",
      "حمل",
      "ثور", 
      "جوزا",
      "سرطان",
      "اسد",
      "سنبله",
      "میزان",
      "عقرب",
      "قوس",
      "جدی",
      "دلو",
      "حوت"
    ];

    try {
      let [year, month, day] = dateString.split("-");
      month = parseInt(month);
      day = parseInt(day);

      return `${day} ${months[month]} ${year}`;
    } catch {
      return dateString;
    }
  };

  const formatTimeWithPersianAmPm = (time) => {
    if (!time) return "";
    if (time.includes('ق.ظ') || time.includes('ب.ظ')) return time;
    if (time.includes('AM') || time.includes('PM')) {
      return time.replace('AM', 'قبل از ظهر').replace('PM', 'بعد از ظهر');
    }
    try {
      let [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      let minute = minutes || '00';
      let persianAmPm = hour >= 12 ? 'بعد از ظهر' : 'قبل از ظهر';
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      return `${hour}:${minute.toString().padStart(2, '0')} ${persianAmPm}`;
    } catch {
      return time;
    }
  };

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

  const qrUrl = `http://qasid.org/ticketsucess?ticket=${ticket.ticket_number || ticket.id}&name=${encodeURIComponent(ticket.name || "کاربر")}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Modal Overlay - Hidden during print */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isOpen ? 'block' : 'hidden'} print:hidden`}>
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

          {/* Ticket Preview */}
          <div className="p-6">
            <div className="ticket-preview scale-90 origin-top">
              <TicketContent ticket={ticket} company={company} logo_url={logo_url} />
            </div>
          </div>
        </div>
      </div>

      {/* Printable Ticket - Only visible during print */}
      <div className="hidden print:block">
        <TicketContent ticket={ticket} company={company} logo_url={logo_url} />
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except the printable ticket */
          body * {
            visibility: hidden;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .printable-ticket,
          .printable-ticket * {
            visibility: visible;
          }
          
          .printable-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          /* A5 Landscape setup */
          @page {
            size: A5 landscape;
            margin: 5mm;
          }
          
          /* Ensure proper scaling */
          .ticket-content {
            width: 100% !important;
            max-width: 100% !important;
            transform: scale(0.9);
            transform-origin: top center;
          }
        }
      `}</style>
    </>
  );
};

// Separate component for the ticket content
const TicketContent = ({ ticket, company, logo_url }) => {
  const formatAfghanDate = (dateString) => {
    if (!dateString) return "نامشخص";
    const months = ["", "حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"];
    try {
      let [year, month, day] = dateString.split("-");
      month = parseInt(month);
      day = parseInt(day);
      return `${day} ${months[month]} ${year}`;
    } catch {
      return dateString;
    }
  };

  const formatTimeWithPersianAmPm = (time) => {
    if (!time) return "";
    if (time.includes('ق.ظ') || time.includes('ب.ظ')) return time;
    if (time.includes('AM') || time.includes('PM')) {
      return time.replace('AM', 'قبل از ظهر').replace('PM', 'بعد از ظهر');
    }
    try {
      let [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      let minute = minutes || '00';
      let persianAmPm = hour >= 12 ? 'بعد از ظهر' : 'قبل از ظهر';
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      return `${hour}:${minute.toString().padStart(2, '0')} ${persianAmPm}`;
    } catch {
      return time;
    }
  };

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
  const qrUrl = `http://qasid.org/ticketsucess?ticket=${ticket.ticket_number || ticket.id}&name=${encodeURIComponent(ticket.name || "کاربر")}`;

  return (
    <div className="printable-ticket">
      <div className="ticket-content w-full max-w-[210mm] mx-auto bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-200 to-orange-200"></div>

        {/* Top Slanted Bars */}
        <div className="relative">
          <div className="w-full h-[16px] bg-blue-900 rotate-1 origin-left"></div>
          <div className="w-full h-[16px] bg-orange-500 -rotate-1 origin-right -mt-2"></div>
        </div>

        {/* Ticket Body */}
        <div dir="rtl" className="p-4 border-t border-gray-300 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-sm text-center">
              {company?.logo_url ? (
                <img
                  src={`${logo_url}/public/${company.logo_url}`} 
                  alt="Company Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                "وردگ"
              )}
            </div>
            <h1 className="text-[18px] font-extrabold text-blue-900 text-center flex-1">
              <span>شرکت ترانسپورتی</span>{" "}
              {company?.name || "وردگ"}
            </h1>
          </div>

          {/* Company Info */}
          <div className="border-b border-gray-400 my-2"></div>
          <div className="flex justify-between text-[11px] font-semibold text-gray-700 px-1">
            <span className="ml-2">نام شرکت مسافربری: {company?.name || "وردگ"}</span> 
            <span className="mr-2">شماره تماس شرکت مسافربری: {company?.phone || "0797-105-105"}</span>
          </div>
          <div className="border-b border-gray-400 mt-1 mb-3"></div>

          {/* Trip Info Title */}
          <h2 className="text-center font-bold text-gray-900 text-[15px] mb-2 underline underline-offset-2">
            مشخصات سفر و مسافر
          </h2>

          <div className="flex">
            {/* Left Side - QR Code + Payment */}
            <div className="w-[30%] flex flex-col items-center justify-start pt-1">
              <QRCode
                value={qrUrl}
                size={100}
                bgColor="#ffffff"
                fgColor="#000000"
              />
              <p className="text-[11px] font-semibold text-gray-700 mt-1 text-center">
                شماره تکت: {ticket.ticket_number || ticket.id}
              </p>
              <p className="text-[10px] text-gray-600 mt-1 text-center">
                برای اسکن استفاده نمایید
              </p>

              {isDoorPay && (
                <div className="mt-1 px-2 py-1 bg-yellow-100 border border-yellow-400 rounded-md w-full">
                  <p className="text-[10px] font-bold text-yellow-700 text-center">پرداخت درب منزل</p>
                </div>
              )}
            </div>

            {/* Right Side - Passenger Info */}
            <div className="w-[70%] grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] border border-gray-400 rounded-md p-3 bg-white/80">
              <p><strong>اسم:</strong> {ticket.name || 'نامشخص'}</p>
              <p><strong>اسم پدر:</strong> {ticket.father_name || 'نامشخص'}</p>
              <p><strong>شماره تماس:</strong> {ticket.phone || 'نامشخص'}</p>
              <p><strong>نوع بس:</strong> {ticket.bus_type || 'نامشخص'}</p>
              <p><strong>تعداد چوکی:</strong> {seatCount}</p>
              <p><strong>نمبر چوکی:</strong> {seats || 'نامشخص'}</p>
              <p><strong>کرایه فی نفر:</strong> {((totalPrice / seatCount) || 0).toLocaleString()} AFN</p>
              <p><strong>مبلغ کل:</strong> {totalPrice.toLocaleString()} AFN</p>
              <p><strong>مبدا:</strong> {ticket.from || 'نامشخص'}</p>
              <p><strong>مقصد:</strong> {ticket.to || 'نامشخص'}</p>
              <p><strong>تاریخ حرکت:</strong> {formatAfghanDate(ticket.ticket_departure_date)}</p>
              <p><strong>ساعت حرکت:</strong> {formatTimeWithPersianAmPm(ticket.departure_time) || 'نامشخص'}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-400 my-3"></div>

          {/* Notes */}
          <div>
            <h3 className="font-bold text-gray-900 text-[13px] mb-1 underline">نکات ضروری</h3>
            <ul className="text-[11px] text-gray-800 leading-6 font-bold list-disc pr-4 space-y-1">
              <li>از مسافرین محترم تقاضا به عمل می‌آید تا حداقل نیم ساعت قبل از حرکت بس در ترمینال حاضر باشند.</li>
              <li>شما میتوانید تا شش ساعت قبل از حرکت بس, تکت خود را لغو یا تغیر دهید</li>
              <li>در صورت عدم رعایت موارد فوق الذکر مسولیت آن به دوش خود تان میباشد.</li>
           
            </ul>
          </div>
        </div>

        {/* Bottom Slanted Bars */}
        <div className="relative mt-3">
          <div className="w-full h-[16px] bg-orange-500 rotate-1 origin-right"></div>
          <div className="w-full h-[16px] bg-blue-900 -rotate-1 origin-left -mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default TicketPrint;