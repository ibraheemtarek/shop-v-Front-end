
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Heart, Star, ArrowLeft, Share2, Check, Loader2 } from 'lucide-react';
import productService, { Product } from '@/services/productService';
import { useCart } from '@/context/cartUtils';
import { useAuth } from '@/context/authUtils';
import { useWishlist } from '@/context/wishlistUtils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist: checkInWishlist, loading: wishlistLoading } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Fetch product data from the API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const productData = await productService.getProductById(id);
        console.log('Product data received:', productData); // Debug log
        setProduct(productData);
        
        // Set initial selected color and size if available
        if (productData.colors?.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        if (productData.sizes?.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        
        // Reset selected image index if needed
        if (!productData.images || productData.images.length === 0) {
          setSelectedImage(0);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your cart.",
        variant: "destructive"
      });
      return;
    }
    
    if (!product) return;
    
    try {
      await addToCart(product._id, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product?.name} added to your cart.`,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast({
        title: "Failed to add to cart",
        description: "There was an error adding this item to your cart. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Check if product is in wishlist
  useEffect(() => {
    if (product?._id && user) {
      const inWishlist = checkInWishlist(product._id);
      setIsInWishlist(inWishlist);
    } else {
      setIsInWishlist(false);
    }
  }, [product?._id, user, checkInWishlist]);

  const handleAddToWishlist = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!product?._id) return;

    try {
      setIsAddingToWishlist(true);
      
      if (isInWishlist) {
        await removeFromWishlist(product._id);
        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} removed from your wishlist.`,
        });
      } else {
        try {
          await addToWishlist(product._id);
          setIsInWishlist(true);
          toast({
            title: "Added to wishlist",
            description: `${product.name} added to your wishlist.`,
          });
        } catch (error: Error | unknown) {
          // Check if the error is because the product is already in the wishlist
          if (error instanceof Error && error.message.includes('already in wishlist')) {
            // Product is already in wishlist, just update the UI state
            console.log('Product already in wishlist, updating UI state');
            setIsInWishlist(true);
            toast({
              title: "Already in wishlist",
              description: `${product.name} is already in your wishlist.`,
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
        title: "Operation failed",
        description: "There was a problem updating your wishlist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container py-8">
          <div className="flex animate-pulse flex-col gap-8 md:flex-row">
            <div className="w-full md:w-1/2 rounded-lg bg-gray-200 h-96" />
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="mb-8">{error}</p>
          <Button asChild>
            <Link to="/products">View All Products</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!loading && !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-8">Sorry, the product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/products">View All Products</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="container py-4">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-foreground">Products</Link>
            <span className="mx-2">/</span>
            <Link to={`/category/${typeof product.category === 'string' ? product.category.toLowerCase() : product.categoryName?.toLowerCase() || 'uncategorized'}`} className="hover:text-foreground">
              {typeof product.category === 'string' ? product.category : product.categoryName || 'Uncategorized'}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        {/* Product Detail */}
        <div className="container py-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border bg-white">
                <AspectRatio ratio={1 / 1}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  className="rounded-md overflow-hidden border ring-2 ring-brand-blue"
                >
                  <AspectRatio ratio={1 / 1}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                    />
                  </AspectRatio>
                </button>
              </div>
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <>
                    <span className="text-3xl font-bold text-brand-blue">${product.price.toFixed(2)}</span>
                    <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                    <Badge className="ml-2 bg-green-600">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              
              {product.inStock ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>In Stock</span>
                </div>
              ) : (
                <div className="text-destructive">Out of Stock</div>
              )}
              
              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium">Color: {selectedColor}</div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-10 rounded-md border px-3 ${
                          selectedColor === color
                            ? "border-brand-blue bg-brand-blue/10"
                            : "border-input hover:bg-accent"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium">Size: {selectedSize}</div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 rounded-md border px-3 ${
                          selectedSize === size
                            ? "border-brand-blue bg-brand-blue/10"
                            : "border-input hover:bg-accent"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              <div className="space-y-2">
                <div className="font-medium">Quantity</div>
                <div className="flex items-center">
                  <button 
                    className="h-10 w-10 rounded-l-md border flex items-center justify-center"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="h-10 w-12 border-t border-b flex items-center justify-center">
                    {quantity}
                  </div>
                  <button 
                    className="h-10 w-10 rounded-r-md border flex items-center justify-center"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || cartLoading}
                >
                  {cartLoading ? (
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
                <Button 
                  variant={isInWishlist ? "secondary" : "outline"}
                  className="flex-1"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                >
                  {isAddingToWishlist ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isInWishlist ? "Removing..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                      {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Product Features */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="product-card overflow-hidden">
                  <AspectRatio ratio={1 / 1}>
                    <img 
                      src="/placeholder.svg" 
                      alt="Related product" 
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </AspectRatio>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Related Product {item}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="price">$199.99</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
