import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/priceUtils';

const SUPABASE_STORAGE_URL = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site';

interface HighlightProduct {
  id: number;
  name: string;
  article: string;
  gender: string;
  season: string;
  image: string;
  category_id: number;
  variants: {
    purchase_price: number;
  }[];
}

// Утилита для безопасного формирования URL
const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    const sanitizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${SUPABASE_STORAGE_URL}/${sanitizedPath}`;
};

const ProductCardIndex = () => {
    const brandColors = {
        darkGreen: '#004C22',
        backgroundLight: '#F5F5F5',
    };

    const [highlightedProducts, setHighlightedProducts] = useState<HighlightProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHighlightedProducts = async () => {
            setLoading(true);
            const genders = ['чол', 'жiн', 'хлопч', 'дiвч'];

            const findProductForGender = async (gender: string) => {
                const { data: candidates, error } = await supabase
                    .from('products')
                    .select('id, name, article, gender, season, image, category_id, variants!inner(purchase_price, stock, discount)')
                    .eq('gender', gender)
                    .not('image', 'is', null)
                    .neq('image', '')
                    .not('image', 'ilike', '%placeholder%')
                    .gt('variants.stock', 0)
                    .or('discount.is.null,discount.eq.0', { foreignTable: 'variants' })
                    .limit(15);

                if (error || !candidates || candidates.length === 0) {
                    console.error(`Ошибка или нет кандидатов для ${gender}:`, error);
                    return null;
                }

                // Создаем массив промисов для ПАРАЛЛЕЛЬНОЙ проверки изображений
                const checkPromises = candidates.map(candidate => 
                    new Promise<HighlightProduct>(async (resolve, reject) => {
                        if (!candidate.image) return reject();

                        const imageUrl = getImageUrl(candidate.image);
                        try {
                            const response = await fetch(imageUrl, { method: 'HEAD', cache: 'no-store' });
                            if (response.ok) {
                                resolve(candidate as HighlightProduct);
                            } else {
                                reject();
                            }
                        } catch (e) {
                            reject();
                        }
                    })
                );

                try {
                    // Promise.any ждет выполнения САМОГО ПЕРВОГО успешного промиса
                    const firstValidProduct = await Promise.any(checkPromises);
                    return firstValidProduct;
                } catch (e) {
                    // Этот блок выполнится, если ВСЕ промисы были отклонены
                    console.warn(`Для категории '${gender}' не найдено ни одного товара с валидной картинкой.`);
                    return null;
                }
            };

            const productPromises = genders.map(findProductForGender);
            const results = await Promise.all(productPromises);
            const validProducts = results.filter((p): p is HighlightProduct => p !== null);

            setHighlightedProducts(validProducts);
            setLoading(false);
        };

        fetchHighlightedProducts();
    }, []);

    return (
        <section className="py-20" style={{ backgroundColor: brandColors.backgroundLight }}>
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-3xl font-bold" style={{ color: brandColors.darkGreen }}>
              Лучшее сегодня - новая коллекция!
            </h2>
            {loading ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="group block overflow-hidden rounded-lg bg-white shadow-lg">
                          <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200 animate-pulse"></div>
                          <div className="p-6 min-h-[8rem]">
                            <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse"></div>
                            <div className="mt-4 h-4 w-1/4 rounded bg-gray-200 animate-pulse"></div>
                          </div>
                        </div>
                    ))}
                </div>
            ) : highlightedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {highlightedProducts.map((product) => (
                    <Link 
                        key={product.id} 
                        to={`/gender/${product.gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`}
                        className="group block overflow-hidden rounded-lg bg-white shadow-lg"
                    >
                        <div className="overflow-hidden aspect-w-1 aspect-h-1">
                            <img 
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                width="400"
                                height="400"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; 
                                    currentTarget.src = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp';
                                }}
                            />
                        </div>
                        <div className="p-6 min-h-[8rem]">
                            <h3 className="text-lg font-semibold truncate" title={product.name}>{product.name}</h3>
                            <p className="mt-2 text-gray-500">{formatPrice(product.variants[0]?.purchase_price ?? 0)}</p>
                        </div>
                    </Link>
                ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">Не удалось загрузить товары из новой коллекции.</div>
            )}
          </div>
        </section>
    );
};

export default ProductCardIndex;
