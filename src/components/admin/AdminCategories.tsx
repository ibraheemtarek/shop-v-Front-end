import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus, Search, Trash, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import categoryService, { Category as ApiCategory } from '@/services/categoryService';
import mockData from '@/services/mockData';

// Interface for our local category data structure
interface Category {
  id: string;
  name: string;
  slug: string;
  products: number;
  description: string;
  image?: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id' | 'products'>>({
    name: '',
    slug: '',
    description: '',
    image: ''
  });

  const { toast } = useToast();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated with token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in as an admin.');
          setLoading(false);
          return;
        }
        
        // Fetch categories
        const apiCategories = await categoryService.getCategories();
        
        // Transform API categories to our local format
        const transformedCategories = apiCategories.map(cat => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          products: cat.itemCount || 0,
          description: cat.image || 'No description available', // API doesn't have description, using image field as placeholder
          image: cat.image || ''
        }));
        
        setCategories(transformedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
        
        // Use mock data for testing if API fails
        const mockCategories = mockData.getCategories().map(cat => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          products: cat.itemCount || 0,
          description: cat.image || 'No description available',
          image: cat.image || ''
        }));
        
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string, isNew = true) => {
    if (isNew) {
      setNewCategory({
        ...newCategory,
        name: value,
        slug: generateSlug(value)
      });
    } else if (currentCategory) {
      setCurrentCategory({
        ...currentCategory,
        name: value,
        slug: generateSlug(value)
      });
    }
  };

  const handleAddCategory = async () => {
    try {
      // Validate inputs
      if (!newCategory.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Category name is required",
          variant: "destructive"
        });
        return;
      }

      // Prepare data for API
      const categoryData = {
        name: newCategory.name,
        slug: newCategory.slug,
        image: newCategory.image || newCategory.description || 'https://placehold.co/600x400?text=' + encodeURIComponent(newCategory.name),
        itemCount: 0
      };
      
      console.log('Creating category with data:', categoryData);
      
      // Call API to create category
      const createdCategory = await categoryService.createCategory(categoryData);
      
      console.log('Created category response:', createdCategory);
      
      // Add new category to local state
      const newCategoryWithId: Category = {
        id: createdCategory._id,
        name: createdCategory.name,
        slug: createdCategory.slug,
        products: createdCategory.itemCount || 0,
        description: createdCategory.image || '',
        image: createdCategory.image || ''
      };
      
      setCategories([...categories, newCategoryWithId]);
      setIsAddDialogOpen(false);
      setNewCategory({
        name: '',
        slug: '',
        description: '',
        image: ''
      });
      
      toast({
        title: "Category Added",
        description: `${newCategory.name} has been added successfully.`
      });
    } catch (err) {
      console.error('Error adding category:', err);
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory) return;
    
    try {
      // Validate inputs
      if (!currentCategory.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Category name is required",
          variant: "destructive"
        });
        return;
      }
      
      // Prepare data for API
      const categoryData = {
        name: currentCategory.name,
        slug: currentCategory.slug || currentCategory.name.toLowerCase().replace(/\s+/g, '-'),
        image: currentCategory.image || currentCategory.description || 'https://placehold.co/600x400?text=' + encodeURIComponent(currentCategory.name)
      };
      
      console.log('Updating category with ID:', currentCategory.id, 'Data:', categoryData);
      
      // Call API to update category
      const updatedCategory = await categoryService.updateCategory(currentCategory.id, categoryData);
      
      console.log('Updated category response:', updatedCategory);
      
      // Force refresh from mock data to ensure we have the latest data
      const refreshedCategories = await categoryService.getCategories();
      
      // Transform API categories to our local format
      const transformedCategories = refreshedCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        products: cat.itemCount || 0,
        description: cat.image || 'No description available',
        image: cat.image || ''
      }));
      
      setCategories(transformedCategories);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Category Updated",
        description: `${currentCategory.name} has been updated successfully.`
      });
      
      // Force reload the page to ensure localStorage changes are reflected
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error updating category:', err);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    
    try {
      console.log('Attempting to delete category with ID:', currentCategory.id);
      
      // Call API to delete category
      const response = await categoryService.deleteCategory(currentCategory.id);
      
      console.log('Delete category response:', response);
      
      if (response.success) {
        toast({
          title: "Category Deleted",
          description: `${currentCategory.name} has been deleted successfully.`
        });
        
        // Force reload the page to ensure localStorage changes are reflected
        window.location.reload();
      } else {
        throw new Error('Failed to delete category: ' + response.message);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          <span className="ml-2">Loading categories...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search categories..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new category below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input 
                      id="name" 
                      className="col-span-3" 
                      value={newCategory.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="slug" className="text-right">Slug</Label>
                    <Input 
                      id="slug" 
                      className="col-span-3" 
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image" className="text-right">Image URL</Label>
                    <Input 
                      id="image" 
                      className="col-span-3" 
                      value={newCategory.image}
                      onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {newCategory.image && (
                    <div className="flex justify-center mt-2">
                      <img 
                        src={newCategory.image} 
                        alt="Category preview" 
                        className="h-40 w-40 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea 
                      id="description" 
                      className="col-span-3" 
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Image & Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? 'No categories match your search' : 'No categories found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>{category.products}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {category.image ? (
                              <img 
                                src={category.image} 
                                alt={category.name} 
                                className="h-12 w-12 object-cover rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://placehold.co/400x400?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No Image</span>
                              </div>
                            )}
                            <div className="line-clamp-2 max-w-[200px]">
                              {category.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog open={isEditDialogOpen && currentCategory?.id === category.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (!open) setCurrentCategory(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentCategory(category)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription>
                                  Make changes to the category details below.
                                </DialogDescription>
                              </DialogHeader>
                              {currentCategory && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                                    <Input 
                                      id="edit-name" 
                                      className="col-span-3" 
                                      value={currentCategory.name}
                                      onChange={(e) => handleNameChange(e.target.value, false)}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-slug" className="text-right">Slug</Label>
                                    <Input 
                                      id="edit-slug" 
                                      className="col-span-3" 
                                      value={currentCategory.slug}
                                      onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value})}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-image" className="text-right">Image URL</Label>
                                    <Input 
                                      id="edit-image" 
                                      className="col-span-3" 
                                      value={currentCategory.image}
                                      onChange={(e) => setCurrentCategory({...currentCategory, image: e.target.value})}
                                      placeholder="https://example.com/image.jpg"
                                    />
                                  </div>
                                  {currentCategory.image && (
                                    <div className="flex justify-center mt-2">
                                      <img 
                                        src={currentCategory.image} 
                                        alt="Category preview" 
                                        className="h-40 w-40 object-cover rounded-md border border-gray-200"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'https://placehold.co/400x400?text=No+Image';
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-description" className="text-right">Description</Label>
                                    <Textarea 
                                      id="edit-description" 
                                      className="col-span-3" 
                                      value={currentCategory.description}
                                      onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateCategory}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isDeleteDialogOpen && currentCategory?.id === category.id} onOpenChange={(open) => {
                            setIsDeleteDialogOpen(open);
                            if (!open) setCurrentCategory(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentCategory(category)}>
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Category</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this category? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              {currentCategory && (
                                <div className="py-4">
                                  <p><strong>Name:</strong> {currentCategory.name}</p>
                                  <p><strong>Slug:</strong> {currentCategory.slug}</p>
                                  <p><strong>Products:</strong> {currentCategory.products}</p>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDeleteCategory}>Delete Category</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminCategories;
