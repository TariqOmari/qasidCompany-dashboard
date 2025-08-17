// src/components/CustomTable.jsx
import React from 'react';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import qlogo from '../assets/qlogo.jfif';

const CustomTable = ({ columns = [], data = [], title = 'جدول اطلاعات', onView, onEdit, onDelete }) => {
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
      </div>

      {/* Table */}
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-[#0B2A5B] text-white text-sm">
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
                className="bg-white shadow-sm rounded-lg hover:shadow-md transition duration-150"
              >
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
                    <button
                      className="text-[#F37021] hover:text-orange-600 transition"
                      title="مشاهده جزئیات"
                      onClick={() => onView && onView(row)}
                    >
                      <MdVisibility size={20} />
                    </button>
                    <button
                      className="text-[#F37021] hover:text-orange-600 transition"
                      title="ویرایش"
                      onClick={() => onEdit && onEdit(row)}
                    >
                      <MdEdit size={20} />
                    </button>
                    <button
                      className="text-[#F37021] hover:text-orange-600 transition"
                      title="حذف"
                      onClick={() => onDelete && onDelete(row.id)}
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="text-center text-gray-400 py-5">
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
