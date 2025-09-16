import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { supabaseApi } from '@/lib/supabase-api';

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

    const [seasons, setSeasons] = useState<string[]>([]); // Все сезоны для коллекции
    const [seasonsWithProducts, setSeasonsWithProducts] = useState<string[]>([]); // Сезоны с товарами по выбранной категории
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCategories, setShowCategories] = useState<boolean>(false);
    const [isProduct, setIsProduct] = useState<boolean | null>(null); // null = не определено, true = товар, false = сезон
    const [productData, setProductData] = useState<any>(null); // Данные товара, если это товар
    
    // Состояние для сортировки по цене
    const [priceSortOrder, setPriceSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

    // Проверка, является ли season настоящим сезоном или артикулом товара
    useEffect(() => {
        // Если у нас есть categoryId, это точно не товар
        if (categoryId) {
            setIsProduct(false);
            return;
        }
        
        // Если season равен "all", это точно не товар
        if (decodedSeason === 'all') {
            setIsProduct(false);
            return;
        }
        
        // Если season совпадает с одним из известных сезонов, это точно сезон
        if (decodedSeason && seasons.includes(decodedSeason)) {
            setIsProduct(false);
            return;
        }
        
        // Если season не совпадает с известными сезонами, проверяем, является ли он артикулом товара
        if (decodedSeason) {
            const checkIfProductExists = async () => {
                try {
                    console.log('Проверка, является ли параметр товаром:', decodedSeason);
                    const productData = await supabaseApi.getProduct(decodedSeason);
                    
                    if (productData && productData.product) {
                        console.log('Найден товар:', productData.product);
                        setIsProduct(true);
                        setProductData(productData);
                    } else {
                        console.log('Товар не найден, считаем параметр сезоном');
                        setIsProduct(false);
                    }
                } catch (error) {
                    console.error('Ошибка при проверке товара:', error);
                    // Если ошибка, считаем, что это сезон
                    setIsProduct(false);
                }
            };
            
            checkIfProductExists();
        } else {
            // Если нет decodedSeason, это не товар
            setIsProduct(false);
        }
    }, [decodedSeason, gender, categoryId, seasons]);

    // Загрузка сезонов через Supabase для текущей коллекции
    useEffect(() => {
        if (!gender || isProduct) return; // Не загружаем сезоны, если это товар
        
        const loadSeasons = async () => {
            try {
                console.log('Загрузка сезонов для коллекции:', gender);
                // Получаем уникальные сезоны для текущего пола
                const { data, error } = await supabase
                    .from('products')
                    .select('season')
                    .eq('gender', gender) // Используем точное совпадение
                    .not('season', 'is', null)
                    .not('season', 'eq', '');

                if (error) {
                    console.error('Seasons loading error:', error);
                    setSeasons([]);
                    return;
                }

                console.log('Полученные сезоны:', data);
                // Получаем уникальные значения сезонов
                const uniqueSeasons = [...new Set(data?.map(item => item.season).filter(Boolean))] as string[];
                console.log('Уникальные сезоны:', uniqueSeasons);
                setSeasons(uniqueSeasons);
            } catch (error) {
                console.error('Seasons loading failed:', error);
                setSeasons([]);
            }
        };
        
        loadSeasons();
    }, [gender, isProduct]);

    // Загрузка сезонов с товарами по выбранной категории
    useEffect(() => {
        if (!gender || isProduct) return; // Не загружаем сезоны, если это товар
        
        const loadSeasonsWithProducts = async () => {
            try {
                console.log('Загрузка сезонов с товарами для коллекции:', gender, 'категория:', selectedCategory);
                let query = supabase
                    .from('products')
                    .select('season')
                    .eq('gender', gender) // Используем точное совпадение
                    .not('season', 'is', null)
                    .not('season', 'eq', '')
                    .gt('variants.stock', 0); // Только товары в наличии

                // Если выбрана категория, фильтруем по ней
                if (selectedCategory) {
                    query = query.eq('category_id', selectedCategory);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('Seasons with products loading error:', error);
                    setSeasonsWithProducts([]);
                    return;
                }

                console.log('Полученные сезоны с товарами:', data);
                // Получаем уникальные значения сезонов
                const uniqueSeasons = [...new Set(data?.map(item => item.season).filter(Boolean))] as string[];
                console.log('Уникальные сезоны с товарами:', uniqueSeasons);
                setSeasonsWithProducts(uniqueSeasons);
            } catch (error) {
                console.error('Seasons with products loading failed:', error);
                setSeasonsWithProducts([]);
            }
        };
        
        loadSeasonsWithProducts();
    }, [gender, selectedCategory, isProduct]);

    // Загрузка категорий
    useEffect(() => {
        if (!gender || isProduct) return; // Не загружаем категории, если это товар
        
        const loadCategories = async () => {
            try {
                console.log('Загрузка категорий для коллекции:', gender, 'сезон:', decodedSeason);
                console.log('Подготовка запроса категорий с параметрами:', { gender, decodedSeason });
                
                // Если у нас есть конкретный сезон (не "all"), загружаем категории с товарами для этого сезона
                if (decodedSeason && decodedSeason !== 'all') {
                    let query = supabase
                        .from('products')
                        .select(`
                            category_id,
                            categories(name)
                        `)
                        .eq('gender', gender) // Используем точное совпадение
                        .gt('variants.stock', 0) // Только товары в наличии
                        .eq('season', decodedSeason); // Фильтр по сезону
                    
                    console.log('Запрос к Supabase для категорий:', query);

                    const { data, error } = await query;

                    if (error) {
                        console.error('Categories with products loading error:', error);
                        // В случае ошибки загружаем все категории
                        const allCats = await supabaseApi.getCategories(gender);
                        setCategories(allCats);
                        return;
                    }

                    console.log('Полученные категории с товарами:', data);
                    // Получаем уникальные категории
                    const uniqueCategories = (data && data.length > 0) ? data.reduce((acc, item) => {
                        if (item.category_id && !acc.find((cat: any) => cat.id === item.category_id)) {
                            acc.push({
                                id: item.category_id,
                                name: (item.categories as any)?.name || ''
                            });
                        }
                        return acc;
                    }, [] as Array<{id: number, name: string}>) : [];
                    
                    console.log('Уникальные категории с товарами:', uniqueCategories);
                    setCategories(uniqueCategories);
                } else {
                    // Если у нас "все сезоны" или нет сезона, загружаем все категории
                    const allCats = await supabaseApi.getCategories(gender);
                    setCategories(allCats);
                }
            } catch (error) {
                console.error('Categories loading failed:', error);
                // В случае ошибки пробуем загрузить все категории
                try {
                    const allCats = await supabaseApi.getCategories(gender);
                    setCategories(allCats);
                } catch (fallbackError) {
                    console.error('Fallback categories loading failed:', fallbackError);
                    setCategories([]);
                }
            }
        };
        
        loadCategories();
    }, [gender, decodedSeason, isProduct]);
    
    // Отладочный вывод
    useEffect(() => {
        console.log('seasons:', seasons);
        console.log('seasonsWithProducts:', seasonsWithProducts);
        console.log('selectedCategory:', selectedCategory);
    }, [seasons, seasonsWithProducts, selectedCategory]);

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
                if (categoryId) {
                    query = query.eq('category_id', categoryId);
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
    }, [decodedSeason, gender, categoryId, isProduct]);

    // Если еще не определено, что это за параметр, показываем загрузку
    if (isProduct === null && (decodedSeason || categoryId)) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Проверка...</div>;
    }

    // Если это товар, отображаем страницу товара
    if (isProduct === true && productData) {
        // Здесь должна быть логика отображения страницы товара
        // Но так как у нас уже есть отдельный компонент ProductPage, 
        // мы можем просто перенаправить на него
        // Однако, чтобы избежать бесконечного цикла, мы не будем перенаправлять,
        // а отобразим страницу товара прямо здесь
        
        // Импортируем логику отображения товара из ProductPage
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-4 flex items-center gap-3">
                        <Button onClick={() => navigate(-1)} variant="ghost">← Назад</Button>
                        <Link to="/"><Button variant="outline">Домой</Button></Link>
                    </div>
                    <div className="text-center">
                        <h1>Страница товара</h1>
                        <p>Артикул: {productData.product?.article}</p>
                        <p>Название: {productData.product?.name}</p>
                        {/* Здесь должна быть полная реализация страницы товара */}
                    </div>
                </div>
            </div>
        );
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

    const formatPrice = (v: any) => {
        if (v === null || v === undefined || v === '') return '-';
        
        // Handle database format where comma is thousands separator (e.g., "2,109")
        let priceStr = String(v).replace(/\s+/g, '');
        
        // If string contains comma, treat it as thousands separator
        if (priceStr.includes(',')) {
            // Remove comma and parse as integer (2,109 -> 2109)
            priceStr = priceStr.replace(/,/g, '');
        }
        
        const n = Number(priceStr);
        if (Number.isNaN(n)) return String(v);
        
        // Manual formatting to ensure correct display
        // Format with space as thousands separator and always show ,0
        let formatted = n.toString();
        
        // Add space thousands separator for numbers >= 1000
        if (n >= 1000) {
            formatted = n.toLocaleString('ru-RU');
        }
        
        // Always add ,0 at the end
        formatted += ',0';
        
        return formatted + ' грн';
    };

    const formatDiscount = (d: any) => {
        if (d === null || d === undefined || d === '') return '-';
        const n = Number(String(d).replace(',', '.'));
        if (Number.isNaN(n)) return String(d);
        return `${n}%`;
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
                                            src={product.image ? `/static/pic/${product.image}` : "/static/pic/placeholder.webp"}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                            onError={({ currentTarget }) => {
                                                currentTarget.onerror = null;
                                                currentTarget.src = '/static/pic/placeholder.webp';
                                            }}
                                        />
                                    </div>
                                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <div className="text-xs text-gray-500 mb-2">
                                        {product.article}
                                    </div>
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