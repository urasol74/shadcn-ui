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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';

export default function GenderSeasonPage() {
    const { season, gender, categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const decodedSeason = season ? decodeURIComponent(season) : null;
    
    const { isProduct, productData } = useIsProduct(decodedSeason, categoryId, []);
    const { seasons, categories, loading, setLoading } = useCatalogData(gender, decodedSeason, isProduct);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (categoryId) {
            setSelectedCategory(categoryId);
        } else {
            setSelectedCategory(null);
        }
    }, [categoryId]);

    useEffect(() => {
        if (!gender || isProduct === true) return;
        
        const loadProducts = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('products')
                    .select(`id, article, name, gender, season, category_id, categories(name), image, variants!inner(purchase_price, sale_price, discount, stock)`)
                    .eq('gender', gender)
                    .gt('variants.stock', 0);

                if (selectedCategory) {
                    query = query.eq('category_id', selectedCategory);
                }

                if (decodedSeason && isProduct === false && decodedSeason !== 'all') {
                    query = query.eq('season', decodedSeason);
                }

                const { data, error } = await query.limit(200);

                if (error) {
                    console.error('Products loading error:', error);
                    setProducts([]);
                    return;
                }

                if (!data) {
                    setProducts([]);
                    return;
                }
                
                const result: any[] = [];
                data.forEach(product => {
                    if (!product.variants || product.variants.length === 0) return;
                    
                    product.variants.forEach((variant: any) => {
                        const price = variant.sale_price || variant.purchase_price || 0;
                        if (variant.stock > 0 && price > 0) {
                            const existing = result.find(r => r.product_id === product.id && r.sale_price === price);
                            if (!existing) {
                                result.push({
                                    product_id: product.id, article: product.article, name: product.name,
                                    gender: product.gender, season: product.season, category_id: product.category_id,
                                    category_name: (product.categories as any)?.name || '',
                                    purchase_price: variant.purchase_price, sale_price: variant.sale_price,
                                    discount: variant.discount, stock: variant.stock || 0, image: product.image
                                });
                            }
                        }
                    });
                });

                setProducts(result);
            } catch (error) {
                console.error('Products loading failed:', error);
            } finally {
                setLoading(false);
            }
        };
        
        if (isProduct !== null) {
            loadProducts();
        }
    }, [decodedSeason, gender, selectedCategory, isProduct, categories, setLoading]);

    if (isProduct === null && (decodedSeason || categoryId)) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Проверка...</div>;
    }

    if (isProduct === true && productData) {
        return <ProductViewInline productData={productData} gender={gender} />;
    }

    const getGenderTitle = (g: string) => {
        const titles: { [key: string]: string } = {
            'чол': 'Мужская коллекция', 'жiн': 'Женская коллекция',
            'хлопч': 'Коллекция для мальчиков', 'дiвч': 'Коллекция для девочек', 
            'дівч': 'Коллекция для девочек'
        };
        return titles[g] || 'Коллекция';
    };

    const getOtherGenders = () => [
        { id: 'чол', name: 'Он' }, { id: 'жiн', name: 'Она' },
        { id: 'хлопч', name: 'Мальчик' }, { id: 'дiвч', name: 'Девочка' }
    ].filter(g => g.id !== gender);

    const getSeasonLink = (seasonName: string) => categoryId ? 
        `/gender/${gender}/season/${encodeURIComponent(seasonName)}/category/${categoryId}` : 
        `/gender/${gender}/season/${encodeURIComponent(seasonName)}`;

    const getCategoryLink = (catId: string) => (decodedSeason && decodedSeason !== 'all') ? 
        `/gender/${gender}/season/${encodeURIComponent(decodedSeason)}/category/${catId}` :
        `/gender/${gender}/season/all/category/${catId}`;

    const getAllCategoriesLink = () => (decodedSeason && decodedSeason !== 'all') ?
         `/gender/${gender}/season/${encodeURIComponent(decodedSeason)}` :
         `/gender/${gender}/season/all`;

    const FilterPanel = () => (
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="font-semibold mb-2">Сезоны</h3>
                <div className="flex flex-col gap-2 items-start">
                    <Link to={`/gender/${gender}/season/all`} className={`w-full text-left px-3 py-1 rounded-md text-sm ${!decodedSeason || decodedSeason === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} onClick={() => setIsSheetOpen(false)}>Все сезоны</Link>
                    {seasons.map((seasonName) => (
                        <Link key={seasonName} to={getSeasonLink(seasonName)} className={`w-full text-left px-3 py-1 rounded-md text-sm ${decodedSeason === seasonName ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} onClick={() => setIsSheetOpen(false)}>{seasonName}</Link>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Категории</h3>
                <div className="flex flex-col gap-2 items-start">
                    <Link to={getAllCategoriesLink()} className={`w-full text-left px-3 py-1 rounded-md text-sm ${!selectedCategory ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} onClick={() => setIsSheetOpen(false)}>Все категории</Link>
                    {categories.map((category) => (
                        <Link key={category.id} to={getCategoryLink(category.id)} className={`w-full text-left px-3 py-1 rounded-md text-sm ${String(selectedCategory) === String(category.id) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} onClick={() => setIsSheetOpen(false)}>{category.name}</Link>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {getGenderTitle(gender || '')}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            {getOtherGenders().map((g) => (
                                <Link key={g.id} to={`/gender/${g.id}/season/all`} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300">{g.name}</Link>
                            ))}
                        </div>
                    </div>
                    
                    {/* Mobile filters */}
                    <div className="md:hidden mt-4">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full flex items-center gap-2"><Menu size={16} /> Меню фильтров</Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle>Фильтры</SheetTitle>
                                </SheetHeader>
                                <div className="py-4">
                                    <FilterPanel />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    
                    {/* Desktop filters */}
                    <div className="hidden md:block mt-4">
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link to={`/gender/${gender}/season/all`} className={`px-3 py-1 rounded-full text-sm ${!decodedSeason || decodedSeason === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                Все сезоны
                            </Link>
                            {seasons.map((seasonName) => (
                                <Link key={seasonName} to={getSeasonLink(seasonName)} className={`px-3 py-1 rounded-full text-sm ${decodedSeason === seasonName ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {seasonName}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link to={getAllCategoriesLink()} className={`px-3 py-1 rounded-full text-sm ${!selectedCategory ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                Все категории
                            </Link>
                            {categories.map((category) => (
                                <Link key={category.id} to={getCategoryLink(category.id)} className={`px-3 py-1 rounded-full text-sm ${String(selectedCategory) === String(category.id) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-8">Загрузка товаров...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Товары не найдены</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <Card key={`${product.product_id}-${product.sale_price}`} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/gender/${gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`)}>
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
                                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                                    <div className="space-y-1">
                                        {product.discount && Number(product.discount) > 0 ? (
                                            <div className="text-gray-500 line-through text-sm">{formatPrice(product.purchase_price)}</div>
                                        ) : (
                                            <div className="invisible text-gray-500 line-through text-sm" style={{ height: '1.25rem' }}>{formatPrice(product.purchase_price)}</div>
                                        )}
                                        <div className="font-semibold text-blue-600">{formatPrice(product.sale_price)}</div>
                                        {product.discount && Number(product.discount) > 0 ? (
                                            <div className="text-red-600 text-sm">Скидка: {formatDiscount(product.discount)}</div>
                                        ) : (
                                            <div className="text-green-600 text-sm">Новая коллекция</div>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); navigate(`/gender/${gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`); }}>
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