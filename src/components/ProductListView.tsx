
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductProps } from './ProductCard';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface ProductListViewProps {
  products: ProductProps[];
}

const ProductListView = ({ products }: ProductListViewProps) => {
  return (
    <div className="flex flex-col gap-4">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="flex flex-col md:flex-row bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="md:w-64 h-52 md:h-auto">
            <Link to={`/product/${product.id}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </Link>
          </div>
          
          <div className="flex flex-col justify-between p-4 flex-1">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold hover:text-brand-blue transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm">{product.category}</p>
                </div>
                {(product.isNew || product.isOnSale) && (
                  <div>
                    {product.isNew && (
                      <Badge className="bg-brand-blue">New</Badge>
                    )}
                    {product.isOnSale && (
                      <Badge className="bg-red-500 ml-2">Sale</Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  ({product.reviewCount} reviews)
                </span>
              </div>
              
              <p className="text-muted-foreground mb-4 line-clamp-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. 
                Sed euismod, nisl vel tincidunt lacinia, nunc est ultricies nisl.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-9 w-9"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductListView;
