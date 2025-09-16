import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/Search';
import GenderSeasonPage from './pages/GenderSeasonPage';
import React from 'react';
import { Navigate } from 'react-router-dom';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Маршруты для обработки страниц коллекций и товаров */}
            {/* Более специфичные маршруты должны идти первыми */}
            <Route path="/gender/:gender/season/:season/category/:categoryId" element={<GenderSeasonPage />} />
            <Route path="/gender/:gender/season/:season" element={<GenderSeasonPage />} />
            <Route path="/gender/:gender/season/all/category/:categoryId" element={<GenderSeasonPage />} />
            <Route path="/gender/:gender/season/all" element={<GenderSeasonPage />} />
            {/* Маршруты для товаров с разным контекстом */}
            <Route path="/gender/:gender/season/:season/category/:categoryId/:article" element={<ProductPage />} />
            <Route path="/gender/:gender/season/all/category/:categoryId/:article" element={<ProductPage />} />
            <Route path="/gender/:gender/season/:season/:article" element={<ProductPage />} />
            <Route path="/gender/:gender/:article" element={<ProductPage />} />
            {/* Маршрут по умолчанию для коллекций - перенаправляем на all */}
            <Route path="/gender/:gender" element={<Navigate to="/gender/:gender/season/all" replace />} />
            
            <Route path="/category/:gender/:categoryId" element={<CategoryPage />} />
            <Route path="/category/:gender/:categoryId/:article" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;