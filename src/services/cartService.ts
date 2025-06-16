import api from './api';

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
    return api.get<Cart>('/api/cart');
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    return api.post<Cart>('/api/cart/add', { productId, quantity });
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    return api.put<Cart>(`/api/cart/${productId}`, { quantity });
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string): Promise<Cart> {
    return api.delete<Cart>(`/api/cart/${productId}`);
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<{ message: string; cart: Cart }> {
    return api.delete<{ message: string; cart: Cart }>('/api/cart');
  }
}

export default new CartService();
