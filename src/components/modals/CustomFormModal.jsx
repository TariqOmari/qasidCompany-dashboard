import React, { useState, useEffect } from 'react';

const CustomFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'افزودن مورد جدید',
  titleIcon,
  fields = [],
  initialData = null,
  children,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize formData when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) {
      setFormData({});
      setErrors({});
      return;
    }

    const initialFormValues = {};
    fields.forEach((field) => {
      if (field.type === 'file') {
        initialFormValues[field.name] = null;
        initialFormValues[`${field.name}Preview`] =
          initialData && initialData[field.name] ? initialData[field.name] : '';
      } else {
        initialFormValues[field.name] = initialData
          ? initialData[field.name] || ''
          : '';
      }
    });

    setFormData(initialFormValues);
    setErrors({});
  }, [isOpen, initialData, fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
        [`${name}Preview`]: URL.createObjectURL(file),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} الزامی است`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = { ...formData };
      fields.forEach((field) => {
        if (field.type === 'file') {
          delete submitData[`${field.name}Preview`];
        }
      });

      if (onSubmit) {
        await onSubmit(submitData);
      }
      onClose();
    } catch (err) {
      console.error('Modal submit error:', err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300
        ${isOpen ? 'bg-opacity-40 visible opacity-100' : 'bg-opacity-0 invisible opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 font-vazir text-right max-h-[90vh] overflow-y-auto">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-[#0B2A5B] flex items-center gap-2 justify-end">
          {title}
          {titleIcon && <span className="text-[#F37021]">{titleIcon}</span>}
        </h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.type === 'file' ? 'sm:col-span-2' : ''}
            >
              <InputWithIcon
                {...field}
                value={field.type === 'file' ? undefined : formData[field.name] || ''}
                onChange={field.type === 'file' ? handleFileChange : handleChange}
                preview={formData[`${field.name}Preview`]}
                error={errors[field.name]}
              />
            </div>
          ))}

          {children && <div className="sm:col-span-2">{children}</div>}

          {/* Footer buttons */}
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
              className="px-4 py-2 bg-[#F37021] text-white rounded hover:bg-orange-600 transition"
            >
              {initialData ? 'به‌روزرسانی' : 'افزودن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Input component with RTL support
const InputWithIcon = ({
  icon,
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  pattern,
  min,
  value,
  onChange,
  preview,
  error,
}) => (
  <div className="text-right">
    <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2 justify-end">
      {required && <span className="text-red-500">*</span>}
      {label}
      {icon && <span className="text-orange-500">{icon}</span>}
    </label>

    {type !== 'file' ? (
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
          {icon}
        </div>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          pattern={pattern}
          min={min}
          value={value}
          onChange={onChange}
          dir="rtl"
          className={`w-full border rounded-md py-2 pr-10 pl-3 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
    ) : (
      <>
        <input
          name={name}
          type="file"
          accept="image/*"
          onChange={onChange}
          className={`w-full border rounded-md px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 max-h-24 rounded-md object-contain"
          />
        )}
      </>
    )}

    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default CustomFormModal;