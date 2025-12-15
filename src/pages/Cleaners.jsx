import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomTable from "../components/CustomTable";
import DashboardLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import { useLanguage } from "../contexts/LanguageContext"; // Import the context
import { translations } from "./locales/translations";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const Cleaners = () => {
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [formData, setFormData] = useState({
    cleaner_name: "",
    cleaner_phone: "",
  });

  // Message modal states
  const [messageModal, setMessageModal] = useState({
    visible: false,
    text: "",
    type: "", // success | error
  });

  const token = sessionStorage.getItem("auth_token");
  const { language } = useLanguage(); // Use context instead of sessionStorage
  const t = translations[language];

  // Fetch Cleaners (sorted by created_at descending)
  const fetchCleaners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/cleaners`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Sort by created_at if available
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setCleaners(sorted);
    } catch (error) {
      console.error("Error fetching cleaners:", error);
      showMessage(
        language === "fa" 
          ? "خطا در دریافت نماینده ها ❌" 
          : "د استازیانو د ترلاسه کولو تېروتنه ❌", 
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaners();
  }, []);

  // Handle form input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Show message modal
  const showMessage = (text, type) => {
    setMessageModal({ visible: true, text, type });
    setTimeout(() => {
      setMessageModal({ visible: false, text: "", type: "" });
    }, 2000);
  };

  // Add Cleaner
  const handleAddCleaner = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    setShowModal(false);

    try {
      await axios.post(`${baseURL}/api/cleaners`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({ cleaner_name: "", cleaner_phone: "" });
      fetchCleaners();
      showMessage(
        language === "fa" 
          ? "نماینده با موفقیت اضافه شد ✅" 
          : "استازی په بریالیتوب سره اضافه شو ✅", 
        "success"
      );
    } catch (error) {
      console.error("Error adding cleaner:", error);
      showMessage(
        language === "fa" 
          ? "خطا در اضافه کردن نماینده ❌" 
          : "د استازی د اضافه کولو تېروتنه ❌", 
        "error"
      );
    } finally {
      setBtnLoading(false);
    }
  };

  // Update Cleaner
  const handleUpdateCleaner = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    setShowModal(false);

    try {
      await axios.put(
        `${baseURL}/api/cleaners/${selectedCleaner.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFormData({ cleaner_name: "", cleaner_phone: "" });
      setSelectedCleaner(null);
      fetchCleaners();
      showMessage(
        language === "fa" 
          ? "نماینده با موفقیت ویرایش شد ✅" 
          : "استازی په بریالیتوب سره سم شو ✅", 
        "success"
      );
    } catch (error) {
      console.error("Error updating cleaner:", error);
      showMessage(
        language === "fa" 
          ? "خطا در ویرایش نماینده ❌" 
          : "د استازی د سمون تېروتنه ❌", 
        "error"
      );
    } finally {
      setBtnLoading(false);
    }
  };

  // Delete Cleaner
  const handleDeleteCleaner = async (id) => {
    if (!window.confirm(
      language === "fa" 
        ? "آیا مطمئن هستید که می‌خواهید حذف کنید؟" 
        : "آیا تاسې ډاډه یاست چې ړنگول یې غواړئ؟"
    )) return;

    try {
      await axios.delete(`${baseURL}/api/cleaners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCleaners();
      showMessage(
        language === "fa" 
          ? "نماینده با موفقیت حذف شد 🗑️" 
          : "استازی په بریالیتوب سره ړنگ شو 🗑️", 
        "success"
      );
    } catch (error) {
      console.error("Error deleting cleaner:", error);
      showMessage(
        language === "fa" 
          ? "خطا در حذف نماینده ❌" 
          : "د استازی د ړنگولو تېروتنه ❌", 
        "error"
      );
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setSelectedCleaner(null);
    setFormData({ cleaner_name: "", cleaner_phone: "" });
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (cleaner) => {
    setSelectedCleaner(cleaner);
    setFormData({
      cleaner_name: cleaner.cleaner_name,
      cleaner_phone: cleaner.cleaner_phone,
    });
    setShowModal(true);
  };

  return (
    <DashboardLayout>
      {/* Independent Global Loader */}
      {loading && <Loader />}

      <div className="p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {language === "fa" ? "مدیریت نماینده ها" : "د استازیانو مدیریت"}
          </h2>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            {language === "fa" ? "افزودن نماینده" : "نوی استازی اضافه کړئ"}
          </button>
        </div>

        {/* Table */}
        <CustomTable
          columns={[
            { 
              header: language === "fa" ? "نام نماینده" : "د استازی نوم", 
              accessor: "cleaner_name" 
            },
            { 
              header: language === "fa" ? "شماره نماینده" : "د استازی شمېره", 
              accessor: "cleaner_phone" 
            },
          ]}
          data={cleaners}
          isLoading={false}
          emptyMessage={language === "fa" ? "هیچ نماینده ای موجود نیست" : "هیڅ استازی نشته"}
          onEdit={openEditModal}
          onDelete={(row) => handleDeleteCleaner(row.id)}

           title={language === 'fa' ? " نماینده ها " : " استازو "}
                     language={language}
        />

        {/* Modal for Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-[fadeIn_0.25s_ease]">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-700">
                {selectedCleaner 
                  ? (language === "fa" ? "ویرایش نماینده" : "استازی سمول") 
                  : (language === "fa" ? "افزودن نماینده" : "نوی استازی اضافه کول")
                }
              </h3>

              <form
                onSubmit={
                  selectedCleaner ? handleUpdateCleaner : handleAddCleaner
                }
                className="space-y-5"
              >
                {/* Cleaner Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-600">
                    {language === "fa" ? "نام نماینده" : "د استازی نوم"}
                  </label>
                  <input
                    type="text"
                    name="cleaner_name"
                    value={formData.cleaner_name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Cleaner Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-600">
                    {language === "fa" ? "شماره نماینده" : "د استازی شمېره"}
                  </label>
                  <input
                    type="number"
                    name="cleaner_phone"
                    value={formData.cleaner_phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    {t.cancel}
                  </button>

                  <button
                    type="submit"
                    disabled={btnLoading}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 min-w-[100px]"
                  >
                    {btnLoading ? <Loader /> : selectedCleaner ? t.edit : t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Success / Error Modal */}
        {messageModal.visible && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
            <div
              className={`${
                messageModal.type === "success"
                  ? "bg-green-600"
                  : "bg-red-600"
              } text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-2xl animate-[fadeIn_0.3s_ease]`}
            >
              {messageModal.text}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cleaners;