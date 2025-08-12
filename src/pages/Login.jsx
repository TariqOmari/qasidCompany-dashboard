import { useState } from "react";
import { FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/qlogo.jfif";
import Loader from "../components/Loader";
import { useToast } from "../components/ToastContext";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toast = useToast();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setIsSubmitting(true);

  try {
    const res = await axios.post("http://127.0.0.1:8000/api/companies/login", {
      username,
      password,
    });

    const { token, user } = res.data;

    sessionStorage.setItem("auth_token", token);
    sessionStorage.setItem("user", JSON.stringify(user));

    toast.success("ورود موفقیت‌آمیز بود");
    navigate("/");
  } catch (err) {
    toast.error(err.response?.data?.message || "ورود ناموفق بود");
  } finally {
    setIsSubmitting(false);
  }
};


  // ✅ Full page loader while logging in
  if (isSubmitting) {
    return <Loader />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(to bottom right, #003366, #f37021)",
      }}
    >
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md px-8 py-10 text-right relative">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="قاصد"
            className="w-28 h-28 object-contain rounded-full border-4 border-orange-400 shadow-md"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-[#003366]">ورود به قاصد</h2>
          <p className="text-[#f37021] mt-1">با هم، تا مقصد</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="relative">
            <input
              type="text"
              placeholder="نام کاربری"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              required
            />
            <FaUser className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#f37021] text-xl" />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003366]"
              required
            />
            <FaLock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#003366] text-xl" />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#f37021] hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition duration-200"
          >
            ورود
          </button>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 text-center mt-2">{error}</p>
          )}
        </form>

        {/* Link */}
        <div className="text-sm text-center text-gray-600 mt-6">
          حساب ندارید؟{" "}
          <a href="#" className="text-[#003366] font-semibold hover:underline">
            ثبت‌نام کنید
          </a>
        </div>
      </div>
    </div>
  );
}
