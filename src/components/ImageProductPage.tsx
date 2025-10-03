
import { useState, useEffect } from 'react';
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FullscreenImageModal } from '@/components/ui/FullscreenImageModal';

interface ImageProductPageProps {
  productImages: string[];
  productName: string;
}

export default function ImageProductPage({ productImages, productName }: ImageProductPageProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState('');
  
  // Состояние для хранения только валидных, загрузившихся изображений
  const [validImages, setValidImages] = useState<string[]>([]);

  // При монтировании и при изменении productImages, мы инициализируем validImages
  useEffect(() => {
    // Мы предполагаем, что все изображения валидны изначально
    setValidImages(productImages);
  }, [productImages]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const openFullscreenImage = (imageUrl: string) => {
    setFullscreenImageUrl(imageUrl);
    setIsFullscreenImageOpen(true);
  };

  // Функция для обработки ошибок загрузки изображений
  const handleImageError = (failedSrc: string) => {
    // Удаляем "сломанную" ссылку из списка валидных изображений
    setValidImages(prevImages => prevImages.filter(src => src !== failedSrc));
  };

  // Если после всех проверок не осталось валидных изображений
  if (validImages.length === 0) {
    return (
        <div className="md:w-1/2 flex items-center justify-center bg-gray-100 rounded-lg aspect-[4/3]">
            {/* Показываем запасное изображение, если вообще ничего не загрузилось */}
            <img src="https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp" alt="Изображение недоступно" className="max-w-full max-h-full object-contain" />
        </div>
    );
  }

  return (
    <div className="md:w-1/2">
      <Carousel className="w-full max-w-xl mx-auto" setApi={setApi}>
        <CarouselContent>
          {validImages.map((src, index) => (
            <CarouselItem key={index} onClick={() => openFullscreenImage(src)}>
              <div className="aspect-[4/3] w-full bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer">
                <img
                  src={src}
                  alt={`${productName} - изображение ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  // Используем наш новый обработчик ошибок
                  onError={() => handleImageError(src)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="flex justify-center gap-2 mt-4">
        {validImages.map((src, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-20 h-20 rounded-md overflow-hidden border-2 ${current === index ? 'border-blue-500' : 'border-transparent'}`}>
            <img
              src={src}
              alt={`Миниатюра ${index + 1}`}
              className="w-full h-full object-cover"
              // Добавляем обработчик и сюда для консистентности, хотя он может и не понадобиться
              onError={() => handleImageError(src)}
            />
          </button>
        ))}
      </div>
      <FullscreenImageModal
        isOpen={isFullscreenImageOpen}
        onClose={() => setIsFullscreenImageOpen(false)}
        imageUrl={fullscreenImageUrl}
      />
    </div>
  );
}
