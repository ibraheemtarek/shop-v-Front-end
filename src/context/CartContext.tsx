import React, { useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import type { Cart } from '../services/cartService';
import { useAuth } from './authUtils';
import { CartContext, CartContextType } from './cartUtils';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Refresh cart data
  const refreshCart = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const cartData = await cartService.getUserCart();
      setCart(cartData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      setCart(null);
    }
  }, [user, refreshCart]);



  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.updateCartItem(productId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message || 'Failed to update cart item');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message || 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.clearCart();
      setCart(response.cart);
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  // Explicitly create the context value with the CartContextType
  const contextValue: CartContextType = { 
    cart, 
    loading, 
    error, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// useCart hook has been moved to cartUtils.ts
