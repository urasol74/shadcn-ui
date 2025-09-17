import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tel: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация данных
    if (!formData.tel || !formData.password) {
      setError('Телефон и пароль обязательны для заполнения');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Поиск пользователя по телефону и паролю
      const { data, error } = await supabase
        .from('user')
        .select('id, name, tel, sale')
        .eq('tel', formData.tel)
        .eq('password', formData.password)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Пользователь не найден');
      }
      
      // Преобразуем значение sale в число, если оно хранится как строка
      if (typeof data.sale === 'string') {
        // Удаляем запятую и преобразуем в число
        data.sale = Number(data.sale.replace(',', '.').replace(/[^0-9.]/g, ''));
      }
      
      // Сохраняем информацию о пользователе в localStorage
      localStorage.setItem('user', JSON.stringify(data));
      
      // Перенаправляем на главную страницу
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Неверный телефон или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Вход</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                id="tel"
                value={formData.tel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+380XXXXXXXXX"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите пароль"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Нет аккаунта?{' '}
            <Link to="/registration" className="text-blue-600 hover:underline">
              Зарегистрируйтесь
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}