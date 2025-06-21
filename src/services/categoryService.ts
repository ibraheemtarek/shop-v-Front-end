import api from './api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Category API service
 */
class CategoryService {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      // Get categories from API
      const categories = await api.get<Category[]>('/api/categories');
      
      // Get products to calculate accurate item counts - use a smaller limit
      try {
        // Use a smaller limit that the API can handle (50 is usually safe)
        const productsResponse = await api.get<{products: Array<{category: string}>, total: number}>('/api/products', { limit: '50' });
        let products = productsResponse.products || [];
        const totalProducts = productsResponse.total || 0;
        
        // If there are more products than the limit, fetch them in batches
        if (totalProducts > 50) {
          // Calculate how many pages we need to fetch
          const totalPages = Math.ceil(totalProducts / 50);
          
          // Fetch the remaining pages
          for (let page = 2; page <= totalPages; page++) {
            try {
              const nextPageResponse = await api.get<{products: Array<{category: string}>}>('/api/products', { 
                limit: '50', 
                page: page.toString() 
              });
              
              if (nextPageResponse.products && nextPageResponse.products.length > 0) {
                products = [...products, ...nextPageResponse.products];
              }
            } catch (pageError) {
              console.error(`Failed to fetch products page ${page}:`, pageError);
              // Continue with what we have so far
              break;
            }
          }
        }
        
        // Calculate item counts for each category
        return categories.map(category => {
          const count = products.filter(product => product.category === category._id).length;
          return { ...category, itemCount: count };
        });
      } catch (productError) {
        console.error('Failed to fetch products for item count calculation:', productError);
        return categories; // Return categories with original item counts if product fetch fails
      }
    } catch (error) {
      console.error('Failed to fetch categories from API:', error);
      throw error; // Propagate the error instead of falling back to mock data
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      // Get category from API
      const category = await api.get<Category>(`/api/categories/${slug}`);
      
      // Get products to calculate accurate item count - use a smaller limit
      try {
        // Use a smaller limit that the API can handle (50 is usually safe)
        const productsResponse = await api.get<{products: Array<{category: string}>, total: number}>('/api/products', { limit: '50' });
        let products = productsResponse.products || [];
        const totalProducts = productsResponse.total || 0;
        
        // If there are more products than the limit, fetch them in batches
        if (totalProducts > 50) {
          // Calculate how many pages we need to fetch
          const totalPages = Math.ceil(totalProducts / 50);
          
          // Fetch the remaining pages
          for (let page = 2; page <= totalPages; page++) {
            try {
              const nextPageResponse = await api.get<{products: Array<{category: string}>}>('/api/products', { 
                limit: '50', 
                page: page.toString() 
              });
              
              if (nextPageResponse.products && nextPageResponse.products.length > 0) {
                products = [...products, ...nextPageResponse.products];
              }
            } catch (pageError) {
              console.error(`Failed to fetch products page ${page}:`, pageError);
              // Continue with what we have so far
              break;
            }
          }
        }
        
        // Calculate item count for this category
        const count = products.filter(product => product.category === category._id).length;
        return { ...category, itemCount: count };
      } catch (productError) {
        console.error('Failed to fetch products for item count calculation:', productError);
        return category; // Return category with original item count if product fetch fails
      }
    } catch (error) {
      console.error(`Failed to fetch category ${slug} from API:`, error);
      throw error; // Propagate the error instead of falling back to mock data
    }
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return api.post<Category>('/api/categories', categoryData);
  }

  /**
   * Update a category (admin only)
   */
  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    return api.put<Category>(`/api/categories/${id}`, categoryData);
  }

  /**
   * Delete a category (admin only)
   */
  async deleteCategory(id: string): Promise<{ message: string; success: boolean }> {
    const response = await api.delete<{ message: string }>(`/api/categories/${id}`);
    return { ...response, success: true };
  }

  /**
   * Upload a category image (admin only)
   */
  async uploadCategoryImage(id: string, imageFile: File): Promise<Category> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      return await api.uploadFile<Category>(`/api/categories/${id}/image`, formData);
    } catch (error) {
      console.error('Failed to upload category image via API:', error);
      throw new Error('Failed to upload category image');
    }
  }

  /**
   * Delete a category image (admin only)
   */
  async deleteCategoryImage(id: string): Promise<Category> {
    try {
      return await api.delete<Category>(`/api/categories/${id}/image`);
    } catch (error) {
      console.error('Failed to delete category image via API:', error);
      throw new Error('Failed to delete category image');
    }
  }
}

export default new CategoryService();
