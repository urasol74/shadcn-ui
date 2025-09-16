import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">BENETTON ОДЕССА</h1>
          <p className="text-xl mb-8">Официальный магазин модной одежды</p>
          <p className="text-lg mb-8 opacity-90">Стильная одежда для всей семьи • Новая коллекция 2025</p>
          
          <div className="collections-buttons">
            <Link to="/gender/чол/season/all" className="collection-link">
              <Button size="lg" variant="secondary" className="btn-collection">
                Мужская коллекция
              </Button>
            </Link>
            <Link to="/gender/жiн/season/all" className="collection-link">
              <Button size="lg" variant="secondary" className="btn-collection">
                Женская коллекция
              </Button>
            </Link>
            <Link to="/gender/хлопч/season/all" className="collection-link">
              <Button size="lg" variant="secondary" className="btn-collection">
                Мальчик
              </Button>
            </Link>
            <Link to="/gender/дiвч/season/all" className="collection-link">
              <Button size="lg" variant="secondary" className="btn-collection">
                Девочка
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Рекламный блок */}
      <section className="py-2">
        <div className="w-full flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 h-40 md:h-64 bg-gray-100 relative overflow-hidden">
            <img src="/static/image/left-pic.jpg" alt="Promo left" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative z-10 p-4 text-white text-center">
              <h3 className="text-lg md:text-xl font-semibold">Коллекция — слева</h3>
              <p className="text-xs md:text-sm opacity-90">Здесь можно разместить рекламный текст или ссылку.</p>
            </div>
          </div>

          <div className="flex-1 h-40 md:h-64 bg-gray-100 relative overflow-hidden">
            <img src="/static/image/right-pic.jpg" alt="Promo right" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 p-4 text-white text-center">
              <h3 className="text-lg md:text-xl font-semibold">Коллекция — справа</h3>
              <p className="text-xs md:text-sm opacity-90">Заглушка для баннера. Замените картинку в /static/image/</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pt-4 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-5">Категории товаров</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link to="/gender/чол/season/all" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Мужская одежда</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gender/жiн/season/all" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Женская одежда</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gender/хлопч/season/all" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Одежда на мальчика</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gender/дiвч/season/all" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Одежда на девочку</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BENETTON ОДЕССА</h3>
              <p className="text-gray-300">Официальный магазин модной одежды в Одессе</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <p className="text-gray-300">г. Одесса</p>
              <p className="text-gray-300">Украина</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Коллекции</h4>
              <div className="space-y-2 text-gray-300">
                <Link to="/gender/чол/season/all" className="block hover:text-white">Мужская</Link>
                <Link to="/gender/жiн/season/all" className="block hover:text-white">Женская</Link>
                <Link to="/gender/хлопч/season/all" className="block hover:text-white">Детская</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Benetton Одесса. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
