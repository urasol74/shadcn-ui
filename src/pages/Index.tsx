import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import ProductCardIndex from '@/components/ProductCardIndex'; // Импортируем новый компонент

const BenettonHomePage = () => {
  const brandColors = {
    primaryGreen: '#00A03E',
    darkGreen: '#004C22',
    accentPink: '#E5004F',
    textPrimary: '#1F1F1F',
    backgroundLight: '#F5F5F5',
  };

  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />

      <main>
        <section className="relative h-[70vh] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/image/photo-index-1.avif')" }}>
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

        {/* Вставляем наш новый, чистый компонент */}
        <ProductCardIndex />
        
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
