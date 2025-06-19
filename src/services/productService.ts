import api from './api';

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  categoryName: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  features?: string[];
  colors?: string[];
  sizes?: string[];
  inStock: boolean;
  isNewProduct?: boolean;
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

  /**
   * Upload a single product image (admin only)
   */
  async uploadProductImage(id: string, imageFile: File): Promise<Product> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return api.uploadFile<Product>(`/api/products/${id}/image`, formData);
  }

  /**
   * Upload multiple product images (admin only)
   */
  async uploadProductImages(id: string, imageFiles: File[]): Promise<Product> {
    const formData = new FormData();
    
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });
    
    return api.uploadFile<Product>(`/api/products/${id}/images`, formData);
  }

  /**
   * Delete a product image (admin only)
   */
  async deleteProductImage(productId: string, imageIndex: number): Promise<Product> {
    return api.delete<Product>(`/api/products/${productId}/image/${imageIndex}`);
  }
}

export default new ProductService();
