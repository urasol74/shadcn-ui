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

interface CartItem {
    id: number;
    productId: number;
    name: string;
    article: string;
    image: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    stock: number;
    discount?: number;
}

// Correct Telegram credentials from QuickOrderModal.tsx
const TELEGRAM_BOT_TOKEN = '7223314836:AAEUHr6yHUM-RnNn3tTN9PpuFeRc9I10VH0';
const TELEGRAM_CHAT_ID = '1023307031';

export default function CheckoutPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        postOffice: '',
    });
    const [loading, setLoading] = useState(false);

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
            setFormData(prev => ({ 
                ...prev, 
                fullName: user.user_metadata?.full_name || '', 
                phone: user.phone || '' 
            }));
        }
    }, [user, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Пожалуйста, войдите, чтобы оформить заказ.", {
                action: { label: "Войти", onClick: () => navigate('/login') },
            });
            return;
        }

        const { fullName, phone, city, postOffice } = formData;
        if (!fullName || !phone || !city || !postOffice) {
            toast.error("Пожалуйста, заполните все поля доставки.");
            return;
        }

        setLoading(true);

        try {
            const variantIds = cartItems.map(item => item.id);
            const { data: variantsData, error: variantsError } = await supabase
                .from('variants')
                .select('id, discount')
                .in('id', variantIds);

            if (variantsError) throw variantsError;

            const orderData = cartItems.map(item => {
                const variantDetail = variantsData.find(v => v.id === item.id);
                const hasDiscount = variantDetail && variantDetail.discount > 0;
                
                return {
                    user_id: user.id,
                    full_name: fullName,
                    phone: phone,
                    city: city,
                    nova_poshta_office: postOffice,
                    article: item.article,
                    size: item.size,
                    color: item.color,
                    price: item.price,
                    stock: item.quantity,
                    discount: hasDiscount ? variantDetail.discount : 0,
                    sale: !hasDiscount ? (user.sale || 0) : 0,
                };
            });

            const { error: insertError } = await supabase.from('card').insert(orderData);
            if (insertError) throw insertError;

            // --- Telegram Notification Logic (Robust Implementation) ---
            try {
                let messageLines = [
                    `*✅ Новый заказ с сайта!*`,
                    `--------------------------------`,
                    `*👤 Клиент:*`,
                    `ФИО: ${fullName}`,
                    `Телефон: ${phone}`,
                    `Город: ${city}`,
                    `НП: ${postOffice}`,
                    `--------------------------------`,
                    `*📦 Заказ:*`,
                ];

                cartItems.forEach(item => {
                    messageLines.push(`- ${item.name} (${item.article})`);
                    messageLines.push(`  Цвет: ${item.color}, Размер: ${item.size}`);
                    messageLines.push(`  Кол-во: ${item.quantity} шт. x ${formatPrice(item.price)}`);
                    messageLines.push(``); // Add a blank line for spacing
                });

                messageLines.push(`--------------------------------`);
                messageLines.push(`*💰 Итого: ${formatPrice(totalPrice)}*`);
                
                const message = messageLines.join('\n');

                const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'Markdown',
                    }),
                });

                const result = await response.json();
                if (!result.ok) {
                    console.error('Telegram API Error:', result.description);
                    throw new Error(result.description);
                }
            } catch (teleError) {
                console.error("Failed to send Telegram notification:", teleError);
                toast.warning("Заказ оформлен, но не удалось отправить уведомление. Мы уже знаем о проблеме!");
            }

            localStorage.removeItem('cart');
            window.dispatchEvent(new CustomEvent('cartChange'));
            
            toast.success("Заказ успешно оформлен!");
            navigate('/order-success');

        } catch (error: any) {
            console.error("Error submitting order:", error);
            toast.error(`Ошибка при оформлении заказа: ${error.message}`);
        } finally {
            setLoading(false);
        }
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
                            <div>
                                <Label htmlFor="city">Город</Label>
                                <Input id="city" type="text" placeholder="Например, Киев" value={formData.city} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <Label htmlFor="postOffice">Отделение Новой Почты</Label>
                                <Input id="postOffice" type="text" placeholder="Номер отделения или почтомата" value={formData.postOffice} onChange={handleInputChange} required />
                            </div>
                            <Button type="submit" size="lg" className="w-full mt-6" disabled={loading}>
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
                                        <img 
                                            src={item.image ? `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${item.image}` : "/placeholder.webp"}
                                            alt={item.name} 
                                            className="h-20 w-16 rounded-md object-cover bg-gray-100"
                                        />
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
