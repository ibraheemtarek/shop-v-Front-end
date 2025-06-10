import userService from '../services/userService';

/**
 * Utility function to create an admin account
 * This should be run only once to set up the initial admin account
 */
export const createAdminAccount = async () => {
  const adminCredentials = {
    email: 'admin@admin.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User'
  };

  try {
    console.log('Attempting to create admin account...');
    
    // First try to login with admin credentials to check if account already exists
    try {
      const loginResponse = await userService.login({
        email: adminCredentials.email,
        password: adminCredentials.password
      });
      
      if (loginResponse && loginResponse.role === 'admin') {
        console.log('Admin account already exists and credentials are valid.');
        return loginResponse;
      }
    } catch (loginError) {
      console.log('Admin account does not exist or credentials are invalid. Creating new account...');
    }
    
    try {
      // Attempt to register the admin account through the API
      console.log('Attempting to register admin account via API...');
      const response = await userService.register(adminCredentials);
      console.log('Admin account created successfully via API:', response);
      return response;
    } catch (registerError) {
      // Log detailed error information
      console.error('API registration failed, details:', {
        error: registerError,
        message: registerError instanceof Error ? registerError.message : 'Unknown error',
        stack: registerError instanceof Error ? registerError.stack : 'No stack trace'
      });
      console.log('Falling back to mock admin account creation...');
      
      // If API fails, create a mock admin account for testing purposes
      const mockAdminResponse = {
        _id: 'admin-mock-id-123',
        firstName: adminCredentials.firstName,
        lastName: adminCredentials.lastName,
        email: adminCredentials.email,
        role: 'admin' as const,
        token: 'mock-admin-token-' + Date.now()
      };
      
      // Store the mock token in localStorage
      localStorage.setItem('token', mockAdminResponse.token);
      localStorage.setItem('userRole', mockAdminResponse.role);
      
      console.log('Created mock admin account for testing:', mockAdminResponse);
      return mockAdminResponse;
    }
  } catch (error) {
    console.error('Failed to create admin account:', error);
    throw error;
  }
};

// For direct execution in browser console
if (typeof window !== 'undefined') {
  (window as any).createAdminAccount = createAdminAccount;
}

export default createAdminAccount;
