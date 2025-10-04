import { useState, useEffect, Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Интерфейсы для данных
interface Variant {
  id: number; product_id: number; size: string; color: string; barcode: string; stock: number;
  purchase_price: number; sale_price: number; new_price: number; total_price: number; discount: number;
}
interface Category { id: number; name: string; }
interface Product {
  id: number; article: string; name: string; category_id: number; brand: string; season: string;
  gender: string; image: string; variants: Variant[];
  category_name?: string; // Название категории, добавляется программно
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Состояние для поисковых запросов
  const [filters, setFilters] = useState({
    article: '',
    category_name: '',
    gender: '',
    season: ''
  });

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('id, name');
        if (categoriesError) throw categoriesError;
        const categoriesMap = new Map(categoriesData.map(cat => [cat.id, cat.name]));

        const { data: productsData, error: productsError } = await supabase.from('products').select(`*, variants(*)`).order('article', { ascending: true });
        if (productsError) throw productsError;

        const combinedData = productsData.map(product => ({
          ...product,
          category_name: categoriesMap.get(product.category_id) || 'N/A',
        }));
        setProducts(combinedData as Product[]);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(`Не удалось загрузить данные. Ошибка: ${error.message}`);
      }
      setLoading(false);
    };
    fetchProductsAndCategories();
  }, []);

  // Обработчик для обновления фильтров
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Фильтрация товаров на стороне клиента
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const articleMatch = product.article.toLowerCase().includes(filters.article.toLowerCase());
      const categoryMatch = (product.category_name || '').toLowerCase().includes(filters.category_name.toLowerCase());
      const genderMatch = product.gender.toLowerCase().includes(filters.gender.toLowerCase());
      const seasonMatch = product.season.toLowerCase().includes(filters.season.toLowerCase());
      return articleMatch && categoryMatch && genderMatch && seasonMatch;
    });
  }, [products, filters]);

  const renderContent = () => {
    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm text-left border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            {/* Заголовки колонок */}
            <tr>
              <th className="py-2 px-3 border font-semibold">Артикул</th>
              <th className="py-2 px-3 border font-semibold">Категория</th>
              <th className="py-2 px-3 border font-semibold">Пол</th>
              <th className="py-2 px-3 border font-semibold">Сезон</th>
              <th className="py-2 px-3 border font-semibold">Цвет</th>
              <th className="py-2 px-3 border font-semibold">Размер</th>
              <th className="py-2 px-3 border font-semibold">Цена продажи</th>
              <th className="py-2 px-3 border font-semibold">Цена закупки</th>
              <th className="py-2 px-3 border font-semibold">Остаток</th>
              <th className="py-2 px-3 border font-semibold">Штрихкод</th>
            </tr>
            {/* Поля для фильтрации */}
            <tr>
              <td className="p-1 border bg-gray-100"><input type="text" placeholder="Поиск..." name="article" value={filters.article} onChange={handleFilterChange} className="w-full px-2 py-1 border rounded-md shadow-sm" /></td>
              <td className="p-1 border bg-gray-100"><input type="text" placeholder="Поиск..." name="category_name" value={filters.category_name} onChange={handleFilterChange} className="w-full px-2 py-1 border rounded-md shadow-sm" /></td>
              <td className="p-1 border bg-gray-100"><input type="text" placeholder="Поиск..." name="gender" value={filters.gender} onChange={handleFilterChange} className="w-full px-2 py-1 border rounded-md shadow-sm" /></td>
              <td className="p-1 border bg-gray-100"><input type="text" placeholder="Поиск..." name="season" value={filters.season} onChange={handleFilterChange} className="w-full px-2 py-1 border rounded-md shadow-sm" /></td>
              <td colSpan={6} className="p-1 border bg-gray-100"></td>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 && !loading ? (
                <tr><td colSpan={10} className="text-center py-4">Товары не найдены</td></tr>
            ) : (
                filteredProducts.map((product) => (
                    <Fragment key={product.id}>
                        <tr className="bg-gray-200 font-semibold">
                        <td className="py-2 px-3 border">{product.article}</td>
                        <td className="py-2 px-3 border">{product.category_name}</td>
                        <td className="py-2 px-3 border">{product.gender}</td>
                        <td className="py-2 px-3 border">{product.season}</td>
                        <td className="py-2 px-3 border" colSpan={6}></td>
                        </tr>
                        {product.variants && product.variants.length > 0 ? (
                        product.variants.map((variant) => (
                            <tr key={variant.id} className="hover:bg-gray-50">
                            <td className="py-1 px-3 border" colSpan={4}></td>
                            <td className="py-1 px-3 border">{variant.color}</td>
                            <td className="py-1 px-3 border">{variant.size}</td>
                            <td className="py-1 px-3 border">{variant.sale_price}</td>
                            <td className="py-1 px-3 border">{variant.purchase_price}</td>
                            <td className="py-1 px-3 border">{variant.stock}</td>
                            <td className="py-1 px-3 border">{variant.barcode}</td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td className="py-1 px-3 border text-center text-gray-500" colSpan={10}>Нет вариантов</td>
                        </tr>
                        )}
                    </Fragment>
                ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex container mx-auto px-4 py-8 space-x-8">
        <aside className="w-1/5 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Меню</h2>
            <nav><ul>
              <li className="mb-2"><Link to="/admin/user" className="block py-2 px-3 rounded hover:bg-gray-100">Клиенты</Link></li>
              <li className="mb-2"><Link to="/admin/quick-orders" className="block py-2 px-3 rounded hover:bg-gray-100">Быстрые заказы</Link></li>
              <li><Link to="/admin/products" className="block py-2 px-3 bg-green-100 text-green-800 rounded font-semibold">Товары</Link></li>
              </ul></nav>
          </div>
        </aside>
        <main className="w-4/5">
          <h1 className="text-3xl font-bold mb-6">Товары</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProductsPage;