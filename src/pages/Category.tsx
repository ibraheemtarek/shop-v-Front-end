
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductProps } from '@/components/ProductCard';
import { SlidersHorizontal, Grid2X2, List, X } from 'lucide-react';

// Sample products (would normally come from an API)
const allProducts: ProductProps[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    category: 'Electronics',
    rating: 4.5,
    reviewCount: 128,
    isNew: true,
  },
  {
    id: '2',
    name: 'Premium Cotton T-Shirt',
    price: 24.99,
    originalPrice: 34.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    category: 'Fashion',
    rating: 4.2,
    reviewCount: 95,
    isOnSale: true,
  },
  {
    id: '3',
    name: 'Modern Coffee Table',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    category: 'Furniture',
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: '4',
    name: 'Stainless Steel Water Bottle',
    price: 19.99,
    originalPrice: 29.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    category: 'Kitchen',
    rating: 4.0,
    reviewCount: 156,
    isOnSale: true,
  },
  {
    id: '5',
    name: 'Professional Digital Camera',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    category: 'Electronics',
    rating: 4.9,
    reviewCount: 64,
    isNew: true,
  },
  {
    id: '6',
    name: 'Leather Wallet',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    category: 'Accessories',
    rating: 4.3,
    reviewCount: 87,
  }
];

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');
  
  // Format category title
  const categoryTitle = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'All Categories';
  
  // Filter products by category and other filters
  const filteredProducts = allProducts.filter((product) => {
    // Category filter
    if (slug && product.category.toLowerCase() !== slug.toLowerCase()) {
      return false;
    }

    // Price filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Sample brands (would come from API)
  const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas'];

  // Handle brand filter change
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  useEffect(() => {
    document.title = `${categoryTitle} | Shoply`;
  }, [categoryTitle]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-brand-bg">
        <div className="container py-8">
          <h1 className="mb-6 text-3xl font-bold">{categoryTitle}</h1>

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
                Showing <span className="font-medium">{filteredProducts.length}</span> of{" "}
                <span className="font-medium">{allProducts.length}</span> products
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Input
                type="search"
                placeholder="Search in category..."
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
                <h3 className="mb-3 text-lg font-medium">Brand</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="mb-3 text-lg font-medium">Ratings</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox id={`rating-${rating}`} />
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
                  onClick={() => {
                    setPriceRange([0, 1000]);
                    setSelectedBrands([]);
                    setSearchQuery('');
                  }}
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
                      <h3 className="mb-3 text-lg font-medium">Brand</h3>
                      <div className="space-y-2">
                        {brands.map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-brand-${brand}`}
                              checked={selectedBrands.includes(brand)}
                              onCheckedChange={() => toggleBrand(brand)}
                            />
                            <Label htmlFor={`mobile-brand-${brand}`}>{brand}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="mb-3 text-lg font-medium">Ratings</h3>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <Checkbox id={`mobile-rating-${rating}`} />
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
                        onClick={() => {
                          setPriceRange([0, 1000]);
                          setSelectedBrands([]);
                          setSearchQuery('');
                        }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
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
                      onClick={() => {
                        setPriceRange([0, 1000]);
                        setSelectedBrands([]);
                        setSearchQuery('');
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="bg-brand-blue text-white">
                      1
                    </Button>
                    <Button variant="outline" size="sm">
                      2
                    </Button>
                    <Button variant="outline" size="sm">
                      3
                    </Button>
                    <Button variant="outline" size="sm">
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

export default Category;
