import { supabase } from './supabase'
import { cacheService } from './cacheService'

export const supabaseApi = {

  async searchProducts(query: string) {
    if (query.length < 2) return [];

    const cacheKey = cacheService.generateKey('searchProducts', { query });
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Используем полнотекстовый поиск Supabase. `to_tsvector` и `plainto_tsquery`
    // должны быть настроены в вашей базе данных для эффективного поиска.
    // Здесь мы ищем по 'name' и 'article'.
    const { data, error } = await supabase
      .from('products')
      .select('name, article, gender, season, category_id, image')
      // .textSearch('name_article_tsvector', query) // Предполагаем, что у вас есть tsvector колонка
      .or(`name.ilike.%${query}%,article.ilike.%${query}%`) // Менее эффективный, но рабочий вариант без tsvector
      .limit(10);

    if (error) {
      console.error('Search API error:', error);
      return [];
    }

    cacheService.set(cacheKey, data);
    return data;
  },

  // Замена для /api/product
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

    // ВАЖНО: Если есть ошибка, но это НЕ ошибка "не найдено" - логируем.
    if (error) {
        console.error('[API] Ошибка при запросе товара:', error);
        return { product: null, variants: [] };
    }

    // Если товар просто не найден, это не ошибка, а ожидаемое поведение.
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

  // ... (остальные методы без изменений)
};