import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseQueryTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testQuery = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Выполняем тестовый запрос к Supabase...');
        
        // Тестовый запрос к таблице products
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            article,
            name,
            gender,
            season,
            image,
            variants!inner(purchase_price, sale_price, discount, stock)
          `)
          .ilike('gender', 'чол')
          .gt('variants.stock', 0)
          .limit(5);

        if (error) {
          console.error('Ошибка запроса:', error);
          setError(error.message);
          setResult(null);
        } else {
          console.log('Результат запроса:', data);
          setResult(data);
        }
      } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    testQuery();
  }, []);

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Тест запроса к Supabase</h2>
      
      {loading && <div>Загрузка...</div>}
      
      {error && (
        <div className="p-2 bg-red-100 text-red-800 rounded">
          <strong>Ошибка:</strong> {error}
        </div>
      )}
      
      {result && (
        <div>
          <div className="mb-2">Найдено товаров: {result.length}</div>
          <div className="space-y-2">
            {result.map((product: any) => (
              <div key={product.id} className="p-2 bg-white border rounded">
                <div><strong>ID:</strong> {product.id}</div>
                <div><strong>Артикул:</strong> {product.article}</div>
                <div><strong>Название:</strong> {product.name}</div>
                <div><strong>Пол:</strong> {product.gender}</div>
                <div><strong>Сезон:</strong> {product.season}</div>
                <div><strong>Варианты:</strong> {product.variants?.length || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}