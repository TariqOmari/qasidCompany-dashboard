import React, { useEffect, useState } from "react";
import CustomTable from "../components/CustomTable";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import { MdAdd, MdClose } from "react-icons/md";
import { useLanguage } from '../contexts/LanguageContext.jsX'; // Import language context

const API = import.meta.env.VITE_API_BASE_URL;

// Translation objects
const translations = {
  fa: {
    columns: [
      { header: "کد کوپن", accessor: "code" },
      { header: "مقدار تخفیف", accessor: "amount" },
      { header: "تاریخ انقضا", accessor: "expiry_date" },
      { header: "حداکثر استفاده", accessor: "usage_limit" },
    ],
    titles: {
      manageCoupons: "مدیریت کوپن‌ها",
      coupons: "کوپن‌ها",
      addCoupon: "اضافه کردن کوپن",
      editCoupon: "ویرایش کوپن",
      update: "به‌روزرسانی",
      add: "اضافه کردن"
    },
    placeholders: {
      code: "کد کوپن",
      amount: "مقدار تخفیف",
      expiry_date: "تاریخ انقضا",
      usage_limit: "حداکثر استفاده"
    },
    messages: {
      loading: "در حال بارگذاری...",
      confirmDelete: (code) => `Are you sure you want to delete coupon "${code}"?`
    }
  },
  ps: {
    columns: [
      { header: "د کوپن کوډ", accessor: "code" },
      { header: "د تخفیف مقدار", accessor: "amount" },
      { header: "د پای نیټه", accessor: "expiry_date" },
      { header: "د کارونې حد", accessor: "usage_limit" },
    ],
    titles: {
      manageCoupons: "د کوپنونو مدیریت",
      coupons: "کوپنونه",
      addCoupon: "کوپن اضافه کول",
      editCoupon: "کوپن سمول",
      update: "اوسمهالول",
      add: "اضافه کول"
    },
    placeholders: {
      code: "د کوپن کوډ",
      amount: "د تخفیف مقدار",
      expiry_date: "د پای نیټه",
      usage_limit: "د کارونې حد"
    },
    messages: {
      loading: "په بار کېږي...",
      confirmDelete: (code) => `آیا تاسی ډاډه یاست چې کوپن "${code}" ړنگ کړئ؟`
    }
  }
};

function Copones() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    amount: "",
    expiry_date: "",
    usage_limit: "",
  });

  const { language } = useLanguage(); // Get current language
  const t = translations[language]; // Get translations

  const token = sessionStorage.getItem("auth_token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/coupons`, axiosConfig);
      setCoupons(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching coupons:", err.response || err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Open modal
  const openModal = (coupon = null) => {
    setEditingCoupon(coupon);
    setFormData(
      coupon
        ? {
            code: coupon.code,
            amount: coupon.amount,
            expiry_date: coupon.expiry_date || "",
            usage_limit: coupon.usage_limit || "",
          }
        : { code: "", amount: "", expiry_date: "", usage_limit: "" }
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingCoupon(null);
    setFormData({ code: "", amount: "", expiry_date: "", usage_limit: "" });
    setModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await axios.put(`${API}/api/coupons/${editingCoupon.id}`, formData, axiosConfig);
      } else {
        await axios.post(`${API}/api/coupons`, formData, axiosConfig);
      }
      fetchCoupons();
      closeModal();
    } catch (err) {
      console.error("Error submitting coupon:", err.response || err);
    }
  };

  const handleDelete = async (coupon) => {
    if (window.confirm(t.messages.confirmDelete(coupon.code))) {
      try {
        await axios.delete(`${API}/api/coupons/${coupon.id}`, axiosConfig);
        fetchCoupons();
      } catch (err) {
        console.error("Error deleting coupon:", err.response || err);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t.titles.manageCoupons}</h2>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
          >
            <MdAdd /> {t.titles.addCoupon}
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">{t.messages.loading}</div>
        ) : (
          <CustomTable
            columns={t.columns}
            data={coupons}
            title={t.titles.coupons}
            onEdit={(row) => openModal(row)}
            onDelete={handleDelete}
          />
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-5 w-96 relative">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <MdClose size={20} />
              </button>
              <h3 className="text-lg font-bold mb-4">
                {editingCoupon ? t.titles.editCoupon : t.titles.addCoupon}
              </h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder={t.placeholders.code}
                  className="border px-3 py-2 rounded-lg"
                  required
                />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder={t.placeholders.amount}
                  className="border px-3 py-2 rounded-lg"
                  required
                />
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  placeholder={t.placeholders.expiry_date}
                  className="border px-3 py-2 rounded-lg"
                  required
                />
                <input
                  type="number"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleChange}
                  placeholder={t.placeholders.usage_limit}
                  className="border px-3 py-2 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingCoupon ? t.titles.update : t.titles.add}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Copones;