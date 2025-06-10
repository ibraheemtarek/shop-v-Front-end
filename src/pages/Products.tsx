import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import ProductListView from '@/components/ProductListView';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductProps } from '@/components/ProductCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid2X2, List, SlidersHorizontal, X } from 'lucide-react';
import productService, { Product, ProductsResponse } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';

// Loading skeleton component for products
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

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State for products and loading
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filters
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Get filter values from URL params
  useEffect(() => {
    const categoryParam = queryParams.get('category');
    const searchParam = queryParams.get('search');
    const minPriceParam = queryParams.get('minPrice');
    const maxPriceParam = queryParams.get('maxPrice');
    const pageParam = queryParams.get('page');
    const ratingParam = queryParams.get('rating');
    const filterParam = queryParams.get('filter');
    
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    if (minPriceParam && !isNaN(Number(minPriceParam))) {
      setPriceRange(prev => [Number(minPriceParam), prev[1]]);
    }
    
    if (maxPriceParam && !isNaN(Number(maxPriceParam))) {
      setPriceRange(prev => [prev[0], Number(maxPriceParam)]);
    }
    
    if (pageParam && !isNaN(Number(pageParam))) {
      setCurrentPage(Number(pageParam));
    }
    
    if (ratingParam && !isNaN(Number(ratingParam))) {
      setSelectedRating(Number(ratingParam));
    }
  }, [queryParams]);

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const params: Record<string, any> = {
          page: currentPage,
          limit: 12
        };
        
        if (selectedCategories.length > 0) {
          params.category = selectedCategories[0];
        }
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        if (priceRange[0] > 0) {
          params.minPrice = priceRange[0];
        }
        
        if (priceRange[1] < 1000) {
          params.maxPrice = priceRange[1];
        }
        
        if (selectedRating) {
          params.minRating = selectedRating;
        }
        
        const response = await productService.getProducts(params);
        
        // Map API products to ProductProps format
        const mappedProducts: ProductProps[] = response.products.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image,
          category: typeof p.category === 'string' ? p.category : 
            (p.category && typeof p.category === 'object' && 'name' in p.category) ? 
            p.category.name : 'Uncategorized',
          rating: p.rating,
          reviewCount: p.reviewCount,
          isNew: p.isNew,
          isOnSale: p.isOnSale
        }));
        
        setProducts(mappedProducts);
        setTotalProducts(response.total);
        setTotalPages(response.pages);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, selectedCategories, searchQuery, priceRange, selectedRating]);

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getProducts();
        const allProducts = response.products;
        
        // Extract unique categories
        const uniqueCategories = [...new Set(allProducts.map(product => {
          if (typeof product.category === 'string') {
            return product.category;
          } else if (product.category && typeof product.category === 'object' && 'name' in product.category) {
            return product.category.name;
          }
          return 'Uncategorized';
        }))];
        
        setCategories(uniqueCategories);
        
        // Find min and max prices
        if (allProducts.length > 0) {
          const prices = allProducts.map(p => p.price);
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          
          setMinPrice(min);
          setMaxPrice(max);
          
          // Only set price range if it hasn't been set by URL params
          if (priceRange[0] === 0 && priceRange[1] === 1000) {
            setPriceRange([min, max]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories[0]);
    }
    
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    if (priceRange[0] > minPrice) {
      params.set('minPrice', priceRange[0].toString());
    }
    
    if (priceRange[1] < maxPrice) {
      params.set('maxPrice', priceRange[1].toString());
    }
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    if (selectedRating) {
      params.set('rating', selectedRating.toString());
    }
    
    // Update URL without reloading page
    navigate({ search: params.toString() }, { replace: true });
  }, [navigate, selectedCategories, searchQuery, priceRange, currentPage, selectedRating, minPrice, maxPrice]);

  // Handle category filter change
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [category]
    );
    setCurrentPage(1); // Reset to first page when changing filters
  };
  
  // Handle rating filter change
  const toggleRating = (rating: number) => {
    setSelectedRating(prev => prev === rating ? null : rating);
    setCurrentPage(1); // Reset to first page when changing filters
  };
  
  // Handle reset filters
  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedCategories([]);
    setSearchQuery('');
    setSelectedRating(null);
    setCurrentPage(1);
  };
  
  // Handle page change
  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-brand-bg">
        <div className="container py-8">
          <h1 className="mb-6 text-3xl font-bold">All Products</h1>

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="md:hidden flex items-center gap-2"
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={view === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setView('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{products.length}</span> of{" "}
                <span className="font-medium">{totalProducts}</span> products
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-[300px] w-full"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter Sidebar - Desktop */}
            <aside className="hidden md:block w-64 space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-medium">Price Range</h3>
                <Slider
                  defaultValue={[0, 1000]}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-2"
                />
                <div className="flex items-center justify-between">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-medium">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={`category-${category}`}>{category}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="mb-3 text-lg font-medium">Ratings</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`rating-${rating}`} 
                        checked={selectedRating === rating}
                        onCheckedChange={() => toggleRating(rating)}
                      />
                      <Label htmlFor={`rating-${rating}`}>
                        {rating}★ & above
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            </aside>

            {/* Filter Sidebar - Mobile */}
            {isFilterOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
                <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-lg font-medium">Price Range</h3>
                      <Slider
                        defaultValue={[0, 1000]}
                        max={1000}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="mb-2"
                      />
                      <div className="flex items-center justify-between">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-medium">Categories</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <Label htmlFor={`mobile-category-${category}`}>{category}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="mb-3 text-lg font-medium">Ratings</h3>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`mobile-rating-${rating}`} 
                              checked={selectedRating === rating}
                              onCheckedChange={() => toggleRating(rating)}
                            />
                            <Label htmlFor={`mobile-rating-${rating}`}>
                              {rating}★ & above
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        Apply Filters
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={resetFilters}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid/List View */}
            <div className="flex-1">
              {loading ? (
                <ProductsLoadingSkeleton />
              ) : error ? (
                <div className="flex h-64 items-center justify-center rounded-lg border bg-white p-6 text-center">
                  <div>
                    <p className="mb-2 text-xl font-semibold text-red-500">{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : products.length > 0 ? (
                <>
                  {view === 'grid' ? (
                    <ProductGrid products={products} />
                  ) : (
                    <ProductListView products={products} />
                  )}
                </>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border bg-white p-6 text-center">
                  <div>
                    <p className="mb-2 text-xl font-semibold">No products found</p>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search query.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && products.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1}
                      onClick={() => changePage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageNum = currentPage - 3 + i;
                        }
                        if (pageNum > totalPages) {
                          pageNum = totalPages - (5 - i - 1);
                        }
                      }
                      
                      return (
                        <Button 
                          key={pageNum}
                          variant="outline" 
                          size="sm" 
                          className={currentPage === pageNum ? "bg-brand-blue text-white" : ""}
                          onClick={() => changePage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => changePage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
