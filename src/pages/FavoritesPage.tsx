import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDiscount } from '@/lib/priceUtils';
import { X } from 'lucide-react';

export default function FavoritesPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavoriteProducts = async () => {
            setLoading(true);
            const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');

            if (favoriteIds.length === 0) {
                setLoading(false);
                setProducts([]);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        id, article, name, gender, season, category_id, 
                        categories(name), 
                        image,
                        variants!inner(purchase_price, sale_price, discount, stock)
                    `)
                    .in('id', favoriteIds)
                    .gt('variants.stock', 0);

                if (error) {
                    console.error("Error fetching favorites:", error);
                    setProducts([]);
                } else if (data) {
                    const processedProducts = data.map(product => {
                        // Find the variant with the best price (lowest sale_price)
                        const bestVariant = [...product.variants].sort((a, b) => a.sale_price - b.sale_price)[0];
                        return {
                            ...product,
                            purchase_price: bestVariant.purchase_price,
                            sale_price: bestVariant.sale_price,
                            discount: bestVariant.discount,
                            stock: bestVariant.stock,
                        };
                    });
                    setProducts(processedProducts);
                }
            } catch (err) {
                console.error("Exception fetching favorites:", err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteProducts();
    }, []);

    const removeFromFavorites = (productId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking the remove button
        let currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        currentFavorites = currentFavorites.filter((id: number) => id !== productId);
        localStorage.setItem('favorites', JSON.stringify(currentFavorites));
        setProducts(products.filter(p => p.id !== productId));
    };

    const handleProductClick = (product: any) => {
        navigate(`/gender/${product.gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Избранное</h1>
                </div>

                {loading ? (
                    <div className="text-center py-8">Загрузка избранных товаров...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>В избранном пока пусто.</p>
                        <Link to="/">
                            <Button variant="link" className="mt-2">Перейти к покупкам</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <Card 
                                key={product.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer relative group"
                                onClick={() => handleProductClick(product)}
                            >
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-1 right-1 z-10 rounded-full bg-white/70 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => removeFromFavorites(product.id, e)}
                                >
                                    <X className="h-5 w-5 text-gray-600" />
                                </Button>
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
                                    <h3 className="font-medium text-sm mb-1 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                                        {product.name}
                                    </h3>
                                    <div className="space-y-1">
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}