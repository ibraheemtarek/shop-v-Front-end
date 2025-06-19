
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cartUtils';
import { useAuth } from '@/context/authUtils';

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart, refreshCart } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user && !loading) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to view your cart',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [user, loading, navigate, toast]);

  // Refresh cart when component mounts
  useEffect(() => {
    if (user) {
      refreshCart();
    }
  }, [user, refreshCart]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(productId, newQuantity);
      toast({
        title: 'Cart updated',
        description: 'Item quantity has been updated.',
      });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: 'Failed to update item quantity. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast({
        title: 'Item removed',
        description: 'The item has been removed from your cart.',
      });
    } catch (err) {
      toast({
        title: 'Remove failed',
        description: 'Failed to remove item from cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const applyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplyingPromo(true);
    
    // Simulate API call - this would be replaced with an actual API call in the future
    setTimeout(() => {
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is invalid or expired.",
        variant: "destructive",
      });
      setIsApplyingPromo(false);
    }, 1500);
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      });
    } catch (err) {
      toast({
        title: 'Clear failed',
        description: 'Failed to clear cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate cart totals
  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) || 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1; // 10% tax rate
  const total = subtotal + shipping + tax;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-brand-bg">
        <div className="container py-8">
          <h1 className="mb-6 text-3xl font-bold">Your Shopping Cart</h1>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-brand-blue" />
              <p className="mt-4 text-lg">Loading your cart...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border bg-red-50 p-6 text-center">
              <p className="text-lg text-red-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => refreshCart()}
              >
                Try Again
              </Button>
            </div>
          ) : cart?.items?.length ? (
            <div className="grid gap-8 md:grid-cols-3">
              {/* Cart Items */}
              <div className="md:col-span-2">
                <div className="rounded-lg border bg-white">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold">Cart Items ({cart.items.length})</h2>
                  </div>
                  <Separator />
                  {cart.items.map((item) => (
                    <div key={item.product} className="flex flex-col sm:flex-row border-b p-6">
                      <div className="mb-4 sm:mb-0 sm:mr-6 h-24 w-24 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full rounded-md object-cover object-center"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <Link
                              to={`/product/${item.product}`}
                              className="text-lg font-medium hover:text-brand-blue"
                            >
                              {item.name}
                            </Link>
                            <p className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex h-8 items-center rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-full rounded-none"
                              onClick={() => updateQuantity(item.product, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-full rounded-none"
                              onClick={() => updateQuantity(item.product, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.product)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between p-6">
                    <Button variant="outline" asChild>
                      <Link to="/products">
                        <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                        Continue Shopping
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleClearCart}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="rounded-lg border bg-white">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold">Order Summary</h2>
                  </div>
                  <Separator />
                  <div className="space-y-4 p-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>

                    <form onSubmit={applyPromoCode} className="mt-6">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" variant="outline" disabled={isApplyingPromo}>
                          {isApplyingPromo ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                    </form>

                    <Button className="w-full mt-6" asChild>
                      <Link to="/checkout">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Proceed to Checkout
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-4 rounded-lg border bg-white p-6">
                  <h3 className="mb-4 font-medium">We Accept</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-md border bg-white px-3 py-2">
                      <span>Visa</span>
                    </div>
                    <div className="rounded-md border bg-white px-3 py-2">
                      <span>Mastercard</span>
                    </div>
                    <div className="rounded-md border bg-white px-3 py-2">
                      <span>PayPal</span>
                    </div>
                    <div className="rounded-md border bg-white px-3 py-2">
                      <span>Apple Pay</span>
                    </div>
                    <div className="rounded-md border bg-white px-3 py-2">
                      <span>Cash on Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-12">
              <div className="mb-4 rounded-full bg-brand-bg p-3">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">Your cart is empty</h2>
              <p className="mb-6 text-center text-muted-foreground">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button asChild>
                <Link to="/products">Start Shopping</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
