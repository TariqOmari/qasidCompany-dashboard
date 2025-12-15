import React, { useState, useEffect } from "react";
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
  selectedItems = [],
  clearSelection = false,
  language = "fa", // Add language prop with default Farsi
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 60;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const translations = {
    fa: {
      tableTitle: (title) => `مدیریت داده‌های ${title}`,
      operations: "عملیات",
      noData: "هیچ داده‌ای موجود نیست",
      selectAll: "انتخاب همه",
      selectedCount: "مورد انتخاب شده",
      previous: "قبلی",
      next: "بعدی",
      view: "مشاهده",
      edit: "ویرایش",
      delete: "حذف",
    },
    ps: {
      tableTitle: (title) => `د ${title} مدیریت`,
      operations: "عملیات",
      noData: "هیڅ معلومات نشته",
      selectAll: "ټول انتخاب کړئ",
      selectedCount: "انتخاب شوي توکي",
      previous: "پخوانی",
      next: "بل",
      view: "لیدل",
      edit: "سمول",
      delete: "ړنگول",
    }
  };
  
  const t = translations[language] || translations.fa;

  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Clear selection when clearSelection prop changes
  useEffect(() => {
    if (clearSelection) {
      setSelectedRows(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  }, [clearSelection, onSelectionChange]);

  // Initialize selection from selectedItems only once on mount
  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      const selectedIndices = new Set();
      data.forEach((item, index) => {
        if (selectedItems.some(selectedItem => selectedItem.id === item.id)) {
          selectedIndices.add(index);
        }
      });
      setSelectedRows(selectedIndices);
    }
  }, []);

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
      Array.from({ length: end - start }, (_, i) => i + start)
    );

    const newSelectedRows = new Set(selectedRows);
    const allSelected = [...currentPageIndices].every((i) =>
      newSelectedRows.has(i)
    );

    if (allSelected) {
      currentPageIndices.forEach((i) => newSelectedRows.delete(i));
    } else {
      currentPageIndices.forEach((i) => newSelectedRows.add(i));
    }

    setSelectedRows(newSelectedRows);

    if (onSelectionChange) {
      const selectedData = data.filter((_, i) => newSelectedRows.has(i));
      onSelectionChange(selectedData);
    }
  };

  // Reset current page when data changes significantly
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-3 sm:p-5 w-full font-sans"
      dir={language === "fa" ? "rtl" : "rtl"}
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
              {t.tableTitle(title)}
            </p>
          </div>
        </div>

        {selectable && selectedRows.size > 0 && (
          <div className="bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
            {selectedRows.size} {t.selectedCount}
          </div>
        )}
      </div>

      {/* REMOVE scrollable container - Let browser handle scrolling */}
      {/* Table directly without extra wrapper */}
      <div className="w-full">
        <table className="w-full text-xs sm:text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-[#0B2A5B] text-white text-[11px] sm:text-sm">
              {selectable && (
                <th className="px-2 sm:px-4 py-2 text-right font-semibold rounded-t-md w-8 sm:w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center w-full"
                    title={t.selectAll}
                  >
                    {(() => {
                      const start = (currentPage - 1) * rowsPerPage;
                      const end = currentPage * rowsPerPage;
                      const currentPageIndices = Array.from(
                        { length: end - start }, 
                        (_, i) => i + start
                      );
                      const allSelected = currentPageIndices.length > 0 && 
                        currentPageIndices.every((i) => selectedRows.has(i));
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
              {(onView || onEdit || onDelete) && (
                <th className="px-2 sm:px-4 py-2 text-right font-semibold rounded-t-md whitespace-nowrap">
                  {t.operations}
                </th>
              )}
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
                  {(onView || onEdit || onDelete) && (
                    <td className="px-2 sm:px-4 py-2 text-right">
                      <div className="flex gap-2 justify-start items-center">
                        {onView && (
                          <button
                            className="text-[#F37021] hover:text-orange-600 transition"
                            onClick={() => onView(row)}
                            title={t.view}
                          >
                            <MdVisibility size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            className="text-[#F37021] hover:text-orange-600 transition"
                            onClick={() => onEdit(row)}
                            title={t.edit}
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="text-[#F37021] hover:text-orange-600 transition"
                            onClick={() => onDelete(row)}
                            title={t.delete}
                          >
                            <MdDelete size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + ((onView || onEdit || onDelete) ? 1 : 0)}
                  className="text-center text-gray-400 py-4 sm:py-6"
                >
                  {t.noData}
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
            <MdArrowBack /> {t.previous}
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
            {t.next} <MdArrowForward />
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomTable;