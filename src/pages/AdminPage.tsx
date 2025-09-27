import React from 'react';
import Header from '@/components/Header';

const AdminPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>
                {/* В будущем здесь будут выводиться заказы и клиенты */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p>Раздел администрирования находится в разработке.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
