import api from './api';

export interface WishlistItem {
  product: string;
  name: string;
  image: string;
  price: number;
  category?: string;
  categoryName?: string;
  rating?: number;
  reviewCount?: number;
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

/**
 * Wishlist API service
 */
class WishlistService {
  /**
   * Get user wishlist
   */
  async getUserWishlist(): Promise<Wishlist> {
    return api.get<Wishlist>('/api/users/wishlist');
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(productId: string): Promise<Wishlist> {
    return api.post<Wishlist>('/api/users/wishlist', { productId });
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
