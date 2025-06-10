
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">SHOP</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm hover:text-brand-blue transition-colors">All Products</Link></li>
              <li><Link to="/deals" className="text-sm hover:text-brand-blue transition-colors">Deals & Discounts</Link></li>
              <li><Link to="/category/electronics" className="text-sm hover:text-brand-blue transition-colors">Electronics</Link></li>
              <li><Link to="/category/fashion" className="text-sm hover:text-brand-blue transition-colors">Fashion</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">ACCOUNT</h3>
            <ul className="space-y-2">
              <li><Link to="/account" className="text-sm hover:text-brand-blue transition-colors">My Account</Link></li>
              <li><Link to="/account?tab=orders" className="text-sm hover:text-brand-blue transition-colors">Order History</Link></li>
              <li><Link to="/account?tab=wishlist" className="text-sm hover:text-brand-blue transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">SUPPORT</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-sm hover:text-brand-blue transition-colors">Contact Us</Link></li>
              <li><Link to="/faqs" className="text-sm hover:text-brand-blue transition-colors">FAQs</Link></li>
              <li><Link to="/shipping-returns" className="text-sm hover:text-brand-blue transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/policy" className="text-sm hover:text-brand-blue transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Shoply. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link to="#" className="text-muted-foreground hover:text-brand-blue">
              <span className="sr-only">Facebook</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-brand-blue">
              <span className="sr-only">Instagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-brand-blue">
              <span className="sr-only">Twitter</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
