import React, { useEffect, useState } from 'react';
import LiveSearch from './LiveSearch';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabaseApi } from '@/lib/supabase-api';

const Header = () => {
  const [menCategories, setMenCategories] = useState([]);
  const [womenCategories, setWomenCategories] = useState([]);
  const [boyCategories, setBoyCategories] = useState([]);
  const [girlCategories, setGirlCategories] = useState([]);

  useEffect(() => {
    // Загружаем категории с использованием Supabase API
    const loadCategories = async () => {
      try {
        const [men, women, boy, girl] = await Promise.all([
          supabaseApi.getCategories('чол'),
          supabaseApi.getCategories('жiн'),
          supabaseApi.getCategories('хлопч'),
          supabaseApi.getCategories('дiвч')
        ]);
        
        setMenCategories(men);
        setWomenCategories(women);
        setBoyCategories(boy);
        setGirlCategories(girl);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Хук для управления hover
  const [openMenu, setOpenMenu] = useState(null);
  const handleMouseEnter = (menu) => setOpenMenu(menu);
  const handleMouseLeave = () => setOpenMenu(null);

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">BENETTON</h1>
              <p className="text-sm text-gray-500">Одесса</p>
            </div>
          </Link>

          {/* Строка поиска: на мобильных скрываем полноразмерную строку и показываем только кнопку-лупу */}
          <div className="flex-1 w-full max-w-2xl mx-0 md:mx-4">
            <div className="hidden md:block">
              <LiveSearch />
            </div>
            <div className="block md:hidden">
              <Link to="/search">
                <Button variant="ghost" className="p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>

          {/* Блок Админ */}
          <div className="flex items-center ml-2">
            <Link to="/admin" className="bg-green-100 text-green-700 px-3 py-2 rounded font-semibold hover:bg-green-200 transition-all text-sm">
              Админ
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;