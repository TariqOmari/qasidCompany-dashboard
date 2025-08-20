// src/components/modals/CustomFormModal.jsx
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

  // Initialize formData when modal opens or when initialData changes
  useEffect(() => {
    if (!isOpen) return;

    const initialFormValues = {};
    fields.forEach((field) => {
      if (field.type === 'file') {
        initialFormValues[field.name] = null;
        initialFormValues[`${field.name}Preview`] = 
          initialData && initialData[field.name] ? initialData[field.name] : '';
      } else {
        initialFormValues[field.name] = initialData ? initialData[field.name] || '' : '';
      }
    });

    setFormData(initialFormValues);
  }, [isOpen, initialData, fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
      // keep modal open on error
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300
        ${isOpen ? 'bg-opacity-40 visible opacity-100' : 'bg-opacity-0 invisible opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 font-vazir text-right">
        <h2 className="text-2xl font-bold mb-6 text-[#0B2A5B] flex items-center gap-2">
          {titleIcon && <span className="text-[#F37021]">{titleIcon}</span>}
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name} className={field.type === 'file' ? 'sm:col-span-2' : ''}>
              <InputWithIcon
                {...field}
                value={field.type === 'file' ? undefined : formData[field.name] || ''}
                onChange={field.type === 'file' ? handleFileChange : handleChange}
                preview={formData[`${field.name}Preview`]}
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
}) => (
  <div>
    <label className="block mb-1 font-semibold text-[#0B2A5B] flex items-center gap-2">
      {icon}
      {label}
    </label>

    {type !== 'file' ? (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
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
          className="w-full border border-gray-300 rounded-md px-10 py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400"
        />
      </div>
    ) : (
      <>
        <input
          name={name}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
  </div>
);

export default CustomFormModal;