import api from './api';

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  features?: string[];
  colors?: string[];
  sizes?: string[];
  inStock: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

/**
 * Product API service
 */
class ProductService {
  /**
   * Get all products with optional filters
   */
  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isNew?: boolean;
    isOnSale?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> {
    return api.get<ProductsResponse>('/api/products', params as Record<string, string>);
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product> {
    return api.get<Product>(`/api/products/${id}`);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    return api.get<Product[]>('/api/products/featured');
  }

  /**
   * Get bestseller products
   */
  async getBestsellerProducts(): Promise<Product[]> {
    return api.get<Product[]>('/api/products/bestsellers');
  }

  /**
   * Get sale products
   */
  async getSaleProducts(): Promise<Product[]> {
    return api.get<Product[]>('/api/products/sale');
  }

  /**
   * Create a new product (admin only)
   */
  async createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return api.post<Product>('/api/products', productData);
  }

  /**
   * Update a product (admin only)
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    return api.put<Product>(`/api/products/${id}`, productData);
  }

  /**
   * Delete a product (admin only)
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/api/products/${id}`);
  }
}

export default new ProductService();
