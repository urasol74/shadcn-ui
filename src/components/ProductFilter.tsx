import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'

interface ProductFilterProps {
  selectedGender: string
  selectedCategories: number[]
  priceRange: [number, number]
  inStockOnly: boolean
  onCategoriesChange: (categories: number[]) => void
  onPriceRangeChange: (range: [number, number]) => void
  onInStockChange: (inStock: boolean) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  loading?: boolean
  className?: string
}

export function ProductFilter({
  selectedGender,
  selectedCategories,
  priceRange,
  inStockOnly,
  onCategoriesChange,
  onPriceRangeChange,
  onInStockChange,
  onApplyFilters,
  onResetFilters,
  loading = false,
  className = ""
}: ProductFilterProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [maxPrice, setMaxPrice] = useState(10000)

  // Загружаем категории для выбранного пола
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          products!inner(gender)
        `)
        .eq('products.gender', selectedGender)

      if (error) {
        console.error('Categories error:', error)
        setCategories([])
        return
      }

      const unique = data?.reduce((acc, curr) => {
        if (!acc.find(item => item.id === curr.id)) {
          acc.push({ id: curr.id, name: curr.name })
        }
        return acc
      }, [] as Array<{id: number, name: string}>) || []

      setCategories(unique)
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    }
  }

  // Загружаем максимальную цену для слайдера
  const loadMaxPrice = async () => {
    try {
      // Сначала пробуем new_price, потом sale_price
      let { data, error } = await supabase
        .from('variants')
        .select('new_price')
        .not('new_price', 'is', null)
        .order('new_price', { ascending: false })
        .limit(1)
        .single()
      
      if (error || !data) {
        // Если new_price не найдено, пробуем sale_price
        const { data: saleData, error: saleError } = await supabase
          .from('variants')
          .select('sale_price')
          .not('sale_price', 'is', null)
          .order('sale_price', { ascending: false })
          .limit(1)
          .single()
        
        if (!saleError && saleData) {
          const max = Math.ceil(saleData.sale_price || 10000)
          setMaxPrice(max)
          if (priceRange[1] === 10000) {
            onPriceRangeChange([0, max])
          }
          return
        }
      }
      
      if (data) {
        const max = Math.ceil(data.new_price || 10000)
        setMaxPrice(max)
        if (priceRange[1] === 10000) {
          onPriceRangeChange([0, max])
        }
      }
    } catch (error) {
      console.error('Error loading max price:', error)
      setMaxPrice(10000)
    }
  }

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      onCategoriesChange([...selectedCategories, categoryId])
    } else {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId))
    }
  }

  useEffect(() => {
    loadCategories()
  }, [selectedGender])

  useEffect(() => {
    loadMaxPrice()
  }, [])

  return (
    <div className={`bg-white p-6 shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
      
      {/* Фильтр по категориям */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Категории</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category: any) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
              />
              <Label 
                htmlFor={`category-${category.id}`} 
                className="text-sm cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-sm text-gray-500">Загрузка категорий...</div>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Фильтр по цене */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Ціна, грн</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            max={maxPrice}
            min={0}
            step={50}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{priceRange[0]} грн</span>
            <span>{priceRange[1]} грн</span>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Фильтр по наличию */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => onInStockChange(checked as boolean)}
          />
          <Label htmlFor="in-stock" className="text-sm cursor-pointer">
            В наявності
          </Label>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="space-y-2">
        <Button 
          onClick={onApplyFilters} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Обновление...' : 'Применить фильтры'}
        </Button>
        <Button 
          onClick={onResetFilters} 
          variant="outline"
          className="w-full"
        >
          Сбросить фильтры
        </Button>
      </div>
    </div>
  )
}