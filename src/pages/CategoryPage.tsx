import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import ProductImage from '@/components/ProductImage';
import { ProductFilter } from '@/components/ProductFilter';
import { useProductFilters } from '@/hooks/useProductFilters';
import { supabaseApi } from '@/lib/supabase-api';

export default function CategoryPage() {
  const { gender, categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Используем хук для фильтров
  const {
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    loading: filtersLoading,
    filteredProducts,
    applyFilters,
    resetFilters
  } = useProductFilters({ 
    selectedGender: gender || 'чол',
    onFilteredProductsChange: (filteredProducts) => {
      // Применяем дополнительный фильтр по категории
      if (categoryId) {
        const categoryFiltered = filteredProducts.filter(p => 
          String(p.category_id) === String(categoryId)
        )
        setProducts(categoryFiltered)
      } else {
        setProducts(filteredProducts)
      }
    }
  });



  // Оригинальная загрузка продуктов (оставляем как fallback)
  useEffect(() => {
    if (!gender || !categoryId) return;
    
    // При первом запуске устанавливаем категорию в фильтре
    if (categoryId && !selectedCategories.includes(Number(categoryId))) {
      setSelectedCategories([Number(categoryId)])
    }
    
    setLoading(true);
    
    // Используем Supabase API
    supabaseApi.getProducts(gender, categoryId)
      .then(data => {
        const incoming = Array.isArray(data) ? data : [];
        setProducts(prev => {
          const enriched = incoming.map(item => {
            const key = item.product_id ?? item.id ?? item.article;
            const existing = Array.isArray(prev) ? prev.find(p => (p.product_id ?? p.id ?? p.article) === key) : undefined;
            return existing ? { ...existing, ...item } : item;
          });
          return enriched;
        });
      })
      .catch(error => {
        console.error('Failed to load products:', error)
        // Fallback к старому API
        fetch(`http://178.212.198.23:3001/api/products?gender=${encodeURIComponent(gender)}&categoryId=${encodeURIComponent(categoryId)}`)
          .then(res => res.json())
          .then(data => {
            const incoming = Array.isArray(data) ? data : [];
            setProducts(prev => {
              const enriched = incoming.map(item => {
                const key = item.product_id ?? item.id ?? item.article;
                const existing = Array.isArray(prev) ? prev.find(p => (p.product_id ?? p.id ?? p.article) === key) : undefined;
                return existing ? { ...existing, ...item } : item;
              });
              return enriched;
            });
          })
          .catch(err => console.error('Fallback API also failed:', err))
      })
      .finally(() => setLoading(false));
  }, [gender, categoryId]);

  const formatPrice = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    const n = Number(String(v).replace(/\s+/g, '').replace(',', '.'));
    if (Number.isNaN(n)) return String(v);
    return n.toLocaleString('ru-RU');
  };

  const formatDiscount = (d: any) => {
    if (d === null || d === undefined || d === '') return '-';
    const n = Number(String(d).replace(',', '.'));
    if (Number.isNaN(n)) return String(d);
    return `${n}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Мобильная кнопка фильтров */}
        <div className="lg:hidden mb-4">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="w-full"
          >
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Левый сайдбар - фильтры */}
          <div className={`${
            showFilters ? 'block' : 'hidden'
          } lg:block w-full lg:w-80 mb-6 lg:mb-0`}>
            <ProductFilter
              selectedGender={gender || 'чол'}
              selectedCategories={selectedCategories}
              priceRange={priceRange}
              inStockOnly={inStockOnly}
              onCategoriesChange={setSelectedCategories}
              onPriceRangeChange={setPriceRange}
              onInStockChange={setInStockOnly}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
              loading={filtersLoading}
            />
          </div>

          {/* Правая область - продукты */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-8 text-center">Товары категории</h1>
            
            {/* Количество найденных товаров */}
            {!loading && (
              <div className="mb-4 text-sm text-gray-600">
                Найдено товаров: {products.length}
              </div>
            )}
            
            {loading ? (
              <div className="text-center">Загрузка...</div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-500">Нет товаров в этой категории.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Card key={product.article || product.product_id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-full h-48 bg-gray-100 mb-4 flex items-center justify-center rounded overflow-hidden">
                        <ProductImage 
                          product={product} 
                          className="w-full h-full object-contain" 
                          alt={product.name} 
                        />
                      </div>
                      <Link to={`/category/${gender}/${categoryId}/${encodeURIComponent(product.article)}`}>
                        <Button variant="outline" className="mb-3 w-full text-sm">
                          {product.name}
                        </Button>
                      </Link>
                      
                      <div className="space-y-1 text-sm">
                        {product.purchase_price && (
                          <div className="text-gray-500">
                            Старая цена: {formatPrice(product.purchase_price)}
                          </div>
                        )}
                        <div className="font-semibold text-blue-600">
                          Цена: {formatPrice(product.sale_price || product.price || product.new_price)}
                        </div>
                        {product.discount && Number(product.discount) > 0 && (
                          <div className="text-red-600 font-medium">
                            Скидка: {formatDiscount(product.discount)}
                          </div>
                        )}
                        {product.stock !== undefined && (
                          <div className={`text-xs ${
                            product.in_stock ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}