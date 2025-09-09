import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { supabaseApi } from '@/lib/supabase-api';

export default function GenderSeasonPage() {
    const { season, gender } = useParams();
    const navigate = useNavigate();

    const [seasons, setSeasons] = useState<string[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<string | null>(season || null);
    const [selectedGender, setSelectedGender] = useState<string | null>(gender || null);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCategories, setShowCategories] = useState<boolean>(false);
    
    // Состояние для сортировки по цене
    const [priceSortOrder, setPriceSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

    // Загрузка категорий через Supabase
    useEffect(() => {
        const activeGenderForCategories = gender ?? selectedGender;
        if (!activeGenderForCategories) return;
        
        const loadCategories = async () => {
            try {
                const cats = await supabaseApi.getCategories(activeGenderForCategories);
                setCategories(cats);
            } catch (error) {
                console.error('Categories loading failed:', error);
                setCategories([]);
            }
        };
        
        loadCategories();
    }, [gender, selectedGender]);

    // Загрузка сезонов через Supabase
    useEffect(() => {
        const activeGenderForSeasons = gender ?? selectedGender;
        
        const loadSeasons = async () => {
            try {
                const seasonsData = await supabaseApi.getSeasons(activeGenderForSeasons);
                const seasonsList = seasonsData.map(item => item.season);
                setSeasons(seasonsList);
            } catch (error) {
                console.error('Seasons loading failed:', error);
                setSeasons([]);
            }
        };
        
        loadSeasons();
    }, [gender, selectedGender]);

    useEffect(() => {
        setSelectedSeason(season || null);
        setSelectedGender(gender || null);
    }, [season, gender]);

    // Загрузка продуктов через Supabase
    useEffect(() => {
        if (!selectedGender && !gender) return;
        
        const loadProducts = async () => {
            setLoading(true);
            try {
                const activeGender = gender ?? selectedGender;
                
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
                    .ilike('gender', activeGender)
                    .gt('variants.stock', 0);

                // Фильтр по категории если выбрана
                if (selectedCategory) {
                    query = query.eq('category_id', selectedCategory);
                }

                // Фильтр по сезону если есть
                if (season || selectedSeason) {
                    const currentSeason = season || selectedSeason;
                    query = query.ilike('season', `%${currentSeason}%`);
                }

                const { data, error } = await query.limit(100);

                if (error) {
                    console.error('Products loading error:', error);
                    setProducts([]);
                    return;
                }

                if (!data || data.length === 0) {
                    setProducts([]);
                    return;
                }

                // Обрабатываем результаты как в SupabaseTest
                const result: any[] = [];
                
                data.forEach(product => {
                    if (!product.variants || product.variants.length === 0) return;
                    
                    product.variants.forEach((variant: any) => {
                        const price = variant.sale_price || variant.purchase_price || 0;
                        
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
            }
            setLoading(false);
        };
        
        loadProducts();
    }, [season, gender, selectedCategory, selectedGender, selectedSeason]);

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

    // Функция для определения цены для сортировки
    const getProductSortPrice = (product: any) => {
        // Если есть скидка (discount > 0), берем sale_price
        // Иначе берем purchase_price
        if (product.discount && Number(product.discount) > 0) {
            return Number(String(product.sale_price || 0).replace(/,/g, '')) || 0;
        }
        return Number(String(product.purchase_price || 0).replace(/,/g, '')) || 0;
    };

    // Функция сортировки по цене
    const sortProductsByPrice = (products: any[]) => {
        if (priceSortOrder === 'none') return products;
        
        return [...products].sort((a, b) => {
            const priceA = getProductSortPrice(a);
            const priceB = getProductSortPrice(b);
            
            if (priceSortOrder === 'asc') {
                return priceA - priceB; // от низких к высоким
            } else {
                return priceB - priceA; // от высоких к низким
            }
        });
    };

    // Обработчик клика по кнопкам сортировки
    const handlePriceSortClick = (direction: 'asc' | 'desc') => {
        if (priceSortOrder === direction) {
            // Если кликнули по уже активной кнопке - отключаем сортировку
            setPriceSortOrder('none');
        } else {
            setPriceSortOrder(direction);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-foreground">Главная</Link>
                        <span>/</span>
                        {gender ? (
                            <Link to={`/gender/${gender}`} className="hover:text-foreground">{getGenderTitle(String(gender))}</Link>
                        ) : (
                            <span className="text-muted-foreground">{getGenderTitle(String(selectedGender || ''))}</span>
                        )}
                        {season && (
                            <>
                                <span>/</span>
                                <span className="text-foreground">{season}</span>
                            </>
                        )}
                    </div>
                </nav>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button onClick={() => navigate(-1)} variant="ghost">← Назад</Button>
                        <Link to="/"><Button variant="outline">Домой</Button></Link>
                    </div>
                    
                    {/* Фильтр сортировки по цене */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Цена:</span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePriceSortClick('asc')}
                                className={`p-2 h-8 w-8 ${priceSortOrder === 'asc' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Сортировать по возрастанию цены"
                            >
                                ↑
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePriceSortClick('desc')}
                                className={`p-2 h-8 w-8 ${priceSortOrder === 'desc' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Сортировать по убыванию цены"
                            >
                                ↓
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: compact categories filter (hidden on mobile, available via off-canvas) */}
                    <aside className="hidden md:block md:w-1/4">
                        <div className="bg-white p-3 rounded-md shadow-sm">
                            <div className="mb-3">
                                <span className="inline-block bg-gray-100 text-sm px-3 py-1 rounded-md font-medium">{getGenderTitle(String(gender || selectedGender || ''))}</span>
                            </div>
                            {loading && categories.length === 0 ? (
                                <div className="text-sm">Загрузка...</div>
                            ) : categories.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Нет категорий</div>
                            ) : (
                                <ul className="space-y-1 text-sm">
                                    <li>
                                        <button
                                            className={`w-full text-left py-1.5 px-2 rounded text-sm ${selectedCategory ? '' : 'bg-gray-100'}`}
                                            onClick={() => { setSelectedCategory(null); }}
                                        >
                                            Все
                                        </button>
                                    </li>
                                    {categories.map(cat => (
                                        <li key={cat.id}>
                                            <button
                                                className={`w-full text-left py-1.5 px-2 rounded text-sm ${selectedCategory === cat.id ? 'bg-gray-100' : ''}`}
                                                onClick={() => { setSelectedCategory(cat.id); }}
                                            >
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </aside>

                    {/* Main: seasons + products grid */}
                    <main className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-32 flex items-center">
                                <div className="flex items-center gap-2 md:hidden">
                                    <button
                                        className="p-2 rounded border bg-white"
                                        aria-label="Показать категории"
                                        onClick={() => setShowCategories(true)}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-center flex-1">{getGenderTitle(String(gender || selectedGender || ''))}</h1>
                            <div className="w-32 flex justify-end">
                                <div className="text-sm text-gray-600">
                                    Найдено: {products.length}
                                </div>
                            </div>
                        </div>

                        {/* Top filter: genders (show active season as label) */}
                        <div className="mb-6">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <div className="text-sm text-gray-600">Сезон:</div>
                                <div className="px-3 py-1 rounded bg-gray-100 text-sm">{selectedSeason || season || 'Все сезоны'}</div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {['чол', 'жiн', 'хлопч', 'дiвч'].map(g => (
                                    <button
                                        key={g}
                                        className={`py-1.5 px-3 rounded ${((gender === g) || (selectedGender === g)) ? 'bg-gray-200' : 'bg-white'}`}
                                        onClick={() => {
                                            setSelectedGender(g);
                                            const targetSeason = encodeURIComponent(String(selectedSeason || season || '')).replace(/%20/g, '%20');
                                            navigate(`/${g}/gender-season/${targetSeason}`);
                                        }}
                                    >
                                        {getGenderTitle(g)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Интерактивные сезоны */}
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2 justify-center">
                                <button
                                    className={`py-1.5 px-3 rounded ${!selectedSeason ? 'bg-blue-200' : 'bg-white border'}`}
                                    onClick={() => setSelectedSeason(null)}
                                >
                                    Все сезоны
                                </button>
                                {seasons.map(seasonItem => (
                                    <button
                                        key={seasonItem}
                                        className={`py-1.5 px-3 rounded ${selectedSeason === seasonItem ? 'bg-blue-200' : 'bg-white border'}`}
                                        onClick={() => setSelectedSeason(seasonItem)}
                                    >
                                        {seasonItem}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center">Загрузка товаров...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center text-gray-500">Нет товаров по выбранным фильтрам.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {sortProductsByPrice(products).map((product: any) => (
                                    <Link 
                                        key={product.product_id ?? product.id ?? product.article}
                                        to={`/category/${gender || selectedGender}/${product.category_id}/${product.article}`}
                                        className="block"
                                    >
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                            <CardContent className="p-4 text-center">
                                                <div className="w-full h-48 bg-gray-100 mb-4 flex items-center justify-center rounded overflow-hidden">
                                                    {/* Используем поле image из products для отображения изображения */}
                                                    {product.image ? (
                                                        <img 
                                                            src={`/static/pic/${product.image}`}
                                                            className="w-full h-full object-contain" 
                                                            alt={product.name || product.article}
                                                            loading="lazy"
                                                            decoding="async"
                                                            onError={(e) => {
                                                                const img = e.target as HTMLImageElement;
                                                                // Проверяем расширение файла из базы данных
                                                                const imageFileName = product.image;
                                                                const ext = imageFileName.split('.').pop()?.toLowerCase() || 'webp';
                                                                
                                                                // Пытаемся загрузить изображение с тем же расширением
                                                                const cleanArticle = product.article.replace(/\.K$/, '');
                                                                img.src = `/static/pic/${cleanArticle}.${ext}`;
                                                                
                                                                // Если не удалось, пробуем другие расширения
                                                                img.onerror = () => {
                                                                    if (img.src.includes(`.${ext}`)) {
                                                                        img.src = `/static/pic/${cleanArticle}.webp`;
                                                                    } else if (img.src.includes('.webp')) {
                                                                        img.src = `/static/pic/${cleanArticle}.jpg`;
                                                                    } else if (img.src.includes('.jpg')) {
                                                                        img.src = `/static/pic/${cleanArticle}.jpeg`;
                                                                    } else if (img.src.includes('.jpeg')) {
                                                                        img.src = `/static/pic/${cleanArticle}.png`;
                                                                    } else {
                                                                        img.src = '/static/pic/placeholder.jpg';
                                                                    }
                                                                };
                                                            }}
                                                        />
                                                    ) : (
                                                        <img 
                                                            src={`/static/pic/${product.article.replace(/\.K$/, '')}.webp`}
                                                            className="w-full h-full object-contain" 
                                                            alt={product.name || product.article}
                                                            loading="lazy"
                                                            decoding="async"
                                                            onError={(e) => {
                                                                const img = e.target as HTMLImageElement;
                                                                const cleanArticle = product.article.replace(/\.K$/, '');
                                                                if (img.src.includes('.webp')) {
                                                                    img.src = `/static/pic/${cleanArticle}.jpg`;
                                                                } else if (img.src.includes('.jpg')) {
                                                                    img.src = `/static/pic/${cleanArticle}.jpeg`;
                                                                } else if (img.src.includes('.jpeg')) {
                                                                    img.src = `/static/pic/${cleanArticle}.png`;
                                                                } else {
                                                                    img.src = '/static/pic/placeholder.jpg';
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-center mb-3 text-base font-medium text-foreground hover:text-blue-600">
                                                    {product.name}
                                                </div>
                                                
                                                <div className="space-y-2 text-sm">
                                                    {/* Резервируем место для старой цены для симметрии */}
                                                    {(product.purchase_price) && (product.discount) && Number(product.discount) > 0 ? (
                                                        <div className="text-gray-500 line-through">
                                                            Старая цена: {formatPrice(product.purchase_price)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-transparent select-none" aria-hidden="true">
                                                            .
                                                        </div>
                                                    )}
                                                    <div className="font-semibold text-lg text-blue-600">
                                                        Цена: {formatPrice(product.sale_price)}
                                                    </div>
                                                    
                                                    {/* Отображение скидки или "Новая коллекция" */}
                                                    {(product.discount) ? (
                                                        Number(product.discount) > 0 ? (
                                                            <div className="text-red-600 font-medium">
                                                                Скидка: {formatDiscount(product.discount)}
                                                            </div>
                                                        ) : (
                                                            <div className="text-green-600 font-medium">
                                                                Новая коллекция
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="text-green-600 font-medium">
                                                            Новая коллекция
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
                {/* Off-canvas categories panel for mobile */}
                {showCategories && (
                    <div className="fixed inset-0 z-50 flex">
                        <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setShowCategories(false)}></div>
                        <div className="relative w-80 max-w-full bg-white h-full shadow-xl p-4 overflow-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-lg font-medium">Категории</div>
                                <button className="p-2" onClick={() => setShowCategories(false)} aria-label="Закрыть">✕</button>
                            </div>
                            <div>
                                {loading && categories.length === 0 ? (
                                    <div className="text-sm">Загрузка...</div>
                                ) : categories.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">Нет категорий</div>
                                ) : (
                                    <ul className="space-y-1 text-sm">
                                        <li>
                                            <button
                                                className={`w-full text-left py-1.5 px-2 rounded text-sm ${selectedCategory ? '' : 'bg-gray-100'}`}
                                                onClick={() => { setSelectedCategory(null); setShowCategories(false); }}
                                            >
                                                Все
                                            </button>
                                        </li>
                                        {categories.map(cat => (
                                            <li key={cat.id}>
                                                <button
                                                    className={`w-full text-left py-1.5 px-2 rounded text-sm ${selectedCategory === cat.id ? 'bg-gray-100' : ''}`}
                                                    onClick={() => { setSelectedCategory(cat.id); setShowCategories(false); }}
                                                >
                                                    {cat.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}