
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = 'Order Confirmation | Shoply';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Your order has been placed successfully.
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="font-medium">{id}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-sm text-muted-foreground">Order Date</span>
              <span className="font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className="mb-6 text-sm text-muted-foreground">
            We've sent a confirmation email to your email address with all the order details.
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to={`/order/${id}`}>View Order Details</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? <Link to="/contact" className="text-brand-blue hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
