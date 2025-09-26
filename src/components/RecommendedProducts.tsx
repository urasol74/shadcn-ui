
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDiscount } from '@/lib/priceUtils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

export const RecommendedProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProductsForGender = useCallback(async (gender: string, limit: number = 1) => {
        const { data, error } = await supabase
            .from('products')
            .select('id, article, name, gender, season, category_id, categories(name), image, variants!inner(purchase_price, sale_price, discount, stock)')
            .eq('gender', gender)
            .gt('variants.stock', 0)
            .limit(limit * 5); // Fetch more to get random items

        if (error) {
            console.error(`Error fetching products for gender ${gender}:`, error);
            return [];
        }
        if (!data) return [];
        
        const processed: any[] = [];
        data.forEach(p => {
            p.variants.forEach((v:any) => {
                if(v.stock > 0 && v.sale_price > 0) {
                    const existing = processed.find(item => item.product_id === p.id && item.sale_price === v.sale_price);
                    if(!existing) {
                        processed.push({
                            product_id: p.id, 
                            ...p, 
                            ...v
                        });
                    }
                }
            })
        });

        return shuffleArray(processed).slice(0, limit);
    }, []);

    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            setLoading(true);
            try {
                const genders = ['чол', 'жiн', 'хлопч', 'дiвч'];
                const promises = genders.map(gender => fetchProductsForGender(gender, 1));
                const results = await Promise.all(promises);
                let allProducts = results.flat();

                // Fetch one more random product from any gender
                if (allProducts.length < 5) {
                    const randomGender = genders[Math.floor(Math.random() * genders.length)];
                    const extraProduct = await fetchProductsForGender(randomGender, 1);
                    allProducts.push(...extraProduct);
                }

                // Ensure we have exactly 5 products, remove duplicates
                const uniqueProducts = Array.from(new Set(allProducts.map(p => p.product_id))).map(id => allProducts.find(p => p.product_id === id));
                
                setProducts(shuffleArray(uniqueProducts).slice(0, 5));

            } catch (error) {
                console.error('Failed to load recommended products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedProducts();
    }, [fetchProductsForGender]);

    if (loading) {
        return <div className="text-center py-8">Загрузка рекомендуемых товаров...</div>;
    }
    
    if (products.length === 0) {
        return null; // Or some placeholder
    }

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Рекомендуемые товары</h2>
                <Carousel 
                    opts={{ 
                        align: "start", 
                        loop: true 
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {products.map((product, index) => (
                            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/5">
                                <div className="p-1">
                                    <Card 
                                        className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                                        onClick={() => navigate(`/gender/${product.gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`)}
                                    >
                                        <CardContent className="p-4 flex flex-col flex-grow">
                                            <div className="h-48 bg-gray-100 rounded-md mb-3 flex items-center justify-center flex-shrink-0">
                                                <img 
                                                    src={product.image ? `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${product.image}` : "https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp"}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                    onError={({ currentTarget }) => {
                                                        currentTarget.onerror = null;
                                                        currentTarget.src = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp';
                                                    }}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="flex-grow flex flex-col justify-between">
                                                <h3 className="font-medium text-sm mb-1 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                                                    {product.name}
                                                </h3>
                                                <div className="space-y-1 mt-auto">
                                                    {product.discount && Number(product.discount) > 0 ? (
                                                        <div className="text-gray-500 line-through text-sm">
                                                            {formatPrice(product.purchase_price)}
                                                        </div>
                                                    ) : (
                                                        <div className="invisible text-gray-500 line-through text-sm" style={{ height: '1.25rem' }}></div>
                                                    )}
                                                    <div className="font-semibold text-blue-600">
                                                        {formatPrice(product.sale_price)}
                                                    </div>
                                                    {product.discount && Number(product.discount) > 0 ? (
                                                        <div className="text-red-600 text-sm">
                                                            Скидка: {formatDiscount(product.discount)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-green-600 text-sm" style={{ height: '1.25rem' }}></div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full mt-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/gender/${product.gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`);
                                                }}
                                            >
                                                Подробнее
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md" />
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md" />
                </Carousel>
            </div>
        </section>
    );
};
