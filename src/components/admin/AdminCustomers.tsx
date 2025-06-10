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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Search, Trash, UserPlus, Loader2 } from 'lucide-react';
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
import userService, { User as ApiUser } from '@/services/userService';
import orderService from '@/services/orderService';
import mockData from '@/services/mockData';

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  status: string;
  lastOrder: string;
  image: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'orders' | 'spent' | 'lastOrder'>>({
    name: '',
    email: '',
    status: 'New',
    image: ''
  });

  const { toast } = useToast();

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
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
        
        // Fetch users (customers)
        const users = await userService.getAllUsers();
        console.log('API Users:', users);
        
        // Fetch orders to calculate spent amount and last order date
        let ordersByUser: Record<string, { count: number; total: number; lastDate: string }> = {};
        try {
          const orders = await orderService.getOrders();
          
          // Group orders by user
          orders.forEach(order => {
            const userId = order.user;
            if (!ordersByUser[userId]) {
              ordersByUser[userId] = { count: 0, total: 0, lastDate: '' };
            }
            
            ordersByUser[userId].count += 1;
            ordersByUser[userId].total += order.totalPrice;
            
            // Update last order date if this order is more recent
            const orderDate = new Date(order.createdAt);
            const currentLastDate = ordersByUser[userId].lastDate ? 
              new Date(ordersByUser[userId].lastDate) : new Date(0);
              
            if (orderDate > currentLastDate) {
              ordersByUser[userId].lastDate = order.createdAt;
            }
          });
        } catch (err) {
          console.error('Error fetching orders for customer data:', err);
          // Continue with users data even if orders fetch fails
        }
        
        // Transform API users to our local customer format
        const transformedCustomers = users
          .filter(user => user.role === 'user') // Only include regular users, not admins
          .map(user => {
            const userOrders = ordersByUser[user._id] || { count: 0, total: 0, lastDate: '' };
            const fullName = `${user.firstName} ${user.lastName}`;
            
            // Determine status based on order history
            let status = 'New';
            if (userOrders.count > 0) {
              const lastOrderDate = userOrders.lastDate ? new Date(userOrders.lastDate) : null;
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              
              status = lastOrderDate && lastOrderDate > threeMonthsAgo ? 'Active' : 'Inactive';
            }
            
            return {
              id: user._id,
              name: fullName,
              email: user.email,
              orders: userOrders.count,
              spent: userOrders.total,
              status,
              lastOrder: userOrders.lastDate ? new Date(userOrders.lastDate).toISOString().split('T')[0] : '',
              image: ''
            };
          });
        
        setCustomers(transformedCustomers);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers. Using mock data for testing.');
        
        // Use mock data for testing
        const mockUsers = mockData.getUsers();
        const mockOrders = mockData.getOrders();
        
        // Create a map of orders by user
        const ordersByUser: Record<string, { count: number; total: number; lastDate: string }> = {};
        mockOrders.forEach(order => {
          const userId = order.user;
          if (!ordersByUser[userId]) {
            ordersByUser[userId] = { count: 0, total: 0, lastDate: '' };
          }
          
          ordersByUser[userId].count += 1;
          ordersByUser[userId].total += order.totalPrice;
          
          // Update last order date if this order is more recent
          if (!ordersByUser[userId].lastDate || new Date(order.createdAt) > new Date(ordersByUser[userId].lastDate)) {
            ordersByUser[userId].lastDate = order.createdAt;
          }
        });
        
        // Transform mock users to our local customer format
        const mockCustomers = mockUsers
          .filter(user => user.role === 'user')
          .map(user => {
            const userOrders = ordersByUser[user._id] || { count: 0, total: 0, lastDate: '' };
            const fullName = `${user.firstName} ${user.lastName}`;
            
            // Determine status based on order history
            let status = 'New';
            if (userOrders.count > 0) {
              const lastOrderDate = userOrders.lastDate ? new Date(userOrders.lastDate) : null;
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              
              status = lastOrderDate && lastOrderDate > threeMonthsAgo ? 'Active' : 'Inactive';
            }
            
            return {
              id: user._id,
              name: fullName,
              email: user.email,
              orders: userOrders.count,
              spent: userOrders.total,
              status,
              lastOrder: userOrders.lastDate ? new Date(userOrders.lastDate).toISOString().split('T')[0] : '',
              image: ''
            };
          });
        
        setCustomers(mockCustomers);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = () => {
    // Note: The API might not support direct customer creation
    // This is a placeholder for when the API supports it
    toast({
      title: "Feature Not Available",
      description: "Adding customers directly is not supported. Users must register through the signup page.",
      variant: "destructive"
    });
  };

  const handleEditCustomer = () => {
    // Note: The API might not support customer editing from admin panel
    // This is a placeholder for when the API supports it
    if (!currentCustomer) return;
    
    toast({
      title: "Feature Not Available",
      description: "Editing customer details directly is not supported in this version.",
      variant: "destructive"
    });
  };

  const handleDeleteCustomer = () => {
    // Note: The API might not support customer deletion
    // This is a placeholder for when the API supports it
    if (!currentCustomer) return;
    
    toast({
      title: "Feature Not Available",
      description: "Deleting customers is not supported in this version.",
      variant: "destructive"
    });
  };

  function getInitials(name: string) {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          <span className="ml-2">Loading customers...</span>
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
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new customer below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input 
                      id="name" 
                      className="col-span-3" 
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      className="col-span-3" 
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select 
                      onValueChange={(value) => setNewCustomer({...newCustomer, status: value})}
                      defaultValue={newCustomer.status}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCustomer}>Add Customer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? 'No customers match your search' : 'No customers found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={customer.image} alt={customer.name} />
                              <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                            customer.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>${customer.spent.toFixed(2)}</TableCell>
                        <TableCell>{customer.lastOrder || 'Never'}</TableCell>
                        <TableCell className="text-right">
                          <Dialog open={isViewDialogOpen && currentCustomer?.id === customer.id} onOpenChange={(open) => {
                            setIsViewDialogOpen(open);
                            if (!open) setCurrentCustomer(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentCustomer(customer)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Customer Details</DialogTitle>
                                <DialogDescription>
                                  View details for {customer.name}.
                                </DialogDescription>
                              </DialogHeader>
                              {currentCustomer && (
                                <div className="py-4">
                                  <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage src={currentCustomer.image} alt={currentCustomer.name} />
                                      <AvatarFallback className="text-lg">{getInitials(currentCustomer.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-bold">{currentCustomer.name}</h3>
                                      <p className="text-muted-foreground">{currentCustomer.email}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer Information</h4>
                                      <div className="space-y-1">
                                        <p><strong>Status:</strong> {currentCustomer.status}</p>
                                        <p><strong>Joined:</strong> Unknown</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Order Information</h4>
                                      <div className="space-y-1">
                                        <p><strong>Total Orders:</strong> {currentCustomer.orders}</p>
                                        <p><strong>Total Spent:</strong> ${currentCustomer.spent.toFixed(2)}</p>
                                        <p><strong>Last Order:</strong> {currentCustomer.lastOrder || 'Never'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isEditDialogOpen && currentCustomer?.id === customer.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (!open) setCurrentCustomer(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentCustomer(customer)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Customer</DialogTitle>
                                <DialogDescription>
                                  Make changes to {customer.name}'s information below.
                                </DialogDescription>
                              </DialogHeader>
                              {currentCustomer && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                                    <Input 
                                      id="edit-name" 
                                      className="col-span-3" 
                                      value={currentCustomer.name}
                                      onChange={(e) => setCurrentCustomer({...currentCustomer, name: e.target.value})}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-email" className="text-right">Email</Label>
                                    <Input 
                                      id="edit-email" 
                                      type="email" 
                                      className="col-span-3" 
                                      value={currentCustomer.email}
                                      onChange={(e) => setCurrentCustomer({...currentCustomer, email: e.target.value})}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-status" className="text-right">Status</Label>
                                    <Select 
                                      onValueChange={(value) => setCurrentCustomer({...currentCustomer, status: value})}
                                      defaultValue={currentCustomer.status}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleEditCustomer}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isDeleteDialogOpen && currentCustomer?.id === customer.id} onOpenChange={(open) => {
                            setIsDeleteDialogOpen(open);
                            if (!open) setCurrentCustomer(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentCustomer(customer)}>
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Customer</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this customer? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              {currentCustomer && (
                                <div className="py-4">
                                  <p><strong>Name:</strong> {currentCustomer.name}</p>
                                  <p><strong>Email:</strong> {currentCustomer.email}</p>
                                  <p><strong>Orders:</strong> {currentCustomer.orders}</p>
                                  <p><strong>Total Spent:</strong> ${currentCustomer.spent.toFixed(2)}</p>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDeleteCustomer}>Delete Customer</Button>
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

export default AdminCustomers;
