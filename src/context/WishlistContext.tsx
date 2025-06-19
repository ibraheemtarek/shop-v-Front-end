import React, { useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import type { Wishlist } from '../services/wishlistService';
import { useAuth } from './authUtils';
import { WishlistContext, WishlistContextType } from './wishlistUtils';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Refresh wishlist data
  const refreshWishlist = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const wishlistData = await wishlistService.getUserWishlist();
      setWishlist(wishlistData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlist(null);
    }
  }, [user, refreshWishlist]);

  // Check if a product is in the wishlist
  const isInWishlist = (productId: string): boolean => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some(item => item.product === productId);
  };

  // Add item to wishlist
  const addToWishlist = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedWishlist = await wishlistService.addToWishlist(productId);
      setWishlist(updatedWishlist);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add item to wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedWishlist = await wishlistService.removeFromWishlist(productId);
      setWishlist(updatedWishlist);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedWishlist = await wishlistService.clearWishlist();
      setWishlist(updatedWishlist);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clear wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Explicitly create the context value with the WishlistContextType
  const contextValue: WishlistContextType = { 
    wishlist, 
    loading, 
    error, 
    addToWishlist, 
    removeFromWishlist, 
    clearWishlist,
    refreshWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};
