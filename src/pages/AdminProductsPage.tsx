import { useState, useEffect, Fragment } from 'react';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Интерфейсы для данных
interface Variant {
  id: number; product_id: number; size: string; color: string; barcode: string; stock: number;
  purchase_price: number; sale_price: number; new_price: number; total_price: number; discount: number;
}
interface Category { id: number; name: string; name_rus: string; }
interface Product {
  id: number; article: string; name: string; category_id: number; brand: string; season: string;
  gender: string; image: string; variants: Variant[];
  category_name?: string; // Поле для названия категории, добавляется программно
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Загружаем все категории, используя только поле 'name'
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name');

        if (categoriesError) throw categoriesError;

        // Создаем карту: { category_id: category_name }
        const categoriesMap = new Map(categoriesData.map(cat => [cat.id, cat.name]));

        // 2. Загружаем все товары с их вариантами
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`*, variants(*)`)
          .order('article', { ascending: true });

        if (productsError) throw productsError;

        // 3. Объединяем данные: добавляем имя категории к каждому продукту
        const combinedData = productsData.map(product => ({
          ...product,
          // Используем карту для поиска названия по ID. Если не найдено, показываем 'N/A'
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

  const renderContent = () => {
    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!products || products.length === 0) return <p>В базе данных нет товаров.</p>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm text-left border-collapse">
          <thead className="bg-gray-100 sticky top-0">
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
          </thead>
          <tbody>
            {products.map((product) => (
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
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex container mx-auto px-4 py-8 space-x-8">
        <aside className="w-1/5 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Меню</h2>
            <nav><ul><li className="mb-2"><Link to="/admin/user" className="block py-2 px-3 rounded hover:bg-gray-100">Клиенты</Link></li><li className="mb-2"><Link to="/admin/products" className="block py-2 px-3 bg-green-100 text-green-800 rounded font-semibold">Товары</Link></li><li><Link to="/admin/quick-orders" className="block py-2 px-3 rounded hover:bg-gray-100">Быстрые заказы</Link></li></ul></nav>
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
