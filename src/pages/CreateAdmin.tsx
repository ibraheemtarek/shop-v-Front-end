import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import createAdminAccount from '@/utils/createAdminAccount';

const CreateAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createAdminAccount();
      
      if (response && response.role === 'admin') {
        setSuccess(true);
        // Check if this is a mock account (token starts with 'mock-')
        const isMockAccount = response.token.startsWith('mock-admin-token');
        setIsMock(isMockAccount);
        
        toast({
          title: isMockAccount ? 'Mock Admin Account Created' : 'Admin Account Created',
          description: `Admin account with email admin@admin.com has been ${isMockAccount ? 'mocked' : 'created'} successfully.`,
        });
      } else {
        throw new Error('Failed to create admin account with admin privileges');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error Creating Admin Account',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Admin Account</CardTitle>
          <CardDescription className="text-center">
            Create an admin account with predefined credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm font-mono">admin@admin.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Password:</span>
              <span className="text-sm font-mono">admin123</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm">Admin User</span>
            </div>
          </div>

          {success && (
            <div className={`${isMock ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'} p-4 rounded-md flex items-center gap-2`}>
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">{isMock ? 'Mock admin account created!' : 'Admin account created successfully!'}</p>
                {isMock && (
                  <p className="text-xs mt-1">Note: This is a mock account for testing as the API connection failed.</p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            className="w-full" 
            onClick={handleCreateAdmin} 
            disabled={loading || success}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Admin...
              </>
            ) : success ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Admin {isMock ? 'Mock Account' : 'Account'} Created
              </>
            ) : (
              'Create Admin Account'
            )}
          </Button>
          
          {success && (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/login">
                Go to Admin Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAdmin;
