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
export type WishlistApiResponse = 
  | { _id: string; user: string; products: string[]; createdAt: string; updatedAt: string } 
  | { _id: string; user: string; items: Array<Partial<WishlistItem>>; createdAt: string; updatedAt: string }
  | { wishlist?: string[] | Array<Partial<WishlistItem>> }
  | Record<string, unknown>;

/**
 * Wishlist API service
 */
class WishlistService {
  /**
   * Get user wishlist
   */
  async getUserWishlist(): Promise<Wishlist> {
    try {
      // Get wishlist from backend (might just be product IDs)
      const response = await api.get<WishlistApiResponse>('/api/users/wishlist');
      
      // Check the structure of the response
      if (response && 'products' in response && Array.isArray(response.products)) {
        // Backend returned just an array of product IDs
        // Fetch full product details for each ID
        const productPromises = response.products.map(async (productId: string) => {
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
            } as WishlistItem; // Explicitly cast to WishlistItem
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
            } as WishlistItem; // Explicitly cast to WishlistItem
          }
        });
        
        const items = await Promise.all(productPromises);
        
        // Return in the format our frontend expects
        return {
          _id: typeof response._id === 'string' ? response._id : '',
          user: typeof response.user === 'string' ? response.user : '',
          items,
          createdAt: typeof response.createdAt === 'string' ? response.createdAt : new Date().toISOString(),
          updatedAt: typeof response.updatedAt === 'string' ? response.updatedAt : new Date().toISOString()
        };
      } else if (response && 'items' in response && Array.isArray(response.items)) {
        // Backend already returned full item details
        // Ensure each item has the required properties with defaults
        const items = response.items.map((item) => ({
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
          _id: typeof response._id === 'string' ? response._id : '',
          user: typeof response.user === 'string' ? response.user : '',
          items,
          createdAt: typeof response.createdAt === 'string' ? response.createdAt : new Date().toISOString(),
          updatedAt: typeof response.updatedAt === 'string' ? response.updatedAt : new Date().toISOString()
        };
      }
      
      // Fallback: return empty wishlist
      return {
        _id: '',
        user: '',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
      return await api.post<Wishlist>('/api/users/wishlist', { productId });
    } catch (error) {
      // Check if this is the "Product already in wishlist" error
      if (error instanceof Error && error.message.includes('already in wishlist')) {
        console.log('Product already in wishlist, fetching current wishlist');
        // If the product is already in the wishlist, just return the current wishlist
        return this.getUserWishlist();
      }
      // Re-throw any other errors
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  async checkInWishlist(productId: string): Promise<{ inWishlist: boolean }> {
    // First get the wishlist, then check if the product is in it
    const wishlist = await this.getUserWishlist();
    const inWishlist = wishlist.items.some(item => item.product === productId);
    return { inWishlist };
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(productId: string): Promise<Wishlist> {
    return api.delete<Wishlist>(`/api/users/wishlist/${productId}`);
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
