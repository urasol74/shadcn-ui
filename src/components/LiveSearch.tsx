import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '@/lib/supabase-api';

const LiveSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    // Закрытие dropdown при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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
                setIsOpen(false);
                return;
            }
            
            setIsLoading(true);
            try {
                // Используем Supabase API
                const data = await supabaseApi.searchProducts(value);
                setResults(data);
                setIsOpen(data.length > 0);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
                setIsOpen(false);
            } finally {
                setIsLoading(false);
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
            setIsOpen(false);
            navigate(`/search?article=${encodeURIComponent(query)}`);
        }
    };

    // Переход на страницу товара
    const handleResultClick = (item: any) => {
        // Using the new URL format with gender and article
        navigate(`/gender/${item.gender}/${encodeURIComponent(item.article)}`);
        // Очищаем результаты поиска после перехода
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative flex flex-1 mx-8 items-center">
            <form
                className="relative flex flex-1 items-center"
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
            </form>
            {isOpen && (
                <div
                    className="absolute bg-white border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto w-full"
                    style={{ top: '100%', left: 0, right: 0, marginTop: '0.5rem' }}
                >
                    {isLoading ? (
                        <div className="px-4 py-3 text-base">Загрузка...</div>
                    ) : results.length > 0 ? (
                        results.map((item: any) => (
                            <div
                                key={item.product_id || item.article}
                                className="px-4 py-3 text-base hover:bg-green-50 cursor-pointer transition-all border-b last:border-b-0"
                                onClick={() => handleResultClick(item)}
                            >
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">Артикул: {item.article}</div>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-base text-gray-500">Ничего не найдено</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveSearch;