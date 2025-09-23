import React, { useEffect, useState } from 'react';
import LiveSearch from './LiveSearch';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabaseApi } from '@/lib/supabase-api';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menCategories, setMenCategories] = useState([]);
  const [womenCategories, setWomenCategories] = useState([]);
  const [boyCategories, setBoyCategories] = useState([]);
  const [girlCategories, setGirlCategories] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);

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

  // Загружаем количество избранных товаров из localStorage
  useEffect(() => {
    const updateFavoritesCount = () => {
      try {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          setFavoritesCount(Array.isArray(favorites) ? favorites.length : 0);
        } else {
          setFavoritesCount(0);
        }
      } catch (e) {
        console.error('Error parsing favorites', e);
        setFavoritesCount(0);
      }
    };

    // Инициализируем счетчик
    updateFavoritesCount();

    // Добавляем обработчик события для отслеживания изменений в localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'favorites') {
        updateFavoritesCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Также создаем пользовательское событие для обновления из других компонентов
    const handleFavoritesChange = () => {
      updateFavoritesCount();
    };

    window.addEventListener('favoritesChange', handleFavoritesChange);

    // Очищаем обработчики при размонтировании
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesChange', handleFavoritesChange);
    };
  }, []);

  // Хук для управления hover
  const [openMenu, setOpenMenu] = useState(null);
  const handleMouseEnter = (menu) => setOpenMenu(menu);
  const handleMouseLeave = () => setOpenMenu(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

          {/* Блок пользователя */}
          <div className="flex items-center ml-2">
            <Link to="/favorites" className="mr-2 text-gray-600 hover:text-red-500">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <span>Избранное</span>
                {favoritesCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="bg-green-100 text-green-700 px-3 py-2 rounded font-semibold hover:bg-green-200 transition-all text-sm">
                    {user.tel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleLogout}>
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="bg-green-100 text-green-700 px-3 py-2 rounded font-semibold hover:bg-green-200 transition-all text-sm">
                  Вход
                </Link>
                <Link to="/registration" className="ml-2 bg-blue-100 text-blue-700 px-3 py-2 rounded font-semibold hover:bg-blue-200 transition-all text-sm">
                  Регистрация
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;