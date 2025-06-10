
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Package, ShoppingCart, Heart, LogOut, Settings, CreditCard, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Account = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');
  const { toast } = useToast();
  
  // Update active tab when URL changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Mock user data
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    }
  };

  // Mock orders
  const orders = [
    {
      id: 'ORD-1234',
      date: '2025-05-10',
      total: 125.99,
      status: 'Delivered',
      items: 3
    },
    {
      id: 'ORD-5678',
      date: '2025-05-05',
      total: 79.99,
      status: 'Processing',
      items: 2
    },
    {
      id: 'ORD-9012',
      date: '2025-04-28',
      total: 49.99,
      status: 'Shipped',
      items: 1
    }
  ];

  // Mock wishlist
  const [wishlist, setWishlist] = useState([
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: '2',
      name: 'Smart Watch',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    }
  ]);

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully."
    });
  };

  const handleRemoveFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
    toast({
      title: "Removed from wishlist",
      description: "The item has been removed from your wishlist."
    });
  };

  const handleAddToCart = (item: any) => {
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
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
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
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" defaultValue={user.name} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={user.email} />
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input id="street" defaultValue={user.address.street} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" defaultValue={user.address.city} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input id="state" defaultValue={user.address.state} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">Postal Code</Label>
                            <Input id="zip" defaultValue={user.address.zip} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" defaultValue={user.address.country} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'orders' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                            <div className="space-y-1 mb-2 md:mb-0">
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-muted-foreground">{order.date}</p>
                              <div className="text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col text-right">
                              <p className="font-medium">${order.total.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">{order.items} item{order.items > 1 ? 's' : ''}</p>
                              <Button variant="ghost" size="sm" className="mt-2" asChild>
                                <Link to={`/order/${order.id}`}>View Details</Link>
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
                    {wishlist.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wishlist.map((item) => (
                          <div key={item.id} className="flex border rounded-lg overflow-hidden">
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
                                <Button size="sm" variant="ghost" onClick={() => handleRemoveFromWishlist(item.id)}>
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
