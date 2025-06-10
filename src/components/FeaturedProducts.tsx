
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductGrid from './ProductGrid';
import { ProductProps } from './ProductCard';
import productService, { Product } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';

// Product loading skeleton component
const ProductsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(8).fill(0).map((_, index) => (
        <div key={index} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
};

const FeaturedProducts = () => {
  const [activeTab, setActiveTab] = useState('featured');
  const [products, setProducts] = useState<Record<string, ProductProps[]>>({
    featured: [],
    bestsellers: [],
    newArrivals: [],
    sale: []
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({
    featured: true,
    bestsellers: true,
    newArrivals: true,
    sale: true
  });
  const [error, setError] = useState<Record<string, string | null>>({
    featured: null,
    bestsellers: null,
    newArrivals: null,
    sale: null
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Set loading state for all tabs
        setLoading({
          featured: true,
          bestsellers: true,
          newArrivals: true,
          sale: true
        });
        
        // Fetch different types of products
        const [featuredData, bestsellersData, newArrivalsData, saleData] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getBestsellerProducts(),
          productService.getProducts({ isNew: true }),
          productService.getSaleProducts()
        ]);
        
        // Map API products to ProductProps format
        const mapProductsToProps = (apiProducts: Product[]): ProductProps[] => {
          return apiProducts.map(p => {
            // Handle category safely
            let categoryName = 'Uncategorized';
            if (typeof p.category === 'string') {
              categoryName = p.category;
            } else if (p.category && typeof p.category === 'object') {
              // Use type assertion to handle the case when category is an object with name property
              const categoryObj = p.category as { name: string };
              if (categoryObj.name) {
                categoryName = categoryObj.name;
              }
            }
            
            return {
              id: p._id,
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice,
              image: p.image,
              category: categoryName,
              rating: p.rating,
              reviewCount: p.reviewCount,
              isNew: p.isNew,
              isOnSale: p.isOnSale
            };
          });
        };
        
        // Update products state
        setProducts({
          featured: mapProductsToProps(featuredData),
          bestsellers: mapProductsToProps(bestsellersData),
          newArrivals: mapProductsToProps(Array.isArray(newArrivalsData) ? newArrivalsData : (newArrivalsData.products || [])),
          sale: mapProductsToProps(saleData)
        });
      } catch (err) {
        setError({
          featured: 'Failed to load featured products',
          bestsellers: 'Failed to load bestseller products',
          newArrivals: 'Failed to load new products',
          sale: 'Failed to load sale products'
        });
      } finally {
        setLoading({
          featured: false,
          bestsellers: false,
          newArrivals: false,
          sale: false
        });
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">Our Products</h2>
          <Link to="/products" className="text-brand-blue hover:underline">
            View all products
          </Link>
        </div>
        
        <Tabs defaultValue="featured" onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger 
              value="featured"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-blue"
            >
              Featured
            </TabsTrigger>
            <TabsTrigger 
              value="bestsellers"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-blue"
            >
              Bestsellers
            </TabsTrigger>
            <TabsTrigger 
              value="newArrivals"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-blue"
            >
              New Arrivals
            </TabsTrigger>
            <TabsTrigger 
              value="sale"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-blue"
            >
              On Sale
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured">
            {loading.featured ? (
              <ProductsLoadingSkeleton />
            ) : error.featured ? (
              <div className="text-center py-8 text-red-500">{error.featured}</div>
            ) : (
              <ProductGrid products={products.featured} />
            )}
          </TabsContent>
          <TabsContent value="bestsellers">
            {loading.bestsellers ? (
              <ProductsLoadingSkeleton />
            ) : error.bestsellers ? (
              <div className="text-center py-8 text-red-500">{error.bestsellers}</div>
            ) : (
              <ProductGrid products={products.bestsellers} />
            )}
          </TabsContent>
          <TabsContent value="newArrivals">
            {loading.newArrivals ? (
              <ProductsLoadingSkeleton />
            ) : error.newArrivals ? (
              <div className="text-center py-8 text-red-500">{error.newArrivals}</div>
            ) : (
              <ProductGrid products={products.newArrivals} />
            )}
          </TabsContent>
          <TabsContent value="sale">
            {loading.sale ? (
              <ProductsLoadingSkeleton />
            ) : error.sale ? (
              <div className="text-center py-8 text-red-500">{error.sale}</div>
            ) : (
              <ProductGrid products={products.sale} />
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 flex justify-center">
          <Link to={`/products?filter=${activeTab}`} className="text-brand-blue hover:underline">
            View more {activeTab === 'newArrivals' ? 'new arrivals' : activeTab}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
