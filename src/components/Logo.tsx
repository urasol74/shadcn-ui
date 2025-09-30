import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
      <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
        <span className="font-bold text-xl text-white">B</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-green-600 tracking-tight">BENETTON</h1>
        <p className="text-xs text-gray-500 -mt-1">Одесса</p>
      </div>
    </Link>
  );
};

export default Logo;
