import React, { useState, useEffect } from 'react'
import { supabaseApi } from '@/lib/supabase-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SupabaseTest() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [randomProducts, setRandomProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedGender, setSelectedGender] = useState('чол')

  const handleSearch = async () => {
    if (!searchTerm) return
    setLoading(true)
    try {
      const results = await supabaseApi.searchProducts(searchTerm)
      setSearchResults(results)
      console.log('Search results:', results)
    } catch (error) {
      console.error('Search failed:', error)
    }
    setLoading(false)
  }

  const loadRandomProducts = async () => {
    setLoading(true)
    try {
      const products = await supabaseApi.getRandomProducts(5)
      setRandomProducts(products)
      console.log('Random products:', products)
    } catch (error) {
      console.error('Random products failed:', error)
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    setLoading(true)
    try {
      const cats = await supabaseApi.getCategories(selectedGender)
      setCategories(cats)
      console.log('Categories:', cats)
    } catch (error) {
      console.error('Categories failed:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRandomProducts()
    loadCategories()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Тестирование Supabase API</h1>
      
      {/* Тест поиска */}
      <Card>
        <CardHeader>
          <CardTitle>Тест поиска продуктов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Введите артикул или название..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              Поиск
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Результаты поиска:</h3>
              {searchResults.map((item: any) => (
                <div key={item.product_id} className="p-2 border rounded">
                  <div>ID: {item.product_id}</div>
                  <div>Артикул: {item.article}</div>
                  <div>Название: {item.name}</div>
                  <div>Категория: {item.category_name}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Тест случайных продуктов */}
      <Card>
        <CardHeader>
          <CardTitle>Случайные продукты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={loadRandomProducts} disabled={loading}>
            Загрузить случайные продукты
          </Button>
          {randomProducts.length > 0 && (
            <div className="grid gap-2">
              {randomProducts.map((item: any) => (
                <div key={item.product_id} className="p-2 border rounded">
                  <div>Артикул: {item.article}</div>
                  <div>Название: {item.name}</div>
                  <div>Цена: {item.sale_price}</div>
                  <div>Скидка: {item.discount}%</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Тест категорий */}
      <Card>
        <CardHeader>
          <CardTitle>Категории по полу</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select 
              value={selectedGender} 
              onChange={(e) => setSelectedGender(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="чол">Мужской</option>
              <option value="жiн">Женский</option>
              <option value="хлопч">Мальчики</option>
              <option value="дiвч">Девочки</option>
            </select>
            <Button onClick={loadCategories} disabled={loading}>
              Загрузить категории
            </Button>
          </div>
          {categories.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Категории:</h3>
              {categories.map((cat: any) => (
                <div key={cat.id} className="p-2 border rounded">
                  ID: {cat.id} - {cat.name}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}