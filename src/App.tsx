import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react"
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
import Footer from './components/Footer';

// Импорт новых страниц
import ContactsPage from './pages/ContactsPage';
import ReturnsPage from './pages/ReturnsPage';
import ShippingPage from './pages/ShippingPage';
import EditorPage from './pages/EditorPage'; // Импорт страницы редактора
import ContentEditorPage from './pages/ContentEditorPage'; // Импорт страницы с редактором контента

const queryClient = new QueryClient();

const AppWrapper = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
        <Routes>
            {/* Основные страницы */}
            <Route path="/" element={<Index />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />

            {/* Новые информационные страницы */}
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/shipping" element={<ShippingPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/user" replace />} />
            <Route path="/admin/user" element={<AdminPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/user/:id" element={<UserOrdersPage />} />
            <Route path="/admin/quick-orders" element={<QuickOrdersAdminPage />} />
            <Route path="/admin/editor" element={<EditorPage />} />
            <Route path="/admin/editor/:page_slug" element={<ContentEditorPage />} />

            {/* Legacy & Combined Routes */}
            <Route path="/gender/:gender/season/:season" element={<GenderSeasonPage />} />
            <Route path="/gender/:gender/season/:season/category/:categoryId" element={<GenderSeasonPage />} />
            <Route path="/gender/:gender/season/:season/product/:article" element={<ProductPage />} />
            <Route path="/gender/:gender/season/:season/category/:categoryId/:article" element={<ProductPage />} />
            <Route path="/gender/:gender" element={<Navigate to="/gender/:gender/season/all" replace />} />
            <Route path="/category/:gender/:categoryId" element={<CategoryPage />} />
            
            <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAdminPage && <Footer />} 
        <SpeedInsights />
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
