
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDiscount } from '@/lib/priceUtils';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

export const RecommendedProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            setLoading(true);
            try {
                // We fetch a larger number of products and then select randomly
                // This is not the most performant way for large datasets, but it is simple.
                // A better way would be to create a database function to get random rows.
                const { data, error } = await supabase
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
                    .gt('variants.stock', 0)
                    .limit(50); // Fetch 50 products to get a good random pool

                if (error) {
                    console.error('Error fetching recommended products:', error);
                    return;
                }

                if (!data) {
                    setProducts([]);
                    return;
                }

                const processedProducts: any[] = [];
                data.forEach(product => {
                    if (product.variants && product.variants.length > 0) {
                        product.variants.forEach((variant: any) => {
                             if (variant.stock > 0 && variant.sale_price > 0) {
                                // Avoid duplicates with same price
                                const existing = processedProducts.find(p => p.product_id === product.id && p.sale_price === variant.sale_price);
                                if (!existing) {
                                     processedProducts.push({
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
                                        stock: variant.stock,
                                        image: product.image
                                    });
                                }
                             }
                        });
                    }
                });

                const shuffled = shuffleArray(processedProducts);
                setProducts(shuffled.slice(0, 4));

            } catch (error) {
                console.error('Failed to load recommended products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedProducts();
    }, []);

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card 
                            key={product.product_id + '-' + product.sale_price} 
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/gender/${product.gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`)}
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
                                        loading="lazy"
                                    />
                                </div>
                                <h3 className="font-medium text-sm mb-1 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                                    {product.name}
                                </h3>
                                <div className="space-y-1">
                                    {product.discount && Number(product.discount) > 0 ? (
                                        <div className="text-gray-500 line-through text-sm">
                                            {formatPrice(product.purchase_price)}
                                        </div>
                                    ) : (
                                        <div className="invisible text-gray-500 line-through text-sm" style={{ height: '1.25rem' }}>
                                            {/* Placeholder for alignment */}
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
                                        <div className="text-green-600 text-sm" style={{ height: '1.25rem' }}>
                                            {/* Placeholder for alignment */}
                                        </div>
                                    )}
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
                    ))}
                </div>
            </div>
        </section>
    );
};
