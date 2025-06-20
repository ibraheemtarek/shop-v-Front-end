import api from './api';
import productService from './productService';
import { Product } from './productService';
import UserService from './userService';

// Our frontend needs more detailed product information
export interface WishlistItem {
  product: string;
  name: string;
  image: string;
  price: number;
  category: string; // Make required but can be empty string
  categoryName: string; // Make required but can be empty string
  rating: number; // Make required with default 0
  reviewCount: number; // Make required with default 0
  isNew?: boolean;
  isOnSale?: boolean;
  _id?: string; // For compatibility with Product type
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

// For type safety when handling API responses from user model
export interface UserWishlistResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  wishlist: string[]; // Array of product IDs
  createdAt: string;
  updatedAt: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
}

/**
 * Wishlist API service
 */
class WishlistService {
  /**
   * Refresh the wishlist data
   */
  async refreshWishlist(): Promise<Wishlist> {
    try {
      console.log('Refreshing wishlist data...');
      const wishlist = await this.getUserWishlist();
      console.log('Wishlist refreshed successfully:', wishlist.items.length, 'items');
      return wishlist;
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
      throw error;
    }
  }

  /**
   * Get user wishlist
   */
  async getUserWishlist(): Promise<Wishlist> {
    try {
      console.log('Fetching user wishlist...');
      
      // Create a default empty wishlist
      const emptyWishlist: Wishlist = {
        _id: '',
        user: '',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Get user profile which includes the wishlist array of product IDs
      const userData = await UserService.getUserProfile();
      
      // Handle case where response is empty or undefined
      if (!userData || !userData.wishlist || !Array.isArray(userData.wishlist)) {
        console.log('No wishlist data found in user profile');
        return emptyWishlist;
      }
      
      console.log('User wishlist product IDs:', userData.wishlist);
      
      // If wishlist is empty, return empty wishlist
      if (userData.wishlist.length === 0) {
        return {
          _id: userData._id || '',
          user: userData._id || '',
          items: [],
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString()
        };
      }
      
      // Fetch full product details for each ID in the wishlist array
      const productPromises = userData.wishlist.map(async (productId) => {
        try {
          const product = await productService.getProductById(productId);
          return {
            product: productId,
            name: product.name,
            image: product.image,
            price: product.price,
            category: product.category || '',
            categoryName: product.categoryName || '',
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            _id: productId
          } as WishlistItem;
        } catch (err) {
          console.error(`Failed to fetch details for product ${productId}:`, err);
          // Return a minimal item with available data
          return {
            product: productId,
            name: 'Product unavailable',
            image: '',
            price: 0,
            category: '',
            categoryName: '',
            rating: 0,
            reviewCount: 0
          } as WishlistItem;
        }
      });
      
      const items = await Promise.all(productPromises);
      console.log('Transformed wishlist items:', items);
      
      // Return in the format our frontend expects
      return {
        _id: userData._id || '',
        user: userData._id || '',
        items,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString()
      };
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      throw err;
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(productId: string): Promise<Wishlist> {
    try {
      console.log(`Adding product ${productId} to wishlist...`);
      // Call the API endpoint to add product to user's wishlist
      await api.post('/api/users/wishlist', { productId });
      
      // Refresh wishlist data to get the updated list
      return this.getUserWishlist();
    } catch (error) {
      // Check if the error is because product is already in wishlist
      if (error instanceof Error && 
          (error.message.includes('already in wishlist') || 
           error.message.includes('Product already exists'))) {
        console.log('Product already in wishlist, returning current wishlist');
        // Return current wishlist instead of throwing
        return this.getUserWishlist();
      }
      // Re-throw any other errors
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  async checkInWishlist(productId: string): Promise<{ inWishlist: boolean }> {
    try {
      console.log(`Checking if product ${productId} is in wishlist...`);
      const wishlist = await this.getUserWishlist();
      
      // Check if the product is in the wishlist
      const inWishlist = wishlist.items.some(item => 
        item.product === productId || item._id === productId
      );
      
      console.log(`Product ${productId} in wishlist: ${inWishlist}`);
      return { inWishlist };
    } catch (error) {
      console.error('Error checking if product is in wishlist:', error);
      // Return false if there's an error, don't throw
      return { inWishlist: false };
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(productId: string): Promise<Wishlist> {
    try {
      console.log(`Removing product ${productId} from wishlist...`);
      // Call the API endpoint to remove product from user's wishlist
      await api.delete(`/api/users/wishlist/${productId}`);
      
      // Refresh wishlist data to get the updated list
      return this.getUserWishlist();
    } catch (error) {
      // Check if the error is because product is not in wishlist
      if (error instanceof Error && 
          (error.message.includes('not in wishlist') || 
           error.message.includes('Product not found'))) {
        console.log('Product not in wishlist, returning current wishlist');
        // Return current wishlist instead of throwing
        return this.getUserWishlist();
      }
      // Re-throw any other errors
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  /**
   * Clear wishlist
   */
  async clearWishlist(): Promise<Wishlist> {
    try {
      console.log('Clearing wishlist...');
      // Since there's no specific endpoint for clearing the wishlist,
      // we'll get all items and remove them one by one
      const wishlist = await this.getUserWishlist();
      
      if (wishlist.items.length === 0) {
        return wishlist;
      }
      
      // Remove all items in parallel
      await Promise.all(wishlist.items.map(item => 
        this.removeFromWishlist(item.product)
      ));
      
      // Return the updated wishlist
      return this.getUserWishlist();
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  }
}

export default new WishlistService();
