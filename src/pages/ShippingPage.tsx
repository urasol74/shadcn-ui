import React from 'react';
import Header from '@/components/Header';

const ShippingPage = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Доставка</h1>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Сроки доставки</h2>
          <p>Доставка по вашему городу осуществляется в течение 1-2 рабочих дней.</p>
          <p>Доставка по стране занимает от 3 до 7 рабочих дней.</p>
          <h2 className="text-2xl font-semibold mt-6">Стоимость доставки</h2>
          <p>Стоимость доставки рассчитывается индивидуально в зависимости от вашего местоположения и веса посылки.</p>
        </div>
      </div>
    </>
  );
};

export default ShippingPage;
