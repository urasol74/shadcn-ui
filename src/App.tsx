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
import { SupabaseTestPage } from './pages/SupabaseTestPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/supabase-test" element={<SupabaseTestPage />} />
          <Route path="/gender/:gender" element={<GenderSeasonPage />} />
          <Route path="/category/:gender/:categoryId" element={<CategoryPage />} />
          <Route path="/category/:gender/:categoryId/:article" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/gender-season/:season" element={<GenderSeasonPage />} />
          {/* Support gender-prefixed season URLs like /жiн/gender-season/:season used by GenderPage navigation */}
          <Route path="/:gender/gender-season/:season" element={<GenderSeasonPage />} />
          <Route path="/:gender/gender-season" element={<GenderSeasonPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;