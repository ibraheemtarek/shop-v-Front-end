
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService, { Category } from '@/services/categoryService';
import { Skeleton } from '@/components/ui/skeleton';

// Category loading skeleton component
const CategoriesLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array(4).fill(0).map((_, index) => (
        <div key={index} className="relative overflow-hidden rounded-lg">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
};

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
          <Link to="/categories" className="text-brand-blue hover:underline">
            View all categories
          </Link>
        </div>
        
        {loading ? (
          <CategoriesLoadingSkeleton />
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link 
                key={category._id}
                to={`/category/${category.slug}`} 
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                  <h3 className="font-bold">{category.name}</h3>
                  <p className="text-sm">{category.itemCount} items</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
