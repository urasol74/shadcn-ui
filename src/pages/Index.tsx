import React from 'react';
import ProductCardIndex from '@/components/ProductCardIndex';
import CatalogImageIndex from '@/components/CatalogImageIndex';
import InfoSection from '@/components/InfoSection';

const BenettonHomePage = () => {
  return (
    <>
      <CatalogImageIndex />
      <ProductCardIndex />
      <InfoSection />
    </>
  );
};

export default BenettonHomePage;
