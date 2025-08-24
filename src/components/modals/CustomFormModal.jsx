import React, { useState, useEffect } from 'react';

const CustomFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'افزودن مورد جدید',
  titleIcon,
  fields = [],
  initialData = null,

  // ✅ Passed from parent
  existingBuses = [],
  editingBus = null,
  existingDrivers = [],
  editingDriver = null,

  children,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

 useEffect(() => {
  if (!isOpen) return;

  // Only initialize form once when modal opens
  const initialFormValues = {};
  fields.forEach((field) => {
    initialFormValues[field.name] = initialData?.[field.name] ?? '';
  });

  setFormData(initialFormValues);
  setErrors({});
  setIsValid(false);
}, [isOpen]); // <-- removed initialData & fields from dependency


  const validateForm = (data = formData) => {
    const newErrors = {};

    // ✅ Required fields
    fields.forEach((field) => {
      if (field.required && !data[field.name]) {
        newErrors[field.name] = `${field.label} الزامی است`;
      }
    });

    // ✅ Bus duplicate checks
    if (data.busNo) {
      const exists = existingBuses.some(
        (b) => b.bus_no === data.busNo && b.id !== editingBus?.id
      );
      if (exists) newErrors.busNo = 'این شماره بس قبلاً ثبت شده است';
    }
    if (data.numberPlate) {
      const exists = existingBuses.some(
        (b) =>
          b.number_plate === data.numberPlate && b.id !== editingBus?.id
      );
      if (exists) newErrors.numberPlate = 'این پلاک قبلاً ثبت شده است';
    }
    if (data.licenseNumber) {
      const exists = existingBuses.some(
        (b) =>
          b.license_number === data.licenseNumber &&
          b.id !== editingBus?.id
      );
      if (exists)
        newErrors.licenseNumber = 'این شماره مجوز قبلاً ثبت شده است';
    }

    // ✅ Driver duplicate checks
    if (data.phone) {
      const exists = existingDrivers.some(
        (d) => d.phone === data.phone && d.id !== editingDriver?.id
      );
      if (exists) newErrors.phone = 'این شماره تلفن قبلاً ثبت شده است';
    }
    if (data.license_number) {
      const exists = existingDrivers.some(
        (d) =>
          d.license_number === data.license_number &&
          d.id !== editingDriver?.id
      );
      if (exists)
        newErrors.license_number = 'این شماره گواهینامه قبلاً ثبت شده است';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    validateForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Modal submit error:', err);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300
        ${
          isOpen
            ? 'bg-opacity-40 visible opacity-100'
            : 'bg-opacity-0 invisible opacity-0 pointer-events-none'
        }`}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 font-vazir text-right max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#0B2A5B] flex items-center gap-2 justify-end">
          {title}
          {titleIcon && <span className="text-[#F37021]">{titleIcon}</span>}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {fields.map((field) => (
            <div key={field.name}>
              <InputWithIcon
                {...field}
                value={formData[field.name] || ''}
                onChange={handleChange}
                error={errors[field.name]}
              />
            </div>
          ))}

          {children && <div className="sm:col-span-2">{children}</div>}

          <div className="sm:col-span-2 flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-4 py-2 rounded transition text-white ${
                isValid
                  ? 'bg-[#F37021] hover:bg-orange-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {initialData ? 'به‌روزرسانی' : 'افزودن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Input with icon + error
const InputWithIcon = ({
  icon,
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  error,
  options = [],
}) => (
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
        className={`w-full border rounded-md py-2 pr-10 pl-3 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">{placeholder || 'لطفا انتخاب کنید'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        dir="rtl"
        className={`w-full border rounded-md py-2 pr-10 pl-3 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          error ? 'border-red-500 animate-shake' : 'border-gray-300'
        }`}
      />
    )}

    {error && <p className="text-red-600 font-bold text-sm mt-1">{error}</p>}
  </div>
);

export default CustomFormModal;
