import React, { useState } from "react";
import {
  MdDelete,
  MdEdit,
  MdVisibility,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdArrowBack,
  MdArrowForward,
} from "react-icons/md";
import qlogo from "../assets/qlogo.jfif";

const CustomTable = ({
  columns = [],
  data = [],
  title = "جدول اطلاعات",
  onView,
  onEdit,
  onDelete,
  selectable = false,
  onSelectionChange,
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const toggleRowSelection = (index) => {
    const actualIndex = (currentPage - 1) * rowsPerPage + index;
    const newSelectedRows = new Set(selectedRows);
    newSelectedRows.has(actualIndex)
      ? newSelectedRows.delete(actualIndex)
      : newSelectedRows.add(actualIndex);
    setSelectedRows(newSelectedRows);

    if (onSelectionChange) {
      const selectedData = data.filter((_, i) => newSelectedRows.has(i));
      onSelectionChange(selectedData);
    }
  };

  const toggleSelectAll = () => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = currentPage * rowsPerPage;
    const currentPageIndices = new Set(
      data.slice(start, end).map((_, i) => i + start)
    );

    const newSelectedRows = new Set(selectedRows);
    const allSelected = [...currentPageIndices].every((i) =>
      newSelectedRows.has(i)
    );

    allSelected
      ? currentPageIndices.forEach((i) => newSelectedRows.delete(i))
      : currentPageIndices.forEach((i) => newSelectedRows.add(i));

    setSelectedRows(newSelectedRows);

    if (onSelectionChange) {
      const selectedData = data.filter((_, i) => newSelectedRows.has(i));
      onSelectionChange(selectedData);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-3 sm:p-5 w-full font-sans"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-3">
          <img
            src={qlogo}
            alt="Qased Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="text-base sm:text-xl font-bold text-[#0B2A5B]">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              مدیریت داده‌های {title}
            </p>
          </div>
        </div>

        {selectable && selectedRows.size > 0 && (
          <div className="bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
            {selectedRows.size} مورد انتخاب شده
          </div>
        )}
      </div>

      {/* Scrollable table container */}
      <div
        className="overflow-x-auto rounded-xl scrollbar-thin scrollbar-thumb-[#F37021] scrollbar-track-gray-100"
        style={{
          WebkitOverflowScrolling: "touch",
          maxWidth: "100%",
        }}
      >
        <table className="min-w-[650px] sm:min-w-full text-xs sm:text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-[#0B2A5B] text-white text-[11px] sm:text-sm">
              {selectable && (
                <th className="px-2 sm:px-4 py-2 text-right font-semibold rounded-t-md w-8 sm:w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center w-full"
                    title="انتخاب همه"
                  >
                    {(() => {
                      const start = (currentPage - 1) * rowsPerPage;
                      const end = currentPage * rowsPerPage;
                      const currentPageIndices = data
                        .slice(start, end)
                        .map((_, i) => i + start);
                      const allSelected = currentPageIndices.every((i) =>
                        selectedRows.has(i)
                      );
                      return allSelected ? (
                        <MdCheckBox size={16} />
                      ) : (
                        <MdCheckBoxOutlineBlank size={16} />
                      );
                    })()}
                  </button>
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-2 sm:px-4 py-2 text-right font-semibold whitespace-nowrap rounded-t-md"
                >
                  {col.header}
                </th>
              ))}
              <th className="px-2 sm:px-4 py-2 text-right font-semibold rounded-t-md whitespace-nowrap">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`bg-white shadow-sm hover:shadow-md transition duration-150 ${
                    selectedRows.has((currentPage - 1) * rowsPerPage + idx)
                      ? "bg-blue-50 ring-2 ring-blue-200"
                      : ""
                  }`}
                >
                  {selectable && (
                    <td className="px-2 sm:px-4 py-2 text-center">
                      <button
                        onClick={() => toggleRowSelection(idx)}
                        className="flex items-center justify-center"
                      >
                        {selectedRows.has(
                          (currentPage - 1) * rowsPerPage + idx
                        ) ? (
                          <MdCheckBox className="text-blue-600" size={16} />
                        ) : (
                          <MdCheckBoxOutlineBlank
                            className="text-gray-400"
                            size={16}
                          />
                        )}
                      </button>
                    </td>
                  )}
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className="px-2 sm:px-4 py-2 text-right text-gray-700 whitespace-nowrap"
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  <td className="px-2 sm:px-4 py-2 text-right">
                    <div className="flex gap-2 justify-start items-center">
                      {onView && (
                        <button
                          className="text-[#F37021] hover:text-orange-600 transition"
                          onClick={() => onView(row)}
                        >
                          <MdVisibility size={16} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="text-[#F37021] hover:text-orange-600 transition"
                          onClick={() => onEdit(row)}
                        >
                          <MdEdit size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="text-[#F37021] hover:text-orange-600 transition"
                          onClick={() => onDelete(row)}
                        >
                          <MdDelete size={16} />
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
                  className="text-center text-gray-400 py-4 sm:py-6"
                >
                  هیچ داده‌ای موجود نیست
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-5 gap-1 sm:gap-2 text-xs sm:text-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-1 rounded-lg flex items-center gap-1 ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-100"
            }`}
          >
            <MdArrowBack /> قبلی
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-2 sm:px-3 py-1 rounded-lg ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-1 rounded-lg flex items-center gap-1 ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-100"
            }`}
          >
            بعدی <MdArrowForward />
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
