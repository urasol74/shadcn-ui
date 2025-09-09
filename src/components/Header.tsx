import React, { useEffect, useState, useRef } from 'react';
import LiveSearch from './LiveSearch';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [menCategories, setMenCategories] = useState([]);
  const [womenCategories, setWomenCategories] = useState([]);
  const [boyCategories, setBoyCategories] = useState([]);
  const [girlCategories, setGirlCategories] = useState([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Создаем Web Worker для обработки категорий
    workerRef.current = new Worker(new URL('../workers/dataProcessor.worker.ts', import.meta.url));

    workerRef.current.onmessage = (event) => {
      const { result, operation } = event.data;
      switch (operation) {
        case 'processCategories':
          // Распределяем результаты по соответствующим состояниям
          // В реальной реализации здесь будет логика распределения
          break;
      }
    };

    // Загружаем категории с минимальной блокировкой основного потока
    Promise.all([
      fetch('http://178.212.198.23:3001/api/categories?gender=чол').then(res => res.json()),
      fetch('http://178.212.198.23:3001/api/categories?gender=жiн').then(res => res.json()),
      fetch('http://178.212.198.23:3001/api/categories?gender=хлопч').then(res => res.json()),
      fetch('http://178.212.198.23:3001/api/categories?gender=дiвч').then(res => res.json())
    ])
    .then(([men, women, boy, girl]) => {
      // Отправляем данные в Web Worker для обработки
      if (workerRef.current) {
        workerRef.current.postMessage({ 
          data: { men, women, boy, girl }, 
          operation: 'processCategories' 
        });
      }
      
      setMenCategories(men);
      setWomenCategories(women);
      setBoyCategories(boy);
      setGirlCategories(girl);
    })
    .catch(error => {
      console.error('Failed to load categories:', error);
    });

    // Очищаем Web Worker при размонтировании компонента
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
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