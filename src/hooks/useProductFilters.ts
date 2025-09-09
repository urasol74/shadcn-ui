import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UseProductFiltersProps {
  selectedGender: string
  onFilteredProductsChange?: (products: any[]) => void
}

export function useProductFilters({ selectedGender, onFilteredProductsChange }: UseProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])

  // Применяем фильтры к продуктам
  const applyFilters = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          article,
          name,
          gender,
          season,
          category_id,
          categories(name),
          variants!inner(new_price, sale_price, purchase_price, discount, stock)
        `)
        .eq('gender', selectedGender)

      // Фильтр по категориям
      if (selectedCategories.length > 0) {
        query = query.in('category_id', selectedCategories)
      }

      // Фильтр по наличию (применяем сначала, чтобы сократить количество данных)
      if (inStockOnly) {
        query = query.gt('variants.stock', 0)
      }

      const { data, error } = await query.limit(100)

      if (error) {
        console.error('Filter error:', error)
        setFilteredProducts([])
        if (onFilteredProductsChange) onFilteredProductsChange([])
        return
      }

      if (!data || data.length === 0) {
        console.log('No products found with current filters')
        setFilteredProducts([])
        if (onFilteredProductsChange) onFilteredProductsChange([])
        return
      }

      // Обрабатываем результаты и применяем фильтр по цене на клиенте
      const result: any[] = []
      
      data.forEach(product => {
        if (!product.variants || product.variants.length === 0) return
        
        product.variants.forEach((variant: any) => {
          // Определяем цену (приоритет new_price, потом sale_price)
          const price = variant.new_price || variant.sale_price || 0
          
          // Применяем фильтр по цене
          if (price >= priceRange[0] && price <= priceRange[1] && price > 0) {
            // Проверяем, нет ли уже этого продукта с той же ценой
            const existing = result.find(r => r.product_id === product.id && r.price === price)
            
            if (!existing) {
              result.push({
                product_id: product.id,
                article: product.article,
                name: product.name,
                gender: product.gender,
                season: product.season,
                category_id: product.category_id,
                category_name: (product.categories as any)?.name || '',
                price: price,
                new_price: variant.new_price,
                sale_price: variant.sale_price,
                purchase_price: variant.purchase_price,
                discount: variant.discount,
                stock: variant.stock || 0,
                in_stock: (variant.stock || 0) > 0
              })
            }
          }
        })
      })

      setFilteredProducts(result)
      if (onFilteredProductsChange) onFilteredProductsChange(result)
      
      console.log('Filtered products:', result.length, 'products found')
      console.log('Price range applied:', priceRange)
      console.log('Categories selected:', selectedCategories)
      console.log('In stock only:', inStockOnly)
    } catch (error) {
      console.error('Filter failed:', error)
      setFilteredProducts([])
      if (onFilteredProductsChange) onFilteredProductsChange([])
    }
    setLoading(false)
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 10000])
    setInStockOnly(false)
    console.log('Filters reset')
  }

  // Автоматически применяем фильтры при изменении параметров
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 500) // Debounce для избежания слишком частых запросов

    return () => clearTimeout(timeoutId)
  }, [selectedCategories, priceRange, inStockOnly, selectedGender])

  return {
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    loading,
    filteredProducts,
    applyFilters,
    resetFilters
  }
}