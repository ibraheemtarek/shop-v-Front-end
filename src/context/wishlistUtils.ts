import { createContext, useContext } from 'react';
import type { Wishlist } from '../services/wishlistService';

// Define the WishlistContext type
export interface WishlistContextType {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

// Create the context
export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Create the useWishlist hook
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
