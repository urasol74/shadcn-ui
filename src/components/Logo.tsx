import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 shrink-0">
      {/* Изображение логотипа */}
      <img 
        src="https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/image/logo.jpg" 
        alt="Логотип"
        className="h-10 w-10 rounded-full object-cover"
      />
      {/* Текстовый блок, который был случайно удален */}
      <div>
        <h1 className="text-xl font-bold text-green-600 tracking-tight">BENETTON</h1>
        <p className="text-xs text-gray-500 -mt-1">Одесса</p>
      </div>
    </Link>
  );
};

export default Logo;
