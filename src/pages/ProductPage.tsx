import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import ProductImage from '@/components/ProductImage';
import { supabaseApi } from '@/lib/supabase-api';

const ProductPage = () => {
  const navigate = useNavigate();
  const { article } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!article) return;
    
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await supabaseApi.getProduct(article);
        
        if (data && data.product) {
          setProduct(data.product);
          setVariants(Array.isArray(data.variants) ? data.variants : []);
        } else {
          setProduct(null);
          setVariants([]);
        }
      } catch (error) {
        console.error('Product fetch error from Supabase:', error);
        setProduct(null);
        setVariants([]);
      }
      setLoading(false);
    };
    
    loadProduct();
  }, [article]);

  // Группировка вариантов по color
  const colorMap = {};
  variants.forEach(v => {
    // only include sizes with positive stock so users don't see unavailable sizes
    const stockNum = Number(v.stock) || 0;
    if (stockNum <= 0) return;
    if (!colorMap[v.color]) colorMap[v.color] = [];
    colorMap[v.color].push(v.size);
  });

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }
  if (!product) {
    return <div className="text-center text-gray-500">Товар не найден.</div>;
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

  const totalStock = variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
  const available = totalStock > 0;

  // colorMap уже содержит sizes, но сделаем безопасную копию и отсортируем размеры
  const colorKeys = Object.keys(colorMap);

  // Если в product нет цен — берём из первого варианта (variant) где есть цена
  const variantWithPrice = variants.find(v => v.sale_price != null || v.purchase_price != null || v.discount != null) || variants[0] || null;
  const displayPurchase = product.purchase_price ?? variantWithPrice?.purchase_price ?? '-';
  const displaySale = product.sale_price ?? variantWithPrice?.sale_price ?? '-';
  const displayDiscount = (product.discount ?? variantWithPrice?.discount);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 flex items-center gap-3">
          <Button onClick={() => navigate(-1)} variant="ghost">← Назад</Button>
          <Link to="/"><Button variant="outline">Домой</Button></Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Левый блок: место для большого изображения */}
          <div className="lg:col-span-7">
            <Card>
              <CardContent className="p-4 bg-white">
                <ProductImage 
                  product={product}
                  variant="gallery"
                  showThumbnails={true}
                  maxImages={8}
                  className="w-full h-[320px] md:h-[560px] object-contain"
                  alt={product?.name || 'product'}
                  onImageLoad={() => setImageLoaded(true)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Правый блок: мета-информация */}
          <div className="lg:col-span-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold leading-tight">{product.name}</h1>
                    <div className="text-sm text-gray-500 mt-1">Артикул: {product.article}</div>
                  </div>
                  {/* Иконки (плейсхолдеры) */}
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-lg">♡</span>
                    <span className="text-gray-400 text-lg">🛒</span>
                  </div>
                </div>

                {/* Цена и скидка */}
                <div className="mt-6">
                  <div className="space-y-2">
                    {/* Старая цена (purchase_price) - только если есть скидка */}
                    {(displayPurchase !== '-') && Number(displayDiscount) > 0 && (
                      <div className="text-gray-500 line-through text-lg font-semibold">
                        Старая цена: {formatPrice(displayPurchase)}
                      </div>
                    )}
                    
                    {/* Основная цена */}
                    <div className="font-semibold text-2xl text-blue-600">
                      Цена: {formatPrice(displaySale)}
                    </div>
                    
                    {/* Отображение скидки или "Новая коллекция" */}
                    {displayDiscount !== null && displayDiscount !== undefined && displayDiscount !== '' ? (
                      Number(displayDiscount) > 0 ? (
                        <div className="text-red-600 font-medium">
                          Скидка: {formatDiscount(displayDiscount)}
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

                  {/* Статус наличия */}
                  <div className="mt-4 text-sm text-green-600">{available ? 'В наличии' : 'Нет в наличии'}</div>
                </div>

                {/* Цвета и размеры */}
                <div className="mt-6">
                  <div className="font-medium mb-2">Цвета и размеры</div>
                  {colorKeys.length === 0 ? (
                    <div className="text-sm text-gray-500">Варианты отсутствуют</div>
                  ) : (
                    <div className="space-y-3">
                      {colorKeys.map(color => (
                        <div key={color} className="flex items-start gap-4">
                          <div className="min-w-[72px] font-medium">{color}</div>
                          <div className="flex-1 text-sm text-gray-700">
                            {Array.from(new Set(colorMap[color])).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Кнопки (заглушены) */}
                <div className="mt-6 flex gap-3">
                  <Button disabled className="flex-1">Купить</Button>
                  <Button disabled variant="outline" className="flex-1">Заказать быстро</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;