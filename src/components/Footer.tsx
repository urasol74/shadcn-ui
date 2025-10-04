
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone, Send, FileText, Package, RefreshCw, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-gray-200 border-t border-gray-700 mt-auto" style={{ backgroundColor: 'rgb(0, 76, 34)' }}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Benetton Info */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">Benetton</h2>
            <p className="text-sm text-gray-300">Одежда, которая рассказывает вашу историю. Яркие цвета, экологичные материалы и итальянский стиль с 1965 года.</p>
          </div>

          {/* Информация */}
          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider">Информация</h3>
            <ul className="space-y-3">
              <li><Link to="/contacts" className="text-gray-300 hover:text-white hover:underline flex items-center"><FileText size={18} className="mr-2"/>Контакты</Link></li>
              <li><Link to="/shipping" className="text-gray-300 hover:text-white hover:underline flex items-center"><Package size={18} className="mr-2"/>Доставка</Link></li>
              <li><Link to="/returns" className="text-gray-300 hover:text-white hover:underline flex items-center"><RefreshCw size={18} className="mr-2"/>Возврат и обмен</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider">Свяжитесь с нами</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <Home size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">г. Москва, ул. Центральная, д. 1, офис 101</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2" />
                <a href="tel:+74951234567" className="text-gray-300 hover:text-white hover:underline">+7 (495) 123-45-67</a>
              </li>
              <li className="flex items-center">
                <Send size={18} className="mr-2" />
                <a href="https://t.me/benetton_support" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline">Telegram</a>
              </li>
              <li className="flex items-center">
                <MessageCircle size={18} className="mr-2" />
                <a href="viber://chat?number=+74951234567" className="text-gray-300 hover:text-white hover:underline">Viber</a>
              </li>
            </ul>
          </div>

          {/* Социальные сети */}
          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider">Мы в соцсетях</h3>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white"><Instagram size={24} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white"><Facebook size={24} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white"><Twitter size={24} /></a>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} United Colors of Benetton. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;