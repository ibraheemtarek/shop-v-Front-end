import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';

// Sample order data (would come from API)
const sampleOrders = [
  {
    id: "ORD-12345",
    date: "2023-05-10T10:30:00Z",
    status: "delivered",
    total: 149.97,
    paymentMethod: "Credit Card",
    trackingNumber: "1ZW4X6789012345678",
    shippingAddress: {
      name: "John Doe",
      line1: "123 Main Street",
      line2: "Apt 4B",
      city: "New York",
      state: "NY",
      postal_code: "10001",
      country: "United States"
    },
    items: [
      {
        id: "1",
        name: "Wireless Bluetooth Headphones",
        price: 99.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      },
      {
        id: "4",
        name: "Stainless Steel Water Bottle",
        price: 19.99,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      },
      {
        id: "6",
        name: "Leather Wallet",
        price: 49.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    id: "ORD-67890",
    date: "2023-06-15T14:45:00Z",
    status: "processing",
    total: 299.99,
    paymentMethod: "PayPal",
    trackingNumber: null,
    shippingAddress: {
      name: "Jane Smith",
      line1: "456 Oak Avenue",
      line2: "",
      city: "San Francisco",
      state: "CA",
      postal_code: "94107",
      country: "United States"
    },
    items: [
      {
        id: "5",
        name: "Professional Digital Camera",
        price: 799.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      }
    ]
  }
];

// Status badge variants
const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: string, label: string }> = {
    'processing': { variant: 'outline', label: 'Processing' },
    'shipped': { variant: 'secondary', label: 'Shipped' },
    'delivered': { variant: 'default', label: 'Delivered' },
    'canceled': { variant: 'destructive', label: 'Canceled' }
  };
  return variants[status] || { variant: 'outline', label: status };
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch order details
    setLoading(true);
    setTimeout(() => {
      // Fixed: ensure we have a valid ID to search for
      const orderId = id || '';
      const foundOrder = sampleOrders.find(order => order.id === orderId);
      console.log("Looking for order with ID:", orderId);
      console.log("Found order:", foundOrder);
      setOrder(foundOrder || null);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-brand-bg p-6">
          <div className="container">
            <div className="flex animate-pulse flex-col space-y-4">
              <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              <div className="h-64 rounded bg-gray-200"></div>
              <div className="h-32 rounded bg-gray-200"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-brand-bg p-6">
          <div className="container">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-6 text-xl">Order not found</p>
              <Button asChild>
                <Link to="/account">Return to Your Account</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusBadge = getStatusBadge(order.status);
  
  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(order.date));

  // Calculate order summary
  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1; // 10% tax

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-brand-bg py-8">
        <div className="container">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-2">
              <Link to="/account">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold">Order {order.id}</h1>
              <div className="mt-2 sm:mt-0">
                <Badge 
                  variant={statusBadge.variant as any} 
                  className="text-sm font-medium px-3 py-1"
                >
                  {statusBadge.label}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">Placed on {formattedDate}</p>
          </div>

          {/* Order Status Timeline */}
          {order.status !== 'canceled' && (
            <div className="mb-8 rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold">Order Status</h2>
              <div className="relative flex justify-between">
                <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200"></div>
                <div className={`relative flex flex-col items-center ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'text-brand-blue' : 'text-gray-400'}`}>
                  <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Processing</p>
                </div>
                <div className={`relative flex flex-col items-center ${order.status === 'shipped' || order.status === 'delivered' ? 'text-brand-blue' : 'text-gray-400'}`}>
                  <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
                    <Truck className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Shipped</p>
                </div>
                <div className={`relative flex flex-col items-center ${order.status === 'delivered' ? 'text-brand-blue' : 'text-gray-400'}`}>
                  <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full ${order.status === 'delivered' ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Delivered</p>
                </div>
              </div>
              
              {order.trackingNumber && (
                <div className="mt-6 rounded border bg-gray-50 p-4">
                  <p className="text-sm text-muted-foreground">Tracking Number: <span className="font-medium text-brand-blue">{order.trackingNumber}</span></p>
                  <Button variant="link" className="p-0 text-brand-blue">
                    Track Package
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-white">
                <div className="p-6">
                  <h2 className="text-xl font-semibold">Order Items</h2>
                </div>
                <Separator />
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex border-b p-6">
                    <div className="mr-6 h-24 w-24 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full rounded-md object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          className="text-lg font-medium hover:text-brand-blue"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/product/${item.id}`}>Buy Again</Link>
                        </Button>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Details */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-6">
                  <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
                  <address className="not-italic">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </address>
                </div>
                <div className="rounded-lg border bg-white p-6">
                  <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
                  <p className="text-muted-foreground">{order.paymentMethod}</p>
                  <p className="mt-6 text-sm text-muted-foreground">Need help with your order?</p>
                  <Button variant="link" className="p-0 text-brand-blue">
                    <Link to="/contact">Contact Support</Link>
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
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <Link to="/contact">Need Help?</Link>
                </Button>
                <Button asChild>
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
