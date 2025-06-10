
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQs = () => {
  useEffect(() => {
    document.title = 'Frequently Asked Questions | Shoply';
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
          
          <div className="mb-12">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger>How do I track my order?</AccordionTrigger>
                <AccordionContent>
                  You can track your order by logging into your account and navigating to the "Orders" section. 
                  There you'll find all your order details including shipping information and tracking numbers.
                  Alternatively, you can use the tracking link sent to your email after shipping.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q2">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.
                  For certain regions, we also offer additional payment options like bank transfers and buy-now-pay-later services.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q3">
                <AccordionTrigger>How long does shipping take?</AccordionTrigger>
                <AccordionContent>
                  Standard shipping typically takes 3-5 business days within the continental US. 
                  Express shipping options (1-2 business days) are available at checkout for an additional fee.
                  International shipping times vary by destination, generally taking 7-14 business days.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q4">
                <AccordionTrigger>What is your return policy?</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day return policy for most items. Products must be unused, in their original packaging,
                  and with all tags attached. Some restrictions apply to personal items and sale merchandise.
                  Please see our <a href="/shipping-returns" className="text-brand-blue underline">Shipping & Returns</a> page for more details.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q5">
                <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                <AccordionContent>
                  Yes, we ship to most countries worldwide. International shipping costs and delivery times 
                  are calculated at checkout based on destination, weight, and value of items. 
                  Please note that any customs fees or import duties are the responsibility of the customer.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q6">
                <AccordionTrigger>How can I change or cancel my order?</AccordionTrigger>
                <AccordionContent>
                  You can request changes or cancellation within 1 hour of placing your order by contacting our customer 
                  service team. After this window, orders are processed for shipping and cannot be modified or canceled.
                  Please contact us as soon as possible if you need to make changes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q7">
                <AccordionTrigger>Are my personal details secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, we use industry-standard encryption and security measures to protect your personal information.
                  We never store complete credit card details on our servers. Our website is SSL secured, and we comply 
                  with all data protection regulations. For more information, please review our Privacy Policy.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q8">
                <AccordionTrigger>Do you offer discounts for bulk orders?</AccordionTrigger>
                <AccordionContent>
                  Yes, we offer special pricing for bulk orders. Please contact our customer service team with your 
                  requirements for a custom quote. We also have a business program for regular corporate purchases 
                  with additional benefits and dedicated support.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="mb-6 text-muted-foreground">
              Our customer support team is here to help. Contact us by phone or email and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <div className="rounded-lg bg-white p-6 border text-center">
                <h3 className="text-lg font-medium mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-2">We'll respond within 24 hours</p>
                <a href="mailto:support@shoply.com" className="text-brand-blue font-medium">support@shoply.com</a>
              </div>
              <div className="rounded-lg bg-white p-6 border text-center">
                <h3 className="text-lg font-medium mb-2">Phone Support</h3>
                <p className="text-muted-foreground mb-2">Available 9am-5pm ET, Mon-Fri</p>
                <a href="tel:+18001234567" className="text-brand-blue font-medium">+1 (800) 123-4567</a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
