
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const NewsletterSection = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Successfully subscribed!",
        description: "You'll now receive our newsletter with the latest updates.",
      });
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="bg-gradient-to-r from-brand-blue to-blue-700 py-16 text-white">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-4 text-2xl md:text-3xl font-bold">Stay Updated with Our Newsletter</h2>
          <p className="mb-8 max-w-2xl text-white/80">
            Subscribe to our newsletter to receive updates on new products, special offers, and more.
          </p>
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="bg-white text-brand-blue hover:bg-white/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-white/60">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
