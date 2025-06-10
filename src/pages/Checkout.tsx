
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, LockKeyhole, ArrowLeft, CreditCardIcon, Wallet, Truck, CheckCircle, Circle } from 'lucide-react';

// Sample cart items (would come from context/state)
const cartItems = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    quantity: 1,
  },
  {
    id: '5',
    name: 'Professional Digital Camera',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    quantity: 1,
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1; // 10% tax rate
  const total = subtotal + shipping + tax;

  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  // Handle payment form submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
    window.scrollTo(0, 0);
  };

  // Handle final order submission
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and will be processed shortly.",
      });
      setIsProcessing(false);
      // Generate random order ID and navigate to success page
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      navigate(`/order-success/${orderId}`);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-brand-bg py-8">
        <div className="container">
          <div className="mb-8">
            <Link to="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-blue">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
            </Link>
          </div>

          {/* Checkout Progress */}
          <div className="mb-8">
            <div className="relative flex justify-between">
              <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200"></div>
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`relative flex flex-col items-center ${
                    currentStep >= step ? 'text-brand-blue' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep === step
                        ? 'border-brand-blue bg-white text-brand-blue'
                        : currentStep > step
                        ? 'border-brand-blue bg-brand-blue text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {currentStep > step ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                  <span className="mt-2 text-sm">
                    {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Checkout Form */}
            <div className="md:col-span-2">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-semibold">Shipping Information</h2>
                  <form onSubmit={handleShippingSubmit}>
                    <div className="mb-4">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={shippingAddress.firstName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={shippingAddress.lastName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        placeholder="Street address"
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                      <Input
                        id="apartment"
                        value={shippingAddress.apartment}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State / Province</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          placeholder="State"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                        <Input
                          id="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                          placeholder="ZIP code"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        placeholder="Country"
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        placeholder="Phone number"
                        required
                      />
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Continue to Payment</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === 2 && (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
                  <form onSubmit={handlePaymentSubmit}>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                      {/* Credit Card Option */}
                      <div className={`rounded-md border p-4 ${paymentMethod === 'credit-card' ? 'border-brand-blue bg-blue-50' : ''}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="credit-card" value="credit-card" />
                          <Label htmlFor="credit-card" className="flex items-center">
                            <CreditCardIcon className="mr-2 h-5 w-5" />
                            Credit / Debit Card
                          </Label>
                        </div>
                        
                        {paymentMethod === 'credit-card' && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <Label htmlFor="card-number">Card Number</Label>
                              <Input id="card-number" placeholder="1234 5678 9012 3456" required />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-2">
                                <Label htmlFor="expiry">Expiry Date</Label>
                                <Input id="expiry" placeholder="MM / YY" required />
                              </div>
                              <div>
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="123" required />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="name-on-card">Name on Card</Label>
                              <Input id="name-on-card" placeholder="John Doe" required />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PayPal Option */}
                      <div className={`rounded-md border p-4 ${paymentMethod === 'paypal' ? 'border-brand-blue bg-blue-50' : ''}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="paypal" value="paypal" />
                          <Label htmlFor="paypal" className="flex items-center">
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.0825 5.81333C19.6295 5.32593 18.9868 5.02728 18.084 5.02728H13.242L13.2152 5.24396L13.176 5.54262L13.1494 5.76596H18.084C18.5509 5.76596 18.8625 5.8861 19.0896 6.10944C19.3033 6.31943 19.4508 6.65075 19.4508 7.08149C19.4508 7.26482 19.4242 7.45481 19.3976 7.6448L18.4014 13.3293C18.2936 13.9701 17.7734 14.4442 17.1332 14.4442H14.4768L14.2765 15.659L11.7336 15.6723C11.6788 15.6723 11.624 15.659 11.5824 15.6324C11.5407 15.6057 11.5143 15.5657 11.5143 15.5124C11.5143 15.499 11.5143 15.4857 11.5143 15.4724L12.1279 11.8385H12.918H15.0749H17.1332C17.1745 11.8385 17.2028 11.8118 17.2161 11.7852L18.4279 4.67263C18.4413 4.61264 18.4545 4.53931 18.4678 4.46598C18.0414 4.1673 17.5079 4 16.8676 4H8.89745C8.36391 4 7.90297 4.35466 7.75897 4.85871L5.24296 15.1936C5.2296 15.2403 5.22292 15.287 5.22292 15.347C5.22292 15.5124 5.35354 15.659 5.51759 15.659H8.04702L8.5406 13.0508L10.2962 4.85871V4.84538C10.2962 4.84538 11.0914 0 11.0914 0H20.4691C21.3322 0 22.0681 0.252 22.6283 0.770677C23.1885 1.27602 23.4867 1.9568 23.4867 2.79027C23.4867 3.33098 23.3826 3.93769 23.1753 4.63178C22.968 5.31254 22.6016 5.90592 22.0681 6.40997C21.5347 6.90069 20.87 7.15936 20.0736 7.15936H17.5633L17.8883 5.20394H20.0736C20.5761 5.20394 20.9623 5.38729 21.2214 5.75527C21.4807 6.11659 21.5482 6.58733 21.4415 7.17071C21.1959 8.32524 20.4287 8.90528 19.1347 8.90528H16.2478L15.6877 12.5814H15.0749H12.918H12.7909L12.6973 13.1088L12.3056 15.0702L11.4166 19.8788H8.84224L5.20094 19.8655C4.67401 19.8655 4.22646 19.5241 4.08247 19.02L1.55309 8.69529C1.53973 8.63532 1.53305 8.5753 1.53305 8.51531C1.53305 8.34997 1.66367 8.20331 1.82772 8.20331H4.35355L7.36464 0.76402C7.78216 -0.254678 8.80524 -0.0133236 9.82831 0H17.1488C17.9125 0 18.5654 0.132002 19.1078 0.382666C19.6935 0.65999 20.1661 1.05063 20.5258 1.55463C20.8856 2.0553 21.0762 2.66202 21.0762 3.36277C21.0762 3.77674 21.0082 4.21817 20.8734 4.69557C20.6458 4.95425 20.3854 5.19959 20.0825 5.41628V5.81333Z" fill="#003087" />
                              <path d="M8.04675 15.6457L8.54034 13.0375L10.2959 4.84534C10.2959 4.84534 11.0911 0 11.0911 0H8.82379C8.29025 0 7.82931 0.354659 7.68531 0.85871L5.1693 11.1936C5.15594 11.2403 5.14926 11.287 5.14926 11.347C5.14926 11.5124 5.27988 11.659 5.44393 11.659H7.97336L8.04675 15.6457Z" fill="#0070E0" />
                              <path d="M20.0731 7.15936H17.5629L17.8878 5.20394H20.0731C20.5756 5.20394 20.9618 5.38729 21.221 5.75527C21.4803 6.11659 21.5477 6.58733 21.441 7.17071C21.1954 8.32524 20.4283 8.90528 19.1342 8.90528H16.2473L15.6873 12.5814H12.1275L12.7411 8.94739H15.6607L16.1077 6.38663H13.149L13.1756 6.17663L13.2152 5.79531L13.2418 5.5753H18.0835C18.5504 5.5753 18.8621 5.69544 19.0891 5.91878C19.3029 6.12877 19.4503 6.46009 19.4503 6.89083C19.4503 7.07416 19.4237 7.26415 19.3971 7.45414V7.15936H20.0731Z" fill="#003087" />
                            </svg>
                            PayPal
                          </Label>
                        </div>
                        
                        {paymentMethod === 'paypal' && (
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">Click "Continue" to be redirected to PayPal to complete your purchase securely.</p>
                          </div>
                        )}
                      </div>

                      {/* Cash on Delivery Option */}
                      <div className={`rounded-md border p-4 ${paymentMethod === 'cash-on-delivery' ? 'border-brand-blue bg-blue-50' : ''}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="cash-on-delivery" value="cash-on-delivery" />
                          <Label htmlFor="cash-on-delivery" className="flex items-center">
                            <Wallet className="mr-2 h-5 w-5" />
                            Cash on Delivery
                          </Label>
                        </div>
                        
                        {paymentMethod === 'cash-on-delivery' && (
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">Pay with cash upon delivery. Please have the exact amount ready for our delivery person.</p>
                          </div>
                        )}
                      </div>
                    </RadioGroup>

                    <div className="mt-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="billing-same"
                          checked={billingAddressSameAsShipping}
                          onCheckedChange={() => setBillingAddressSameAsShipping(!billingAddressSameAsShipping)}
                        />
                        <Label htmlFor="billing-same">
                          Billing address is the same as shipping address
                        </Label>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back to Shipping
                      </Button>
                      <Button type="submit">Review Order</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-semibold">Review Your Order</h2>

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Shipping Address</h3>
                      <Button
                        variant="link"
                        className="p-0 text-brand-blue"
                        onClick={() => setCurrentStep(1)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="mt-2 rounded border p-4">
                      <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.address}</p>
                      {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                      <p>
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                      </p>
                      <p>{shippingAddress.country}</p>
                      <p>{shippingAddress.phone}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Payment Method</h3>
                      <Button
                        variant="link"
                        className="p-0 text-brand-blue"
                        onClick={() => setCurrentStep(2)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="mt-2 rounded border p-4">
                      {paymentMethod === 'credit-card' && (
                        <div className="flex items-center">
                          <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
                          <span>Credit / Debit Card</span>
                        </div>
                      )}
                      {paymentMethod === 'paypal' && (
                        <div className="flex items-center">
                          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.0825 5.81333C19.6295 5.32593 18.9868 5.02728 18.084 5.02728H13.242L13.2152 5.24396L13.176 5.54262L13.1494 5.76596H18.084C18.5509 5.76596 18.8625 5.8861 19.0896 6.10944C19.3033 6.31943 19.4508 6.65075 19.4508 7.08149C19.4508 7.26482 19.4242 7.45481 19.3976 7.6448L18.4014 13.3293C18.2936 13.9701 17.7734 14.4442 17.1332 14.4442H14.4768L14.2765 15.659L11.7336 15.6723C11.6788 15.6723 11.624 15.659 11.5824 15.6324C11.5407 15.6057 11.5143 15.5657 11.5143 15.5124C11.5143 15.499 11.5143 15.4857 11.5143 15.4724L12.1279 11.8385H12.918H15.0749H17.1332C17.1745 11.8385 17.2028 11.8118 17.2161 11.7852L18.4279 4.67263C18.4413 4.61264 18.4545 4.53931 18.4678 4.46598C18.0414 4.1673 17.5079 4 16.8676 4H8.89745C8.36391 4 7.90297 4.35466 7.75897 4.85871L5.24296 15.1936C5.2296 15.2403 5.22292 15.287 5.22292 15.347C5.22292 15.5124 5.35354 15.659 5.51759 15.659H8.04702L8.5406 13.0508L10.2962 4.85871V4.84538C10.2962 4.84538 11.0914 0 11.0914 0H20.4691C21.3322 0 22.0681 0.252 22.6283 0.770677C23.1885 1.27602 23.4867 1.9568 23.4867 2.79027C23.4867 3.33098 23.3826 3.93769 23.1753 4.63178C22.968 5.31254 22.6016 5.90592 22.0681 6.40997C21.5347 6.90069 20.87 7.15936 20.0736 7.15936H17.5633L17.8883 5.20394H20.0736C20.5761 5.20394 20.9623 5.38729 21.2214 5.75527C21.4807 6.11659 21.5482 6.58733 21.4415 7.17071C21.1959 8.32524 20.4287 8.90528 19.1347 8.90528H16.2478L15.6877 12.5814H15.0749H12.918H12.7909L12.6973 13.1088L12.3056 15.0702L11.4166 19.8788H8.84224L5.20094 19.8655C4.67401 19.8655 4.22646 19.5241 4.08247 19.02L1.55309 8.69529C1.53973 8.63532 1.53305 8.5753 1.53305 8.51531C1.53305 8.34997 1.66367 8.20331 1.82772 8.20331H4.35355L7.36464 0.76402C7.78216 -0.254678 8.80524 -0.0133236 9.82831 0H17.1488C17.9125 0 18.5654 0.132002 19.1078 0.382666C19.6935 0.65999 20.1661 1.05063 20.5258 1.55463C20.8856 2.0553 21.0762 2.66202 21.0762 3.36277C21.0762 3.77674 21.0082 4.21817 20.8734 4.69557C20.6458 4.95425 20.3854 5.19959 20.0825 5.41628V5.81333Z" fill="#003087" />
                            <path d="M8.04675 15.6457L8.54034 13.0375L10.2959 4.84534C10.2959 4.84534 11.0911 0 11.0911 0H8.82379C8.29025 0 7.82931 0.354659 7.68531 0.85871L5.1693 11.1936C5.15594 11.2403 5.14926 11.287 5.14926 11.347C5.14926 11.5124 5.27988 11.659 5.44393 11.659H7.97336L8.04675 15.6457Z" fill="#0070E0" />
                            <path d="M20.0731 7.15936H17.5629L17.8878 5.20394H20.0731C20.5756 5.20394 20.9618 5.38729 21.221 5.75527C21.4803 6.11659 21.5477 6.58733 21.441 7.17071C21.1954 8.32524 20.4283 8.90528 19.1342 8.90528H16.2473L15.6873 12.5814H12.1275L12.7411 8.94739H15.6607L16.1077 6.38663H13.149L13.1756 6.17663L13.2152 5.79531L13.2418 5.5753H18.0835C18.5504 5.5753 18.8621 5.69544 19.0891 5.91878C19.3029 6.12877 19.4503 6.46009 19.4503 6.89083C19.4503 7.07416 19.4237 7.26415 19.3971 7.45414V7.15936H20.0731Z" fill="#003087" />
                          </svg>
                          <span>PayPal</span>
                        </div>
                      )}
                      {paymentMethod === 'cash-on-delivery' && (
                        <div className="flex items-center">
                          <Wallet className="mr-2 h-5 w-5 text-muted-foreground" />
                          <span>Cash on Delivery</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items in Order */}
                  <div>
                    <h3 className="text-lg font-medium">Items in Your Order</h3>
                    <div className="mt-2 space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start rounded border p-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="mr-4 h-16 w-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back to Payment
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-20 rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                </div>
                <Separator />
                <div className="p-6">
                  {/* Order items */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Order calculations */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <LockKeyhole className="h-4 w-4" />
                    <span>Secure Checkout</span>
                  </div>

                  {/* Shipping estimate */}
                  <div className="mt-6">
                    <div className="rounded-md bg-gray-50 p-3">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm">
                          {subtotal > 100
                            ? 'Free standard shipping'
                            : 'Free shipping on orders over $100'}
                        </p>
                      </div>
                      <p className="ml-7 mt-1 text-xs text-muted-foreground">
                        Estimated delivery: 3-5 business days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
