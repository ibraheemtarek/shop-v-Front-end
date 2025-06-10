
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-brand-bg">
        {/* Hero Section */}
        <section className="bg-white py-12 md:py-24">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">Our Story</h1>
                <p className="mb-6 text-lg text-muted-foreground">
                  Founded in 2023, Shoply was created with a simple mission: to build a better shopping experience for everyone. We believe that shopping should be easy, enjoyable, and accessible to all.
                </p>
                <p className="text-muted-foreground">
                  What started as a small online store has grown into a comprehensive e-commerce platform offering thousands of products across multiple categories, all while maintaining our commitment to quality, affordability, and exceptional customer service.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Our team at work"
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission and Values */}
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Mission & Values</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                At Shoply, we're driven by core values that shape everything we do.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue">
                    <path d="M12 2v4"></path><path d="m6.37 6.16-2.9 2.9"></path>
                    <path d="m20.13 9.06-2.9-2.9"></path><path d="M4 13H2"></path>
                    <path d="M22 13h-2"></path><path d="m6.37 19.84-2.9-2.9"></path>
                    <path d="m20.13 16.94-2.9 2.9"></path><path d="M12 22v-2"></path>
                    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously strive to improve our platform, products, and processes to deliver the best possible experience to our customers.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-yellow">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Customer Focus</h3>
                <p className="text-muted-foreground">
                  Our customers are at the heart of everything we do. We listen to their feedback and continuously work to exceed their expectations.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange">
                    <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a1.93 1.93 0 0 0-.09 3.33l12.35 6.61c.55.3 1.22.3 1.77 0l3.44-1.9a1.93 1.93 0 0 0 .34-3.33z"></path>
                    <path d="M3.09 8.84v7.21a1.93 1.93 0 0 0 1 1.7l4.58 2.39a1.93 1.93 0 0 0 1.81 0l4.58-2.39a1.93 1.93 0 0 0 1-1.7V8.84"></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Quality</h3>
                <p className="text-muted-foreground">
                  We are committed to offering only the highest quality products and services, ensuring our customers receive exceptional value for their money.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-white py-12 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Leadership Team</h2>
              <p className="mb-12 text-lg text-muted-foreground">
                Meet the passionate people behind Shoply who work tirelessly to bring you the best shopping experience.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  name: "Jane Smith",
                  role: "CEO & Founder",
                  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                },
                {
                  name: "Mark Johnson",
                  role: "CTO",
                  image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                },
                {
                  name: "Sarah Williams",
                  role: "CMO",
                  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                },
                {
                  name: "Michael Brown",
                  role: "COO",
                  image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                }
              ].map((member, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="mb-4 h-40 w-40 rounded-full object-cover"
                  />
                  <h3 className="mb-1 text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="rounded-lg bg-brand-blue p-8 text-center text-white md:p-12">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Join Our Journey</h2>
              <p className="mb-6 text-lg">
                Discover why millions of customers choose Shoply for their shopping needs.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/products">Shop Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent text-white hover:bg-white hover:text-brand-blue">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
