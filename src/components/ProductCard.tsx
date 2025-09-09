import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductWithCategory } from '@/lib/database';

interface ProductCardProps {
  product: ProductWithCategory;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Mock image - in real implementation would come from database
  const imageUrl = `https://via.placeholder.com/300x400/22c55e/ffffff?text=${product.article}`;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      </CardContent>
      <CardFooter className="p-4 space-y-2">
        <div className="w-full space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{product.category_name}</p>
            </div>
            <Badge variant="secondary" className="ml-2 text-xs">
              {product.brand}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-xs text-muted-foreground">от</span>
              <span className="font-semibold ml-1">1000 ₴</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {product.gender === 'чол' ? 'Мужское' : 
               product.gender === 'жiн' ? 'Женское' : 
               product.gender === 'хлопч' ? 'Мальчик' : 
               product.gender === 'дiвч' ? 'Девочка' : 'Универсал'}
            </Badge>
          </div>

          <Link to={`/product/${product.id}`}>
            <Button size="sm" className="w-full mt-2">
              Подробнее
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;