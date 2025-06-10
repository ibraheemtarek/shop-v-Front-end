import { Category } from './categoryService';
import { Product } from './productService';
import { Order } from './orderService';
import { User } from './userService';

// Local storage keys for persisting mock data
const STORAGE_KEYS = {
  CATEGORIES: 'mock_categories',
  PRODUCTS: 'mock_products',
  ORDERS: 'mock_orders',
  USERS: 'mock_users'
};

/**
 * Mock data service for testing when API is not available
 */
class MockDataService {
  // Default mock data for categories
  private defaultCategories: Category[] = [
    {
      _id: '1',
      name: 'Electronics',
      slug: 'electronics',
      image: 'https://placehold.co/600x400?text=Electronics',
      itemCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Clothing',
      slug: 'clothing',
      image: 'https://placehold.co/600x400?text=Clothing',
      itemCount: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default mock data for products
  private defaultProducts: Product[] = [
    {
      _id: '1',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 99.99,
      category: '1',
      image: 'https://placehold.co/600x400?text=Headphones',
      inStock: true,
      rating: 4.5,
      reviewCount: 12,
      isNew: true,
      isOnSale: false,
      originalPrice: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Smartphone',
      description: 'Latest model smartphone with advanced camera',
      price: 699.99,
      category: '1',
      image: 'https://placehold.co/600x400?text=Smartphone',
      inStock: true,
      rating: 4.8,
      reviewCount: 24,
      isNew: true,
      isOnSale: true,
      originalPrice: 749.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'Men\'s T-Shirt',
      description: 'Comfortable cotton t-shirt for everyday wear',
      price: 24.99,
      category: '2',
      image: 'https://placehold.co/600x400?text=TShirt',
      inStock: true,
      rating: 4.2,
      reviewCount: 18,
      isNew: false,
      isOnSale: true,
      originalPrice: 29.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default mock data for orders
  private defaultOrders: Order[] = [
    {
      _id: '1',
      user: 'user1',
      orderItems: [
        {
          product: '1',
          name: 'Wireless Headphones',
          quantity: 1,
          image: 'https://placehold.co/600x400?text=Headphones',
          price: 99.99
        }
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '555-123-4567'
      },
      paymentMethod: 'Credit Card',
      itemsPrice: 99.99,
      taxPrice: 8.00,
      shippingPrice: 10.00,
      totalPrice: 117.99,
      isPaid: true,
      paidAt: new Date().toISOString(),
      isDelivered: false,
      orderNumber: 'ORD-001',
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      user: 'user2',
      orderItems: [
        {
          product: '2',
          name: 'Smartphone',
          quantity: 1,
          image: 'https://placehold.co/600x400?text=Smartphone',
          price: 699.99
        },
        {
          product: '3',
          name: 'Men\'s T-Shirt',
          quantity: 2,
          image: 'https://placehold.co/600x400?text=TShirt',
          price: 24.99
        }
      ],
      shippingAddress: {
        firstName: 'Jane',
        lastName: 'Smith',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        phone: '555-987-6543'
      },
      paymentMethod: 'PayPal',
      itemsPrice: 749.97,
      taxPrice: 60.00,
      shippingPrice: 0.00,
      totalPrice: 809.97,
      isPaid: true,
      paidAt: new Date().toISOString(),
      isDelivered: true,
      deliveredAt: new Date().toISOString(),
      orderNumber: 'ORD-002',
      status: 'delivered',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default mock data for users
  private defaultUsers: User[] = [
    {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'user',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      phone: '555-123-4567',
      wishlist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'user',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      phone: '555-987-6543',
      wishlist: ['1', '3'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'admin1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@admin.com',
      role: 'admin',
      wishlist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  /**
   * Get persisted categories or default ones
   */
  getCategories(): Category[] {
    try {
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCategories) {
        return JSON.parse(storedCategories);
      }
      // If no stored categories, save defaults and return them
      this.saveCategories(this.defaultCategories);
      return this.defaultCategories;
    } catch (error) {
      console.error('Error retrieving categories from localStorage:', error);
      return this.defaultCategories;
    }
  }
  
  /**
   * Save categories to localStorage
   */
  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }
  
  /**
   * Create a new category
   */
  createCategory(categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      _id: 'mock-' + Date.now(),
      ...categoryData,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }
  
  /**
   * Update an existing category
   */
  updateCategory(id: string, categoryData: Partial<Category>): Category {
    const categories = this.getCategories();
    const categoryIndex = categories.findIndex(c => c._id === id);
    
    if (categoryIndex === -1) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    const updatedCategory: Category = {
      ...categories[categoryIndex],
      ...categoryData,
      updatedAt: new Date().toISOString()
    };
    
    categories[categoryIndex] = updatedCategory;
    this.saveCategories(categories);
    return updatedCategory;
  }
  
  /**
   * Delete a category
   */
  deleteCategory(id: string): boolean {
    try {
      console.log('Mock service: Attempting to delete category with ID:', id);
      const categories = this.getCategories();
      
      // First try to delete by _id (API format)
      let filteredCategories = categories.filter(c => c._id !== id);
      
      // Check if any category was removed
      if (filteredCategories.length === categories.length) {
        // If no category was removed, the ID might be in a different format
        // Try to find the category by checking if any category's _id ends with the given id
        // This handles cases where the frontend has a shortened version of the ID
        console.log('Mock service: Category not found by exact ID, trying partial match');
        const categoryToDelete = categories.find(c => c._id.includes(id) || id.includes(c._id));
        
        if (categoryToDelete) {
          console.log('Mock service: Found category by partial ID match:', categoryToDelete._id);
          filteredCategories = categories.filter(c => c._id !== categoryToDelete._id);
        } else {
          console.log('Mock service: Category not found, ID:', id);
          return false; // Category not found, but don't throw error
        }
      }
      
      // Double check that we actually removed a category
      if (filteredCategories.length === categories.length) {
        console.log('Mock service: No category was removed');
        return false;
      }
      
      console.log('Mock service: Category found and will be deleted, categories before:', categories.length, 'after:', filteredCategories.length);
      this.saveCategories(filteredCategories);
      return true; // Successfully deleted
    } catch (error) {
      console.error('Mock service: Error deleting category:', error);
      return false; // Error occurred, but don't throw
    }
  }

  /**
   * Get persisted products or default ones
   */
  getProducts(): Product[] {
    try {
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProducts) {
        return JSON.parse(storedProducts);
      }
      // If no stored products, save defaults and return them
      this.saveProducts(this.defaultProducts);
      return this.defaultProducts;
    } catch (error) {
      console.error('Error retrieving products from localStorage:', error);
      return this.defaultProducts;
    }
  }
  
  /**
   * Save products to localStorage
   */
  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }

  /**
   * Get persisted orders or default ones
   */
  getOrders(): Order[] {
    try {
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (storedOrders) {
        return JSON.parse(storedOrders);
      }
      // If no stored orders, save defaults and return them
      this.saveOrders(this.defaultOrders);
      return this.defaultOrders;
    } catch (error) {
      console.error('Error retrieving orders from localStorage:', error);
      return this.defaultOrders;
    }
  }
  
  /**
   * Save orders to localStorage
   */
  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }

  /**
   * Get persisted users or default ones
   */
  getUsers(): User[] {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
      // If no stored users, save defaults and return them
      this.saveUsers(this.defaultUsers);
      return this.defaultUsers;
    } catch (error) {
      console.error('Error retrieving users from localStorage:', error);
      return this.defaultUsers;
    }
  }
  
  /**
   * Save users to localStorage
   */
  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }
}

export default new MockDataService();
