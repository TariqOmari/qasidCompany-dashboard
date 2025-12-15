import React, { useState, useEffect } from "react";
import { GiSteeringWheel } from "react-icons/gi";
import axios from "axios";
import "./Sets.css";
import { useLanguage } from "../contexts/LanguageContext";

const Sets = ({ selectedSeats, setSelectedSeats, tripId, companyApiUrl, busType, departureDate }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capacity, setCapacity] = useState({
    base_capacity: 35,
    additional_capacity: 0,
    total_capacity: 35,
  });

  // Get translations
  const { translations } = useLanguage();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!tripId || !API_BASE_URL || !busType || !departureDate) return;

    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError(null);

        const secureBaseUrl = API_BASE_URL
          .replace(/^http:\/\//i, "http://")
          .replace(/\/$/, "");

        const apiUrl = `${secureBaseUrl}/api/trips/${tripId}/seats`;

        const response = await axios.get(apiUrl, {
          params: { bus_type: busType, departure_date: departureDate },
        });

        setSeats(response.data.seats || []);
        setCapacity({
          base_capacity: response.data.base_capacity || 35,
          additional_capacity: response.data.additional_capacity || 0,
          total_capacity: response.data.total_capacity || 35,
        });
      } catch (err) {
        console.error("Error fetching seats:", err);
        setError("Failed to load seat information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [tripId, companyApiUrl, busType, departureDate]);

  const handleVipSeatClick = (seatNumber, status) => {
    if (status !== "free") return;
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handle580SeatClick = (seatNumber, status) => {
    if (status !== "free") return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const renderVipLayout = () => {
    if (loading) return <div className="text-center py-10">Loading seat information...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    const { base_capacity: baseCapacity, additional_capacity: additionalCapacity, total_capacity: totalCapacity } = capacity;

    const leftSeats = seats.filter((s) =>
      [3, 6, 9, 12, 15, 16, 17, 20, 23, 26, 29, 32, 35].includes(s.seat_number)
    );

    const rightSeatNumbers = [
      2, 1, 5, 4, 8, 7, 11, 10, 14, 13,
      19, 18, 22, 21, 25, 24, 28, 27,
      31, 30, 34, 33,
    ];

    const rightSeats = [];
    const doorRowIndex = 5;

    for (let i = 0; i < rightSeatNumbers.length; i += 2) {
      if (i / 2 === doorRowIndex) {
        rightSeats.push(["door"]);
      }
      const seat1 = seats.find((s) => s.seat_number === rightSeatNumbers[i]);
      const seat2 = seats.find((s) => s.seat_number === rightSeatNumbers[i + 1]);
      if (seat1 && seat2) {
        rightSeats.push([seat1, seat2]);
      }
    }

    if (additionalCapacity > 0) {
      const startNumber = baseCapacity + 1;
      const extraSeats = [];

      for (let i = startNumber; i <= baseCapacity + additionalCapacity; i++) {
        const seat = seats.find((s) => s.seat_number === i);
        if (seat) extraSeats.push(seat);
      }

      let index = 0;
      let turn = 'right';
      
      while (index < extraSeats.length) {
        if (turn === 'right' && index + 1 < extraSeats.length) {
          rightSeats.push([extraSeats[index + 1], extraSeats[index]]);
          index += 2;
          turn = 'left';
        } else if (turn === 'left' && index < extraSeats.length) {
          leftSeats.push(extraSeats[index]);
          index += 1;
          turn = 'right';
        } else {
          if (index < extraSeats.length) {
            leftSeats.push(extraSeats[index]);
            index += 1;
          }
        }
      }
    }

    const getSeatClass = (seat) => {
      if (seat.status === "booked") return "bg-red-600 text-white cursor-not-allowed";
      if (selectedSeats.includes(seat.seat_number)) return "bg-blue-500 text-white";
      return "bg-white text-black hover:bg-gray-100";
    };

    return (
      <div className="flex flex-col items-center p-4 bg-white min-h-screen" dir="ltr">
        <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-gray-700">
          <div className="flex justify-center items-center gap-4 mb-3 text-xs font-medium">
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 bg-white border border-gray-400 rounded-sm"></div>
              <span>خالی</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm"></div>
              <span>انتخاب شده</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 bg-red-600 rounded-sm"></div>
              <span>پر</span>
            </div>
          </div>

          <div className="flex mb-4 items-center">
            <GiSteeringWheel className="text-4xl text-gray-700 ml-2" />
            <h1 className="ml-[100px] text-lg font-semibold">دروازه</h1>
          </div>

          <div className="flex">
            <div className="flex flex-col">
              {leftSeats.map((seat) => (
                <div
                  key={seat.seat_number}
                  onClick={() => handleVipSeatClick(seat.seat_number, seat.status)}
                  className={`w-12 h-12 flex items-center justify-center rounded-md border border-gray-400 m-1 cursor-pointer transition-all ${getSeatClass(seat)}`}
                >
                  {seat.seat_number}
                </div>
              ))}
            </div>

            <div className="mx-8"></div>

            <div className="flex flex-col">
              {rightSeats.map((row, i) => (
                <div key={i} className="flex mb-1">
                  {row[0] === "door" ? (
                    <div className="col-span-2 w-[100px] h-[75px] flex ml-1 items-center justify-center bg-gray-200 text-gray-700 rounded-md border border-gray-400">
                      دروازه
                    </div>
                  ) : (
                    row.map((seat) => (
                      <div
                        key={seat.seat_number}
                        onClick={() => handleVipSeatClick(seat.seat_number, seat.status)}
                        className={`w-12 h-12 flex items-center justify-center rounded-md border border-gray-400 m-1 cursor-pointer transition-all ${getSeatClass(seat)}`}
                      >
                        {seat.seat_number}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const render580Layout = () => {
    if (loading) return <div className="text-center py-10">Loading seat information...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    const allSeatNumbers = seats.map(s => s.seat_number).sort((a, b) => a - b);
    const LAST_ROW_SIZE = 5;
    const lastRowNumbers =
      allSeatNumbers.length >= LAST_ROW_SIZE
        ? allSeatNumbers.slice(-LAST_ROW_SIZE)
        : [...allSeatNumbers];

    const remainingSeatNumbers = allSeatNumbers.filter(n => !lastRowNumbers.includes(n));

    const template = [
      [0, 0, null, 0, 0],
      [0, 0, null, 0, 0],
      [0, 0, null, 0, 0],
      [0, 0, null, 0, 0],
      [0, 0, null, 0, 0],
      ["WC", null, 0, 0],
      ["DOOR", null, 0, 0],
      ["", "", null, 0, 0],
      [0, 0, null, 0, 0],
      [0, 0, null, 0, 0],
      [0, 0, null, 0, 0],
      [0, 0, null, 0, 0],
      [0, 0, null, 0, 0],
    ];

    const cloneRow = (r) => Array.isArray(r) ? r.slice() : r;

    const filledRows = template.map(row => {
      const r = cloneRow(row);
      for (let i = 0; i < r.length; i++) {
        if (r[i] === 0) {
          if (remainingSeatNumbers.length > 0) {
            r[i] = remainingSeatNumbers.shift();
          } else {
            r[i] = "";
          }
        }
      }
      return r;
    });

    const extraRows = [];
    while (remainingSeatNumbers.length > 0) {
      const chunk = remainingSeatNumbers.splice(0, 4);
      const left = chunk.slice(0, 2);
      const right = chunk.slice(2, 4);
      const l0 = left[0] ?? "";
      const l1 = left[1] ?? "";
      const r0 = right[0] ?? "";
      const r1 = right[1] ?? "";
      extraRows.push([l0, l1, null, r0, r1]);
    }

    const seatLayout = [...filledRows, ...extraRows, lastRowNumbers];

    const getSeatClass = (status, seatNumber) => {
      if (status === "booked") return "seat occupied";
      if (selectedSeats.includes(seatNumber)) return "seat selected";
      return "seat";
    };

    return (
      <div className="bus-container">
        <div className="legend">
          <span className="legend-box selected"></span> انتخاب شده
          <span className="legend-box empty"></span> خالی
          <span className="legend-box occupied"></span> پُر
        </div>

        <div className="bus-layout">
          <div className="driver-door-row">
            <div className="door1">دروازه</div>
            <div className="driver"><GiSteeringWheel /></div>
          </div>

          {seatLayout.map((row, rowIndex) => (
            <div className={`seat-row ${rowIndex === seatLayout.length - 1 ? "last-row" : ""}`} key={rowIndex}>
              {row.map((seat, i) => {
                if (seat === "WC") return <div key={i} className="wc tall">WC</div>;
                if (seat === "DOOR") return <div key={i} className="door tall">دروازه</div>;
                if (seat === null) return <div key={i} className="empty-space"></div>;
                if (seat === "") return <div key={i} className="seat disabled-seat"></div>;

                const seatData = seats.find(s => s.seat_number === seat);
                const status = seatData ? seatData.status : "free";

                return (
                  <div
                    key={i}
                    className={getSeatClass(status, seat)}
                    onClick={() => status !== "booked" && handle580SeatClick(seat, status)}
                  >
                    {seat}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (busType === "VIP") return renderVipLayout();
  if (busType === "580") return render580Layout();
  return <div className="p-6 text-center">Bus layout not available.</div>;
};

export default Sets;