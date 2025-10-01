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

  useEffect(() => {
    const fetchHighlightedProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, article, gender, season, image, variants!inner(purchase_price)')
        .eq('season', '2025 осінь-зима')
        .not('image', 'eq', 'placeholder.webp');

      if (error) {
        console.error("Ошибка при загрузке товаров для главной страницы:", error);
        return;
      }

      const productsByGender = new Map<string, HighlightProduct>();
      for (const product of data) {
        if (product.variants && product.variants.length > 0) {
            if (!productsByGender.has(product.gender)) {
                productsByGender.set(product.gender, product as HighlightProduct);
            }
        }
      }
      
      const finalProducts = Array.from(productsByGender.values()).slice(0, 4);
      setHighlightedProducts(finalProducts);
    };

    fetchHighlightedProducts();
  }, []);

  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />

      <main>
        {/* Hero Section - Updated with new content */}
        <section className="relative h-[70vh] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              <span className="block">Benetton</span>
              <span className="block">
                <span className="text-blue-600">Раскрась</span>{" "}
                <span className="text-yellow-400">свой</span>{" "}
                <span className="text-red-600">мир</span>
              </span>
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

        {/* Featured Products Section */}
        <section className="py-20" style={{ backgroundColor: brandColors.backgroundLight }}>
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-3xl font-bold" style={{ color: brandColors.darkGreen }}>
              Каталог магазина
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {highlightedProducts.map((product) => (
                <Link 
                    key={product.id} 
                    to={`/gender/${product.gender}/season/${encodeURIComponent(product.season)}/product/${product.article}`}
                    className="group block overflow-hidden rounded-lg bg-white shadow-lg"
                >
                    <div className="overflow-hidden aspect-w-1 aspect-h-1">
                        <img 
                            src={`${SUPABASE_STORAGE_URL}/${product.image}`}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold truncate" title={product.name}>{product.name}</h3>
                        <p className="mt-2 text-gray-500">{formatPrice(product.variants[0]?.purchase_price ?? 0)}</p>
                    </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
            <div className="order-2 md:order-1">
                <h2 className="mb-4 text-3xl font-bold" style={{ color: brandColors.darkGreen }}>A Story of Color</h2>
                <p className="mb-6 text-gray-600">
                    Since 1965, United Colors of Benetton has woven a narrative of style that transcends borders. Our identity is built on vibrant colors, authentic fashion, and a commitment to a better future.
                </p>
                <a href="#" className="font-bold uppercase tracking-wider" style={{ color: brandColors.primaryGreen }}>
                    Learn More &rarr;
                </a>
            </div>
            <div className="order-1 h-80 w-full overflow-hidden rounded-lg shadow-xl md:order-2">
                 <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1887&auto=format&fit=crop" alt="Model posing in Benetton fashion" className="h-full w-full object-cover" />
            </div>
        </section>

      </main>

    </div>
  );
};

export default BenettonHomePage;
