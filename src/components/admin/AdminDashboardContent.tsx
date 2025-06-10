
import { useEffect, useState } from 'react';
import {
  BarChart as BarChartIcon,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import dashboardService, { DashboardStats } from '@/services/dashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboardContent = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardStats();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  // Fallback to empty data if API call failed but didn't throw an error
  const data = dashboardData || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    customersGrowth: 0,
    recentOrders: [],
    monthlySales: []
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Welcome back, Admin!</h2>
        <p className="text-muted-foreground">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <DollarSign className="h-6 w-6 text-brand-blue" />
              </div>
              <div>
                <p className="text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</h3>
                <p className="text-sm text-green-500">+{data.revenueGrowth}% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <ShoppingCart className="h-6 w-6 text-brand-yellow" />
              </div>
              <div>
                <p className="text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{data.totalOrders.toLocaleString()}</h3>
                <p className="text-sm text-green-500">+{data.ordersGrowth}% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-100 p-3">
                <Package className="h-6 w-6 text-brand-orange" />
              </div>
              <div>
                <p className="text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold">{data.totalProducts.toLocaleString()}</h3>
                <p className="text-sm text-green-500">+{data.productsGrowth} new this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-muted-foreground">Total Customers</p>
                <h3 className="text-2xl font-bold">{data.totalCustomers.toLocaleString()}</h3>
                <p className="text-sm text-green-500">+{data.customersGrowth} new this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            {data.monthlySales.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.monthlySales}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center border rounded-md p-4 bg-gray-50">
                <BarChartIcon className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest {data.recentOrders.length || 5} orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentOrders.length > 0 ? (
              data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      order.status === 'Processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No recent orders found</p>
              </div>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboardContent;
