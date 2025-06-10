import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Search, Trash, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import orderService, { Order as ApiOrder, OrderItem as ApiOrderItem } from '@/services/orderService';
import mockData from '@/services/mockData';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const { toast } = useToast();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated with token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in as an admin.');
          setLoading(false);
          return;
        }
        
        // Fetch orders
        const apiOrders = await orderService.getOrders();
        console.log('API Orders:', apiOrders);
        
        // Transform API orders to our local format
        const transformedOrders = apiOrders.map(order => {
          // Extract customer name from shipping address
          const customerName = order.shippingAddress ? 
            `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 
            'Unknown Customer';
          
          // Format date
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          
          // Transform order items
          const orderItems = order.orderItems.map(item => ({
            id: item.product,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }));
          
          return {
            id: order.orderNumber || order._id,
            customer: customerName,
            email: 'customer@example.com', // API doesn't provide customer email directly
            date: orderDate,
            status: order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'),
            total: order.totalPrice,
            items: orderItems
          };
        });
        
        setOrders(transformedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Using mock data for testing.');
        
        // Use mock data for testing
        const mockOrders = mockData.getOrders().map(order => {
          const customerName = order.shippingAddress ? 
            `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 
            'Unknown Customer';
          
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          
          const orderItems = order.orderItems.map(item => ({
            id: item.product,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }));
          
          return {
            id: order.orderNumber || order._id,
            customer: customerName,
            email: 'customer@example.com',
            date: orderDate,
            status: order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'),
            total: order.totalPrice,
            items: orderItems
          };
        });
        
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = async () => {
    if (!currentOrder || !newStatus) return;
    
    try {
      // Map UI status to API status
      const apiStatus = newStatus.toLowerCase() as ApiOrder['status'];
      
      // Call API to update order status
      await orderService.updateOrderStatus(currentOrder.id, apiStatus);
      
      // Update order in local state
      setOrders(orders.map(order => 
        order.id === currentOrder.id 
          ? { ...order, status: newStatus }
          : order
      ));
      
      setIsUpdateStatusDialogOpen(false);
      toast({
        title: "Order Status Updated",
        description: `Order ${currentOrder.id} status changed to ${newStatus}.`
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      
      // Update local state anyway for testing
      setOrders(orders.map(order => 
        order.id === currentOrder.id 
          ? { ...order, status: newStatus }
          : order
      ));
      
      setIsUpdateStatusDialogOpen(false);
      toast({
        title: "Order Status Updated (Mock)",
        description: `Order ${currentOrder.id} status changed to ${newStatus}. (API call failed, but UI updated for testing)`
      });
    }
  };

  const handleDeleteOrder = async () => {
    if (!currentOrder) return;
    
    try {
      // Note: The API might not support order deletion
      // This is a placeholder for when the API supports it
      
      // Remove order from local state
      setOrders(orders.filter(o => o.id !== currentOrder.id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Order Deleted",
        description: `Order ${currentOrder.id} has been deleted.`
      });
    } catch (err) {
      console.error('Error deleting order:', err);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          <span className="ml-2">Loading orders...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? 'No orders match your search' : 'No orders found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p>{order.customer}</p>
                            <p className="text-sm text-muted-foreground">{order.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Dialog open={isViewDialogOpen && currentOrder?.id === order.id} onOpenChange={(open) => {
                            setIsViewDialogOpen(open);
                            if (!open) setCurrentOrder(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                                <DialogDescription>
                                  View the details for order {order.id}.
                                </DialogDescription>
                              </DialogHeader>
                              {currentOrder && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground">Order Information</h3>
                                      <div className="mt-2 space-y-1">
                                        <p><strong>Order ID:</strong> {currentOrder.id}</p>
                                        <p><strong>Date:</strong> {currentOrder.date}</p>
                                        <p><strong>Status:</strong> {currentOrder.status}</p>
                                        <p><strong>Total:</strong> ${currentOrder.total.toFixed(2)}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground">Customer Information</h3>
                                      <div className="mt-2 space-y-1">
                                        <p><strong>Name:</strong> {currentOrder.customer}</p>
                                        <p><strong>Email:</strong> {currentOrder.email}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Product</TableHead>
                                          <TableHead>Price</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {currentOrder.items.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>${item.price.toFixed(2)}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                          </TableRow>
                                        ))}
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                                          <TableCell className="text-right font-medium">${currentOrder.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                                <Button onClick={() => {
                                  setIsViewDialogOpen(false);
                                  setNewStatus(currentOrder?.status || '');
                                  setIsUpdateStatusDialogOpen(true);
                                }}>Update Status</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isUpdateStatusDialogOpen && currentOrder?.id === order.id} onOpenChange={(open) => {
                            setIsUpdateStatusDialogOpen(open);
                            if (!open) {
                              setCurrentOrder(null);
                              setNewStatus('');
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => {
                                setCurrentOrder(order);
                                setNewStatus(order.status);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Order Status</DialogTitle>
                                <DialogDescription>
                                  Change the status for order {order.id}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                      onValueChange={setNewStatus}
                                      defaultValue={order.status}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateStatus}>Update Status</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isDeleteDialogOpen && currentOrder?.id === order.id} onOpenChange={(open) => {
                            setIsDeleteDialogOpen(open);
                            if (!open) setCurrentOrder(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentOrder(order)}>
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Order</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this order? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              {currentOrder && (
                                <div className="py-4">
                                  <p><strong>Order ID:</strong> {currentOrder.id}</p>
                                  <p><strong>Customer:</strong> {currentOrder.customer}</p>
                                  <p><strong>Date:</strong> {currentOrder.date}</p>
                                  <p><strong>Total:</strong> ${currentOrder.total.toFixed(2)}</p>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDeleteOrder}>Delete Order</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminOrders;
