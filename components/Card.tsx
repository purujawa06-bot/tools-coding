
import React, { ReactNode } from 'react';

interface CardProps {
  step: number;
  title: string;
  isActive: boolean;
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ step, title, isActive, children }) => {
  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 md:p-8 w-full transition-all duration-500 ${
        isActive ? 'opacity-100 transform scale-100' : 'opacity-50 transform scale-95'
      }`}
    >
      <div className="flex items-center mb-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 ${
            isActive ? 'bg-indigo-600' : 'bg-gray-600'
          }`}
        >
          {step}
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-100">{title}</h2>
      </div>
      {isActive && <div className="pl-12">{children}</div>}
    </div>
  );
};

export default Card;
