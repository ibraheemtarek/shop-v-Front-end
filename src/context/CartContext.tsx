import React, { createContext, useState, useContext, useEffect } from 'react';
import cartService from '../services/cartService';
import type { Cart, CartItem } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      setCart(null);
    }
  }, [user]);

  // Refresh cart data
  const refreshCart = async () => {
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
  };

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

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      error, 
      addToCart, 
      updateCartItem, 
      removeFromCart, 
      clearCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
