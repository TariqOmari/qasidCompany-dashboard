import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomTable from "../components/CustomTable";
import Loader from "../components/Loader";
import DashboardLayout from "../components/DashboardLayout";

function ReadyTrips() {
  const [trips, setTrips] = useState([]);
  const [readyTrips, setReadyTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/trips-with-tickets`);
      const tripData = response.data.trips || [];

      // filter trips that have exactly 35 tickets
      const filtered = tripData.filter((trip) => trip.tickets.length === 35);

      setTrips(tripData);
      setReadyTrips(filtered);
    } catch (error) {
      console.error("خطا در دریافت سفرها:", error);
    } finally {
      setLoading(false);
    }
  };

  // columns for table
  const columns = [
    { header: "از", accessor: "from" },
    { header: "به", accessor: "to" },
    { header: "تاریخ حرکت", accessor: "departure_date" },
    { header: "تعداد بلیط‌ها", accessor: "ticketsCount" },
  ];

  // format trips for table
  const data = readyTrips.map((trip) => ({
    ...trip,
    ticketsCount: trip.tickets.length,
  }));

  if (loading) {
    // 🔹 Full screen loader
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {readyTrips.length > 0 ? (
          <CustomTable
            title="لیست سفرهای آماده"
            columns={columns}
            data={data}
          />
        ) : (
          <div className="text-center text-red-600 text-lg font-bold mt-10">
            {trips.length > 0
              ? `شما ${trips.length} سفر دارید اما هیچ بس چالان وجود ندارد`
              : "هیچ سفر ثبت نشده است"}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ReadyTrips;
