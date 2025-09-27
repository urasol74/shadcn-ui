import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabaseApi } from '@/lib/supabase-api';
import { Search } from 'lucide-react';

const LiveSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

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

    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const performSearch = useCallback(
        debounce(async (value: string) => {
            if (value.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }
            
            setIsLoading(true);
            try {
                const data = await supabaseApi.searchProducts(value);
                setResults(data || []);
                setIsOpen(data && data.length > 0);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        performSearch(value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length > 1) {
            setIsOpen(false);
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery('');
        }
    };

    const handleResultClick = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };
    
    const generateProductUrl = (item: any) => {
        const season = item.season ? encodeURIComponent(item.season) : 'all';
        return `/gender/${item.gender}/season/${season}/category/${item.category_id}/${item.article}`;
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <form
                className="relative flex items-center"
                onSubmit={handleSearchSubmit}
                autoComplete="off"
            >
                <input
                    type="text"
                    className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    placeholder="Поиск по артикулу..."
                    value={query}
                    onChange={handleInputChange}
                />
                <button
                    type="submit"
                    className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 hover:text-green-600"
                    disabled={query.length < 2}
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>
            {isOpen && (
                <div className="absolute bg-white border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto w-full mt-1">
                    {isLoading ? (
                        <div className="px-4 py-3">Загрузка...</div>
                    ) : results.length > 0 ? (
                        results.map((item) => (
                            <Link
                                to={generateProductUrl(item)}
                                key={item.article}
                                className="block px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                onClick={handleResultClick}
                            >
                                <div className="flex items-center gap-4">
                                    <img src={`https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${item.image}`} alt={item.name} className="w-12 h-16 object-cover rounded-md bg-gray-200"/>
                                    <div>
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-sm text-gray-600">Артикул: {item.article}</div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-gray-500">Ничего не найдено.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveSearch;
