
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDiscount } from '@/lib/priceUtils';
import { Heart } from 'lucide-react';
// Импортируем правильные типы, включая User
import type { Product, Variant, User } from '@/types/types';

interface InfoProductPageProps {
  product: Product;
  selectedVariant: Variant | null;
  variantsByColor: Record<string, Variant[]>;
  user: User | null; // Используем правильный тип User
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelectVariant: (variant: Variant) => void;
  onAddToCart: () => void;
  onQuickOrder: () => void;
}

export default function InfoProductPage({ 
    product, 
    selectedVariant, 
    variantsByColor, 
    user, 
    isFavorite, 
    onToggleFavorite, 
    onSelectVariant, 
    onAddToCart, 
    onQuickOrder 
}: InfoProductPageProps) {

    // Теперь мы точно знаем структуру user и можем безопасно обращаться к user_metadata
    const userSaleAmount = user?.user_metadata?.sale || 0;
    const inStock = selectedVariant && selectedVariant.stock > 0;
    const hasDiscount = selectedVariant && selectedVariant.discount > 0;
    const userHasPersonalSale = userSaleAmount > 0;

    let yourPrice = selectedVariant ? selectedVariant.purchase_price : 0;
    if (selectedVariant && !hasDiscount && userHasPersonalSale) {
        yourPrice = selectedVariant.purchase_price * (1 - userSaleAmount / 100);
    }

    return (
        <div className="md:w-1/2">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
                    <p className="text-gray-500 text-sm">Артикул: {product.article}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onToggleFavorite}>
                        <Heart className="h-6 w-6" fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "currentColor"}/>
                    </Button>
                </div>
            </div>
            
            {selectedVariant && (
                <div className="my-5 space-y-2">
                    {hasDiscount ? (
                        <>
                            <p className="text-xl text-gray-500 line-through">Цена: {formatPrice(selectedVariant.purchase_price)}</p>
                            <p className="text-2xl font-bold text-red-600">Новая цена: {formatPrice(selectedVariant.sale_price)}</p>
                            <p className="text-red-600 font-semibold">Скидка: {formatDiscount(selectedVariant.discount)}</p>
                        </>
                    ) : (
                        <>
                            <p className={`text-xl ${userHasPersonalSale ? 'text-gray-500 line-through' : 'text-gray-700'}`}>Цена: {formatPrice(selectedVariant.purchase_price)}</p>
                            {userHasPersonalSale && (
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
                                        onClick={() => onSelectVariant(variant)}
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

            <div className="flex flex-col gap-3 mt-8">
                <Button size="lg" className="w-full bg-gray-800 hover:bg-gray-900" onClick={onAddToCart} disabled={!inStock}>Купить</Button>
                <Button size="lg" variant="outline" className="w-full" onClick={onQuickOrder} disabled={!inStock}>Заказать быстро</Button>
            </div>
            
            <div className="mt-8 text-sm text-gray-600 space-y-1">
                <p><span className="font-semibold">Категория:</span> <Link to={`/gender/${product.gender}/season/all/category/${product.category_id}`} className="hover:underline">{product.categories.name}</Link></p>
                <p><span className="font-semibold">Сезон:</span> <Link to={`/gender/${product.gender}/season/${encodeURIComponent(product.season)}`} className="hover:underline">{product.season}</Link></p>
            </div>
        </div>
    );
}
