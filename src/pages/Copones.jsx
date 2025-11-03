import React, { useEffect, useState } from "react";
import CustomTable from "../components/CustomTable";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import { MdAdd, MdClose } from "react-icons/md";

const API = import.meta.env.VITE_API_BASE_URL;

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
    if (window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      try {
        await axios.delete(`${API}/api/coupons/${coupon.id}`, axiosConfig);
        fetchCoupons();
      } catch (err) {
        console.error("Error deleting coupon:", err.response || err);
      }
    }
  };

  const columns = [
    { header: "کد کوپن", accessor: "code" },
    { header: "مقدار تخفیف", accessor: "amount" },
    { header: "تاریخ انقضا", accessor: "expiry_date" },
    { header: "حداکثر استفاده", accessor: "usage_limit" },
  ];

  return (
    <DashboardLayout>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">مدیریت کوپن‌ها</h2>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
          >
            <MdAdd /> اضافه کردن کوپن
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">در حال بارگذاری...</div>
        ) : (
          <CustomTable
            columns={columns}
            data={coupons}
            title="کوپن‌ها"
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
                {editingCoupon ? "ویرایش کوپن" : "اضافه کردن کوپن"}
              </h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="کد کوپن"
                  className="border px-3 py-2 rounded-lg"
                  required
                />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="مقدار تخفیف"
                  className="border px-3 py-2 rounded-lg"
                  required
                />
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  placeholder="تاریخ انقضا"
                  className="border px-3 py-2 rounded-lg"
                  required
                />
                <input
                  type="number"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleChange}
                  placeholder="حداکثر استفاده"
                  className="border px-3 py-2 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingCoupon ? "به‌روزرسانی" : "اضافه کردن"}
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
