
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/cartUtils';
import { useAuth } from '@/context/authUtils';
import { useWishlist } from '@/context/wishlistUtils';
import { useToast } from '@/components/ui/use-toast';

export interface ProductProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryName: string;
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
  categoryName,
  rating,
  reviewCount,
  isNew,
  isOnSale,
  className,
}: ProductProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessingWishlist, setIsProcessingWishlist] = useState(false);
  const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  // Check if product is in wishlist when component mounts or user changes
  useEffect(() => {
    if (user) {
      const inWishlist = isInWishlist(id);
      setIsWishlisted(inWishlist);
    } else {
      setIsWishlisted(false);
    }
  }, [user, id, isInWishlist]);
  
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessingWishlist(true);
      
      if (isWishlisted) {
        await removeFromWishlist(id);
        toast({
          title: "Removed from wishlist",
          description: `${name} has been removed from your wishlist.`
        });
        setIsWishlisted(false);
      } else {
        try {
          await addToWishlist(id);
          toast({
            title: "Added to wishlist",
            description: `${name} has been added to your wishlist.`
          });
          setIsWishlisted(true);
        } catch (error: Error | unknown) {
          // Check if the error is because the product is already in the wishlist
          if (error instanceof Error && error.message.includes('already in wishlist')) {
            // Product is already in wishlist, just update the UI state
            console.log('Product already in wishlist, updating UI state');
            setIsWishlisted(true);
            toast({
              title: "Already in wishlist",
              description: `${name} is already in your wishlist.`
            });
          } else {
            // Re-throw other errors to be caught by the outer catch block
            throw error;
          }
        }
      }
    } catch (err) {
      console.error('Wishlist operation failed:', err);
      toast({
        title: "Wishlist action failed",
        description: "There was an error updating your wishlist.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingWishlist(false);
    }
  };
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your cart.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsAddingToCart(true);
      await addToCart(id, 1);
      toast({
        title: "Added to cart",
        description: `${name} added to your cart.`
      });
    } catch (err) {
      toast({
        title: "Failed to add to cart",
        description: "There was an error adding this item to your cart.",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
    }
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
          disabled={isProcessingWishlist || wishlistLoading}
        >
          {isProcessingWishlist ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
          )}
          <span className="sr-only">{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</span>
        </Button>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <Button 
            className="w-full rounded-none bg-brand-blue hover:bg-blue-600" 
            onClick={handleAddToCart}
            disabled={isAddingToCart || cartLoading}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/product/${id}`} className="block">
          <p className="mb-1 text-xs text-muted-foreground">{categoryName}</p>
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
