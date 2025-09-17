import React, { useState, useEffect } from 'react'

interface ProductImageProps {
  product: any
  alt?: string
  className?: string
  variant?: 'card' | 'gallery'
  onImageLoad?: () => void
  onImagesLoaded?: (validImages: string[]) => void
  showThumbnails?: boolean
  maxImages?: number
}

export const ProductImage: React.FC<ProductImageProps> = ({ 
  product, 
  alt, 
  className = '', 
  variant = 'card',
  onImageLoad,
  onImagesLoaded,
  showThumbnails = false,
  maxImages = 8
}) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [validImages, setValidImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Генерируем возможные пути к изображениям
  const generateImageCandidates = (product: any): string[] => {
    const candidates: string[] = []
    
    try {
      // Только если есть поле image из базы данных, используем его
      if (product.image) {
        // Проверяем, является ли путь абсолютным или относительным
        if (product.image.startsWith('http') || product.image.startsWith('/')) {
          candidates.push(product.image)
        } else {
          // Если это относительный путь, добавляем префикс /static/pic/
          candidates.push(`/static/pic/${product.image}`)
        }
        
        // Генерируем также пути для дополнительных изображений с тем же префиксом
        const baseName = product.image.replace(/\.[^.\s]+$/, '') // Убираем расширение
        const extension = product.image.split('.').pop() // Получаем расширение
        
        if (baseName) {
          // Добавляем дополнительные изображения в формате: префикс-1, префикс-2 и т.д.
          // Используем то же расширение, что и у основного изображения
          for (let i = 1; i <= maxImages; i++) {
            candidates.push(`/static/pic/${baseName}-${i}.${extension}`)
            
            // Также проверяем формат с -F префиксом
            candidates.push(`/static/pic/${baseName}-F${i}.${extension}`)
          }
        }
      } else if (product.article) {
        // Если нет поля image, используем article для генерации пути
        const cleanArticle = product.article.replace(/\.K$/, '')
        // Пробуем сначала .webp (как в базе данных), затем другие расширения
        candidates.push(`/static/pic/${cleanArticle}.webp`)
        candidates.push(`/static/pic/${cleanArticle}.jpg`)
        candidates.push(`/static/pic/${cleanArticle}.jpeg`)
        candidates.push(`/static/pic/${cleanArticle}.png`)
        
        // Добавляем дополнительные изображения
        for (let i = 1; i <= maxImages; i++) {
          candidates.push(`/static/pic/${cleanArticle}-${i}.webp`)
          candidates.push(`/static/pic/${cleanArticle}-${i}.jpg`)
          candidates.push(`/static/pic/${cleanArticle}-${i}.jpeg`)
          candidates.push(`/static/pic/${cleanArticle}-${i}.png`)
          candidates.push(`/static/pic/${cleanArticle}-F${i}.webp`)
          candidates.push(`/static/pic/${cleanArticle}-F${i}.jpg`)
          candidates.push(`/static/pic/${cleanArticle}-F${i}.jpeg`)
          candidates.push(`/static/pic/${cleanArticle}-F${i}.png`)
        }
      }
      
      // Плейсхолдер в конце (только для основного изображения, не для галереи)
      if (variant !== 'gallery' && candidates.length === 0) {
        candidates.push('/static/pic/placeholder.jpg')
      }
      
      // Удаляем дубликаты
      const uniqueCandidates = [...new Set(candidates)]
      
      // Логирование для отладки
      console.log('Generated image candidates for product:', product.article || product.id, uniqueCandidates)
      
      return uniqueCandidates
    } catch (e) {
      console.warn('Error generating image candidates:', e)
    }
    
    return candidates
  }

  // Проверка доступности изображений с Promise.all как в старом коде
  const validateImages = async (candidates: string[]): Promise<string[]> => {
    console.log('Validating image candidates:', candidates);
    
    const checks = candidates.map(src => 
      new Promise<{ src: string; valid: boolean }>((resolve) => {
        const img = new Image()
        let completed = false
        let timeoutId: NodeJS.Timeout
        
        const cleanup = () => {
          img.removeEventListener('load', onLoad)
          img.removeEventListener('error', onError)
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
        }
        
        const onLoad = () => {
          if (completed) return
          completed = true
          cleanup()
          // Дополнительная проверка: есть ли отрисованные размеры изображения
          const isValidImage = img.naturalWidth > 0 && img.naturalHeight > 0
          console.log(`Image loaded: ${src}, valid: ${isValidImage}, dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
          resolve({ src, valid: isValidImage })
        }
        
        const onError = () => {
          if (completed) return
          completed = true
          cleanup()
          console.log(`Image failed to load: ${src}`);
          resolve({ src, valid: false })
        }
        
        img.addEventListener('load', onLoad)
        img.addEventListener('error', onError)
        
        // Timeout для избежания зависания (3 секунды)
        timeoutId = setTimeout(() => {
          if (completed) return
          completed = true
          cleanup()
          console.log(`Image load timeout: ${src}`);
          resolve({ src, valid: false })
        }, 3000)
        
        img.src = src
      })
    )

    try {
      const results = await Promise.all(checks)
      const validImages = results.filter(r => r.valid).map(r => r.src)
      
      // Логирование для отладки
      console.log('Gallery image validation:', {
        total: candidates.length,
        valid: validImages.length,
        validImages
      })
      
      return validImages
    } catch (error) {
      console.warn('Error validating images:', error)
      return []
    }
  }

  // Эффект для загрузки и валидации изображений
  useEffect(() => {
    let mounted = true
    
    const loadImages = async () => {
      setLoading(true)
      
      // Отладочная информация
      console.log('ProductImage component received product:', product);
      
      // Проверяем, есть ли у продукта данные
      if (!product) {
        console.log('Product is null');
        if (mounted) {
          setValidImages([]);
          setLoading(false);
        }
        return;
      }
      
      const candidates = generateImageCandidates(product)
      const valid = await validateImages(candidates)
      
      if (mounted) {
        setValidImages(valid)
        setCurrentIdx(0)
        setLoading(false)
        
        if (onImageLoad && valid.length > 0) {
          onImageLoad()
        }
        
        if (onImagesLoaded) {
          onImagesLoaded(valid)
        }
      }
    }

    loadImages()

    return () => {
      mounted = false
    }
  }, [product, variant, maxImages])

  // Обработка ошибки загрузки изображения (fallback)
  const handleImageError = () => {
    if (currentIdx < validImages.length - 1) {
      setCurrentIdx(prev => prev + 1)
    }
  }

  // Переключение изображения
  const switchImage = (index: number) => {
    if (index >= 0 && index < validImages.length) {
      setCurrentIdx(index)
    }
  }

  // Если нет валидных изображений
  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-gray-400 text-sm">Загрузка...</div>
      </div>
    )
  }

  if (validImages.length === 0) {
    console.log('No valid images found for product:', product?.article);
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-gray-400 text-sm">Нет изображения</div>
      </div>
    )
  }

  // Основное изображение
  const mainImage = (
    <img
      src={validImages[currentIdx]}
      alt={alt || product?.name || 'Product image'}
      className={className}
      onError={handleImageError}
      loading="lazy"
      decoding="async"
      onClick={variant === 'gallery' ? () => setLightboxOpen(true) : undefined}
      style={variant === 'gallery' ? { cursor: 'zoom-in' } : undefined}
    />
  )

  // Для варианта карточки возвращаем только основное изображение
  if (variant === 'card' || !showThumbnails) {
    return mainImage
  }

  // Для варианта галереи возвращаем изображение с миниатюрами
  return (
    <div className="w-full">
      {/* Основное изображение */}
      <div className="w-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
        <img
          src={validImages[currentIdx]}
          alt={alt || product?.name || 'Product image'}
          className={className}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
          onClick={variant === 'gallery' ? () => setLightboxOpen(true) : undefined}
          style={variant === 'gallery' ? { cursor: 'zoom-in' } : undefined}
        />
      </div>

      {/* Миниатюры (показываем только если больше одного изображения) */}
      {validImages.length > 1 && showThumbnails && (
        <div className="w-full mt-3">
          <div className="flex gap-2 overflow-x-auto pb-3 px-1">
            {validImages.map((src, idx) => (
              <button 
                key={`${src}-${idx}`} 
                className={`flex-shrink-0 border-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  idx === currentIdx 
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => switchImage(idx)}
              >
                <img 
                  src={src} 
                  alt={`${alt || 'Product'} ${idx + 1}`} 
                  className="w-16 h-16 object-cover rounded-md" 
                  onError={(e) => {
                    // Удаляем несправную миниатюру из DOM
                    const button = (e.target as HTMLImageElement).closest('button')
                    if (button) {
                      button.style.display = 'none'
                    }
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox для полноразмерного просмотра */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-auto" 
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={validImages[currentIdx]} 
              alt={alt || 'Product image'} 
              className="max-h-[calc(100vh-2rem)] max-w-full object-contain cursor-zoom-out" 
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Навигация в lightbox */}
            {validImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    switchImage(currentIdx > 0 ? currentIdx - 1 : validImages.length - 1)
                  }}
                >
                  ←
                </button>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    switchImage(currentIdx < validImages.length - 1 ? currentIdx + 1 : 0)
                  }}
                >
                  →
                </button>
                
                {/* Индикатор текущего изображения */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-3 py-1 rounded-full text-sm z-10">
                  {currentIdx + 1} / {validImages.length}
                </div>
              </>
            )}
            
            {/* Кнопка закрытия */}
            <button 
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full z-10"
              onClick={() => setLightboxOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductImage