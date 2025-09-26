import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useIsProduct } from '@/hooks/useIsProduct';
import { useCatalogData } from '@/hooks/useCatalogData';
import { ProductViewInline } from '@/components/ProductViewInline';
import { formatPrice, formatDiscount } from '@/lib/priceUtils';

export default function GenderSeasonPage() {
    const { season, gender, categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Декодируем параметр season, если он есть
    // Правильно декодируем URL-encoded значения
    const decodedSeason = season ? decodeURIComponent(season) : null;
    
    // Добавим эффект для отладки параметров
    useEffect(() => {
        console.log('Параметры маршрута изменились:', { season, gender, categoryId, decodedSeason });
        console.log('Типы параметров:', { 
            season: typeof season, 
            gender: typeof gender, 
            categoryId: typeof categoryId,
            decodedSeason: typeof decodedSeason 
        });
        console.log('Полный location:', location);
    }, [season, gender, categoryId, decodedSeason, location]);

    const { isProduct, productData } = useIsProduct(decodedSeason, categoryId, []); // Временно пустой массив сезонов
    const { seasons, categories, loading, setLoading } = useCatalogData(gender, decodedSeason, isProduct);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [showCategories, setShowCategories] = useState<boolean>(false);
    
    // Состояние для сортировки по цене
    const [priceSortOrder, setPriceSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

    // Отладочный вывод
    useEffect(() => {
        console.log('seasons:', seasons);
        console.log('selectedCategory:', selectedCategory);
    }, [seasons, selectedCategory]);

    // Сброс всех фильтров при смене коллекции (только при фактической смене коллекции)
    useEffect(() => {
        // Сбрасываем выбранную категорию только если это действительно новая коллекция
        setSelectedCategory(null);
    }, [gender]);

    // Установка выбранной категории из параметров URL
    useEffect(() => {
        if (categoryId) {
            setSelectedCategory(categoryId);
        } else {
            setSelectedCategory(null);
        }
    }, [categoryId]);

    // Загрузка продуктов через Supabase
    useEffect(() => {
        console.log('useEffect для загрузки товаров сработал с параметрами:', { gender, season, decodedSeason, categoryId, isProduct });
        if (!gender || isProduct === true) return; // Не загружаем товары, если это товар
        
        const loadProducts = async () => {
            setLoading(true);
            try {
                console.log('Загрузка товаров для:', { gender, season: decodedSeason, categoryId });
                
                let query = supabase
                    .from('products')
                    .select(`
                        id,
                        article,
                        name,
                        gender,
                        season,
                        category_id,
                        categories(name),
                        image,
                        variants!inner(purchase_price, sale_price, discount, stock)
                    `)
                    .eq('gender', gender) // Используем точное совпадение вместо ilike
                    .gt('variants.stock', 0);

                // Фильтр по категории если выбрана
                if (selectedCategory) {
                    query = query.eq('category_id', selectedCategory);
                }

                // Фильтр по сезону если есть (кроме "all")
                if (decodedSeason && isProduct === false && decodedSeason !== 'all') {
                    console.log('Применяем фильтр по сезону:', decodedSeason);
                    console.log('Тип параметра decodedSeason:', typeof decodedSeason);
                    // Используем точное совпадение для более надежной фильтрации
                    query = query.eq('season', decodedSeason);
                } else {
                    console.log('Фильтр по сезону не применяется');
                }

                const { data, error } = await query.limit(200);
                
                console.log('Запрос к Supabase:', query);
                console.log('Результат:', { data, error });

                if (error) {
                    console.error('Products loading error:', error);
                    setProducts([]);
                    return;
                }

                if (!data || data.length === 0) {
                    console.log('Нет данных для отображения');
                    setProducts([]);
                    return;
                }
                
                console.log('Полученные данные из Supabase:', data.length, 'товаров');

                // Обрабатываем результаты как в SupabaseTest
                const result: any[] = [];
                
                data.forEach((product, index) => {
                    console.log(`Обработка товара ${index + 1}:`, product.article, product.name);
                    if (!product.variants || product.variants.length === 0) {
                        console.log('Нет вариантов для товара:', product.article);
                        return;
                    }
                    
                    product.variants.forEach((variant: any, variantIndex) => {
                        console.log(`Вариант ${variantIndex + 1} для товара ${product.article}:`, variant);
                        const price = variant.sale_price || variant.purchase_price || 0;
                        console.log(`Цена варианта: ${price}, Наличие: ${variant.stock}`);
                        
                        // Проверяем наличие на складе
                        if (variant.stock <= 0) {
                            console.log(`Вариант ${variantIndex + 1} товара ${product.article} отсутствует на складе`);
                            return;
                        }
                        
                        if (price > 0) {
                            // Проверяем, нет ли уже этого продукта с той же ценой
                            const existing = result.find(r => r.product_id === product.id && r.sale_price === price);
                            
                            if (!existing) {
                                result.push({
                                    product_id: product.id,
                                    article: product.article,
                                    name: product.name,
                                    gender: product.gender,
                                    season: product.season,
                                    category_id: product.category_id,
                                    category_name: (product.categories as any)?.name || '',
                                    purchase_price: variant.purchase_price,
                                    sale_price: variant.sale_price,
                                    discount: variant.discount,
                                    stock: variant.stock || 0,
                                    // Берем поле image из продукта, а не из варианта
                                    image: product.image
                                });
                            }
                        }
                    });
                });

                setProducts(result);
                console.log('Loaded products from Supabase:', result.length);
            } catch (error) {
                console.error('Products loading failed:', error);
                setProducts([]);
            } finally {
                // Всегда устанавливаем loading в false после завершения загрузки
                setLoading(false);
            }
        };
        
        // Не загружаем товары, если еще не определено, что это за параметр
        if (isProduct !== null) {
            loadProducts();
        }
    }, [decodedSeason, gender, selectedCategory, isProduct, categories]);

    // Если еще не определено, что это за параметр, показываем загрузку
    if (isProduct === null && (decodedSeason || categoryId)) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Проверка...</div>;
    }

    // Если это товар, отображаем страницу товара
    if (isProduct === true && productData) {
        return <ProductViewInline productData={productData} gender={gender} />;
    }

    const getGenderTitle = (g: string) => {
        switch (g) {
            case 'чол': return 'Мужская коллекция';
            case 'жiн': return 'Женская коллекция';
            case 'хлопч': return 'Коллекция для мальчиков';
            case 'дiвч': return 'Коллекция для девочек'; // латинская i
            case 'дівч': return 'Коллекция для девочек'; // украинская і (для совместимости)
            default: return 'Коллекция';
        }
    };

    // Функция для получения списка всех коллекций
    const getAllGenders = () => {
        return [
            { id: 'чол', name: 'Он' },
            { id: 'жiн', name: 'Она' },
            { id: 'хлопч', name: 'Мальчик' },
            { id: 'дiвч', name: 'Девочка' }
        ];
    };

    // Функция для получения списка коллекций, кроме текущей
    const getOtherGenders = () => {
        return getAllGenders().filter(g => g.id !== gender);
    };

    // Функция для получения ссылки на другой сезон
    const getSeasonLink = (seasonName: string) => {
        if (categoryId) {
            return `/gender/${gender}/season/${encodeURIComponent(seasonName)}/category/${categoryId}`;
        }
        return `/gender/${gender}/season/${encodeURIComponent(seasonName)}`;
    };

    // Функция для получения ссылки на другую категорию
    const getCategoryLink = (categoryId: string) => {
        if (decodedSeason && decodedSeason !== 'all') {
            return `/gender/${gender}/season/${encodeURIComponent(decodedSeason)}/category/${categoryId}`;
        }
        return `/gender/${gender}/season/all/category/${categoryId}`;
    };

    // Функция для получения ссылки на все категории
    const getAllCategoriesLink = () => {
        if (decodedSeason && decodedSeason !== 'all') {
            return `/gender/${gender}/season/${encodeURIComponent(decodedSeason)}`;
        }
        return `/gender/${gender}/season/all`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            {/* Заголовок коллекции */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {getGenderTitle(gender || '')}
                        </h1>
                        
                        {/* Кнопки переключения коллекций */}
                        <div className="flex flex-wrap gap-2">
                            {getOtherGenders().map((g) => (
                                <Link
                                    key={g.id}
                                    to={`/gender/${g.id}/season/all`}
                                    className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    {g.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    
                    {/* Навигация по сезонам */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link 
                            to={`/gender/${gender}/season/all`}
                            className={`px-3 py-1 rounded-full text-sm ${
                                !decodedSeason || decodedSeason === 'all' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Все сезоны
                        </Link>
                        
                        {seasons.map((seasonName) => (
                            <Link
                                key={seasonName}
                                to={getSeasonLink(seasonName)}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    decodedSeason === seasonName
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {seasonName}
                            </Link>
                        ))}
                    </div>
                    
                    {/* Навигация по категориям */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                            to={getAllCategoriesLink()}
                            className={`px-3 py-1 rounded-full text-sm ${
                                !selectedCategory
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Все категории
                        </Link>
                        
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={getCategoryLink(category.id)}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    selectedCategory && String(selectedCategory) === String(category.id)
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Список товаров */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-8">Загрузка товаров...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Товары не найдены
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <Card 
                                key={product.product_id} 
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/gender/${gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`)}
                            >
                                <CardContent className="p-4">
                                    <div className="h-48 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                                        <img 
                                            src={product.image ? `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${product.image}` : "https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp"}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                            onError={({ currentTarget }) => {
                                                currentTarget.onerror = null;
                                                currentTarget.src = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp';
                                            }}
                                        />
                                    </div>
                                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <div className="space-y-1">
                                        {product.discount && Number(product.discount) > 0 ? (
                                            <div className="text-gray-500 line-through text-sm">
                                                {formatPrice(product.purchase_price)}
                                            </div>
                                        ) : (
                                            <div className="invisible text-gray-500 line-through text-sm" style={{ height: '1.25rem' }}>
                                                {formatPrice(product.purchase_price)}
                                            </div>
                                        )}
                                        <div className="font-semibold text-blue-600">
                                            {formatPrice(product.sale_price)}
                                        </div>
                                        {product.discount && Number(product.discount) > 0 ? (
                                            <div className="text-red-600 text-sm">
                                                Скидка: {formatDiscount(product.discount)}
                                            </div>
                                        ) : (
                                            <div className="text-green-600 text-sm">
                                                Новая коллекция
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full mt-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/gender/${gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`);
                                        }}
                                    >
                                        Подробнее
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}