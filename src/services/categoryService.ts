import api from './api';
import mockData from './mockData';

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
      return await api.get<Category[]>('/api/categories');
    } catch (error) {
      console.error('Failed to fetch categories from API, using mock data:', error);
      return mockData.getCategories();
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    return api.get<Category>(`/api/categories/${slug}`);
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      return await api.post<Category>('/api/categories', categoryData);
    } catch (error) {
      console.error('Failed to create category via API, using mock data:', error);
      // Use the mock data service to create and persist the category
      return mockData.createCategory(categoryData);
    }
  }

  /**
   * Update a category (admin only)
   */
  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    try {
      return await api.put<Category>(`/api/categories/${id}`, categoryData);
    } catch (error) {
      console.error('Failed to update category via API, using mock data:', error);
      // Use the mock data service to update and persist the category
      return mockData.updateCategory(id, categoryData);
    }
  }

  /**
   * Delete a category (admin only)
   */
  async deleteCategory(id: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await api.delete<{ message: string }>(`/api/categories/${id}`);
      return { ...response, success: true };
    } catch (error) {
      console.error('Failed to delete category via API, using mock data service:', error);
      // Use the mock data service to delete and update persisted categories
      const success = mockData.deleteCategory(id);
      
      if (success) {
        console.log('Successfully deleted category in mock data service');
        return { message: 'Category deleted successfully (mock)', success: true };
      } else {
        console.error('Failed to delete category in mock data service');
        return { message: 'Category not found or could not be deleted', success: false };
      }
    }
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
