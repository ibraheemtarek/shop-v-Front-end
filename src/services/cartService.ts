import api from './api';
import { getFullImageUrl } from './productService';

export interface CartItem {
  product: string;
  name: string;
  quantity: number;
  image: string;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Cart API service
 */
class CartService {
  /**
   * Get user cart
   */
  async getUserCart(): Promise<Cart> {
    const cart = await api.get<Cart>('/api/cart');
    
    // Process image URLs in cart items
    if (cart && cart.items) {
      cart.items = cart.items.map(item => ({
        ...item,
        image: getFullImageUrl(item.image)
      }));
    }
    
    return cart;
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const cart = await api.post<Cart>('/api/cart/add', { productId, quantity });
    
    // Process image URLs in cart items
    if (cart && cart.items) {
      cart.items = cart.items.map(item => ({
        ...item,
        image: getFullImageUrl(item.image)
      }));
    }
    
    return cart;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    const cart = await api.put<Cart>(`/api/cart/${productId}`, { quantity });
    
    // Process image URLs in cart items
    if (cart && cart.items) {
      cart.items = cart.items.map(item => ({
        ...item,
        image: getFullImageUrl(item.image)
      }));
    }
    
    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string): Promise<Cart> {
    const cart = await api.delete<Cart>(`/api/cart/${productId}`);
    
    // Process image URLs in cart items
    if (cart && cart.items) {
      cart.items = cart.items.map(item => ({
        ...item,
        image: getFullImageUrl(item.image)
      }));
    }
    
    return cart;
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<{ message: string; cart: Cart }> {
    const result = await api.delete<{ message: string; cart: Cart }>('/api/cart');
    
    // Process image URLs in cart items if any remain
    if (result && result.cart && result.cart.items) {
      result.cart.items = result.cart.items.map(item => ({
        ...item,
        image: getFullImageUrl(item.image)
      }));
    }
    
    return result;
  }
}

export default new CartService();
