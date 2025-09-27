import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Тип для данных заказа
interface Order {
    id: number;
    phone: string;
    full_name: string;
    user_id: number;
    article: string;
    color: string;
    size: string;
    price: number;
    discount: number;
    sale: number;
    city: string;
    nova_poshta_office: string;
    purchase_date: string; // Используем purchase_date как поле для даты
}

const UserOrdersPage = () => {
    const { id } = useParams<{ id: string }>(); // Получаем id пользователя из URL
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            // 1. Получаем заказы для конкретного user_id
            const { data: ordersData, error: ordersError } = await supabase
                .from('card')
                .select('*')
                .eq('user_id', id);

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
                setError('Не удалось загрузить заказы клиента.');
            } else if (ordersData) {
                // Устанавливаем имя пользователя из первого заказа (оно везде одинаковое)
                if (ordersData.length > 0) {
                    setUserName(ordersData[0].full_name);
                }
                setOrders(ordersData);
            }
            setLoading(false);
        };

        fetchOrders();
    }, [id]);

    const renderContent = () => {
        if (loading) {
            return <p>Загрузка заказов...</p>;
        }

        if (error) {
            return <p className="text-red-500">{error}</p>;
        }

        if (orders.length === 0) {
            return <p>У этого клиента еще нет заказов.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b font-semibold">ID заказа</th>
                            <th className="py-2 px-4 border-b font-semibold">Phone</th>
                            <th className="py-2 px-4 border-b font-semibold">Full Name</th>
                            <th className="py-2 px-4 border-b font-semibold">User ID</th>
                            <th className="py-2 px-4 border-b font-semibold">Article</th>
                            <th className="py-2 px-4 border-b font-semibold">Color</th>
                            <th className="py-2 px-4 border-b font-semibold">Size</th>
                            <th className="py-2 px-4 border-b font-semibold">Price</th>
                            <th className="py-2 px-4 border-b font-semibold">Discount/Sale</th>
                            <th className="py-2 px-4 border-b font-semibold">City</th>
                            <th className="py-2 px-4 border-b font-semibold">Nova Poshta</th>
                            <th className="py-2 px-4 border-b font-semibold">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b">{order.id}</td>
                                <td className="py-2 px-4 border-b">{order.phone}</td>
                                <td className="py-2 px-4 border-b">{order.full_name}</td>
                                <td className="py-2 px-4 border-b">{order.user_id}</td>
                                <td className="py-2 px-4 border-b">{order.article}</td>
                                <td className="py-2 px-4 border-b">{order.color}</td>
                                <td className="py-2 px-4 border-b">{order.size}</td>
                                <td className="py-2 px-4 border-b">{order.price}</td>
                                <td className="py-2 px-4 border-b">{order.discount > 0 ? `${order.discount}%` : `${order.sale}%`}</td>
                                <td className="py-2 px-4 border-b">{order.city}</td>
                                <td className="py-2 px-4 border-b">{order.nova_poshta_office}</td>
                                <td className="py-2 px-4 border-b">{new Date(order.purchase_date).toLocaleString('uk-UA')}</td>
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
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link to="/admin/user">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Заказы клиента: {userName || `ID ${id}`}</h1>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default UserOrdersPage;
