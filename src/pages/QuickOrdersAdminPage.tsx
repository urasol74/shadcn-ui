import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/priceUtils'; // Импортируем форматирование цены

// Тип для быстрого заказа
interface QuickOrder {
    id: number;
    name: string;
    tel: string;
    article: string;
    color: string;
    size: string;
    order_date: string;
    price: number; // Добавляем поле цены
}

const QuickOrdersAdminPage = () => {
    const [orders, setOrders] = useState<QuickOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
            .from('quick_order')
            .select('*')
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error fetching quick orders:', error);
            setError('Не удалось загрузить быстрые заказы.');
        } else if (data) {
            setOrders(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDelete = async (orderId: number) => {
        const isConfirmed = window.confirm('Вы уверены, что хотите удалить этот заказ?');
        if (!isConfirmed) return;

        const { error } = await supabase
            .from('quick_order')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error('Error deleting quick order:', error);
            toast.error('Не удалось удалить заказ.');
        } else {
            setOrders(orders.filter(order => order.id !== orderId));
            toast.success('Заказ успешно удален.');
        }
    };

    const renderContent = () => {
        if (loading) {
            return <p>Загрузка быстрых заказов...</p>;
        }

        if (error) {
            return <p className="text-red-500">{error}</p>;
        }

        if (orders.length === 0) {
            return <p>Нет активных быстрых заказов.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b font-semibold">ID</th>
                            <th className="py-2 px-4 border-b font-semibold">Имя</th>
                            <th className="py-2 px-4 border-b font-semibold">Телефон</th>
                            <th className="py-2 px-4 border-b font-semibold">Артикул</th>
                            <th className="py-2 px-4 border-b font-semibold">Цвет</th>
                            <th className="py-2 px-4 border-b font-semibold">Размер</th>
                            <th className="py-2 px-4 border-b font-semibold">Цена</th>
                            <th className="py-2 px-4 border-b font-semibold">Дата</th>
                            <th className="py-2 px-4 border-b font-semibold">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b">{order.id}</td>
                                <td className="py-2 px-4 border-b">{order.name}</td>
                                <td className="py-2 px-4 border-b">{order.tel}</td>
                                <td className="py-2 px-4 border-b">{order.article}</td>
                                <td className="py-2 px-4 border-b">{order.color}</td>
                                <td className="py-2 px-4 border-b">{order.size}</td>
                                <td className="py-2 px-4 border-b font-semibold">{formatPrice(order.price)}</td>
                                <td className="py-2 px-4 border-b">{new Date(order.order_date).toLocaleString('uk-UA')}</td>
                                <td className="py-2 px-4 border-b">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
                                        <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex container mx-auto px-4 py-8 space-x-8">
                <aside className="w-1/5 flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Меню</h2>
                        <nav>
                            <ul>
                                <li className="mb-2">
                                    <Link to="/admin/user" className="block py-2 px-3 rounded hover:bg-gray-100">
                                        Клиенты
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/quick-orders" className="block py-2 px-3 bg-green-100 text-green-800 rounded font-semibold">
                                        Быстрые заказы
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </aside>

                <main className="w-4/5">
                     <h1 className="text-3xl font-bold mb-6">Быстрые заказы</h1>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                       {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QuickOrdersAdminPage;
