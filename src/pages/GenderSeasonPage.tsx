import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useIsProduct } from '@/hooks/useIsProduct';
import { useCatalogData } from '@/hooks/useCatalogData';
import { ProductViewInline } from '@/components/ProductViewInline';
import ProductCard from '@/components/ProductCard'; // <-- 1. ИМПОРТИРУЕМ НАШ НОВЫЙ КОМПОНЕНТ
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

export default function GenderSeasonPage() {
    const { season, gender, categoryId } = useParams();
    const navigate = useNavigate();

    const decodedSeason = season ? decodeURIComponent(season) : null;
    
    const { isProduct, productData } = useIsProduct(decodedSeason, categoryId);
    const { seasons, categories, loading: catalogLoading } = useCatalogData(gender, decodedSeason, isProduct);

    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const selectedCategory = categoryId || null;

    // Эффект для проверки существования категории при смене сезона
    useEffect(() => {
        if (!catalogLoading && categoryId && categories.length > 0) {
            const categoryExistsInNewSeason = categories.some(cat => String(cat.id) === String(categoryId));
            if (!categoryExistsInNewSeason) {
                const targetPath = (decodedSeason && decodedSeason !== 'all')
                    ? `/gender/${gender}/season/${encodeURIComponent(decodedSeason)}`
                    : `/gender/${gender}/season/all`;
                navigate(targetPath, { replace: true });
            }
        }
    }, [categories, categoryId, catalogLoading, navigate, gender, decodedSeason]);

    // Эффект для загрузки товаров (остается без изменений)
    useEffect(() => {
        if (isProduct === true || !gender || isProduct === null) {
            setProductsLoading(false);
            return;
        }
        
        const loadProducts = async () => {
            setProductsLoading(true);
            try {
                let query = supabase
                    .from('products')
                    .select(`id, article, name, gender, season, category_id, categories(name), image, variants!inner(purchase_price, sale_price, discount, stock)`)
                    .eq('gender', gender)
                    .gt('variants.stock', 0);

                if (selectedCategory) {
                    query = query.eq('category_id', selectedCategory);
                }

                if (decodedSeason && decodedSeason !== 'all') {
                    query = query.eq('season', decodedSeason);
                }

                const { data, error } = await query.limit(200);

                if (error || !data) {
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
                setProductsLoading(false);
            }
        };
        
        loadProducts();
    }, [decodedSeason, gender, selectedCategory, isProduct]);

    if (isProduct === null) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Анализ адреса...</div>;
    }

    if (isProduct === true && productData) {
        return <ProductViewInline productData={productData} gender={gender} />;
    }
    
    const isLoading = catalogLoading || productsLoading;

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
                    {categories.map((category: Category) => (
                        <Link key={category.id} to={getCategoryLink(String(category.id))} className={`w-full text-left px-3 py-1 rounded-md text-sm ${String(selectedCategory) === String(category.id) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} onClick={() => setIsSheetOpen(false)}>{category.name}</Link>
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
                    
                    <div className="hidden md:block mt-4"> 
                        {/* ... код фильтров остается без изменений ... */}
                    </div>
                </div>
            </div>
            
            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="text-center py-8">Загрузка товаров...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Товары не найдены</div>
                ) : (
                    // 2. ЗАМЕНЯЕМ СТАРЫЙ КОД НА ИСПОЛЬЗОВАНИЕ ProductCard
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map((product) => (
                            // Передаем каждый товар в наш новый, чистый компонент
                            <ProductCard key={`${product.product_id}-${product.sale_price}`} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}