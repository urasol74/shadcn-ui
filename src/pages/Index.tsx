import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
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

const BenettonHomePage = () => {
  const brandColors = {
    primaryGreen: '#00A03E',
    darkGreen: '#004C22',
    accentPink: '#E5004F',
    textPrimary: '#1F1F1F',
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
          .select('id, name, article, gender, season, image, category_id, variants!inner(purchase_price, stock)')
          .eq('gender', gender)
          .not('image', 'is', null)
          .neq('image', '')
          .not('image', 'ilike', '%placeholder%')
          .gt('variants.stock', 0)
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
    <div className="bg-white font-sans text-gray-800">
      <Header />

      <main>
        <section className="relative h-[70vh] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              <span className="block">Benetton</span>
              <span className="block">Раскрась свой мир</span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg">Откройте новую коллекцию, с разнообразием и ярким самовыражением!</p>
            <Link to="/gender/жiн/season/all">
                <button
                className="transform rounded-full px-12 py-3 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-105"
                style={{ backgroundColor: brandColors.primaryGreen }}
                >
                Каталог магазина
                </button>
            </Link>
          </div>
        </section>

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
                <div className="text-center py-8 text-gray-500">Не удалось загрузить товары.</div>
            )}
          </div>
        </section>
        
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
            <div className="order-2 md:order-1">
                <h2 className="mb-4 text-3xl font-bold" style={{ color: brandColors.darkGreen }}>История цвета</h2>
                <p className="mb-6 text-gray-600">
                    С 1965 года United Colors of Benetton создает историю стиля, выходящую за рамки границ. Наша идентичность построена на ярких цветах, аутентичной моде и стремлении к лучшему будущему.
                </p>
                <a href="#" className="font-bold uppercase tracking-wider" style={{ color: brandColors.primaryGreen }}>
                    Узнать больше &rarr;
                </a>
            </div>
            <div className="order-1 h-80 w-full overflow-hidden rounded-lg shadow-xl md:order-2">
                 <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1887&auto=format&fit=crop" alt="Модель позирует в одежде Benetton" className="h-full w-full object-cover" />
            </div>
        </section>

      </main>

      <footer className="py-16" style={{ backgroundColor: brandColors.darkGreen }}>
        <div className="container mx-auto px-6 text-center text-white">
          <p className="mb-4 text-xl font-bold">UNITED COLORS OF BENETTON.</p>
          <div className="mb-6 flex justify-center space-x-6">
            <a href="#" className="hover:underline">Instagram</a>
            <a href="#" className="hover:underline">Facebook</a>
            <a href="#" className="hover:underline">Twitter</a>
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Benetton Group S.r.l. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default BenettonHomePage;
