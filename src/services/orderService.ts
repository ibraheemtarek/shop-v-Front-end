import api from './api';
import mockData from './mockData';

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  image: string;
  price: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface RefundData {
  reason: string;
  amount?: number; // Optional for partial refunds
}

export interface CreateOrderData {
  orderItems: Omit<OrderItem, 'product'> & { product: string }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

/**
 * Order API service
 */
class OrderService {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    return api.post<Order>('/api/orders', orderData);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    return api.get<Order>(`/api/orders/${id}`);
  }

  /**
   * Get user orders
   */
  async getUserOrders(): Promise<Order[]> {
    return api.get<Order[]>('/api/orders/myorders');
  }

  /**
   * Update order to paid
   */
  async updateOrderToPaid(id: string, paymentResult: PaymentResult): Promise<Order> {
    return api.put<Order>(`/api/orders/${id}/pay`, paymentResult);
  }

  /**
   * Get all orders (admin only)
   */
  async getOrders(): Promise<Order[]> {
    try {
      return await api.get<Order[]>('/api/orders');
    } catch (error) {
      console.error('Failed to fetch orders from API, using mock data:', error);
      return mockData.getOrders();
    }
  }

  /**
   * Update order to delivered (admin only)
   */
  async updateOrderToDelivered(id: string): Promise<Order> {
    return api.put<Order>(`/api/orders/${id}/deliver`, {});
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return api.put<Order>(`/api/orders/${id}/status`, { status });
  }

  /**
   * Process refund for order (admin only)
   */
  async refundOrder(id: string, refundData: RefundData): Promise<Order> {
    return api.put<Order>(`/api/orders/${id}/refund`, refundData);
  }
}

export default new OrderService();
