import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabaseApi } from '@/lib/supabase-api';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            performSearch(query);
        }
    }, [searchParams]);

    const performSearch = async (query: string) => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await supabaseApi.searchProducts(query);
            setResults(data || []);
        } catch (err) {
            console.error('Search error:', err);
            setError('Не удалось выполнить поиск. Пожалуйста, попробуйте еще раз.');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ q: searchTerm });
    };
    
    const generateProductUrl = (item: any) => {
        const season = item.season ? encodeURIComponent(item.season) : 'all';
        return `/gender/${item.gender}/season/${season}/category/${item.category_id}/${item.article}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Поиск по сайту</h1>
                
                <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-10 flex items-center gap-2">
                    <Input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Введите артикул или название..."
                        className="text-lg p-4"
                    />
                    <Button type="submit" size="lg">
                        <Search className="h-5 w-5 mr-2"/>
                        Найти
                    </Button>
                </form>

                <div>
                    {isLoading ? (
                        <div className="text-center py-10">Загрузка...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">{error}</div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {results.map(product => (
                                <Link to={generateProductUrl(product)} key={product.article}>
                                    <ProductCard product={product} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                         searchParams.get('q') && <div className="text-center py-10 text-gray-500">По вашему запросу "{searchParams.get('q')}" ничего не найдено.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
