import { supabase } from './supabase'
import { cacheService } from './cacheService'

export const supabaseApi = {
  // Замена для /api/search
  async searchProducts(article: string) {
    if (!article || article.length < 2) return []

    // Проверяем кэш
    const cacheKey = cacheService.generateKey('searchProducts', { article })
    const cached = cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        article,
        name,
        gender,
        category_id,
        image,
        categories(name)
      `)
      .or(`article.ilike.%${article}%,name.ilike.%${article}%`)
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return []
    }

    const result = data?.map(item => ({
      product_id: item.id,
      article: item.article,
      name: item.name,
      gender: item.gender,
      category_id: item.category_id,
      category_name: (item.categories as any)?.name || '',
      image: item.image || null
    })) || []

    // Сохраняем в кэш
    cacheService.set(cacheKey, result)
    return result
  },

  // Замена для /api/products/random
  async getRandomProducts(count: number = 5) {
    // Проверяем кэш
    const cacheKey = cacheService.generateKey('getRandomProducts', { count })
    const cached = cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        article,
        name,
        gender,
        category_id,
        image,
        categories(name),
        variants!inner(sale_price, discount, stock)
      `)
      .gt('variants.stock', 0)
      .limit(count * 3)
      
    if (error) {
      console.error('Random products error:', error)
      return []
    }

    const shuffled = data?.sort(() => 0.5 - Math.random()) || []
    const selected = shuffled.slice(0, count)

    const result = selected.map(product => {
      const variant = product.variants[0]
      return {
        product_id: product.id,
        article: product.article,
        name: product.name,
        gender: product.gender,
        category_id: product.category_id,
        category_name: (product.categories as any)?.name || '',
        image: product.image || null,
        sale_price: variant?.sale_price || null,
        discount: variant?.discount || null,
      }
    })

    // Сохраняем в кэш
    cacheService.set(cacheKey, result)
    return result
  },

  // Замена для /api/categories
  async getCategories(gender: string) {
    // Проверяем кэш
    const cacheKey = cacheService.generateKey('getCategories', { gender })
    const cached = cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        products!inner(gender)
      `)
      .eq('products.gender', gender)

    if (error) {
      console.error('Categories error:', error)
      return []
    }

    const unique = data?.reduce((acc, curr) => {
      if (!acc.find(item => item.id === curr.id)) {
        acc.push({ id: curr.id, name: curr.name })
      }
      return acc
    }, [] as Array<{id: number, name: string}>) || []

    const result = unique

    // Сохраняем в кэш
    cacheService.set(cacheKey, result)
    return result
  },

  // Замена для /api/products
  async getProducts(gender: string, categoryId: string) {
    // Проверяем кэш
    const cacheKey = cacheService.generateKey('getProducts', { gender, categoryId })
    const cached = cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        article,
        name,
        gender,
        category_id,
        image,
        categories(name),
        variants!inner(sale_price, discount, stock)
      `)
      .eq('gender', gender)
      .eq('category_id', categoryId)
      .gt('variants.stock', 0)

    if (error) {
      console.error('Products error:', error)
      return []
    }

    const result: any[] = []
    data?.forEach(product => {
      const variants = product.variants || []
      const seen = new Set()
      
      variants.forEach(variant => {
        const key = variant.sale_price
        if (!seen.has(key)) {
          seen.add(key)
          result.push({
            product_id: product.id,
            article: product.article,
            name: product.name,
            gender: product.gender,
            category_id: product.category_id,
            category_name: (product.categories as any)?.name || '',
            image: product.image || null,
            sale_price: variant.sale_price,
            discount: variant.discount
          })
        }
      })
    })

    // Сохраняем в кэш
    cacheService.set(cacheKey, result)
    return result
  },

  // Замена для /api/product
  async getProduct(article: string) {
    if (!article) return { product: null, variants: [] }

    // Проверяем кэш
    const cacheKey = cacheService.generateKey('getProduct', { article })
    const cached = cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        article,
        name,
        season,
        gender,
        category_id,
        categories(name),
        image,
        variants(*)
      `)
      .eq('article', article)
      .single()

    if (error || !product) {
      console.error('Product error:', error)
      return { product: null, variants: [] }
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
        // Берем поле image из продукта, а не из варианта
        image: product.image || null,
        // Добавляем все варианты для получения дополнительных изображений
        variants: product.variants || []
      },
      variants: product.variants || []
    }

    // Сохраняем в кэш
    cacheService.set(cacheKey, result)
    return result
  },

  // Для получения уникальных сезонов
  async getSeasons(gender?: string) {
    // Проверяем кэш
    const cacheKey = cacheService.generateKey('getSeasons', { gender })
    const cached = cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    let query = supabase
      .from('products')
      .select('season')
      .not('season', 'is', null)
      .not('season', 'eq', '')

    if (gender) {
      query = query.eq('gender', gender)
    }

    const { data, error } = await query

    if (error) {
      console.error('Seasons error:', error)
      return []
    }

    const unique = [...new Set(data?.map(item => item.season).filter(Boolean))]
    const result = unique.map(season => ({ season }))

    // Сохраняем в кэш
    cacheService.set(cacheKey, result)
    return result
  },

  // Получить рекомендуемые товары с распределением по гендерам
  // 5 товаров: по 1 от каждого гендера, один гендер получает 2 товара
  async getRecommendedProducts() {
    // Проверяем кэш
    const cacheKey = cacheService.generateKey('getRecommendedProducts')
    const cached = cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    const genders = ['чол', 'жiн', 'хлопч', 'дiвч'];
    const result = [];
    
    try {
      // Получаем по 1 товару от каждого гендера
      for (const gender of genders) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            article,
            name,
            gender,
            category_id,
            categories(name),
            variants!inner(sale_price, discount, stock)
          `)
          .eq('gender', gender)
          .gt('variants.stock', 0)
          .limit(10) // Получаем больше для случайного выбора
          
        if (error) {
          console.error(`Error fetching ${gender} products:`, error)
          continue
        }
        
        if (data && data.length > 0) {
          // Случайно выбираем один товар из доступных
          const randomIndex = Math.floor(Math.random() * data.length)
          const product = data[randomIndex]
          const variant = product.variants[0]
          
          result.push({
            product_id: product.id,
            article: product.article,
            name: product.name,
            gender: product.gender,
            category_id: product.category_id,
            category_name: (product.categories as any)?.name || '',
            sale_price: variant?.sale_price || null,
            discount: variant?.discount || null,
          })
        }
      }
      
      // Если у нас есть товары, добавляем еще один случайный товар
      if (result.length > 0) {
        // Случайно выбираем гендер для дополнительного товара
        const randomGender = genders[Math.floor(Math.random() * genders.length)]
        
        // Исключаем уже выбранные артикулы
        const usedArticles = result.map(p => p.article)
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            article,
            name,
            gender,
            category_id,
            categories(name),
            variants!inner(sale_price, discount, stock)
          `)
          .eq('gender', randomGender)
          .not('article', 'in', `(${usedArticles.map(a => `"${a}"`).join(',')})`)
          .gt('variants.stock', 0)
          .limit(10)
          
        if (!error && data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length)
          const product = data[randomIndex]
          const variant = product.variants[0]
          
          result.push({
            product_id: product.id,
            article: product.article,
            name: product.name,
            gender: product.gender,
            category_id: product.category_id,
            category_name: (product.categories as any)?.name || '',
            sale_price: variant?.sale_price || null,
            discount: variant?.discount || null,
          })
        }
      }
      
      // Перемешиваем результат для случайного порядка
      const shuffledResult = result.sort(() => 0.5 - Math.random())
      
      // Сохраняем в кэш
      cacheService.set(cacheKey, shuffledResult)
      return shuffledResult
      
    } catch (error) {
      console.error('Recommended products error:', error)
      return []
    }
  }
}