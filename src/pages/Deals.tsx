
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Tag, Percent } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

// Mock product data
interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  discountPrice: number;
  discount: number;
  category: string;
  isFeatured?: boolean;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    image: '/placeholder.svg',
    price: 299.99,
    discountPrice: 199.99,
    discount: 33,
    category: 'Electronics',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    image: '/placeholder.svg',
    price: 199.99,
    discountPrice: 149.99,
    discount: 25,
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'Leather Crossbody Bag',
    image: '/placeholder.svg',
    price: 89.99,
    discountPrice: 59.99,
    discount: 33,
    category: 'Fashion',
    isFeatured: true,
  },
  {
    id: '4',
    name: 'Stainless Steel Water Bottle',
    image: '/placeholder.svg',
    price: 29.99,
    discountPrice: 19.99,
    discount: 33,
    category: 'Home',
  },
  {
    id: '5',
    name: 'Wireless Charging Pad',
    image: '/placeholder.svg',
    price: 49.99,
    discountPrice: 34.99,
    discount: 30,
    category: 'Electronics',
  },
  {
    id: '6',
    name: 'Cotton Graphic T-Shirt',
    image: '/placeholder.svg',
    price: 24.99,
    discountPrice: 14.99,
    discount: 40,
    category: 'Fashion',
    isFeatured: true,
  },
  {
    id: '7',
    name: 'Ceramic Coffee Mug Set',
    image: '/placeholder.svg',
    price: 39.99,
    discountPrice: 29.99,
    discount: 25,
    category: 'Home',
  },
  {
    id: '8',
    name: 'Bluetooth Portable Speaker',
    image: '/placeholder.svg',
    price: 79.99,
    discountPrice: 49.99,
    discount: 38,
    category: 'Electronics',
    isFeatured: true,
  },
];

const Deals = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { toast } = useToast();

  // Filter products based on active tab
  useEffect(() => {
    if (activeTab === 'all') {
      setProducts(mockProducts);
    } else if (activeTab === 'featured') {
      setProducts(mockProducts.filter(product => product.isFeatured));
    } else {
      setProducts(mockProducts.filter(product => {
        // Safely handle category which might be a string or an object
        const categoryStr = typeof product.category === 'string' 
          ? product.category 
          : 'uncategorized';
        return categoryStr.toLowerCase() === activeTab;
      }));
    }
  }, [activeTab]);
  
  // Set document title on component mount
  useEffect(() => {
    document.title = 'Special Deals & Discounts | Shoply';
  }, []);
  
  const handleAddToCart = (product: Product) => {
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  const handleAddToWishlist = (product: Product) => {
    toast({
      title: "Added to wishlist",
      description: `${product.name} has been added to your wishlist.`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-brand-blue to-blue-700 text-white py-16">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Special Offers & Deals</h1>
            <p className="max-w-2xl mx-auto text-lg text-white/90 mb-6">
              Discover incredible savings across our product range. Limited-time offers you don't want to miss!
            </p>
            <div className="flex justify-center items-center gap-4">
              <Percent className="h-8 w-8" />
              <span className="text-xl font-bold">Up to 40% off</span>
              <Tag className="h-8 w-8" />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container py-12">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="all">All Deals</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="electronics">Electronics</TabsTrigger>
                <TabsTrigger value="fashion">Fashion</TabsTrigger>
                <TabsTrigger value="home">Home</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <Card key={product.id} className="product-card overflow-hidden">
                    <div className="relative">
                      <AspectRatio ratio={1 / 1}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                      <Badge className="absolute top-2 left-2 bg-red-600">
                        {product.discount}% OFF
                      </Badge>
                      {product.isFeatured && (
                        <Badge className="absolute top-2 right-2 bg-amber-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-brand-blue">
                          ${product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" /> 
                          Add
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddToWishlist(product)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="featured" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <Card key={product.id} className="product-card overflow-hidden">
                    <div className="relative">
                      <AspectRatio ratio={1 / 1}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                      <Badge className="absolute top-2 left-2 bg-red-600">
                        {product.discount}% OFF
                      </Badge>
                      <Badge className="absolute top-2 right-2 bg-amber-500">
                        Featured
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-brand-blue">
                          ${product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" /> 
                          Add
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddToWishlist(product)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="electronics" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <Card key={product.id} className="product-card overflow-hidden">
                    <div className="relative">
                      <AspectRatio ratio={1 / 1}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                      <Badge className="absolute top-2 left-2 bg-red-600">
                        {product.discount}% OFF
                      </Badge>
                      {product.isFeatured && (
                        <Badge className="absolute top-2 right-2 bg-amber-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-brand-blue">
                          ${product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" /> 
                          Add
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddToWishlist(product)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="fashion" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <Card key={product.id} className="product-card overflow-hidden">
                    <div className="relative">
                      <AspectRatio ratio={1 / 1}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                      <Badge className="absolute top-2 left-2 bg-red-600">
                        {product.discount}% OFF
                      </Badge>
                      {product.isFeatured && (
                        <Badge className="absolute top-2 right-2 bg-amber-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-brand-blue">
                          ${product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" /> 
                          Add
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddToWishlist(product)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="home" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <Card key={product.id} className="product-card overflow-hidden">
                    <div className="relative">
                      <AspectRatio ratio={1 / 1}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                      <Badge className="absolute top-2 left-2 bg-red-600">
                        {product.discount}% OFF
                      </Badge>
                      {product.isFeatured && (
                        <Badge className="absolute top-2 right-2 bg-amber-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-brand-blue">
                          ${product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" /> 
                          Add
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddToWishlist(product)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-12" />
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Current Promotions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-0 overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Summer Sale</h3>
                  <p className="mb-4 text-muted-foreground">Up to 40% off summer essentials</p>
                  <Badge className="bg-brand-blue">Ends in 7 days</Badge>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-0 overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
                  <p className="mb-4 text-muted-foreground">On all orders over $50</p>
                  <Badge className="bg-brand-yellow text-black">Ongoing</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Deals;
