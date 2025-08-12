import React from 'react';
import {
  RiUserAddLine,
  RiShoppingBagLine,
  RiPieChart2Line,
  RiBarChartBoxLine,
  RiBusFill,
} from 'react-icons/ri';
import Card from './Card';

const Cards = () => {
  const cardData = [
    {
      title: 'بازدید جدید',
      value: 65,
      icon: <RiPieChart2Line />,
      color: 'bg-red-500',
    },
    {
      title: 'بس هایی ثبت شده',
      value: 44,
      icon: <RiBusFill />,
      color: 'bg-yellow-500',
    },
    {
      title: 'افزایش امتیاز',
      value: '53%',
      icon: <RiBarChartBoxLine />,
      color: 'bg-green-600',
    },
    {
      title: 'سفارشات جدید',
      value: 150,
      icon: <RiShoppingBagLine />,
      color: 'bg-cyan-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
      {cardData.map((card, index) => (
        <Card key={index} {...card} />
      ))}
    </div>
  );
};

export default Cards;
