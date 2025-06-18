import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/authUtils';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut,
  Heart
} from 'lucide-react';
import Search from '@/components/Search';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState(2); // Sample cart count
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth(); // Get user and loading state from AuthContext
  
  // Determine login status from AuthContext
  const isLoggedIn = !!user;
  
  // Debug logging to help diagnose the issue
  useEffect(() => {
    console.log('Auth state in Header:', { user, isLoggedIn, token: localStorage.getItem('token') });
  }, [user, isLoggedIn]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Access the auth context for logout functionality
  const { logout: authLogout } = useAuth();
  
  // Handle logout
  const handleLogout = async () => {
    // Call the API logout function from the auth context
    authLogout();
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out."
    });
    
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="block md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-brand-blue">Shoply</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-brand-blue transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium hover:text-brand-blue transition-colors">
            Shop
          </Link>
          <Link to="/deals" className="text-sm font-medium hover:text-brand-blue transition-colors">
            Deals
          </Link>
          <Link to="/category/electronics" className="text-sm font-medium hover:text-brand-blue transition-colors">
            Electronics
          </Link>
          <Link to="/category/fashion" className="text-sm font-medium hover:text-brand-blue transition-colors">
            Fashion
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-brand-blue transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-brand-blue transition-colors">
            Contact
          </Link>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center relative max-w-md flex-1 mx-4">
          <Search />
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <Search variant="mobile" className="md:hidden" />
          
          {isLoggedIn ? (
            <>
              <Link to="/account" className="relative">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          )}
          
          <Link to="/account?tab=wishlist" className="relative">
            <Heart className="h-5 w-5" />
          </Link>
          
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                {cartItems}
              </Badge>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container md:hidden pb-4">
          <div className="flex items-center relative mb-4">
            <Search />
          </div>
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-sm font-medium hover:text-brand-blue transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-sm font-medium hover:text-brand-blue transition-colors"
              onClick={toggleMenu}
            >
              Shop
            </Link>
            <Link 
              to="/deals" 
              className="text-sm font-medium hover:text-brand-blue transition-colors"
              onClick={toggleMenu}
            >
              Deals
            </Link>
            <Link 
              to="/category/electronics" 
              className="text-sm font-medium hover:text-brand-blue transition-colors"
              onClick={toggleMenu}
            >
              Electronics
            </Link>
            <Link 
              to="/category/fashion" 
              className="text-sm font-medium hover:text-brand-blue transition-colors"
              onClick={toggleMenu}
            >
              Fashion
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium hover:text-brand-blue transition-colors"
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium hover:text-brand-blue transition-colors"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            
            <Separator className="my-2" />
            
            {isLoggedIn ? (
              <>
                <Link 
                  to="/account" 
                  className="text-sm font-medium hover:text-brand-blue transition-colors"
                  onClick={toggleMenu}
                >
                  My Account
                </Link>
                <Button 
                  variant="ghost" 
                  className="justify-start p-0 h-auto"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-medium hover:text-brand-blue transition-colors"
                onClick={toggleMenu}
              >
                Login / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
