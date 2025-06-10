
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import FeaturedProducts from '@/components/FeaturedProducts';

const Index = () => {
  useEffect(() => {
    document.title = 'Shoply | Modern E-Commerce Platform';
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <HeroSection />
        <FeaturedCategories />
        <FeaturedProducts />
        <section className="py-12 bg-brand-bg">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-sm">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-brand-blue">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M12 12v9"></path>
                    <path d="m8 17 4 4 4-4"></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium">Fast Delivery</h3>
                <p className="text-muted-foreground">Free shipping on all orders over $50</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-sm">
                <div className="mb-4 rounded-full bg-amber-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-brand-yellow">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium">Satisfaction Guarantee</h3>
                <p className="text-muted-foreground">30-day money-back guarantee</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-sm">
                <div className="mb-4 rounded-full bg-orange-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-brand-orange">
                    <path d="M12 12v.01"></path>
                    <path d="M12 16v.01"></path>
                    <path d="M12 8v.01"></path>
                    <path d="M21.21 8.42A4 4 0 1 1 15.16 4a4 4 0 0 0-6.32 0 4 4 0 1 1-6.05 4.42 4 4 0 0 0 0 7.16 4 4 0 1 1 6.05 4.42 4 4 0 0 0 6.32 0 4 4 0 1 1 6.05-4.42 4 4 0 0 0 0-7.16Z"></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium">Secure Payments</h3>
                <p className="text-muted-foreground">100% secure payment methods</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
