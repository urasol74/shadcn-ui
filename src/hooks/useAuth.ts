import { useState, useEffect } from 'react';

// Определяем тип для объекта пользователя
interface User {
  id: string;
  name: string;
  tel: string;
  sale: number;
}

// Кастомное событие для уведомления об изменении localStorage
const dispatchStorageEvent = () => {
  window.dispatchEvent(new Event('storageChange'));
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedUser = localStorage.getItem('user');
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch (error) {
        console.error("Failed to parse user from localStorage on storage event", error);
        setUser(null);
      }
    };

    // Слушаем и стандартное событие storage (для других вкладок)
    window.addEventListener('storage', handleStorageChange);
    // И наше кастомное событие (для текущей вкладки)
    window.addEventListener('storageChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageChange', handleStorageChange);
    };
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    dispatchStorageEvent(); // Уведомляем другие компоненты
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    dispatchStorageEvent(); // Уведомляем другие компоненты
  };

  return { user, login, logout };
};
