import createAdminAccount from './createAdminAccount';

/**
 * Setup function to automatically create an admin account if it doesn't exist
 * This is useful for development and testing purposes
 */
export const setupAdminAccount = async () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    try {
      console.log('Setting up admin account for development...');
      await createAdminAccount();
      console.log('Admin account setup complete');
    } catch (error) {
      console.error('Error setting up admin account:', error);
    }
  }
};

export default setupAdminAccount;
