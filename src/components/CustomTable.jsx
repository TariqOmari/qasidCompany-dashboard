// src/components/CustomTable.jsx
import React, { useState } from 'react';
import { MdDelete, MdEdit, MdVisibility, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import qlogo from '../assets/qlogo.jfif';

const CustomTable = ({ 
  columns = [], 
  data = [], 
  title = 'جدول اطلاعات', 
  onView, 
  onEdit, 
  onDelete,
  selectable = false,
  onSelectionChange 
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Handle row selection
  const toggleRowSelection = (index) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(index)) {
      newSelectedRows.delete(index);
    } else {
      newSelectedRows.add(index);
    }
    setSelectedRows(newSelectedRows);
    
    // Notify parent component about selection change
    if (onSelectionChange) {
      const selectedData = data.filter((_, i) => newSelectedRows.has(i));
      onSelectionChange(selectedData);
    }
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      // Deselect all
      setSelectedRows(new Set());
      if (onSelectionChange) onSelectionChange([]);
    } else {
      // Select all
      const allIndices = new Set(data.map((_, index) => index));
      setSelectedRows(allIndices);
      if (onSelectionChange) onSelectionChange([...data]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full overflow-x-auto font-sans" dir="rtl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={qlogo} alt="Qased Logo" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="text-xl font-bold text-[#0B2A5B]">{title}</h2>
            <p className="text-sm text-gray-500">مدیریت داده‌های {title}</p>
          </div>
        </div>
        
        {/* Selection info */}
        {selectable && selectedRows.size > 0 && (
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm">
            {selectedRows.size} مورد انتخاب شده
          </div>
        )}
      </div>

      {/* Table */}
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-[#0B2A5B] text-white text-sm">
            {selectable && (
              <th className="px-4 py-3 text-right font-semibold rounded-t-md w-12">
                <button 
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center w-full"
                  title={selectedRows.size === data.length ? "لغو انتخاب همه" : "انتخاب همه"}
                >
                  {selectedRows.size === data.length ? (
                    <MdCheckBox size={20} />
                  ) : (
                    <MdCheckBoxOutlineBlank size={20} />
                  )}
                </button>
              </th>
            )}
            {Array.isArray(columns) &&
              columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-right font-semibold whitespace-nowrap rounded-t-md"
                >
                  {col.header}
                </th>
              ))}
            <th className="px-4 py-3 text-right font-semibold rounded-t-md">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((row, idx) => (
              <tr
                key={idx}
                className={`bg-white shadow-sm rounded-lg hover:shadow-md transition duration-150 ${
                  selectedRows.has(idx) ? 'bg-blue-50 ring-2 ring-blue-200' : ''
                }`}
              >
                {selectable && (
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => toggleRowSelection(idx)}
                      className="flex items-center justify-center"
                      title={selectedRows.has(idx) ? "لغو انتخاب" : "انتخاب"}
                    >
                      {selectedRows.has(idx) ? (
                        <MdCheckBox className="text-blue-600" size={20} />
                      ) : (
                        <MdCheckBoxOutlineBlank className="text-gray-400" size={20} />
                      )}
                    </button>
                  </td>
                )}
                {columns.map((col, i) => (
                  <td
                    key={i}
                    className="px-4 py-3 text-right text-gray-700 text-sm whitespace-nowrap"
                  >
                    {row[col.accessor]}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-start items-center">
                    {onView && (
                      <button
                        className="text-[#F37021] hover:text-orange-600 transition"
                        title="مشاهده جزئیات"
                        onClick={() => onView(row)}
                      >
                        <MdVisibility size={20} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="text-[#F37021] hover:text-orange-600 transition"
                        title="ویرایش"
                        onClick={() => onEdit(row)}
                      >
                        <MdEdit size={20} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="text-[#F37021] hover:text-orange-600 transition"
                        title="حذف"
                        onClick={() => onDelete(row)}
                      >
                        <MdDelete size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length + (selectable ? 2 : 1)} 
                className="text-center text-gray-400 py-5"
              >
                هیچ داده‌ای موجود نیست
              </td>
            </tr>
          )}
        </tbody>
      </table>

     
    </div>
  );
};

export default CustomTable;