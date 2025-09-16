import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductFilter } from '@/components/ProductFilter';
import { useProductFilters } from '@/hooks/useProductFilters';
import { supabaseApi } from '@/lib/supabase-api';
import ProductImage from '@/components/ProductImage';

const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const urlQ = params.get('q') || '';
    const articleParam = params.get('article') || '';
    const genderParam = params.get('gender') || 'чол';

    const [q, setQ] = useState(urlQ);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchProducts, setSearchProducts] = useState<any[]>([]);

    // Используем хук для фильтров
    const {
        selectedCategories,
        setSelectedCategories,
        priceRange,
        setPriceRange,
        inStockOnly,
        setInStockOnly,
        loading: filtersLoading,
        filteredProducts,
        applyFilters,
        resetFilters
    } = useProductFilters({ 
        selectedGender: genderParam,
        onFilteredProductsChange: (filteredProducts) => {
            setSearchProducts(filteredProducts);
        }
    });

    useEffect(() => {
        // Если в параметрах указан article — выполняем поиск по артикулу
        const query = articleParam || q;
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        
        // Используем Supabase API
        supabaseApi.searchProducts(query)
            .then(data => setResults(data))
            .catch(error => {
                console.error('Supabase search failed:', error);
                // Fallback к старому API
                fetch(`http://178.212.198.23:3001/api/search?article=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => setResults(data))
                    .catch(() => setResults([]))
            })
            .finally(() => setLoading(false));
    }, [q, articleParam]);

    const onSubmit = (e: any) => {
        e.preventDefault();
        // Навигация обновляет параметр q в URL — это позволит восстановить состояние
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    const handleResultClick = (item: any) => {
        // Using the new URL format with gender and article
        navigate(`/gender/${item.gender}/${encodeURIComponent(item.article)}`);
    };

    const formatPrice = (v: any) => {
        if (v === null || v === undefined || v === '') return '-';
        const n = Number(String(v).replace(/\s+/g, '').replace(',', '.'));
        if (Number.isNaN(n)) return String(v);
        return n.toLocaleString('ru-RU') + ' грн';
    };

    const formatDiscount = (d: any) => {
        if (d === null || d === undefined || d === '') return '-';
        const n = Number(String(d).replace(',', '.'));
        if (Number.isNaN(n)) return String(d);
        return `${n}%`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {/* Поисковая строка */}
                <form onSubmit={onSubmit} className="max-w-2xl mx-auto mb-8">
                    <div className="flex gap-3 items-center">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Артикул или название"
                            className="flex-1 p-3 rounded-lg border border-gray-200 bg-white"
                        />
                        <Button type="submit" className="px-6 py-3">Найти</Button>
                    </div>
                </form>

                {/* Мобильная кнопка фильтров */}
                <div className="lg:hidden mb-4 max-w-2xl mx-auto">
                    <Button 
                        onClick={() => setShowFilters(!showFilters)}
                        variant="outline"
                        className="w-full"
                    >
                        {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                    </Button>
                </div>

                <div className="flex gap-8">
                    {/* Левый сайдбар - фильтры */}
                    <div className={`${
                        showFilters ? 'block' : 'hidden'
                    } lg:block w-full lg:w-80 mb-6 lg:mb-0`}>
                        <ProductFilter
                            selectedGender={genderParam}
                            selectedCategories={selectedCategories}
                            priceRange={priceRange}
                            inStockOnly={inStockOnly}
                            onCategoriesChange={setSelectedCategories}
                            onPriceRangeChange={setPriceRange}
                            onInStockChange={setInStockOnly}
                            onApplyFilters={applyFilters}
                            onResetFilters={resetFilters}
                            loading={filtersLoading}
                        />
                    </div>

                    {/* Правая область - результаты */}
                    <div className="flex-1">
                        {/* Быстрые результаты поиска */}
                        {(q || articleParam) && (
                            <section className="mb-8">
                                <h2 className="text-lg font-semibold mb-4">Результаты поиска: "{q || articleParam}"</h2>
                                {loading && <div>Загрузка...</div>}
                                {!loading && results.length === 0 && <div className="text-sm text-gray-500">Ничего не найдено.</div>}
                                {results.length > 0 && (
                                    <div className="bg-white border rounded-lg shadow-sm p-4 max-h-60 overflow-y-auto">
                                        {results.map(item => (
                                            <div
                                                key={item.product_id || item.article}
                                                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-b-0 rounded"
                                                onClick={() => handleResultClick(item)}
                                            >
                                                <div className="font-medium">{item.article} — {item.name}</div>
                                                <div className="text-xs text-gray-500">{item.category_name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Отфильтрованные продукты */}
                        <section>
                            <h2 className="text-lg font-semibold mb-4">Каталог товаров</h2>
                            
                            {/* Количество найденных товаров */}
                            {!filtersLoading && (
                                <div className="mb-4 text-sm text-gray-600">
                                    Найдено товаров: {searchProducts.length}
                                </div>
                            )}
                            
                            {filtersLoading ? (
                                <div className="text-center py-8">Обновление фильтров...</div>
                            ) : searchProducts.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">Нет товаров, соответствующих фильтрам.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {searchProducts.map((product) => (
                                        <Card key={product.article || product.product_id} className="hover:shadow-lg transition-shadow">
                                            <CardContent className="p-4 text-center">
                                                <div className="w-full h-48 bg-gray-100 mb-4 flex items-center justify-center rounded overflow-hidden">
                                                    <ProductImage 
                                                        product={product} 
                                                        className="w-full h-full object-contain" 
                                                        alt={product.name} 
                                                    />
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    className="mb-3 w-full text-sm"
                                                    onClick={() => handleResultClick(product)}
                                                >
                                                    {product.name}
                                                </Button>
                                                
                                                <div className="space-y-1 text-sm">
                                                    <div className="font-semibold text-blue-600">
                                                        Цена: {formatPrice(product.price)}
                                                    </div>
                                                    {product.discount && Number(product.discount) > 0 && (
                                                        <div className="text-red-600 font-medium">
                                                            Скидка: {formatDiscount(product.discount)}
                                                        </div>
                                                    )}
                                                    <div className={`text-xs ${
                                                        product.in_stock ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.category_name}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
