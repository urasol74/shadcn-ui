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
        
        const checkImageExists = async (imageUrl: string): Promise<boolean> => {
            try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            return response.ok;
            } catch (error) {
            return false;
            }
        };

        const findProductForGender = async (gender: string) => {
            const { data: candidates, error } = await supabase
            .from('products')
            .select('id, name, article, gender, season, image, category_id, variants!inner(purchase_price, stock, discount)')
            .eq('gender', gender)
            .not('image', 'is', null)
            .neq('image', '')
            .not('image', 'ilike', '%placeholder%')
            .gt('variants.stock', 0)
            .or('discount.is.null,discount.eq.0', { foreignTable: 'variants' }) // Только товары без скидки
            .limit(15);

            if (error || !candidates) {
            console.error(`Ошибка при загрузке кандидатов для ${gender}:`, error);
            return null;
            }

            const shuffledCandidates = candidates.sort(() => 0.5 - Math.random());

            for (const candidate of shuffledCandidates) {
            if (candidate.image) {
                const imageUrl = `${SUPABASE_STORAGE_URL}/${candidate.image}`;
                const exists = await checkImageExists(imageUrl);
                if (exists) {
                return candidate as HighlightProduct;
                }
            }
            }

            return null;
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
                <div className="text-center py-8">Загрузка рекомендуемых товаров...</div>
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
                                src={`${SUPABASE_STORAGE_URL}/${product.image}`}
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
                        <div className="p-6">
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
