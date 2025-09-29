import { supabase } from './supabase'
import { cacheService } from './cacheService'

export const supabaseApi = {
  // ... (остальные методы без изменений)

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