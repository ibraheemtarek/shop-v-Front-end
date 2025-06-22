import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import orderService, { Order } from '@/services/orderService';

// Status badge variants

// Status badge variants
const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: string, label: string }> = {
    'processing': { variant: 'outline', label: 'Processing' },
    'shipped': { variant: 'secondary', label: 'Shipped' },
    'delivered': { variant: 'default', label: 'Delivered' },
    'cancelled': { variant: 'destructive', label: 'Cancelled' }
  };
  return variants[status] || { variant: 'outline', label: status };
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Order ID is missing",
          variant: "destructive"
        });
        navigate('/account');
        return;
      }

      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(id);
        setOrder(orderData);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, toast, navigate]);

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
  }).format(new Date(order.createdAt));

  // Get order summary values from the order data
  const subtotal = order.itemsPrice;
  const shipping = order.shippingPrice;
  const tax = order.taxPrice;

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
              <h1 className="text-3xl font-bold">Order {order.orderNumber || order._id}</h1>
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
          {order.status !== 'cancelled' && (
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
              
              {order.isDelivered && order.deliveredAt && (
                <div className="mt-6 rounded border bg-gray-50 p-4">
                  <p className="text-sm text-muted-foreground">Delivered on: <span className="font-medium text-brand-blue">
                    {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span></p>
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
                {order.orderItems.map((item) => (
                  <div key={item.product} className="flex border-b p-6">
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
                          to={`/product/${item.product}`}
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
                          <Link to={`/product/${item.product}`}>Buy Again</Link>
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
                    <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
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
                    <span>${order.totalPrice.toFixed(2)}</span>
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
