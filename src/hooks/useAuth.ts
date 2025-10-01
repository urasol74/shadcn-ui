import { useState, useEffect } from 'react';
import type { User } from '@/types/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли информация о пользователе в localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    // Удаляем информацию о пользователе из localStorage
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, logout };
};
