import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductImage from '@/components/ProductImage';
import { getProductsByGender, getCategories } from '@/lib/database';
import { supabaseApi } from '@/lib/supabase-api';
import { useEffect, useState } from 'react';
import React from 'react';

export default function HomePage() {
  const featuredProducts = [
    ...getProductsByGender('чол').slice(0, 2),
    ...getProductsByGender('жiн').slice(0, 2),
    ...getProductsByGender('хлопч').slice(0, 2),
    ...getProductsByGender('дiвч').slice(0, 2),
  ];

  const [randomProducts, setRandomProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [debugOpen, setDebugOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    // Загружаем рекомендуемые товары из Supabase с распределением по гендерам
    const loadRecommendedProducts = async () => {
      try {
        const products = await supabaseApi.getRecommendedProducts();
        if (isMounted) {
          setRandomProducts(products);
        }
      } catch (error) {
        console.error('Failed to load recommended products from Supabase:', error);
        if (isMounted) {
          setRandomProducts([]);
        }
      }
    };
    
    // Загружаем сезоны из Supabase
    const loadSeasons = async () => {
      try {
        const seasonsData = await supabaseApi.getSeasons();
        const seasonsList = seasonsData.map(item => item.season);
        if (isMounted) {
          setSeasons(seasonsList);
        }
      } catch (error) {
        console.error('Failed to load seasons from Supabase:', error);
        if (isMounted) {
          setSeasons([]);
        }
      }
    };
    
    loadRecommendedProducts();
    loadSeasons();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Фильтрация уникальных товаров по article (максимум 5)
  const uniqueRandomProducts = [];
  const seenArticles = new Set();
  for (const p of randomProducts) {
    if (!seenArticles.has(p.article)) {
      uniqueRandomProducts.push(p);
      seenArticles.add(p.article);
    }
    if (uniqueRandomProducts.length === 5) break;
  }

  // Функции форматирования (такие же как в GenderSeasonPage)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">BENETTON ОДЕССА</h1>
          <p className="text-xl mb-8">Официальный магазин модной одежды</p>
          <p className="text-lg mb-8 opacity-90">Стильная одежда для всей семьи • Новая коллекция 2025</p>
          
          {/* Кнопка для тестирования Supabase */}
          <div className="mb-4">
            <Link to="/supabase-test">
              <Button size="sm" variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                🧪 Тест Supabase API
              </Button>
            </Link>
          </div>
          
          <div className="collections-buttons">
            <Link to="/gender/чол" className="collection-link">
              <Button size="lg" variant="secondary" className="btn-collection">
                Мужская коллекция
              </Button>
            </Link>
            <Link to="/gender/жiн" className="collection-link">
              <Button size="lg" variant="secondary" className="btn-collection">
                Женская коллекция
              </Button>
            </Link>
            <Link to="/gender/хлопч" className="collection-link">
              <Button size="lg" variant="secondary" className="btn-collection">
                Мальчик
              </Button>
            </Link>
            <Link to="/gender/дiвч" className="collection-link">
              <Button size="lg" variant="secondary" className="btn-collection">
                Девочка
              </Button>
            </Link>
          </div>
        </div>
      </section>
{/* Рекламный блок: две вертикали с картинками (left-pic / right-pic) — без заголовка, минимальные отступы, растянут на всю ширину */}
      <section className="py-2">
        <div className="w-full flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 h-40 md:h-64 bg-gray-100 relative overflow-hidden">
            <img src="/static/image/left-pic.jpg" alt="Promo left" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative z-10 p-4 text-white text-center">
              <h3 className="text-lg md:text-xl font-semibold">Коллекция — слева</h3>
              <p className="text-xs md:text-sm opacity-90">Здесь можно разместить рекламный текст или ссылку.</p>
            </div>
          </div>

          <div className="flex-1 h-40 md:h-64 bg-gray-100 relative overflow-hidden">
            <img src="/static/image/right-pic.jpg" alt="Promo right" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 p-4 text-white text-center">
              <h3 className="text-lg md:text-xl font-semibold">Коллекция — справа</h3>
              <p className="text-xs md:text-sm opacity-90">Заглушка для баннера. Замените картинку в /static/image/</p>
            </div>
          </div>
        </div>
      </section>
      

      {/* Рекомендуемые товары */}
      <section className="pt-5 pb-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-5">Рекомендуемые товары</h2>
          <div className="recommended-grid gap-6">
            {uniqueRandomProducts.map((product) => (
              <Card key={product.product_id || product.article} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-32 bg-gray-200 mb-4 flex items-center justify-center rounded overflow-hidden">
                    <ProductImage 
                      product={product} 
                      className="w-full h-32 object-contain" 
                      alt={product.name || product.article}
                    />
                  </div>
                  <Link to={`/category/${product.gender}/${product.category_id}/${product.article}`}>
                    <Button variant="outline" className="mb-3 w-full text-sm">
                      {product.name}
                    </Button>
                  </Link>
                  
                  <div className="space-y-2 text-sm">
                    {(product.purchase_price) && (product.discount) && Number(product.discount) > 0 && (
                      <div className="text-gray-500 line-through">
                        Старая цена: {formatPrice(product.purchase_price)}
                      </div>
                    )}
                    <div className="font-semibold text-lg text-blue-600">
                      Цена: {formatPrice(product.sale_price)}
                    </div>
                    
                    {/* Отображение скидки или "Новая коллекция" */}
                    {(product.discount) ? (
                      Number(product.discount) > 0 ? (
                        <div className="text-red-600 font-medium">
                          Скидка: {formatDiscount(product.discount)}
                        </div>
                      ) : (
                        <div className="text-green-600 font-medium">
                          Новая коллекция
                        </div>
                      )
                    ) : (
                      <div className="text-green-600 font-medium">
                        Новая коллекция
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pt-4 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-5">Категории товаров</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link to="/gender/чол" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Мужская одежда</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gender/жiн" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Женская одежда</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gender/хлопч" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Одежда на мальчика</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gender/дiвч" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Одежда на девочку</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BENETTON ОДЕССА</h3>
              <p className="text-gray-300">Официальный магазин модной одежды в Одессе</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <p className="text-gray-300">г. Одесса</p>
              <p className="text-gray-300">Украина</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Коллекции</h4>
              <div className="space-y-2 text-gray-300">
                <Link to="/gender/чол" className="block hover:text-white">Мужская</Link>
                <Link to="/gender/жiн" className="block hover:text-white">Женская</Link>
                <Link to="/gender/хлопч" className="block hover:text-white">Детская</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Benetton Одесса. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Mobile debug floating button */}
      <div className="md:hidden fixed right-4 bottom-4 z-50">
        <button
          onClick={() => setDebugOpen(!debugOpen)}
          className="bg-white border rounded-full p-3 shadow-lg"
          aria-label="Debug"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
          </svg>
        </button>
      </div>

      {debugOpen && (
        <div className="md:hidden fixed left-4 right-4 bottom-20 z-50 bg-white border rounded-lg p-4 shadow-lg max-h-60 overflow-auto">
          <h3 className="font-semibold mb-2">Debug: seasons / featured</h3>
          <div className="text-xs text-gray-700">
            <div className="mb-2">Seasons: {seasons.length}</div>
            <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(seasons, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}