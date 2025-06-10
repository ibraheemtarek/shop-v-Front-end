
import { useState, useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  List,
  Grid2X2,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminCustomers from '@/components/admin/AdminCustomers';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { toast } = useToast();
  
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    
    // Redirect to login page
    window.location.href = '/admin/login';
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r transition-all duration-300 ease-in-out hidden md:block`}
      >
        <div className="p-6">
          <Link to="/admin" className="flex items-center gap-2">
            {sidebarOpen ? (
              <span className="text-xl font-bold text-brand-blue">Shoply Admin</span>
            ) : (
              <span className="text-xl font-bold text-brand-blue">S</span>
            )}
          </Link>
        </div>
        <nav className="space-y-2 px-4">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${location.pathname === '/admin' ? 'bg-gray-100' : ''}`}
            asChild
          >
            <Link to="/admin">
              <Grid2X2 className="h-5 w-5" />
              {sidebarOpen && <span>Dashboard</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${location.pathname === '/admin/products' ? 'bg-gray-100' : ''}`}
            asChild
          >
            <Link to="/admin/products">
              <Package className="h-5 w-5" />
              {sidebarOpen && <span>Products</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${location.pathname === '/admin/categories' ? 'bg-gray-100' : ''}`}
            asChild
          >
            <Link to="/admin/categories">
              <List className="h-5 w-5" />
              {sidebarOpen && <span>Categories</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${location.pathname === '/admin/orders' ? 'bg-gray-100' : ''}`}
            asChild
          >
            <Link to="/admin/orders">
              <ShoppingCart className="h-5 w-5" />
              {sidebarOpen && <span>Orders</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${location.pathname === '/admin/customers' ? 'bg-gray-100' : ''}`}
            asChild
          >
            <Link to="/admin/customers">
              <Users className="h-5 w-5" />
              {sidebarOpen && <span>Customers</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${location.pathname === '/admin/settings' ? 'bg-gray-100' : ''}`}
            asChild
          >
            <Link to="/admin/settings">
              <Settings className="h-5 w-5" />
              {sidebarOpen && <span>Settings</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </nav>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Button
          className="rounded-full w-12 h-12 p-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <List className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)}></div>
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white p-4">
            <div className="flex justify-between items-center mb-6">
              <Link to="/admin" className="flex items-center gap-2">
                <span className="text-xl font-bold text-brand-blue">Shoply Admin</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${location.pathname === '/admin' ? 'bg-gray-100' : ''}`}
                asChild
              >
                <Link to="/admin" onClick={() => setSidebarOpen(false)}>
                  <Grid2X2 className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${location.pathname === '/admin/products' ? 'bg-gray-100' : ''}`}
                asChild
              >
                <Link to="/admin/products" onClick={() => setSidebarOpen(false)}>
                  <Package className="h-5 w-5" />
                  <span>Products</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${location.pathname === '/admin/categories' ? 'bg-gray-100' : ''}`}
                asChild
              >
                <Link to="/admin/categories" onClick={() => setSidebarOpen(false)}>
                  <List className="h-5 w-5" />
                  <span>Categories</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${location.pathname === '/admin/orders' ? 'bg-gray-100' : ''}`}
                asChild
              >
                <Link to="/admin/orders" onClick={() => setSidebarOpen(false)}>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Orders</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${location.pathname === '/admin/customers' ? 'bg-gray-100' : ''}`}
                asChild
              >
                <Link to="/admin/customers" onClick={() => setSidebarOpen(false)}>
                  <Users className="h-5 w-5" />
                  <span>Customers</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${location.pathname === '/admin/settings' ? 'bg-gray-100' : ''}`}
                asChild
              >
                <Link to="/admin/settings" onClick={() => setSidebarOpen(false)}>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b h-16">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <span className="ml-2 text-lg font-medium">
                {location.pathname === '/admin' && 'Dashboard'}
                {location.pathname === '/admin/products' && 'Products'}
                {location.pathname === '/admin/categories' && 'Categories'}
                {location.pathname === '/admin/orders' && 'Orders'}
                {location.pathname === '/admin/customers' && 'Customers'}
                {location.pathname === '/admin/settings' && 'Settings'}
              </span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-medium">
                {location.pathname === '/admin' && 'Dashboard Overview'}
                {location.pathname === '/admin/products' && 'Product Management'}
                {location.pathname === '/admin/categories' && 'Category Management'}
                {location.pathname === '/admin/orders' && 'Order Management'}
                {location.pathname === '/admin/customers' && 'Customer Management'}
                {location.pathname === '/admin/settings' && 'System Settings'}
              </h1>
            </div>
            <div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/profile">
                  <User className="h-5 w-5 mr-2" />
                  <span>Admin</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<AdminDashboardContent />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/customers" element={<AdminCustomers />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/profile" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
