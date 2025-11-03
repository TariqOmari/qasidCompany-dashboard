import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fa'); // 'fa' for Persian, 'ps' for Pashto

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('dashboard-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('dashboard-language', lang);
  };

  const value = {
    language,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {/* Remove dir and className changes - keep everything RTL */}
      <div dir="rtl" className="font-vazir">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};