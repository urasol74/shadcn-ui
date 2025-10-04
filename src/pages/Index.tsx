import React from 'react';
import ProductCardIndex from '@/components/ProductCardIndex';
import CatalogImageIndex from '@/components/CatalogImageIndex';
import InfoSection from '@/components/InfoSection';

const BenettonHomePage = () => {
  return (
    <div className="bg-gray-50 font-sans text-gray-800">
      <main className="container mx-auto px-4">
        <CatalogImageIndex />
        <ProductCardIndex />
        <InfoSection />
      </main>
    </div>
  );
};

export default BenettonHomePage;
