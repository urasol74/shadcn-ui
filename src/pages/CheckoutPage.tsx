import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/priceUtils';

import NovaPoshta from '@/components/NovaPoshta';
import DeliveryCalculator from '@/components/NovaPochtaDellivery';

interface CartItem {
    id: number; productId: number; name: string; article: string;
    image: string; color: string; size: string; price: number;
    quantity: number; stock: number; discount?: number;
}

interface NovaPoshtaSelection {
  city: { value: string; label: string } | null;
  warehouse: { value: string; label: string } | null;
}

const TELEGRAM_BOT_TOKEN = '7223314836:AAEUHr6yHUM-RnNn3tTN9PpuFeRc9I10VH0';
const TELEGRAM_CHAT_ID = '1023307031';

export default function CheckoutPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0); // Эта сумма будет передана в калькулятор
    const [loading, setLoading] = useState(false);

    const [novaPoshtaSelection, setNovaPoshtaSelection] = useState<NovaPoshtaSelection>({ 
        city: null, 
        warehouse: null 
    });

    const [formData, setFormData] = useState({ fullName: '', phone: '' });

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (storedCart.length === 0) {
            toast.info("Ваша корзина пуста.");
            navigate('/cart');
            return;
        }
        setCartItems(storedCart);
        const total = storedCart.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
        setTotalPrice(total);

        if (user) {
            setFormData({ 
                fullName: user.user_metadata?.full_name || '', 
                phone: user.phone || '' 
            });
        }
    }, [user, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... (вся логика отправки заказа остается без изменений) ...
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-6">Адрес доставки</h2>
                        <form onSubmit={handleSubmitOrder} className="space-y-6">
                             <div>
                                <Label htmlFor="fullName">ФИО получателя</Label>
                                <Input id="fullName" type="text" placeholder="Иванов Иван Иванович" value={formData.fullName} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <Label htmlFor="phone">Контактный телефон</Label>
                                <Input id="phone" type="tel" placeholder="+380 XX XXX XX XX" value={formData.phone} onChange={handleInputChange} required />
                            </div>

                            <NovaPoshta onSelectionChange={setNovaPoshtaSelection} />
                            
                            <div className="bg-gray-50 p-3 rounded-md min-h-[50px] flex items-center">
                                {/* 
                                  Передаем и Ref города, и итоговую сумму заказа в калькулятор.
                                */}
                                <DeliveryCalculator 
                                    recipientCityRef={novaPoshtaSelection.city?.value || null} 
                                    assessedCost={totalPrice}
                                />
                            </div>
                            
                            <Button type="submit" size="lg" className="w-full !mt-8" disabled={loading}>
                                {loading ? 'Оформление...' : `Подтвердить заказ на ${formatPrice(totalPrice)}`}
                            </Button>
                        </form>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md h-fit">
                        <h2 className="text-2xl font-semibold mb-6">Ваш заказ</h2>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className='flex items-center gap-4'>
                                        <img src={item.image ? `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${item.image}` : "/placeholder.webp"} alt={item.name} className="h-20 w-16 rounded-md object-cover bg-gray-100" />
                                        <div>
                                            <p className="font-semibold leading-tight">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.color}, {item.size}</p>
                                            <p className="text-sm text-gray-500">Кол-во: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <hr className="my-6" />
                        <div className="flex justify-between font-bold text-xl">
                            <span>Итого:</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
