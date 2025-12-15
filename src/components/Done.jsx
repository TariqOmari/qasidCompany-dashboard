import React from 'react';
import { FaCheckCircle, FaArrowLeft, FaHome } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../pages/locales/translations';

function Done() {
  const { language } = useLanguage();
  const t = translations[language];

  // Localized text content
  const localizedText = {
    backButton: language === 'fa' ? 'برگشت' : 'بیرته',
    successTitle: language === 'fa' ? 'رزرو موفقانه انجام شد!' : 'ریزرو په بریالیتوب سره ترسره شو!',
    successMessage: language === 'fa' 
      ? 'تشکر از شما برای استفاده از خدمات  قاصد. .'
      : 'د قاصد د  خدمتونو د کارولو لپاره مننه. .',
    homeButton: language === 'fa' ? 'برگشت به خانه' : 'کور ته بیرته'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 font-vazir" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md text-center border-t-8 border-[#f36f21] relative">

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-4 flex items-center gap-2 text-[#073B78] hover:text-[#052b57] transition font-semibold`}
        >
          {language === 'en' ? (
            <>
              <FaArrowLeft />
              Back
            </>
          ) : (
            <>
              {localizedText.backButton}
              <FaArrowLeft className={language === 'fa' ? 'transform rotate-180' : ''} />
            </>
          )}
        </button>

        {/* Success Icon */}
        <FaCheckCircle className="text-7xl mx-auto text-[#073B78] mb-4 mt-6 drop-shadow-lg" />

        {/* Success Title */}
        <h1 className="text-2xl font-bold text-[#073B78] mb-2">
          {localizedText.successTitle}
        </h1>

        {/* Success Message */}
        <p className="text-gray-700 mb-4 leading-relaxed">
          {localizedText.successMessage}
        </p>

        {/* Home Button */}
        <button
          onClick={() => window.location.href = '/busbooking'}
          className="mt-4 px-6 py-3 bg-[#f36f21] text-white rounded-xl font-semibold shadow hover:bg-[#e25a10] transition flex items-center justify-center gap-2 mx-auto"
        >
          <FaHome />
          {localizedText.homeButton}
        </button>

        {/* Additional Info */}
       
      </div>
    </div>
  );
}

export default Done;