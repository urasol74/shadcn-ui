import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

// Определяем тип для пользователя
interface User {
  id: number;
  name: string;
  tel: string;
  sale: number;
  password?: string;
}

const AdminPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            
            const { data, error } = await supabase
                .from('user')
                .select('id, name, tel, sale, password');

            if (error) {
                console.error('Error fetching users:', error);
                setError('Не удалось загрузить список клиентов.');
            } else if (data) {
                setUsers(data);
            }

            setLoading(false);
        };

        fetchUsers();
    }, []);

    const handleRowClick = (userId: number) => {
        navigate(`/admin/user/${userId}`);
    };

    const renderContent = () => {
        if (loading) {
            return <p>Загрузка клиентов...</p>;
        }

        if (error) {
            return <p className="text-red-500">{error}</p>;
        }

        if (users.length === 0) {
            return <p>В базе данных нет ни одного клиента.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b font-semibold">ID</th>
                            <th className="py-2 px-4 border-b font-semibold">Name</th>
                            <th className="py-2 px-4 border-b font-semibold">Tel</th>
                            <th className="py-2 px-4 border-b font-semibold">Sale</th>
                            <th className="py-2 px-4 border-b font-semibold">Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr 
                                key={user.id} 
                                className="hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleRowClick(user.id)}
                            >
                                <td className="py-2 px-4 border-b">{user.id}</td>
                                <td className="py-2 px-4 border-b">{user.name}</td>
                                <td className="py-2 px-4 border-b">{user.tel}</td>
                                <td className="py-2 px-4 border-b">{user.sale}</td>
                                <td className="py-2 px-4 border-b">{user.password}</td>
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
                                    <Link to="/admin/user" className="block py-2 px-3 bg-green-100 text-green-800 rounded font-semibold">
                                        Клиенты
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/admin/quick-orders" className="block py-2 px-3 rounded hover:bg-gray-100">
                                        Быстрые заказы
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/products" className="block py-2 px-3 rounded hover:bg-gray-100">
                                        Товары
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </aside>

                <main className="w-4/5">
                     <h1 className="text-3xl font-bold mb-6">Клиенты</h1>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                       {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminPage;