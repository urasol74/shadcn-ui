import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingCart } from 'lucide-react';

// Предполагаемая структура объекта товара, сохраненного в localStorage
interface Product {
    id: number;
    name: string;
    article: string;
    price: number;
    images: string[];
    // Добавьте другие поля, если они есть
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);

    // Загрузка и расчет корзины при монтировании компонента
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]') as Product[];
        setCartItems(storedCart);

        const total = storedCart.reduce((sum, item) => sum + item.price, 0);
        setTotalPrice(total);
    }, []);

    // Функция удаления товара из корзины
    const handleRemoveFromCart = (productId: number) => {
        const updatedCart = cartItems.filter(item => item.id !== productId);
        
        // Обновляем состояние
        setCartItems(updatedCart);

        // Обновляем localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        // Пересчитываем итоговую стоимость
        const total = updatedCart.reduce((sum, item) => sum + item.price, 0);
        setTotalPrice(total);

        // Опционально: создаем кастомное событие, чтобы другие компоненты (например, Header) могли на него реагировать
        window.dispatchEvent(new CustomEvent('cartChanged'));
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" />
                <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Ваша корзина пуста</h1>
                <p className="mt-2 text-base text-gray-500">Похоже, вы еще ничего не добавили. Начните покупки, чтобы увидеть товары здесь.</p>
                <Link to="/">
                    <Button className="mt-6">Перейти к покупкам</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Корзина</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <img 
                                        src={item.images[0]} 
                                        alt={item.name} 
                                        className="h-24 w-24 rounded-md object-cover bg-gray-100"
                                    />
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-lg">{item.name}</h3>
                                        <p className="text-sm text-gray-500">Артикул: {item.article}</p>
                                        <p className="text-lg font-bold mt-2">{item.price.toLocaleString('ru-RU')} ₽</p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleRemoveFromCart(item.id)}
                                        aria-label="Удалить товар"
                                    >
                                        <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                
                {/* Итоги заказа */}
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Итоги заказа</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Товары ({cartItems.length} шт.)</span>
                                    <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                                ... 
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                                    <span>Итого</span>
                                    <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                                </div>
                            </div>
                            <Button className="w-full mt-6 h-11" disabled>
                                Перейти к оформлению
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
