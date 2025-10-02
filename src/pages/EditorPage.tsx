import React from 'react';
import Header from '@/components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Импортируем иконку

const EditorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex container mx-auto px-4 py-8 space-x-8">
        <aside className="w-1/5 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <button 
              onClick={() => navigate('/admin')} 
              className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к меню
            </button>
            <h2 className="text-xl font-bold mb-4">Страницы</h2>
            <nav>
              <ul>
                <li className="mb-2">
                  <Link to="/admin/editor/contacts" className="block py-2 px-3 rounded hover:bg-gray-100">
                    Контакты
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/admin/editor/shipping" className="block py-2 px-3 rounded hover:bg-gray-100">
                    Доставка
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/admin/editor/returns" className="block py-2 px-3 rounded hover:bg-gray-100">
                    Возвраты
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <main className="w-4/5">
          <h1 className="text-3xl font-bold mb-6">Редактор страниц</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">
              Выберите страницу слева, чтобы начать редактирование её содержимого.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditorPage;
