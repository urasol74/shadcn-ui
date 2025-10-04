import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Benetton Odessa</h3>
            <p className="text-sm text-gray-400">Официальный представитель United Colors of Benetton в Одессе. Мы предлагаем яркую и стильную одежду для всей семьи.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-white">О нас</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Контакты</Link></li>
              <li><Link to="/delivery" className="text-gray-400 hover:text-white">Доставка и оплата</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white">Вопросы и ответы</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">Мы в соцсетях</h3>
            <div className="flex space-x-4">
              {/* Здесь будут иконки соцсетей */}
            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {currentYear} Benetton Odessa. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
