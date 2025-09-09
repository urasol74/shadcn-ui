import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LiveSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
      // Создаем Web Worker для обработки поиска
      workerRef.current = new Worker(new URL('../workers/dataProcessor.worker.ts', import.meta.url));
  
      workerRef.current.onmessage = (event) => {
        const { result, operation } = event.data;
        if (operation === 'filterProducts') {
          // Обновляем состояние с результатами из Web Worker
          setResults(result);
        }
      };
  
      // Очищаем Web Worker при размонтировании компонента
      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
        }
      };
    }, []);

    // Добавляем debounce для ограничения частоты запросов
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    // Поиск по API с debounce
    const handleChange = useCallback(
        debounce(async (value) => {
            if (value.length < 2) {
                setResults([]);
                return;
            }
            try {
                const res = await fetch(`http://178.212.198.23:3001/api/search?article=${encodeURIComponent(value)}`);
                if (res.ok) {
                    const data = await res.json();
                    // Отправляем данные в Web Worker для фильтрации
                    if (workerRef.current) {
                      workerRef.current.postMessage({ 
                        data, 
                        operation: 'filterProducts' 
                      });
                    } else {
                      setResults(data);
                    }
                } else {
                    setResults([]);
                }
            } catch {
                setResults([]);
            }
        }, 300),
        []
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        handleChange(value);
    };

    // Переход на страницу результатов поиска
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length > 1) {
            navigate(`/search?article=${encodeURIComponent(query)}`);
        }
    };

    // Переход на страницу товара
    const handleResultClick = (item: any) => {
        navigate(`/category/${item.gender}/${item.category_id}/${item.article}`);
    };

    return (
        <form
            className="relative flex flex-1 mx-8 items-center"
            onSubmit={handleSearch}
            autoComplete="off"
        >
            <input
                type="text"
                className="border rounded-l px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="Поиск по артикулу или названию..."
                value={query}
                onChange={handleInputChange}
                style={{ minWidth: 0 }}
            />
            <button
                type="submit"
                className="bg-green-600 text-white p-0 w-12 h-12 rounded-r flex items-center justify-center hover:bg-green-700"
                disabled={query.length < 2}
                style={{ minWidth: '48px' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
                </svg>
            </button>
            {results.length > 0 && (
                <div
                    className="absolute bg-white border rounded-lg shadow-lg mt-2 z-20 max-h-64 overflow-y-auto w-full"
                    style={{ top: '100%', left: 0, right: 0 }}
                >
                    {results.map((item: any) => (
                        <div
                            key={item.product_id}
                            className="px-4 py-3 text-base hover:bg-green-50 cursor-pointer transition-all border-b last:border-b-0"
                            onClick={() => handleResultClick(item)}
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
            )}
        </form>
    );
};

export default LiveSearch;