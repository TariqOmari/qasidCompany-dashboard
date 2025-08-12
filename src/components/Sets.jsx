import React from 'react';
import { GiSteeringWheel } from 'react-icons/gi';

export default function Sets({ selectedSeat, setSelectedSeat }) {
  const totalSeats = 35;
  const bookedSeats = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const doorPositions = [13];

  const handleSelect = (seatNumber) => {
    if (bookedSeats.includes(seatNumber) || doorPositions.includes(seatNumber)) return;

    if (selectedSeat === seatNumber) {
      setSelectedSeat(null); // deselect seat
    } else {
      setSelectedSeat(seatNumber); // select seat
    }
  };

  const getSeatRows = () => {
    const rows = [];
    let seatNumber = 1;
    while (seatNumber <= totalSeats) {
      if (doorPositions.includes(seatNumber)) {
        rows.push({ type: 'door', label: 'دروازه' });
        seatNumber++;
        continue;
      }

      const row = {
        type: 'seats',
        left: seatNumber++,
        right: [],
      };
      if (seatNumber <= totalSeats) row.right.push(seatNumber++);
      if (seatNumber <= totalSeats) row.right.push(seatNumber++);
      rows.push(row);
    }
    return rows;
  };

  return (
    <div dir="rtl" className="max-w-md mx-auto bg-white p-4 rounded-2xl border shadow font-vazir">
      {/* Legend */}
      <div className="flex justify-around text-xs mb-3 text-center">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-blue-700"></div> <span>انتخاب شده</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-300"></div> <span>خالی</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-500"></div> <span>رزرو شده</span>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="bg-gray-100 p-4 rounded-xl border border-gray-300">
        {/* Driver */}
        <div className="flex justify-between items-center mb-3 px-2">
          <GiSteeringWheel className="text-gray-700 text-2xl" />
          <span className="text-sm text-gray-600">دروازه</span>
        </div>

        <div className="space-y-3">
          {getSeatRows().map((row, index) =>
            row.type === 'door' ? (
              <div key={index} className="flex justify-center">
                <div className="bg-gray-400 text-center text-xs py-2 px-4 rounded text-white w-24 shadow">
                  {row.label}
                </div>
              </div>
            ) : (
              <div key={index} className="flex justify-between items-center gap-3">
                {/* Left Seat */}
                <div
                  onClick={() => handleSelect(row.left)}
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition shadow
                    ${
                      bookedSeats.includes(row.left)
                        ? 'bg-red-500 text-white cursor-not-allowed'
                        : selectedSeat === row.left
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-300 text-black hover:bg-gray-400'
                    }`}
                >
                  {row.left}
                </div>

                {/* Aisle Gap */}
                <div className="w-8"></div>

                {/* Right Seats */}
                <div className="flex gap-3">
                  {row.right.map((seat) => (
                    <div
                      key={seat}
                      onClick={() => handleSelect(seat)}
                      className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition shadow
                        ${
                          bookedSeats.includes(seat)
                            ? 'bg-red-500 text-white cursor-not-allowed'
                            : selectedSeat === seat
                            ? 'bg-blue-700 text-white'
                            : 'bg-gray-300 text-black hover:bg-gray-400'
                        }`}
                    >
                      {seat}
                    </div>
                  ))}
                  {/* Fill if only 1 seat on right */}
                  {row.right.length < 2 && <div className="w-12 h-12"></div>}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Total */}
      <div className="text-sm text-center mt-4">
        <span className="font-bold text-blue-700">مجموع:</span>{' '}
        <span className="text-gray-700">{selectedSeat ? 200 : 0} افغانی</span>
      </div>
    </div>
  );
}
