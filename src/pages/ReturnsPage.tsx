import React from 'react';
import Header from '@/components/Header';

const ReturnsPage = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Возврат и обмен</h1>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Условия возврата</h2>
          <p>Вы можете вернуть или обменять товар в течение 14 дней с момента покупки.</p>
          <p>Товар должен иметь первоначальный товарный вид, не иметь следов использования, а также должны быть сохранены все ярлыки и упаковка.</p>
          <h2 className="text-2xl font-semibold mt-6">Процедура возврата</h2>
          <p>1. Свяжитесь с нами для оформления заявки на возврат.</p>
          <p>2. Отправьте товар по адресу, который мы вам сообщим.</p>
          <p>3. После получения и проверки товара мы вернем вам деньги или обменяем на другой товар.</p>
        </div>
      </div>
    </>
  );
};

export default ReturnsPage;
