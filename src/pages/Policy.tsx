
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';

const Policy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | Shoply';
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: May 14, 2025</p>
          
          <div className="prose max-w-none text-brand-text">
            <p className="mb-4">
              At Shoply, we take your privacy very seriously. This privacy policy describes how we collect, use, and 
              share your personal information when you visit our website or make a purchase.
            </p>
            
            <h2 className="text-2xl font-bold my-6">Information We Collect</h2>
            <p className="mb-4">
              When you visit our site, we automatically collect certain information about your device, including 
              information about your web browser, IP address, time zone, and some of the cookies that are installed 
              on your device.
            </p>
            <p className="mb-4">
              Additionally, as you browse the site, we collect information about the individual web pages that you view, 
              what websites or search terms referred you to our site, and information about how you interact with the site.
            </p>
            <p className="mb-6">
              When you make a purchase, we collect personal information such as your name, billing address, shipping 
              address, payment information, email address, and phone number.
            </p>
            
            <Separator className="my-6" />
            
            <h2 className="text-2xl font-bold my-6">How We Use Your Information</h2>
            <p className="mb-4">We use the information that we collect to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Fulfill orders and process transactions</li>
              <li>Communicate with you about your order, account, or inquiries</li>
              <li>Screen orders for potential risk or fraud</li>
              <li>Provide you with information or advertising relating to our products or services</li>
              <li>Improve our website and customer experience</li>
              <li>Comply with our legal obligations</li>
            </ul>
            
            <Separator className="my-6" />
            
            <h2 className="text-2xl font-bold my-6">Sharing Your Information</h2>
            <p className="mb-4">
              We share your personal information with third parties to help us use your personal information, 
              as described above. For example, we use Shopify to power our online store. We also use Google Analytics 
              to help us understand how our customers use the site.
            </p>
            <p className="mb-6">
              We may also share your personal information to comply with applicable laws and regulations, to respond 
              to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
            </p>
            
            <Separator className="my-6" />
            
            <h2 className="text-2xl font-bold my-6">Your Rights</h2>
            <p className="mb-4">
              If you are a European resident, you have the right to access personal information we hold about you and 
              to ask that your personal information be corrected, updated, or deleted. If you would like to exercise 
              this right, please contact us.
            </p>
            <p className="mb-6">
              Additionally, if you are a European resident, we note that we are processing your information in order to 
              fulfill contracts we might have with you, or otherwise to pursue our legitimate business interests listed above.
            </p>
            
            <Separator className="my-6" />
            
            <h2 className="text-2xl font-bold my-6">Data Retention</h2>
            <p className="mb-6">
              When you place an order through the site, we will maintain your order information for our records unless 
              and until you ask us to delete this information.
            </p>
            
            <Separator className="my-6" />
            
            <h2 className="text-2xl font-bold my-6">Changes</h2>
            <p className="mb-6">
              We may update this privacy policy from time to time in order to reflect changes to our practices or for other 
              operational, legal or regulatory reasons. We will notify you of any significant changes.
            </p>
            
            <Separator className="my-6" />
            
            <h2 className="text-2xl font-bold my-6">Contact Us</h2>
            <p className="mb-4">
              For more information about our privacy practices, if you have questions, or if you would like to make a 
              complaint, please contact us by email at privacy@shoply.com or by mail using the details provided below:
            </p>
            <p className="mb-6">
              Shoply Inc.<br />
              123 E-Commerce St, Suite 101<br />
              New York, NY 10001<br />
              United States
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Policy;
