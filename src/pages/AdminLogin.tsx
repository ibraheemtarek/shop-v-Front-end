import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import userService from '@/services/userService';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isLoading, checkAdminStatus } = useAdminAuth();
  
  // Get the redirect path from location state or default to /admin
  const from = location.state?.from?.pathname || '/admin';
  
  // Check if user is already authenticated as admin
  useEffect(() => {
    const checkAuth = async () => {
      const isAdminUser = await checkAdminStatus();
      if (isAdminUser) {
        // If already authenticated as admin, redirect to admin dashboard
        navigate(from, { replace: true });
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await userService.login({ email, password });
      
      if (response.role !== 'admin') {
        toast({
          title: 'Access Denied',
          description: 'This area is restricted to administrators only.',
          variant: 'destructive',
        });
        // Clear any existing tokens
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        return;
      }
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${response.firstName}!`,
      });
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.role);
      
      // Update admin status in context
      await checkAdminStatus();
      
      // Redirect to the original destination
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin area
            </CardDescription>
          </CardHeader>
          <div className="px-6 py-2 bg-blue-50 border-l-4 border-blue-500 text-sm">
            <p className="font-medium">Demo Credentials:</p>
            <p>Email: admin@admin.com</p>
            <p>Password: admin123</p>
          </div>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Not an administrator? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Return to customer login</a>
            </p>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Shopverse Admin &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
