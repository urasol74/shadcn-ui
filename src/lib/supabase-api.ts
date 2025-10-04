
import { supabase } from './supabase'
import { cacheService } from './cacheService'

// Функция для перемешивания массива (алгоритм Фишера–Йейтса)
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const supabaseApi = {

  async searchProducts(query: string) {
    if (query.length < 2) return [];

    const cacheKey = cacheService.generateKey('searchProducts', { query });
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id, article, name, gender, season, category_id, image,
        variants!inner(purchase_price, sale_price, discount, stock)
      `)
      .or(`name.ilike.%${query}%,article.ilike.%${query}%`)
      .gt('variants.stock', 0)
      .limit(20);

    if (error) {
      console.error('Search API error:', error);
      return [];
    }

    if (!data) {
        return [];
    }

    const processedResults = data.map(product => {
        if (!product.variants || product.variants.length === 0) {
            return null;
        }

        const bestVariant = product.variants.reduce((best: any, current: any) => {
            if (!best) return current;
            return current.sale_price < best.sale_price ? current : best;
        });

        return {
            product_id: product.id,
            article: product.article,
            name: product.name,
            gender: product.gender,
            season: product.season,
            category_id: product.category_id,
            image: product.image,
            purchase_price: bestVariant.purchase_price,
            sale_price: bestVariant.sale_price,
            discount: bestVariant.discount,
        };
    }).filter(p => p !== null);

    cacheService.set(cacheKey, processedResults);
    return processedResults;
  },

  async getProduct(article: string) {
    if (!article) return { product: null, variants: [] };

    const cacheKey = cacheService.generateKey('getProduct', { article });
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    console.log(`[API] Проверка товара по артикулу: ${article}`);
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id, article, name, season, gender, category_id, categories(name), image, variants(*)
      `)
      .eq('article', article)
      .maybeSingle();

    if (error) {
        console.error('[API] Ошибка при запросе товара:', error);
        return { product: null, variants: [] };
    }

    if (!product) {
        console.log(`[API] Товар с артикулом "${article}" не найден.`);
        return { product: null, variants: [] };
    }

    const result = {
      product: {
        product_id: product.id,
        article: product.article,
        name: product.name,
        season: product.season,
        gender: product.gender,
        category_id: product.category_id,
        category_name: (product.categories as any)?.name || '',
        image: product.image || null,
        variants: product.variants || []
      },
      variants: product.variants || []
    };

    cacheService.set(cacheKey, result);
    return result;
  },

  // НОВАЯ ФУНКЦИЯ: Получение случайных товаров
  async getRandomProducts(limit: number) {
    const cacheKey = cacheService.generateKey('getRandomProducts', { limit });
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Загружаем пул из 50 товаров в наличии
    const { data, error } = await supabase
        .from('products')
        .select('id, article, name, variants!inner(sale_price, discount, stock)')
        .gt('variants.stock', 0)
        .limit(50);

    if (error) {
        console.error('Get random products error:', error);
        return [];
    }
    
    const processed = data.map(p => {
        const bestVariant = p.variants.reduce((best: any, current: any) => 
            current.sale_price < best.sale_price ? current : best
        );
        return {
            product_id: p.id,
            article: p.article,
            name: p.name,
            sale_price: bestVariant.sale_price,
            discount: bestVariant.discount
        }
    });
    
    // Перемешиваем и возвращаем нужное количество
    const shuffled = shuffleArray(processed);
    const result = shuffled.slice(0, limit);

    cacheService.set(cacheKey, result, 600); // Кэшируем на 10 минут
    return result;
  },

  // НОВАЯ ФУНКЦИЯ: Получение категорий по полу
  async getCategories(gender: string) {
    const cacheKey = cacheService.generateKey('getCategories', { gender });
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('gender', gender)
      .order('name', { ascending: true });

    if (error) {
      console.error('Get categories error:', error);
      return [];
    }

    cacheService.set(cacheKey, data);
    return data;
  }
};