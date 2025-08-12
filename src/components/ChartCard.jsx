import React from 'react';

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 text-right w-full">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      <div className="w-full h-64">{children}</div>
    </div>
  );
};

export default ChartCard;
