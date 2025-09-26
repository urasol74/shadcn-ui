import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDiscount } from '@/lib/priceUtils';
import { Heart } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

interface Variant {
    id: number;
    size: string;
    purchase_price: number;
    sale_price: number;
    discount: number;
    stock: number;
    color: string;
}

interface Product {
    id: number;
    article: string;
    name: string;
    gender: string;
    season: string;
    category_id: number;
    image: string;
    categories: { name: string };
    variants: Variant[];
}

interface CartItem {
    id: number; // variant ID
    productId: number;
    name: string;
    article: string;
    image: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    stock: number;
}

export default function ProductPage() {
    const { gender, season, article } = useParams();
    const { user } = useAuth(); // Получаем данные о пользователе
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [variantsByColor, setVariantsByColor] = useState<Record<string, Variant[]>>({});
    const [isFavorite, setIsFavorite] = useState(false);

    const decodedSeason = season ? decodeURIComponent(season) : null;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!article || !gender || !decodedSeason) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        id, article, name, gender, season, category_id, image,
                        categories(name),
                        variants!inner(id, size, color, purchase_price, sale_price, discount, stock)
                    `)
                    .eq('article', article)
                    .eq('gender', gender)
                    .eq('season', decodedSeason);

                if (error || !data || data.length === 0) {
                    console.error('Product loading error:', error);
                    setProduct(null);
                } else {
                    const fetchedProduct = data[0] as unknown as Product;
                    setProduct(fetchedProduct);

                    const grouped: Record<string, Variant[]> = {};
                    fetchedProduct.variants.forEach(variant => {
                        const color = variant.color || 'default';
                        if (!grouped[color]) {
                            grouped[color] = [];
                        }
                        grouped[color].push(variant);
                    });

                    for (const color in grouped) {
                        grouped[color].sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));
                    }

                    setVariantsByColor(grouped);

                    const firstAvailable = fetchedProduct.variants.find(v => v.stock > 0);
                    setSelectedVariant(firstAvailable || fetchedProduct.variants[0] || null);
                    
                    const currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                    if (currentFavorites.includes(fetchedProduct.id)) {
                        setIsFavorite(true);
                    }
                }
            } catch (err) {
                console.error('Exception while fetching product', err);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [article, gender, decodedSeason]);

    const handleToggleFavorite = () => {
        if (!product) return;

        let currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (isFavorite) {
            currentFavorites = currentFavorites.filter((favId: number) => favId !== product.id);
            toast.info("Товар удален из избранного.");
        } else {
            currentFavorites.push(product.id);
            toast.success("Товар добавлен в избранное!");
        }

        localStorage.setItem('favorites', JSON.stringify(currentFavorites));
        setIsFavorite(!isFavorite);
        window.dispatchEvent(new CustomEvent('favoritesChange'));
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) {
            toast.error("Пожалуйста, выберите цвет и размер.");
            return;
        }

        if (selectedVariant.stock <= 0) {
            toast.warning("Данного размера нет в наличии.");
            return;
        }

        const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex(item => item.id === selectedVariant.id);
        
        let priceForCart = selectedVariant.purchase_price;
        if (selectedVariant.discount > 0) {
            priceForCart = selectedVariant.sale_price;
        } else if (user && user.sale > 0) {
            priceForCart = selectedVariant.purchase_price * (1 - user.sale / 100);
        }

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
            cart[existingItemIndex].price = priceForCart; // Обновляем цену на случай, если она изменилась
        } else {
            const newItem: CartItem = {
                id: selectedVariant.id,
                productId: product.id,
                name: product.name,
                article: product.article,
                image: product.image,
                color: selectedVariant.color,
                size: selectedVariant.size,
                price: priceForCart,
                quantity: 1,
                stock: selectedVariant.stock,
            };
            cart.push(newItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        toast.success("Товар добавлен в корзину!");
        window.dispatchEvent(new CustomEvent('cartChange'));
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Загрузка товара...</div>;
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
                    <p className="text-gray-600 mb-6">Возможно, товар был удален или ссылка устарела.</p>
                    <Link to="/">
                        <Button>Вернуться на главную</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const inStock = selectedVariant && selectedVariant.stock > 0;
    const hasDiscount = selectedVariant && selectedVariant.discount > 0;
    const userSale = user?.sale > 0;

    let yourPrice = selectedVariant ? selectedVariant.purchase_price : 0;
    if (selectedVariant && !hasDiscount && userSale) {
        yourPrice = selectedVariant.purchase_price * (1 - user.sale / 100);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div>
                        <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden sticky top-24">
                            <img 
                                src={product.image ? `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${product.image}` : "https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp"}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp';
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
                                <p className="text-gray-500 text-sm">Артикул: {product.article}</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                                   <Heart className="h-6 w-6" fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "currentColor"}/>
                                </Button>
                            </div>
                        </div>
                        
                        {selectedVariant && (
                             <div className="my-5 space-y-2">
                                {hasDiscount ? (
                                    // Сценарий 1: Есть скидка на товар
                                    <>
                                        <p className="text-xl text-gray-500 line-through">Цена: {formatPrice(selectedVariant.purchase_price)}</p>
                                        <p className="text-2xl font-bold text-red-600">Новая цена: {formatPrice(selectedVariant.sale_price)}</p>
                                        <p className="text-red-600 font-semibold">Скидка: {formatDiscount(selectedVariant.discount)}</p>
                                    </>
                                ) : (
                                    // Сценарий 2: Нет скидки на товар (может быть персональная)
                                    <>
                                        <p className={`text-xl ${userSale ? 'text-gray-500 line-through' : 'text-gray-700'}`}>Цена: {formatPrice(selectedVariant.purchase_price)}</p>
                                        {userSale && (
                                            <p className="text-2xl font-bold text-blue-600">Ваша цена: {formatPrice(yourPrice)}</p>
                                        )}
                                    </>
                                )}

                                {inStock ? (
                                    <p className="text-sm text-green-600 pt-2">В наличии</p>
                                ) : (
                                    <p className="text-sm text-red-600 pt-2">Нет в наличии</p>
                                )}
                            </div>
                        )}

                        <div className="my-6">
                            <h3 className="font-semibold text-lg mb-3">Цвета и размеры</h3>
                            <div className="space-y-4">
                                {Object.entries(variantsByColor).map(([color, variants]) => (
                                    <div key={color}>
                                        <p className="font-medium text-gray-800 mb-2">Цвет: <span className="font-bold">{color}</span></p>
                                        <div className="flex flex-wrap gap-2">
                                            {variants.map((variant) => (
                                                <Button
                                                    key={variant.id}
                                                    variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                                                    disabled={variant.stock <= 0}
                                                    onClick={() => setSelectedVariant(variant)}
                                                    className={variant.stock <= 0 ? 'text-gray-400' : ''}
                                                >
                                                    {variant.size}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            <Button size="lg" className="flex-1 bg-gray-800 hover:bg-gray-900" onClick={handleAddToCart} disabled={!inStock}>Купить</Button>
                            <Button size="lg" variant="outline" className="flex-1">Заказать быстро</Button>
                        </div>
                        
                        <div className="mt-8 text-sm text-gray-600 space-y-1">
                           <p><span className="font-semibold">Категория:</span> <Link to={`/gender/${gender}/season/all/category/${product.category_id}`} className="hover:underline">{product.categories.name}</Link></p>
                           <p><span className="font-semibold">Сезон:</span> <Link to={`/gender/${gender}/season/${encodeURIComponent(product.season)}`} className="hover:underline">{product.season}</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
