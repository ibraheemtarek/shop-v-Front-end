
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';

export interface ProductProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isOnSale?: boolean;
  className?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  rating,
  reviewCount,
  isNew,
  isOnSale,
  className,
}: ProductProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };
  
  return (
    <div className={cn("product-card group", className)}>
      <div className="relative overflow-hidden pb-[100%]">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <Badge className="bg-brand-blue">New</Badge>}
          {isOnSale && <Badge className="bg-brand-orange">{discountPercentage}% Off</Badge>}
        </div>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm",
            isWishlisted && "text-red-500"
          )}
          onClick={toggleWishlist}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
          <span className="sr-only">Add to wishlist</span>
        </Button>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <Button className="w-full rounded-none bg-brand-blue hover:bg-blue-600">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/product/${id}`} className="block">
          <p className="mb-1 text-xs text-muted-foreground">{category}</p>
          <h3 className="mb-1 font-medium line-clamp-1">{name}</h3>
          <div className="mb-2 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(rating) ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="ml-1 text-xs text-muted-foreground">({reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="price">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
