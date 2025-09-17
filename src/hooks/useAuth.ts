import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  tel: string;
  sale: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли информация о пользователе в localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Преобразуем значение sale в число, если оно хранится как строка
        if (typeof userData.sale === 'string') {
          // Удаляем запятую и преобразуем в число
          userData.sale = Number(userData.sale.replace(',', '.').replace(/[^0-9.]/g, ''));
        }
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