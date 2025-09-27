import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase'; // Импортируем клиент Supabase

// Определяем тип для пользователя, чтобы TypeScript понимал структуру данных
interface User {
  id: number;
  name: string;
  tel: string;
  sale: number;
  password?: string; // Пароль может отсутствовать или быть приватным
}

const AdminPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            
            // Запрашиваем всех пользователей из таблицы 'user'
            const { data, error } = await supabase
                .from('user')
                .select('id, name, tel, sale, password');

            if (error) {
                console.error('Error fetching users:', error);
                setError('Не удалось загрузить список клиентов. Проверьте консоль для подробностей.');
            } else if (data) {
                setUsers(data);
            }

            setLoading(false);
        };

        fetchUsers();
    }, []);

    // Функция для рендера контента в зависимости от состояния
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
                            <tr key={user.id} className="hover:bg-gray-50">
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
                {/* Боковое меню */}
                <aside className="w-1/5 flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Меню</h2>
                        <nav>
                            <ul>
                                <li>
                                    {/* Активная вкладка */}
                                    <a href="/admin" className="block py-2 px-3 bg-green-100 text-green-800 rounded font-semibold">
                                        Клиенты
                                    </a>
                                </li>
                                {/* Здесь можно будет добавить другие пункты меню */}
                            </ul>
                        </nav>
                    </div>
                </aside>

                {/* Основной контент */}
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
