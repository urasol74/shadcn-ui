import React from 'react';
import Header from '@/components/Header';
import ProductCardIndex from '@/components/ProductCardIndex';
import CatalogImageIndex from '@/components/CatalogImageIndex';
import InfoSection from '@/components/InfoSection'; // Импортируем новый компонент

const BenettonHomePage = () => {
  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />

      <main>
        {/* Hero Section */}
        <CatalogImageIndex />

        {/* Featured Products Section */}
        <ProductCardIndex />
        
        {/* About Section */}
        <InfoSection />

      </main>

    </div>
  );
};

export default BenettonHomePage;
