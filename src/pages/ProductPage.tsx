
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Home } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { QuickOrderModal } from '@/components/QuickOrderModal';
import ImageProductPage from '@/components/ImageProductPage';
import InfoProductPage from '@/components/InfoProductPage';
import { RecommendedFromCategory } from '@/components/RecommendedFromCategory';
import type { Product, Variant, CartItem, User } from '@/types/types';

const SUPABASE_STORAGE_URL = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site';

export default function ProductPage() {
    const { gender, season, article } = useParams();
    
    const { user } = useAuth();

    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [variantsByColor, setVariantsByColor] = useState<Record<string, Variant[]>>({});
    const [isFavorite, setIsFavorite] = useState(false);
    const [isQuickOrderModalOpen, setIsQuickOrderModalOpen] = useState(false);
    const [productImages, setProductImages] = useState<string[]>([]);

    const decodedSeason = season ? decodeURIComponent(season) : null;

    useEffect(() => {
        const fetchProductAndImages = async () => {
            if (!article || !gender || !decodedSeason) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setProductImages([]);
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
                    .eq('season', decodedSeason)
                    .single();

                if (error || !data) {
                    console.error('Product loading error:', error);
                    setProduct(null);
                } else {
                    const fetchedProduct = data as unknown as Product;
                    setProduct(fetchedProduct);

                    if (fetchedProduct.image) {
                        const imagePrefix = fetchedProduct.image.split('.')[0];
                        const { data: imageList, error: listError } = await supabase
                            .storage
                            .from('image')
                            .list('img-site', { search: `${imagePrefix}` });

                        if (listError) {
                            console.error('Ошибка при получении списка изображений:', listError);
                            setProductImages([`${SUPABASE_STORAGE_URL}/${fetchedProduct.image}`]);
                        } else {
                            const imageUrls = imageList.map(file => `${SUPABASE_STORAGE_URL}/${file.name}`);
                            const mainImageUrl = `${SUPABASE_STORAGE_URL}/${fetchedProduct.image}`;
                            const sortedImages = [mainImageUrl, ...imageUrls.filter(url => url !== mainImageUrl)];
                            setProductImages(Array.from(new Set(sortedImages)));
                        }
                    }

                    const grouped: Record<string, Variant[]> = {};
                    fetchedProduct.variants.forEach(variant => {
                        const color = variant.color || 'default';
                        if (!grouped[color]) grouped[color] = [];
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

        fetchProductAndImages();
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
        const typedUser = user as User | null;
        if (!typedUser) {
            toast.info("Пожалуйста, войдите в аккаунт или зарегистрируйтесь.", {
                action: { label: "Войти", onClick: () => navigate('/login') },
            });
            return;
        }
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
        
        const userSaleAmount = (typedUser.user_metadata?.sale || 0) / 100;
        let priceForCart = selectedVariant.discount > 0 ? selectedVariant.sale_price : selectedVariant.purchase_price * (1 - userSaleAmount);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
            cart[existingItemIndex].price = priceForCart;
        } else {
            cart.push({
                id: selectedVariant.id, productId: product.id, name: product.name,
                article: product.article, image: product.image, color: selectedVariant.color,
                size: selectedVariant.size, price: priceForCart, quantity: 1, stock: selectedVariant.stock,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        toast.success("Товар добавлен в корзину!");
        window.dispatchEvent(new CustomEvent('cartChange'));
    };

    const handleQuickOrder = () => {
        if (!selectedVariant) {
            toast.error("Пожалуйста, выберите цвет и размер.");
            return;
        }
        setIsQuickOrderModalOpen(true);
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
                    <Link to="/"><Button>Вернуться на главную</Button></Link>
                </div>
            </div>
        );
    }

    // Адаптируем объект user под формат, который ожидает QuickOrderModal
    const quickOrderUser = user ? {
        name: (user as any).user_metadata?.name || '',
        tel: (user as any).user_metadata?.tel || '',
        sale: (user as any).user_metadata?.sale || 0,
    } : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Назад</Button>
                    <Link to="/"><Button variant="outline"><Home className="h-4 w-4 mr-2" />На главную</Button></Link>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    <ImageProductPage productImages={productImages} productName={product.name} />
                    <InfoProductPage 
                        product={product}
                        selectedVariant={selectedVariant}
                        variantsByColor={variantsByColor}
                        user={user as User | null}
                        isFavorite={isFavorite}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectVariant={setSelectedVariant}
                        onAddToCart={handleAddToCart}
                        onQuickOrder={handleQuickOrder}
                    />
                </div>
            </div>
             {product && (
                <RecommendedFromCategory 
                    gender={product.gender}
                    categoryId={product.category_id} 
                    currentProductId={product.id} 
                />
            )}
            <QuickOrderModal 
                isOpen={isQuickOrderModalOpen}
                onClose={() => setIsQuickOrderModalOpen(false)}
                product={product ? { 
                    name: product.name, 
                    article: product.article, 
                    image: product.image 
                } : null}
                selectedVariant={selectedVariant ? { 
                    color: selectedVariant.color, 
                    size: selectedVariant.size, 
                    purchase_price: selectedVariant.purchase_price, 
                    sale_price: selectedVariant.sale_price, 
                    discount: selectedVariant.discount 
                } : null}
                user={quickOrderUser}
            />
        </div>
    );
}
