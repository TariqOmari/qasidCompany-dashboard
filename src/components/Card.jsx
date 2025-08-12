import React from 'react';
import { RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';

const Card = ({ title, value, icon, color = 'bg-blue-500', moreInfo = 'اطلاعات بیشتر', direction = 'up' }) => {
  return (
    <div className={`rounded-lg shadow-lg text-white p-4 flex items-center justify-between ${color}`}>
      <div className="text-right">
        <h2 className="text-3xl font-bold">{value}</h2>
        <p className="text-sm mt-1">{title}</p>
        <button className="mt-2 text-xs underline">{moreInfo}</button>
      </div>
      <div className="text-4xl">
        {icon}
      </div>
    </div>
  );
};

export default Card;
