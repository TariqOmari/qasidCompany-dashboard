import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

function Done() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 font-vazir">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md text-center border-t-8 border-[#f36f21]">
        <FaCheckCircle className="text-7xl mx-auto text-[#073B78] mb-4 drop-shadow-lg" />
        <h1 className="text-2xl font-bold text-[#073B78] mb-2">رزرو موفقانه انجام شد!</h1>
        <p className="text-gray-700 mb-4 leading-relaxed">
          تشکر از شما برای استفاده از خدمات ترانسپورت قاصد. معلومات رزرو به ایمیل و شماره تماس تان ارسال شد.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-6 py-3 bg-[#f36f21] text-white rounded-xl font-semibold shadow hover:bg-[#e25a10] transition"
        >
          برگشت به خانه
        </button>
      </div>
    </div>
  );
}

export default Done;
