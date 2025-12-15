import React, { useEffect, useState } from "react";
import CustomTable from "../components/CustomTable";
import DashboardLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "./locales/translations";

const TicketsHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [fromList, setFromList] = useState([]);
  const [toList, setToList] = useState([]);

  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const { language } = useLanguage();
  const t = translations[language];
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/trips-with-tickets`);
        const trips = res.data.trips || [];

        // Extract dynamic from/to
        const froms = [...new Set(trips.map((t) => t.from))];
        const tos = [...new Set(trips.map((t) => t.to))];

        setFromList(froms);
        setToList(tos);

        // Flatten tickets + include trip data
        const allTickets = trips.flatMap((trip) =>
          trip.tickets.map((t) => ({
            id: t.id,
            ticket_number: t.ticket_number,
            name: t.name,
            father_name: t.father_name,
            phone: t.phone,
            from: trip.from,
            to: trip.to,
            departure_date: t.departure_date,
            price: t.final_price,
            created_at: t.created_at,
            
            // Keep original English values for filtering
            original_payment_method: t.payment_method,
            original_payment_status: t.payment_status,
            original_status: t.status,

            // Localized payment method
            payment_method:
              t.payment_method === "doorpay" 
                ? (language === "fa" ? "حضوری" : "په دروازه کې")
                : t.payment_method === "online" 
                ? (language === "fa" ? "آنلاین" : "آنلاین")
                : t.payment_method,

            // Localized payment status
            payment_status:
              t.payment_status === "paid" 
                ? (language === "fa" ? "پرداخت شده" : "ورکړل شوی")
                : t.payment_status === "in_processing" 
                ? (language === "fa" ? "در حال پردازش" : "په پروسس کې")
                : t.payment_status === "unpaid" 
                ? (language === "fa" ? "پرداخت نشده" : "نادې شوی")
                : t.payment_status,

            // Localized ticket status
            status:
              t.status === "stopped" 
                ? (language === "fa" ? "توقف" : "درېدلی")
                : t.status === "arrived" 
                ? (language === "fa" ? "رسیده" : "وررسېدلی")
                : t.status === "cancelled" 
                ? (language === "fa" ? "لغو شده" : "لغوه شوی")
                : t.status,
          }))
        );

        // SORT TICKETS BY CREATED_AT DATE - MOST RECENT FIRST
        const sortedTickets = allTickets.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setTickets(sortedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Apply filters + search - FIXED STATUS FILTER
  const filteredTickets = tickets.filter((t) => {
    const matchesFrom = fromFilter ? t.from === fromFilter : true;
    const matchesTo = toFilter ? t.to === toFilter : true;
    
    // FIX: Compare with original English status values
    const matchesStatus = statusFilter ? t.original_status === statusFilter : true;

    const searchTerm = search.toLowerCase();
    const matchesSearch =
      t.ticket_number.toLowerCase().includes(searchTerm) ||
      t.name.toLowerCase().includes(searchTerm) ||
      t.phone.includes(searchTerm);

    return matchesFrom && matchesTo && matchesStatus && matchesSearch;
  });

  // Table columns with localized headers
  const columns = [
    { 
      header: language === "fa" ? "شماره تکت" : "د ټکټ شمېره", 
      accessor: "ticket_number" 
    },
    { 
      header: t.name, 
      accessor: "name" 
    },
    { 
      header: t.fatherName, 
      accessor: "father_name" 
    },
    { 
      header: language === "fa" ? "شماره تماس" : "د اړیکې شمېره", 
      accessor: "phone" 
    },
    { 
      header: t.from, 
      accessor: "from" 
    },
    { 
      header: t.to, 
      accessor: "to" 
    },
    { 
      header: language === "fa" ? "تاریخ حرکت" : "د تګ نېټه", 
      accessor: "departure_date" 
    },
    { 
      header: t.price, 
      accessor: "price" 
    },
    { 
      header: language === "fa" ? "روش پرداخت" : "د تادیې طریقه", 
      accessor: "payment_method" 
    },
    { 
      header: language === "fa" ? "وضعیت پرداخت" : "د تادیې حالت", 
      accessor: "payment_status" 
    },
    { 
      header: language === "fa" ? "وضعیت تکت" : "د ټکټ حالت", 
      accessor: "status" 
    },
  ];

  // Localized status options for filter dropdown
  const statusOptions = [
    { value: "stopped", label: language === "fa" ? "توقف" : "درېدلی" },
    { value: "arrived", label: language === "fa" ? "رسیده" : "وررسېدلی" },
    { value: "cancelled", label: language === "fa" ? "لغو شده" : "لغوه شوی" },
  ];

  return (
    <DashboardLayout>
      {loading ? (
        <Loader />
      ) : (
        <div className="p-4">
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {language === "fa" ? "لیست مسافرین" : "د مسافرینو لیست"}
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
            {/* From dropdown */}
            <select
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
            >
              <option value="">
                {language === "fa" ? "مبدا" : "له چیرې"}
              </option>
              {fromList.map((item, i) => (
                <option key={i} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* To dropdown */}
            <select
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={toFilter}
              onChange={(e) => setToFilter(e.target.value)}
            >
              <option value="">
                {language === "fa" ? "مقصد" : "چیرې ته"}
              </option>
              {toList.map((item, i) => (
                <option key={i} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Ticket status */}
            <select
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">
                {language === "fa" ? "وضعیت تکت" : "د ټکټ حالت"}
              </option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder={
                language === "fa" 
                  ? "جستجو با نام، نمبر تکت، شماره تماس..." 
                  : "د نوم، د ټکټ شمېرې، د تلیفون شمېرې په واسطه پلټنه..."
              }
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <CustomTable 
            data={filteredTickets} 
            columns={columns}
             title={language === 'fa' ? " تکت ها " : "د ټکټونو "}
                     language={language}
            emptyMessage={
              language === "fa" 
                ? "هیچ تیکتی یافت نشد" 
                : "هیڅ ټکټ ونه موندل شو"
            }
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default TicketsHistory;