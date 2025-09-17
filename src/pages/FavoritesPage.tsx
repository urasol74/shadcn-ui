import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Загружаем избранные товары из localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        console.log('Избранные товары из localStorage:', parsedFavorites);
        setFavorites(parsedFavorites);
      } catch (e) {
        console.error('Error parsing favorites', e);
        setFavorites([]);
      }
    }
  }, []);

  const removeFromFavorites = (article) => {
    const updatedFavorites = favorites.filter(item => item.article !== article);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Функция форматирования цены (такая же как в других компонентах)
  const formatPrice = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    
    // Handle database format where comma is thousands separator (e.g., "2,109")
    let priceStr = String(v).replace(/\s+/g, '');
    
    // If string contains comma, treat it as thousands separator
    if (priceStr.includes(',')) {
      // Remove comma and parse as integer (2,109 -> 2109)
      priceStr = priceStr.replace(/,/g, '');
    }
    
    const n = Number(priceStr);
    if (Number.isNaN(n)) return String(v);
    
    // Manual formatting to ensure correct display
    // Format with space as thousands separator and always show ,0
    let formatted = n.toString();
    
    // Add space thousands separator for numbers >= 1000
    if (n >= 1000) {
      formatted = n.toLocaleString('ru-RU');
    }
    
    // Always add ,0 at the end
    formatted += ',0';
    
    return formatted + ' грн';
  };

  const formatDiscount = (d: any) => {
    if (d === null || d === undefined || d === '') return '-';
    const n = Number(String(d).replace(',', '.'));
    if (Number.isNaN(n)) return String(d);
    return `${n}%`;
  };

  // Функция для получения правильного URL товара
  const getProductUrl = (product) => {
    // Если у товара есть данные о поле, сезоне и категории, используем их
    if (product.gender && product.season && product.category_id) {
      return `/gender/${product.gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`;
    }
    // Иначе используем общий путь
    return `/product/${product.article}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Избранное</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">♡</div>
            <h3 className="text-xl font-semibold mb-2">Список избранного пуст</h3>
            <p className="text-gray-600 mb-6">Добавьте товары в избранное, чтобы они отображались здесь</p>
            <Link to="/">
              <Button>Перейти к покупкам</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map((product) => {
              console.log('Отображение товара:', product);
              const productUrl = getProductUrl(product);
              return (
                <Card 
                  key={product.article} 
                  className="hover:shadow-lg transition-shadow cursor-pointer relative"
                  onClick={() => navigate(productUrl)}
                >
                  <CardContent className="p-4">
                    <div className="h-48 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                      <img 
                        src={product.image ? `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${product.image}` : "https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp"}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          currentTarget.src = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp';
                        }}
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="space-y-1">
                      {product.discount && Number(product.discount) > 0 ? (
                        <div className="text-gray-500 line-through text-sm">
                          {formatPrice(product.purchase_price)}
                        </div>
                      ) : (
                        <div className="invisible text-gray-500 line-through text-sm" style={{ height: '1.25rem' }}>
                          {formatPrice(product.purchase_price)}
                        </div>
                      )}
                      <div className="font-semibold text-blue-600">
                        {formatPrice(product.sale_price || product.purchase_price)}
                      </div>
                      {product.discount && Number(product.discount) > 0 ? (
                        <div className="text-red-600 text-sm">
                          Скидка: {formatDiscount(product.discount)}
                        </div>
                      ) : (
                        <div className="text-green-600 text-sm">
                          Новая коллекция
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(productUrl);
                      }}
                    >
                      Подробнее
                    </Button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromFavorites(product.article);
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1"
                    >
                      <span className="text-lg">❤️</span>
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;