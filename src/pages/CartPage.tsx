import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/priceUtils';
import { toast } from 'sonner';

// Структура объекта товара в корзине
interface CartItem {
    id: number; // Уникальный ID варианта товара (variant.id)
    productId: number; // ID самого продукта (product.id)
    name: string;
    article: string;
    image: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    stock: number;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Загрузка корзины из localStorage
    useEffect(() => {
        const loadCart = () => {
            const storedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
            setCartItems(storedCart);
        };
        
        loadCart();

        // Слушатель для обновления корзины из других вкладок
        window.addEventListener('storage', loadCart);
        // Слушатель для обновления из ProductPage
        window.addEventListener('cartChange', loadCart);

        return () => {
            window.removeEventListener('storage', loadCart);
            window.removeEventListener('cartChange', loadCart);
        };
    }, []);

    const updateCart = (newCart: CartItem[]) => {
        // Фильтруем пустые элементы на всякий случай
        const filteredCart = newCart.filter(item => item.quantity > 0);
        localStorage.setItem('cart', JSON.stringify(filteredCart));
        setCartItems(filteredCart);
        window.dispatchEvent(new CustomEvent('cartChange')); // Уведомить Header
    };

    const handleQuantityChange = (variantId: number, newQuantity: number) => {
        const itemToUpdate = cartItems.find(item => item.id === variantId);
        if (!itemToUpdate) return;

        if (newQuantity <= 0) {
            handleRemoveFromCart(variantId);
            return;
        }

        if (newQuantity > itemToUpdate.stock) {
            toast.warning(`Максимальное количество этого товара: ${itemToUpdate.stock}`);
            newQuantity = itemToUpdate.stock;
        }

        const updatedCart = cartItems.map(item => 
            item.id === variantId ? { ...item, quantity: newQuantity } : item
        );
        updateCart(updatedCart);
    };

    const handleRemoveFromCart = (variantId: number) => {
        const updatedCart = cartItems.filter(item => item.id !== variantId);
        updateCart(updatedCart);
        toast.success('Товар удален из корзины');
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" />
                <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Ваша корзина пуста</h1>
                <p className="mt-2 text-base text-gray-500">Начните покупки, чтобы увидеть товары здесь.</p>
                <Link to="/">
                    <Button className="mt-6">Перейти к покупкам</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Корзина</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                            <CardContent className="flex items-start md:items-center gap-4 p-4">
                                <img 
                                    src={item.image ? `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${item.image}` : "/placeholder.webp"}
                                    alt={item.name} 
                                    className="h-28 w-24 rounded-md object-cover bg-gray-100"
                                />
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                                    <div className="md:col-span-2">
                                        <h3 className="font-semibold text-base leading-tight">{item.name}</h3>
                                        <p className="text-sm text-gray-500">Артикул: {item.article}</p>
                                        <p className="text-sm text-gray-500">Цвет: {item.color}</p>
                                        <p className="text-sm text-gray-500">Размер: {item.size}</p>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end justify-between">
                                        <p className="text-lg font-bold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                                        <div className="flex items-center gap-2 border rounded-md p-1 mt-2">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}><Minus className="h-4 w-4"/></Button>
                                            <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}><Plus className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleRemoveFromCart(item.id)}
                                    aria-label="Удалить товар"
                                    className="self-start md:self-center ml-2"
                                >
                                    <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Итоги заказа</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Товары ({totalItems} шт.)</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                                    <span>Итого</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                            <Link to="/checkout" className="w-full">
                                <Button className="w-full mt-6 h-11">
                                    Перейти к оформлению
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
