
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

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const openFullscreenImage = (imageUrl: string) => {
    setFullscreenImageUrl(imageUrl);
    setIsFullscreenImageOpen(true);
  };

  if (!productImages || productImages.length === 0) {
    return (
        <div className="md:w-1/2 flex items-center justify-center bg-gray-100 rounded-lg aspect-[4/3]">
            <p className="text-gray-500">Нет изображений</p>
        </div>
    );
  }

  return (
    <div className="md:w-1/2">
      <Carousel className="w-full max-w-xl mx-auto" setApi={setApi}>
        <CarouselContent>
          {productImages.map((src, index) => (
            <CarouselItem key={index} onClick={() => openFullscreenImage(src)}>
              <div className="aspect-[4/3] w-full bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer">
                <img
                  src={src}
                  alt={`${productName} - изображение ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp';
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="flex justify-center gap-2 mt-4">
        {productImages.map((src, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-20 h-20 rounded-md overflow-hidden border-2 ${current === index ? 'border-blue-500' : 'border-transparent'}`}>
            <img
              src={src}
              alt={`Миниатюра ${index + 1}`}
              className="w-full h-full object-cover"
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
