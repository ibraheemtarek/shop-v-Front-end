import api from './api';
import categoryService from './categoryService';
import API_CONFIG from '../config/api';

/**
 * Helper function to convert relative image paths to full URLs
 * @param imagePath - Relative or full image path
 * @returns Full image URL
 */
export const getFullImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If the image path is already a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Check if the path contains 'uploads/' which indicates it's a media file
  // These should always come from the backend API, not the frontend
  if (imagePath.includes('uploads/')) {
    // Remove any leading slash to normalize the path
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_CONFIG.BASE_URL}${normalizedPath}`;
  }
  
  // If it's a relative path starting with /, append it to the API base URL
  if (imagePath.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and add a leading slash
  return `${API_CONFIG.BASE_URL}/${imagePath}`;
};

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
    try {
      // Convert params to proper query string format
      const queryParams: Record<string, string> = {};
      
      if (params) {
        // Only include defined parameters
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams[key] = String(value);
          }
        });
      }
      
      const response = await api.get<ProductsResponse>('/api/products', queryParams);
      
      // Process image URLs in the response
      if (response && response.products) {
        response.products = response.products.map(product => ({
          ...product,
          image: getFullImageUrl(product.image),
          images: product.images ? product.images.map(getFullImageUrl) : undefined
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty product response
      return { products: [], page: 1, pages: 0, total: 0 };
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const product = await api.get<Product>(`/api/products/${id}`);
    
    // Process image URLs
    if (product) {
      product.image = getFullImageUrl(product.image);
      if (product.images) {
        product.images = product.images.map(getFullImageUrl);
      }
    }
    
    return product;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const products = await api.get<Product[]>('/api/products/featured');
    
    // Process image URLs
    return products.map(product => ({
      ...product,
      image: getFullImageUrl(product.image),
      images: product.images ? product.images.map(getFullImageUrl) : undefined
    }));
  }

  /**
   * Get bestseller products
   */
  async getBestsellerProducts(): Promise<Product[]> {
    const products = await api.get<Product[]>('/api/products/bestsellers');
    
    // Process image URLs
    return products.map(product => ({
      ...product,
      image: getFullImageUrl(product.image),
      images: product.images ? product.images.map(getFullImageUrl) : undefined
    }));
  }

  /**
   * Get sale products
   */
  async getSaleProducts(): Promise<Product[]> {
    const products = await api.get<Product[]>('/api/products/sale');
    
    // Process image URLs
    return products.map(product => ({
      ...product,
      image: getFullImageUrl(product.image),
      images: product.images ? product.images.map(getFullImageUrl) : undefined
    }));
  }

  /**
   * Create a new product (admin only)
   * Also updates the corresponding category's item count
   */
  async createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct = await api.post<Product>('/api/products', productData);
    
    // Process image URLs in the response
    if (newProduct) {
      newProduct.image = getFullImageUrl(newProduct.image);
      if (newProduct.images) {
        newProduct.images = newProduct.images.map(getFullImageUrl);
      }
    }
    
    // Update the category item count if a category is specified
    if (newProduct.category) {
      try {
        // Refresh all categories to update item counts
        await categoryService.getCategories();
      } catch (error) {
        console.error('Failed to refresh category item counts after product creation:', error);
      }
    }
    
    return newProduct;
  }

  /**
   * Update a product (admin only)
   * Also updates the corresponding category's item count if the category changes
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    // If category is being updated, we need to refresh category counts
    const shouldRefreshCategories = 'category' in productData;
    
    const updatedProduct = await api.put<Product>(`/api/products/${id}`, productData);
    
    // Process image URLs in the response
    if (updatedProduct) {
      updatedProduct.image = getFullImageUrl(updatedProduct.image);
      if (updatedProduct.images) {
        updatedProduct.images = updatedProduct.images.map(getFullImageUrl);
      }
    }
    
    // Update category item counts if needed
    if (shouldRefreshCategories) {
      try {
        // Refresh all categories to update item counts
        await categoryService.getCategories();
      } catch (error) {
        console.error('Failed to refresh category item counts after product update:', error);
      }
    }
    
    return updatedProduct;
  }

  /**
   * Delete a product (admin only)
   * Also updates category item counts after deletion
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    // Get the product first to know which category needs updating
    let categoryToUpdate: string | null = null;
    try {
      const product = await this.getProductById(id);
      categoryToUpdate = product.category;
    } catch (error) {
      console.error('Failed to get product before deletion:', error);
    }
    
    // Delete the product
    const result = await api.delete<{ message: string }>(`/api/products/${id}`);
    
    // Update category item counts if we know which category was affected
    if (categoryToUpdate) {
      try {
        // Refresh all categories to update item counts
        await categoryService.getCategories();
      } catch (error) {
        console.error('Failed to refresh category item counts after product deletion:', error);
      }
    }
    
    return result;
  }

  /**
   * Upload a product image
   */
  async uploadProductImage(productId: string, imageFile: File): Promise<Product> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const updatedProduct = await api.uploadFile<Product>(`/api/products/${productId}/image`, formData);
    
    // Process image URLs in the response
    if (updatedProduct) {
      updatedProduct.image = getFullImageUrl(updatedProduct.image);
      if (updatedProduct.images) {
        updatedProduct.images = updatedProduct.images.map(getFullImageUrl);
      }
    }
    
    return updatedProduct;
  }

  /**
   * Upload multiple product images (admin only)
   */
  async uploadProductImages(id: string, imageFiles: File[]): Promise<Product> {
    const formData = new FormData();
    
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });
    
    const updatedProduct = await api.uploadFile<Product>(`/api/products/${id}/images`, formData);
    
    // Process image URLs in the response
    if (updatedProduct) {
      updatedProduct.image = getFullImageUrl(updatedProduct.image);
      if (updatedProduct.images) {
        updatedProduct.images = updatedProduct.images.map(getFullImageUrl);
      }
    }
    
    return updatedProduct;
  }

  /**
   * Delete a product image (admin only)
   */
  async deleteProductImage(productId: string, imageIndex: number): Promise<Product> {
    const updatedProduct = await api.delete<Product>(`/api/products/${productId}/image/${imageIndex}`);
    
    // Process image URLs in the response
    if (updatedProduct) {
      updatedProduct.image = getFullImageUrl(updatedProduct.image);
      if (updatedProduct.images) {
        updatedProduct.images = updatedProduct.images.map(getFullImageUrl);
      }
    }
    
    return updatedProduct;
  }
}

export default new ProductService();
