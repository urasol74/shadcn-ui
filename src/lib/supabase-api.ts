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

    // 1. ИЗМЕНЯЕМ ЗАПРОС: добавляем `variants` для получения цен
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, article, name, gender, season, category_id, image,
        variants!inner(purchase_price, sale_price, discount, stock)
      `)
      .or(`name.ilike.%${query}%,article.ilike.%${query}%`)
      .gt('variants.stock', 0) // Только товары в наличии
      .limit(20);

    if (error) {
      console.error('Search API error:', error);
      return [];
    }

    if (!data) {
        return [];
    }

    // 2. ОБРАБАТЫВАЕМ РЕЗУЛЬТАТ: для каждого товара находим лучший вариант (самый дешевый)
    // и создаем плоскую структуру данных, которую ожидает ProductCard.
    const processedResults = data.map(product => {
        if (!product.variants || product.variants.length === 0) {
            return null;
        }

        // Находим вариант с самой низкой ценой продажи для отображения
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
            // Добавляем информацию о ценах из найденного варианта
            purchase_price: bestVariant.purchase_price,
            sale_price: bestVariant.sale_price,
            discount: bestVariant.discount,
        };
    }).filter(p => p !== null); // Убираем пустые результаты


    cacheService.set(cacheKey, processedResults);
    return processedResults;
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
};