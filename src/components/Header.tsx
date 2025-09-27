import React, { useEffect, useState } from 'react';
import LiveSearch from './LiveSearch';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Heart, ShoppingCart, LogOut, LogIn, UserPlus, Search, UserCog } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CartItem {
  quantity: number;
}

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Точная проверка на администратора по полю tel
    if (user && user.tel === '380994580337') {
        setIsAdmin(true);
    } else {
        setIsAdmin(false);
    }
  }, [user]);

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
    <TooltipProvider>
      <header className="border-b bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-green-600">BENETTON</h1>
                <p className="text-xs text-gray-500">Одесса</p>
              </div>
            </Link>

            <div className="flex-1 w-full max-w-lg mx-2 sm:mx-4">
              <div className="hidden md:block">
                <LiveSearch />
              </div>
              <div className="block md:hidden text-right">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon">
                      <Link to="/search">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Поиск</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Поиск</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" className="relative">
                    <Link to="/favorites">
                      <Heart className="h-5 w-5" />
                      {favoritesCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                          {favoritesCount}
                        </span>
                      )}
                      <span className="sr-only">Избранное</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Избранное</p>
                </TooltipContent>
              </Tooltip>

              {user ? (
                <>
                  {isAdmin ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button asChild variant="ghost" size="icon">
                           <Link to="/admin">
                            <UserCog className="h-5 w-5" />
                             <span className="sr-only">Админ-панель</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Админ-панель</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button asChild variant="ghost" size="icon" className="relative">
                           <Link to="/cart">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                {cartCount}
                              </span>
                            )}
                            <span className="sr-only">Корзина</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Корзина</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button onClick={handleLogout} variant="ghost" size="icon">
                          <LogOut className="h-5 w-5" />
                          <span className="sr-only">Выйти</span>
                       </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Выйти</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" size="icon">
                        <Link to="/login">
                          <LogIn className="h-5 w-5" />
                          <span className="sr-only">Вход</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Вход</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button asChild variant="ghost" size="icon">
                         <Link to="/registration">
                          <UserPlus className="h-5 w-5" />
                           <span className="sr-only">Регистрация</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                      <p>Регистрация</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>

          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}

export default Header;
