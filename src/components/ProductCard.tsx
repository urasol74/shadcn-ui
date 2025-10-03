import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, formatDiscount } from '@/lib/priceUtils';

// Определяем интерфейс для пропсов, чтобы обеспечить типобезопасность
interface ProductCardProps {
  product: {
    product_id: number;
    article: string;
    name: string;
    gender: string;
    season: string;
    category_id: number;
    purchase_price: number; // Старая цена
    sale_price: number;     // Новая (актуальная) цена
    discount?: number | null;
    image?: string | null;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const hasDiscount = product.discount && Number(product.discount) > 0;

  // Формируем URL для страницы товара прямо здесь
  const productUrl = `/gender/${product.gender}/season/${encodeURIComponent(product.season)}/category/${product.category_id}/${product.article}`;

  const placeholderImage = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.webp';
  // --- ИСПРАВЛЕНИЕ ---
  // 1. Сначала пытаемся использовать имя файла из колонки `image`, как вы и указали.
  // 2. Если оно пустое, формируем имя файла из артикула в качестве запасного варианта.
  const imageName = product.image || `${product.article}.webp`;
  const imageUrl = `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${imageName}`;


  return (
    // Вся карточка - это единая ссылка
    <Link to={productUrl} className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg h-full">
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="h-48 bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
            <img 
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain"
              // В случае ошибки загрузки, устанавливаем placeholder
              onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = placeholderImage;
              }}
            />
          </div>
          
          {/* 1. Добавляем text-center для центрирования названия */}
          <h3 className="font-medium text-sm mb-1 line-clamp-2 flex-grow text-center">{product.name}</h3>
          
          {/* 2. Добавляем text-center к контейнеру с ценами и скидкой */}
          <div className="space-y-1 mt-auto text-center">
            {/* Старая цена (перечеркнутая) или невидимый блок для сохранения верстки */}
            {hasDiscount ? (
              <div className="text-gray-500 line-through text-sm">{formatPrice(product.purchase_price)}</div>
            ) : (
              <div className="invisible text-sm" style={{ height: '1.25rem' }}>&nbsp;</div>
            )}
            
            {/* Актуальная цена */}
            <div className="font-semibold text-blue-600">{formatPrice(product.sale_price)}</div>
            
            {/* Бейдж "Скидка" или "Новая коллекция" */}
            {hasDiscount ? (
              <div className="text-red-600 text-sm">Скидка: {formatDiscount(product.discount)}</div>
            ) : (
              <div className="text-green-600 text-sm">Новая коллекция</div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
