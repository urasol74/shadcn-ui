
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types/types';

interface RecommendedFromCategoryProps {
  gender: string;
  categoryId: number;
  currentProductId: number;
}

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const RecommendedFromCategory = ({ gender, categoryId, currentProductId }: RecommendedFromCategoryProps) => {
    const [products, setProducts] = useState<any[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);

        // First, try to fetch by gender and category
        let { data, error } = await supabase
            .from('products')
            .select('id, article, name, gender, season, category_id, image, categories(name), variants!inner(purchase_price, sale_price, discount, stock)')
            .eq('gender', gender)
            .eq('category_id', categoryId)
            .neq('id', currentProductId)
            .gt('variants.stock', 0)
            .limit(10);

        // If no results, fall back to fetching by category only
        if (!error && data && data.length === 0) {
            const fallbackResult = await supabase
                .from('products')
                .select('id, article, name, gender, season, category_id, image, categories(name), variants!inner(purchase_price, sale_price, discount, stock)')
                .eq('category_id', categoryId)
                .neq('id', currentProductId)
                .gt('variants.stock', 0)
                .limit(10);

            if (fallbackResult.data) {
                data = fallbackResult.data;
                error = fallbackResult.error;
            }
        }

        if (error) {
            console.error('Error fetching recommended products:', error);
            setProducts([]);
        } else if (data && data.length > 0) {
            const productData = data as unknown as Product[];
            const name = productData[0]?.categories?.name;
            if (name) {
                setCategoryName(name);
            }

            const processedProducts = productData.map(p => ({
                ...p,
                product_id: p.id,
                purchase_price: p.variants[0]?.purchase_price,
                sale_price: p.variants[0]?.sale_price,
                discount: p.variants[0]?.discount,
            }));
            const uniqueProducts = Array.from(new Map(processedProducts.map(p => [p.id, p])).values());
            setProducts(shuffleArray(uniqueProducts));
        } else {
            setProducts([]);
        }
        setLoading(false);
    }, [gender, categoryId, currentProductId]);

    useEffect(() => {
        if (gender && categoryId && currentProductId) {
            fetchProducts();
        }
    }, [fetchProducts, gender, categoryId, currentProductId]);

    if (loading) {
        return <div className="text-center py-8">Загрузка рекомендуемых товаров...</div>;
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">
                    {categoryName ? `Рекомендуем из категории "${categoryName}"` : 'Рекомендуем из этой категории'}
                </h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: products.length > 4,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {products.map((product) => (
                            <CarouselItem key={product.id} className="md:basis-1/3 lg:basis-1/5">
                                <div className="p-1 h-full">
                                    <ProductCard product={product} />
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
