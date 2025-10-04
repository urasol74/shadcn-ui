import React from 'react';
import Header from '@/components/Header';
import ProductCardIndex from '@/components/ProductCardIndex';
import CatalogImageIndex from '@/components/CatalogImageIndex';
import InfoSection from '@/components/InfoSection'; 
import Footer from '@/components/Footer';

const BenettonHomePage = () => {
  return (
    <div className="bg-gray-50 font-sans text-gray-800">
      <Header />

      <main className="container mx-auto px-4">
        <CatalogImageIndex />
        <ProductCardIndex />
        <InfoSection />
      </main>

      <Footer />
    </div>
  );
};

export default BenettonHomePage;
