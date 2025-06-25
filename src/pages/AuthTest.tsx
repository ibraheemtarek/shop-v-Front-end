import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authUtils';
import { useAdminAuth } from '@/context/adminAuthUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Test component to verify the separation between user and admin authentication
 */
const AuthTest = () => {
  const { user, loading: userLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminAuth();
  const [userToken, setUserToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<string | null>(null);

  useEffect(() => {
    // Get tokens and data from localStorage
    setUserToken(localStorage.getItem('token'));
    setAdminToken(localStorage.getItem('adminToken'));
    setUserData(localStorage.getItem('userData'));
    setAdminData(localStorage.getItem('adminData'));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>User Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {userLoading ? 'Yes' : 'No'}</p>
              <p><strong>Is Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
              {user && (
                <>
                  <p><strong>User ID:</strong> {user._id}</p>
                  <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                </>
              )}
              <p><strong>User Token in localStorage:</strong> {userToken ? 'Present' : 'Not found'}</p>
              <p><strong>User Data in localStorage:</strong> {userData ? 'Present' : 'Not found'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {adminLoading ? 'Yes' : 'No'}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Admin Token in localStorage:</strong> {adminToken ? 'Present' : 'Not found'}</p>
              <p><strong>Admin Data in localStorage:</strong> {adminData ? 'Present' : 'Not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Local Storage Contents</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify({
            token: userToken,
            adminToken: adminToken,
            userData: userData ? JSON.parse(userData) : null,
            adminData: adminData ? JSON.parse(adminData) : null
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AuthTest;
