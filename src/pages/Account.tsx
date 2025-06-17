import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Package, ShoppingCart, Heart, LogOut, Settings, CreditCard, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import UserService, { User as UserType } from '@/services/userService';
import OrderService, { Order } from '@/services/orderService';
import { Product } from '@/services/productService';

// Use the User type from userService - no need to redefine it
// Adding a placeholder avatar helper since User doesn't include avatar
// Using Product type from productService for wishlist items

// The User type from userService doesn't have an avatar field

// Form data interface for profile updates
interface ProfileFormData {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const getAvatarUrl = (user: UserType) => {
  return `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;
};

const Account = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');
  const { toast } = useToast();
  
  // State for user data with loading and error handling
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for orders data with loading and error handling
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  
  // State for wishlist data with loading and error handling
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  
  // Update active tab when URL changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Use the UserService instead of direct API call
        const userData = await UserService.getUserProfile();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Fetch orders when orders tab is active
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab === 'orders') {
        try {
          setOrdersLoading(true);
          setOrdersError(null);
          const ordersData = await OrderService.getUserOrders();
          setOrders(ordersData);
        } catch (err) {
          console.error('Failed to fetch orders data:', err);
          setOrdersError('Failed to load your orders. Please try again later.');
        } finally {
          setOrdersLoading(false);
        }
      }
    };
    
    fetchOrders();
  }, [activeTab]);

  // Fetch wishlist when wishlist tab is active
  useEffect(() => {
    const fetchWishlist = async () => {
      if (activeTab === 'wishlist') {
        try {
          setWishlistLoading(true);
          setWishlistError(null);
          const wishlistData = await UserService.getWishlist();
          setWishlist(wishlistData);
        } catch (err) {
          console.error('Failed to fetch wishlist data:', err);
          setWishlistError('Failed to load your wishlist. Please try again later.');
        } finally {
          setWishlistLoading(false);
        }
      }
    };
    
    fetchWishlist();
  }, [activeTab]);

  const handleSaveProfile = async (formData: ProfileFormData) => {
    try {
      setIsLoading(true);
      
      // Process form data to match User interface
      const nameParts = formData.name.split(' ');
      const updateData: Partial<UserType> = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: formData.email,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zip, // Note: API expects zipCode, not zip
          country: formData.address.country
        }
      };
      
      // Use UserService to update profile
      const response = await UserService.updateUserProfile(updateData);
      
      // Refresh user data to ensure we have the latest
      const updatedUser = await UserService.getUserProfile();
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      await UserService.removeFromWishlist(id);
      setWishlist(wishlist.filter(item => item._id !== id));
      toast({
        title: "Removed from wishlist",
        description: "The item has been removed from your wishlist."
      });
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      toast({
        title: "Failed to remove",
        description: "There was an error removing the item from your wishlist.",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = (item: Product) => {
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`
    });
  };

  const handleUpdatePassword = () => {
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully."
    });
  };

  const handleAddPaymentMethod = () => {
    toast({
      title: "Feature coming soon",
      description: "This feature will be available soon."
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "We've sent you an email with confirmation details.",
      variant: "destructive"
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-brand-bg">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">My Account</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <Card className="h-fit lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-6">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Loading user data...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center text-center p-4">
                      <p className="text-sm text-destructive mb-2">{error}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : user && (
                    <>
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                        <img 
                          src={getAvatarUrl(user)} 
                          alt={user.firstName + ' ' + user.lastName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-medium">{user.firstName + ' ' + user.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </>
                  )}
                </div>
                
                <nav>
                  <ul className="space-y-1">
                    <li>
                      <Button
                        variant={activeTab === 'profile' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('profile')}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeTab === 'orders' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('orders')}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeTab === 'wishlist' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('wishlist')}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeTab === 'payment' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('payment')}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Payment Methods
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeTab === 'settings' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('settings')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </li>
                  </ul>
                </nav>
              </CardContent>
            </Card>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Loading your profile...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button 
                          onClick={() => window.location.reload()} 
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : user && (
                      <form className="space-y-4" onSubmit={(e) => { 
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const updatedProfile = {
                          name: formData.get('name') as string,
                          email: formData.get('email') as string,
                          address: {
                            street: formData.get('street') as string,
                            city: formData.get('city') as string,
                            state: formData.get('state') as string,
                            zip: formData.get('zip') as string,
                            country: formData.get('country') as string
                          }
                        };
                        handleSaveProfile(updatedProfile);
                      }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" defaultValue={user.firstName + ' ' + user.lastName} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={user.email} />
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="street">Street Address</Label>
                              <Input id="street" name="street" defaultValue={user.address?.street || ''} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input id="city" name="city" defaultValue={user.address?.city || ''} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state">State/Province</Label>
                              <Input id="state" name="state" defaultValue={user.address?.state || ''} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="zip">Postal Code</Label>
                              <Input id="zip" name="zip" defaultValue={user.address?.zipCode} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="country">Country</Label>
                              <Input id="country" name="country" defaultValue={user.address?.country || ''} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'orders' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Loading your orders...</p>
                      </div>
                    ) : ordersError ? (
                      <div className="text-center py-8">
                        <p className="text-destructive mb-4">{ordersError}</p>
                        <Button 
                          onClick={() => setActiveTab('orders')} 
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order._id} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                            <div className="space-y-1 mb-2 md:mb-0">
                              <p className="font-medium">{order.orderNumber || order._id}</p>
                              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                              <div className="text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col text-right">
                              <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">{order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}</p>
                              <Button variant="ghost" size="sm" className="mt-2" asChild>
                                <Link to={`/order/${order._id}`}>View Details</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-4">Start shopping to place your first order</p>
                        <Button asChild>
                          <Link to="/products">Browse Products</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'wishlist' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Wishlist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wishlistLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Loading your wishlist...</p>
                      </div>
                    ) : wishlistError ? (
                      <div className="text-center py-8">
                        <p className="text-destructive mb-4">{wishlistError}</p>
                        <Button 
                          onClick={() => setActiveTab('wishlist')} 
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : wishlist.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wishlist.map((item) => (
                          <div key={item._id} className="flex border rounded-lg overflow-hidden">
                            <div className="w-24 h-24">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-between p-3 flex-1">
                              <div>
                                <h3 className="font-medium line-clamp-1">{item.name}</h3>
                                <p className="text-sm font-bold">${item.price.toFixed(2)}</p>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => handleAddToCart(item)}>
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Add to Cart
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleRemoveFromWishlist(item._id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                        <p className="text-muted-foreground mb-4">Save items you love to your wishlist</p>
                        <Button asChild>
                          <Link to="/products">Browse Products</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No payment methods yet</h3>
                      <p className="text-muted-foreground mb-4">Add your first payment method to quickly checkout</p>
                      <Button onClick={handleAddPaymentMethod}>Add Payment Method</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'settings' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }}>
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <Button type="submit">Update Password</Button>
                      </form>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center text-destructive">
                        Danger Zone
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
