import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useIsProduct } from '@/hooks/useIsProduct';
import { useCatalogData } from '@/hooks/useCatalogData';
import { ProductViewInline } from '@/components/ProductViewInline';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';

export default function GenderSeasonPage() {
    const { season, gender, categoryId } = useParams();
    const navigate = useNavigate();

    const decodedSeason = season ? decodeURIComponent(season) : 'all';
    
    const { isProduct, productData } = useIsProduct(decodedSeason, categoryId);
    const { seasons, categories, loading: catalogLoading } = useCatalogData(gender, decodedSeason, isProduct);

    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const selectedCategory = categoryId || null;

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

    const genderOptions = [
        { id: 'чол', name: 'Он' }, { id: 'жiн', name: 'Она' },
        { id: 'хлопч', name: 'Мальчик' }, { id: 'дiвч', name: 'Девочка' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="container mx-auto px-4">
                    
                    <div className="hidden md:block"> 
                        <FilterPanel 
                            currentGender={gender!}
                            currentSeason={decodedSeason}
                            genders={genderOptions}
                            seasons={seasons}
                            categories={categories}
                            selectedCategory={selectedCategory}
                        />
                    </div>
                    
                    <div className="md:hidden py-3">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full flex items-center gap-2"><Menu size={16} /> Навигация</Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col">
                                <SheetHeader>
                                    <SheetTitle>Навигация</SheetTitle>
                                </SheetHeader>
                                <FilterPanel 
                                    currentGender={gender!}
                                    currentSeason={decodedSeason}
                                    genders={genderOptions}
                                    seasons={seasons}
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onFilterChange={() => setIsSheetOpen(false)}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
            
            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <h2 className="text-xl font-semibold">Товары не найдены</h2>
                        <p className="mt-2">Попробуйте изменить фильтры или выбрать другую категорию.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <ProductCard key={`${product.product_id}-${product.sale_price}`} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}