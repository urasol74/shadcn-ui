import React from 'react';
import Header from '@/components/Header';

const ContactsPage = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Контакты</h1>
        <div className="space-y-4">
          <p>Если у вас есть вопросы, вы можете связаться с нами любым удобным для вас способом.</p>
          <p><strong>Адрес:</strong> г. Город, ул. Примерная, д. 1</p>
          <p><strong>Телефон:</strong> <a href="tel:+1234567890" className="text-blue-600 hover:underline">+1 (234) 567-890</a></p>
          <p><strong>Telegram:</strong> <a href="https://t.me/yourusername" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@yourusername</a></p>
        </div>
      </div>
    </>
  );
};

export default ContactsPage;
