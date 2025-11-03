import React, { useState } from "react";
import axios from "axios";
import { FaLink, FaCopy } from "react-icons/fa";
import DashboardLayout from "../components/DashboardLayout";
import qlogo from "../assets/qlogo.jfif";

const RatingsLink = () => {
  const [tripId, setTripId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("localhost:8004");
  const [feedbackLink, setFeedbackLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8004";

  const handleGenerateLink = async () => {
    if (!tripId || !companyName) {
      alert("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/generate-feedback-link`, {
        trip_id: Number(tripId),
        company_name: companyName,
        subdomain: subdomain,
      });
      setFeedbackLink(res.data.feedback_link);
      alert("لینک با موفقیت ایجاد شد!");
    } catch (err) {
      console.error(err);
      alert("خطا در ایجاد لینک بازخورد.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(feedbackLink);
    alert("لینک با موفقیت کاپی شد!");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#003E91]/10 to-[#F37021]/20 p-4">
        {/* Logo + Button */}
        <div className="flex flex-col items-center space-y-6">
          <img src={qlogo} alt="Qasid Logo" className="w-24 h-24 rounded-full shadow-md" />

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#003E91] hover:bg-[#002F70] text-white px-6 py-3 rounded-2xl shadow-lg text-lg font-semibold transition-all duration-300"
          >
            <FaLink />
            تولید لینک امتیازدهی سفر
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fadeIn border-t-8 border-[#F37021]">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

              <h2 className="text-center text-2xl font-bold text-[#003E91] mb-4">
                ایجاد لینک امتیازدهی سفر
              </h2>
              <p className="text-center text-gray-600 mb-6">
                لطفاً جزئیات سفر خود را وارد کنید تا لینک امتیازدهی برای شما ایجاد گردد.
              </p>

              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="شناسه سفر (trip_id)"
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  className="w-full border border-[#003E91]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#003E91] outline-none"
                />
                <input
                  type="text"
                  placeholder="نام شرکت (company_name)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-[#003E91]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#003E91] outline-none"
                />
                <input
                  type="text"
                  placeholder="ساب‌دامین (subdomain)"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="w-full border border-[#003E91]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#003E91] outline-none"
                />

                <button
                  onClick={handleGenerateLink}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
                    loading
                      ? "bg-[#003E91]/60 cursor-not-allowed"
                      : "bg-[#003E91] hover:bg-[#002F70]"
                  }`}
                >
                  {loading ? "در حال ایجاد..." : "تولید لینک بازخورد"}
                </button>

                {feedbackLink && (
                  <div className="mt-6 space-y-2">
                    <p className="text-center text-gray-700 font-medium">
                      لینک بازخورد شما:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={feedbackLink}
                        className="flex-1 bg-gray-100 border border-gray-300 rounded-xl p-3 text-sm truncate"
                      />
                      <button
                        onClick={handleCopy}
                        className="bg-[#F37021] hover:bg-[#d65e18] text-white px-4 py-2 rounded-xl flex items-center gap-2"
                      >
                        <FaCopy />
                        کاپی
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RatingsLink;
