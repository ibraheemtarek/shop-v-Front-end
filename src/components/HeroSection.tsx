
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
      <div className="container flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Shop the <span className="text-brand-blue">Latest</span>
            <br />
            Products
          </h1>
          <p className="mb-6 max-w-md text-lg text-muted-foreground">
            Discover our curated collection of products for every need. High quality guaranteed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-brand-blue hover:bg-blue-600">
              <Link to="/products">Shop Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/category">Browse Categories</Link>
            </Button>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Hero product"
              className="rounded-lg shadow-lg"
            />
            <div className="absolute -bottom-4 -left-4 rounded-lg bg-white p-4 shadow-lg">
              <p className="text-sm font-medium text-brand-blue">New Collection</p>
              <p className="text-xl font-bold">Summer 2025</p>
            </div>
            <div className="absolute -top-4 -right-4 rounded-full bg-brand-yellow p-4 shadow-lg">
              <p className="text-sm font-bold">Up to</p>
              <p className="text-xl font-bold">50% OFF</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-brand-blue opacity-10 blur-3xl"></div>
      <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-brand-yellow opacity-10 blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
