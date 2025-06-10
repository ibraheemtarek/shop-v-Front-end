
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Truck, Package, Calendar, ArrowLeft } from 'lucide-react';

const ShippingReturns = () => {
  useEffect(() => {
    document.title = 'Shipping & Returns | Shoply';
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shipping & Returns Policy</h1>
          
          {/* Shipping Section */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Truck className="h-6 w-6 mr-3 text-brand-blue" />
              <h2 className="text-2xl font-bold">Shipping Information</h2>
            </div>
            
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="text-lg font-medium mb-4">Processing Time</h3>
              <p className="mb-6">
                All orders are processed within 1-2 business days after receiving your order confirmation email. 
                Orders placed on weekends or holidays will be processed on the next business day.
              </p>
              
              <h3 className="text-lg font-medium mb-4">Shipping Options</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Standard Shipping</h4>
                  <p className="text-muted-foreground">3-5 business days</p>
                  <p className="text-brand-blue font-medium mt-2">FREE on orders over $50</p>
                  <p className="text-sm">$4.99 for orders under $50</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Express Shipping</h4>
                  <p className="text-muted-foreground">1-2 business days</p>
                  <p className="text-brand-blue font-medium mt-2">$9.99</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">International Shipping</h3>
              <p className="mb-6">
                We ship to over 100 countries worldwide. International shipping costs and delivery times vary by 
                location and are calculated at checkout. Please note that customs fees, import duties, or taxes 
                are not included in the item price or shipping cost. These charges are the buyer's responsibility.
              </p>
              
              <h3 className="text-lg font-medium mb-4">Tracking Your Order</h3>
              <p className="mb-6">
                You will receive a shipping confirmation email with tracking information once your order has been shipped. 
                You can also track your order by logging into your account on our website.
              </p>
            </div>
          </section>
          
          <Separator className="my-12" />
          
          {/* Returns Section */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <ArrowLeft className="h-6 w-6 mr-3 text-brand-blue" />
              <h2 className="text-2xl font-bold">Returns & Exchanges</h2>
            </div>
            
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="text-lg font-medium mb-4">Return Policy</h3>
              <p className="mb-6">
                We offer a 30-day return policy for most items. To be eligible for a return, your item must be unused 
                and in the same condition that you received it. It must also be in the original packaging.
              </p>
              
              <h3 className="text-lg font-medium mb-4">Return Process</h3>
              <ol className="list-decimal pl-5 space-y-2 mb-6">
                <li>Log into your account and navigate to your orders</li>
                <li>Select the order and items you wish to return</li>
                <li>Generate a return shipping label</li>
                <li>Package your return securely and attach the shipping label</li>
                <li>Drop off your return at the specified carrier location</li>
              </ol>
              
              <h3 className="text-lg font-medium mb-4">Refunds</h3>
              <p className="mb-6">
                Once your return is received and inspected, we will send you an email to notify you that we have 
                received your returned item. We will also notify you of the approval or rejection of your refund.
              </p>
              <p className="mb-6">
                If approved, your refund will be processed, and a credit will automatically be applied to your 
                original method of payment within 5-7 business days. Please note that depending on your credit 
                card company, it may take an additional 2-10 business days for the refund to appear on your statement.
              </p>
              
              <h3 className="text-lg font-medium mb-4">Exchanges</h3>
              <p className="mb-6">
                If you need to exchange an item for a different size or color, please return your item for a refund 
                and place a new order for the desired item. This ensures the fastest processing time.
              </p>
              
              <h3 className="text-lg font-medium mb-4">Non-Returnable Items</h3>
              <p className="mb-6">
                The following items cannot be returned:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Gift cards</li>
                <li>Downloadable software products</li>
                <li>Personalized or custom-made items</li>
                <li>Personal care items (for hygiene reasons)</li>
                <li>Items marked as "Final Sale" or "Non-Returnable"</li>
              </ul>
            </div>
          </section>
          
          <Separator className="my-12" />
          
          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">What if my order arrives damaged?</h3>
                <p className="text-muted-foreground">
                  If your order arrives damaged, please contact our customer service team within 48 hours with photos of 
                  the damaged items and packaging. We'll arrange for a return or replacement at no additional cost.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Do you offer free returns?</h3>
                <p className="text-muted-foreground">
                  Yes, we provide free return shipping for orders shipped within the United States. International 
                  returns must be paid for by the customer unless the item is defective.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">How can I check the status of my return?</h3>
                <p className="text-muted-foreground">
                  You can check the status of your return by logging into your account and navigating to the 
                  "Orders & Returns" section, or by contacting our customer service team.
                </p>
              </div>
            </div>
          </section>
          
          <div className="mt-12 bg-brand-blue/5 p-6 rounded-xl border border-brand-blue/20">
            <h3 className="text-lg font-medium mb-3">Need more help?</h3>
            <p className="mb-4">If you have any questions about our shipping or returns policies, please contact us:</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:support@shoply.com" className="text-brand-blue font-medium">support@shoply.com</a>
              <span className="hidden sm:inline text-muted-foreground">|</span>
              <a href="tel:+18001234567" className="text-brand-blue font-medium">+1 (800) 123-4567</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingReturns;
