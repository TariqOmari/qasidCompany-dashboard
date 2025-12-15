import React, { useState, useEffect } from 'react';

const CustomFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'افزودن مورد جدید',
  titleIcon,
  fields = [],
  initialData = null,
  existingBuses = [],
  editingBus = null,
  existingDrivers = [],
  editingDriver = null,
  children,
  onFieldChange,
  isLoading = false,
  isValid = true,
  language = 'fa', // Language support
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [internalIsValid, setInternalIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Translations based on language
  const translations = {
    fa: {
      requiredField: 'الزامی است',
      busNoExists: 'این شماره بس قبلاً ثبت شده است',
      numberPlateExists: 'این نمبر پلیت قبلاً ثبت شده است',
      licenseNumberExists: 'این جوازسیر قبلاً ثبت شده است',
      phoneExists: 'این شماره تلفن قبلاً ثبت شده است',
      driverLicenseExists: 'این لیسنس قبلاً ثبت شده است',
      processing: 'در حال پردازش...',
      update: 'بروزرسانی',
      add: 'افزودن',
      cancel: 'انصراف',
      selectPlaceholder: 'لطفا انتخاب کنید',
    },
    ps: {
      requiredField: 'اړین دی',
      busNoExists: 'دا بس نمبر مخکې ثبت شوی دی',
      numberPlateExists: 'دا نمبر پلیټ مخکې ثبت شوی دی',
      licenseNumberExists: 'دا جواز سیر مخکې ثبت شوی دی',
      phoneExists: 'دا تلیفون نمبر مخکې ثبت شوی دی',
      driverLicenseExists: 'دا لایسنس مخکې ثبت شوی دی',
      processing: 'په پروسې کې...',
      update: 'تازه کول',
      add: 'زیاتول',
      cancel: 'لغوه',
      selectPlaceholder: 'مهرباني وکړئ وټاکئ',
    }
  };

  const t = translations[language] || translations.fa;

  useEffect(() => {
    if (!isOpen) return;

    const initialFormValues = {};
    fields.forEach((field) => {
      if (field.type === 'checkbox') {
        initialFormValues[field.name] = initialData?.[field.name] ?? false;
      } else {
        initialFormValues[field.name] = initialData?.[field.name] ?? '';
      }
    });

    setFormData(initialFormValues);
    setErrors({});
    setInternalIsValid(false);
    setIsSubmitting(false);
  }, [isOpen, initialData, fields]);

  const validateForm = (data = formData) => {
    const newErrors = {};

    fields.forEach((field) => {
      if (field.required && !data[field.name]?.toString().trim() && field.type !== 'checkbox') {
        newErrors[field.name] = `${field.label} ${t.requiredField}`;
      }
    });

    // Bus duplicate checks
    if (data.busNo) {
      const exists = existingBuses.some(
        (b) => b.bus_no === data.busNo && b.id !== editingBus?.id
      );
      if (exists) newErrors.busNo = t.busNoExists;
    }
    if (data.numberPlate) {
      const exists = existingBuses.some(
        (b) => b.number_plate === data.numberPlate && b.id !== editingBus?.id
      );
      if (exists) newErrors.numberPlate = t.numberPlateExists;
    }
    if (data.licenseNumber) {
      const exists = existingBuses.some(
        (b) => b.license_number === data.licenseNumber && b.id !== editingBus?.id
      );
      if (exists) newErrors.licenseNumber = t.licenseNumberExists;
    }

    // Driver duplicate checks
    if (data.phone) {
      const exists = existingDrivers.some(
        (d) => d.phone === data.phone && d.id !== editingDriver?.id
      );
      if (exists) newErrors.phone = t.phoneExists;
    }
    if (data.license_number) {
      const exists = existingDrivers.some(
        (d) => d.license_number === data.license_number && d.id !== editingDriver?.id
      );
      if (exists) newErrors.license_number = t.driverLicenseExists;
    }

    setErrors(newErrors);
    const isValidForm = Object.keys(newErrors).length === 0;
    setInternalIsValid(isValidForm);
    return isValidForm;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    const updated = { ...formData, [name]: newValue };
    setFormData(updated);

    if (typeof onFieldChange === 'function') {
      onFieldChange(name, newValue);
    }

    validateForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use external isValid if provided, otherwise use internal validation
    const shouldSubmit = isValid !== undefined ? isValid : validateForm();
    
    if (!shouldSubmit) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (err) {
      console.error('Modal submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Determine if we're in loading state
  const showLoading = isSubmitting || isLoading;
  
  // Use external isValid if provided, otherwise use internal validation
  const finalIsValid = isValid !== undefined ? isValid : internalIsValid;

  const getSubmitButtonText = () => {
    if (showLoading) return t.processing;
    return initialData ? t.update : t.add;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300
        ${isOpen ? 'bg-opacity-40 visible opacity-100' : 'bg-opacity-0 invisible opacity-0 pointer-events-none'}`}
      dir="ltr"
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 font-vazir text-right max-h-[90vh] overflow-y-auto">
        
        <h2 className="text-2xl font-bold mb-6 text-[#0B2A5B] flex items-center gap-2 justify-end">
          {title}
          {titleIcon && <span className="text-[#F37021]">{titleIcon}</span>}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name} className={field.type === 'checkbox' ? 'sm:col-span-2' : ''}>
              <InputWithIcon
                {...field}
                value={formData[field.name] || ''}
                checked={!!formData[field.name]}
                onChange={handleChange}
                error={errors[field.name]}
                language={language}
                translations={t}
              />
            </div>
          ))}

          {children && <div className="sm:col-span-2">{children}</div>}

          <div className="sm:col-span-2 flex justify-between items-center mt-6 gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={showLoading}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!finalIsValid || showLoading}
              className={`px-4 py-2 rounded transition text-white min-w-[100px] ${
                finalIsValid && !showLoading ? 'bg-[#F37021] hover:bg-orange-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Input component
const InputWithIcon = ({
  icon,
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  checked,
  onChange,
  error,
  options = [],
  language = 'fa',
  translations,
}) => {
  const t = translations;

  return (
    <div className="text-right">
      <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2 justify-end">
        {required && <span className="text-red-500">*</span>}
        {label}
        {icon && <span className="text-orange-500">{icon}</span>}
      </label>

      {type === 'select' ? (
        <select
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          dir="rtl"
          className={`w-full border rounded-md py-2 pr-3 pl-10 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">{placeholder || t.selectPlaceholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center justify-end gap-2">
          <label htmlFor={name} className="text-sm text-gray-600">
            {placeholder}
          </label>
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
        </div>
      ) : (
        <div className="relative">
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={onChange}
            dir="rtl"
            className={`w-full border rounded-md py-2 pr-3 pl-10 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              error ? 'border-red-500 animate-shake' : 'border-gray-300'
            }`}
          />
          {icon && (
            <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
              <span className="text-orange-500">{icon}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-600 font-bold text-sm mt-1 text-right">
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomFormModal;