import api from './api';
import productService from './productService';

// Backend might return different response formats
export interface WishlistBackendResponse {
  _id: string;
  user: string;
  products: string[]; // Array of product IDs
  createdAt: string;
  updatedAt: string;
}

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

// For type safety when handling API responses
export type WishlistApiResponse = {
  // First format: direct product IDs
  _id?: string;
  user?: string;
  products?: string[];
  createdAt?: string;
  updatedAt?: string;
  
  // Second format: full items
  items?: Array<Partial<WishlistItem>>;
  
  // Third format: nested wishlist object
  wishlist?: {
    _id?: string;
    user?: string;
    products?: string[];
    items?: Array<Partial<WishlistItem>>;
    createdAt?: string;
    updatedAt?: string;
  };
  
  [key: string]: unknown;
};

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
      // Get wishlist from backend (might just be product IDs)
      const response = await api.get<WishlistApiResponse>('/api/users/wishlist');
      console.log('Wishlist API response:', response);
      
      // Create a default empty wishlist
      const emptyWishlist: Wishlist = {
        _id: '',
        user: '',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Handle case where response is empty or undefined
      if (!response) {
        console.log('Empty response from wishlist API');
        return emptyWishlist;
      }
      
      // Check if we have a wishlist property that contains the actual data
      const wishlistData = response.wishlist || response;
      
      // Type guard function to check if an object has a specific property
      const hasProperty = <T extends object, K extends string>(obj: T, prop: K): 
        obj is T & Record<K, unknown> => Object.prototype.hasOwnProperty.call(obj, prop);
      
      // Check the structure of the response
      if (hasProperty(wishlistData, 'products') && Array.isArray(wishlistData.products)) {
        console.log('Processing wishlist with product IDs:', wishlistData.products);
        // Backend returned just an array of product IDs
        // Fetch full product details for each ID
        const productPromises = wishlistData.products.map(async (productId: string) => {
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
          _id: hasProperty(wishlistData, '_id') ? String(wishlistData._id) : '',
          user: hasProperty(wishlistData, 'user') ? String(wishlistData.user) : '',
          items,
          createdAt: hasProperty(wishlistData, 'createdAt') ? String(wishlistData.createdAt) : new Date().toISOString(),
          updatedAt: hasProperty(wishlistData, 'updatedAt') ? String(wishlistData.updatedAt) : new Date().toISOString()
        };
      } else if (hasProperty(wishlistData, 'items') && Array.isArray(wishlistData.items)) {
        // Backend already returned full item details
        // Ensure each item has the required properties with defaults
        const items = wishlistData.items.map((item: Partial<WishlistItem>) => ({
          product: item.product || '',
          name: item.name || '',
          image: item.image || '',
          price: typeof item.price === 'number' ? item.price : 0,
          category: item.category || '',
          categoryName: item.categoryName || '',
          rating: typeof item.rating === 'number' ? item.rating : 0,
          reviewCount: typeof item.reviewCount === 'number' ? item.reviewCount : 0,
          _id: item._id || item.product || ''
        } as WishlistItem));
        
        return {
          _id: hasProperty(wishlistData, '_id') ? String(wishlistData._id) : '',
          user: hasProperty(wishlistData, 'user') ? String(wishlistData.user) : '',
          items,
          createdAt: hasProperty(wishlistData, 'createdAt') ? String(wishlistData.createdAt) : new Date().toISOString(),
          updatedAt: hasProperty(wishlistData, 'updatedAt') ? String(wishlistData.updatedAt) : new Date().toISOString()
        };
      }
      
      // If we couldn't process the response, return an empty wishlist
      console.log('Could not process wishlist response, returning empty wishlist');
      return emptyWishlist;
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
      const response = await api.post<WishlistApiResponse>('/api/users/wishlist', { productId });
      console.log('Add to wishlist response:', response);
      
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
      const response = await api.delete<WishlistApiResponse>(`/api/users/wishlist/${productId}`);
      console.log('Remove from wishlist response:', response);
      
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
  }
}

export default new WishlistService();
