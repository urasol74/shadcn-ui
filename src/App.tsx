import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import GenderSeasonPage from './pages/GenderSeasonPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import FavoritesPage from './pages/FavoritesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminPage from './pages/AdminPage';
import AdminProductsPage from './pages/AdminProductsPage';
import UserOrdersPage from './pages/UserOrdersPage';
import QuickOrdersAdminPage from './pages/QuickOrdersAdminPage';
import React from 'react';
import Footer from './components/Footer'; // Импортируем наш новый футер

const queryClient = new QueryClient();

// Создаем обертку, которая будет решать, показывать ли футер
const AppWrapper = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/user" replace />} />
            <Route path="/admin/user" element={<AdminPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/user/:id" element={<UserOrdersPage />} />
            <Route path="/admin/quick-orders" element={<QuickOrdersAdminPage />} />

            {/* Legacy & Combined Routes */}
            <Route path="/gender/:gender/season/:season" element={<GenderSeasonPage />} />
            <Route path="/gender/:gender/season/:season/category/:categoryId" element={<GenderSeasonPage />} />
            <Route path="/gender/:gender/season/:season/product/:article" element={<ProductPage />} /> 
            <Route path="/gender/:gender" element={<Navigate to="/gender/:gender/season/all" replace />} />
            <Route path="/category/:gender/:categoryId" element={<CategoryPage />} />
            
            <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAdminPage && <Footer />} {/* Показываем футер только если это не админ-панель */}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
