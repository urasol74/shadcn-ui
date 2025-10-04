import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Обновленный тип для заказа, включающий вложенные данные пользователя
interface Order {
    id: number;
    phone: string;
    full_name: string; // Имя получателя при заказе
    article: string;
    color: string;
    size: string;
    price: number;
    discount: number;
    sale: number;
    city: string;
    nova_poshta_office: string;
    purchase_date: string;
    user: { // Данные из связанной таблицы 'user'
        name: string; // Имя пользователя из его профиля
    } | null;
}

const UserOrdersPage = () => {
    const { id } = useParams<{ id: string }>();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>(''); // Для заголовка страницы

    useEffect(() => {
        const fetchUserData = async () => {
            if (!id) return;
            
            setLoading(true);
            setError(null);

            // 1. Получаем имя пользователя для заголовка
            const { data: userData, error: userError } = await supabase
                .from('user')
                .select('name')
                .eq('id', id)
                .single();

            if (userError) {
                console.error('Error fetching user name:', userError);
                setError('Не удалось найти клиента.');
            } else if (userData) {
                setUserName(userData.name);
            }

            // 2. Получаем заказы клиента, подтягивая имя из таблицы user
            const { data: ordersData, error: ordersError } = await supabase
                .from('card')
                .select(`
                    *,
                    user:user_id ( name )
                `)
                .eq('user_id', id)
                .order('purchase_date', { ascending: false }); // Сортируем по дате

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
                setError('Не удалось загрузить заказы клиента.');
            } else if (ordersData) {
                setOrders(ordersData as Order[]);
            }
            
            setLoading(false);
        };

        fetchUserData();
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
                            <th className="py-2 px-4 border-b font-semibold">Имя получателя</th>
                            <th className="py-2 px-4 border-b font-semibold">Имя клиента</th>
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
                                <td className="py-2 px-4 border-b">{order.user ? order.user.name : 'N/A'}</td>
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
