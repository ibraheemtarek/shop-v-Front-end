import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import categoryService, { Category } from '@/services/categoryService';

// Category loading skeleton component
const CategoriesLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(8).fill(0).map((_, index) => (
        <div key={index} className="relative overflow-hidden rounded-lg">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="mt-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'All Categories | Shoply';
    
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
        setFilteredCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect above
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-brand-bg py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">All Categories</h1>
            <p className="text-muted-foreground">Browse all product categories available in our store</p>
          </div>

          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative max-w-md">
              <Input
                type="search"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          
          {loading ? (
            <CategoriesLoadingSkeleton />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search query</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <Link 
                  key={category._id}
                  to={`/category/${category.slug}`} 
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{category.itemCount} items</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
