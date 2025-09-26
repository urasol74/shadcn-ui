import React, { useEffect, useState } from 'react';
import LiveSearch from './LiveSearch';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabaseApi } from '@/lib/supabase-api';
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
  quantity: number;
}

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Загружаем количество избранных товаров
  useEffect(() => {
    const updateFavoritesCount = () => {
      try {
        const savedFavorites = localStorage.getItem('favorites');
        const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
        setFavoritesCount(Array.isArray(favorites) ? favorites.length : 0);
      } catch (e) {
        console.error('Error parsing favorites', e);
        setFavoritesCount(0);
      }
    };

    updateFavoritesCount();
    window.addEventListener('storage', (e) => e.key === 'favorites' && updateFavoritesCount());
    window.addEventListener('favoritesChange', updateFavoritesCount);

    return () => {
      window.removeEventListener('storage', (e) => e.key === 'favorites' && updateFavoritesCount());
      window.removeEventListener('favoritesChange', updateFavoritesCount);
    };
  }, []);

  // Загружаем количество товаров в корзине
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        const cartItems: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (e) {
        console.error('Error parsing cart', e);
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', (e) => e.key === 'cart' && updateCartCount());
    window.addEventListener('cartChange', updateCartCount);

    return () => {
      window.removeEventListener('storage', (e) => e.key === 'cart' && updateCartCount());
      window.removeEventListener('cartChange', updateCartCount);
    };
  }, []);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-40">
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

          <div className="flex items-center ml-2">
            <Link to="/favorites" className="mr-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
                <span>Избранное</span>
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
               <>
                <Link to="/cart" className="mr-2">
                  <Button variant='outline' size='sm' className="flex items-center gap-2 relative">
                    <span>Корзина</span>
                    {cartCount > 0 && (
                       <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                         {cartCount}
                       </span>
                    )}
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant='outline' size='sm' className="ml-2">
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                    <Button variant='outline' size='sm'>Вход</Button>
                </Link>
                <Link to="/registration" className="ml-2">
                    <Button variant='outline' size='sm'>Регистрация</Button>
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