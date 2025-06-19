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
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Search, Trash, Loader2, Image as ImageIcon } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import productService, { Product as ApiProduct } from '@/services/productService';
import categoryService, { Category } from '@/services/categoryService';

// Interface for our local product data structure
interface Product {
  id: string;
  name: string;
  price: number;
  category: string | { name: string }; // Category can be string or object with name
  categoryName?: string; // Added to match ApiProduct interface
  stock: number;
  status: string;
  image?: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    category: '',
    stock: 0,
    status: 'In Stock',
    image: ''
  });

  const { toast } = useToast();

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
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
        
        // Fetch products
        const productsResponse = await productService.getProducts();
        
        // Fetch categories for dropdown
        const categoriesData = await categoryService.getCategories();
        
        // Transform API products to our local format
        const transformedProducts = productsResponse.products.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.inStock ? 10 : 0, // API doesn't have stock count, using inStock boolean
          status: product.inStock ? 'In Stock' : 'Out of Stock',
          image: product.image
        }));
        
        setProducts(transformedProducts);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        // Fallback to empty products array
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    // Safely handle product name
    const nameMatch = product.name && typeof product.name === 'string' ?
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    
    // Safely handle category which might be a string or an object
    let categoryMatch = false;
    if (product.category) {
      if (typeof product.category === 'string') {
        categoryMatch = product.category.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (typeof product.category === 'object' && product.category !== null) {
        // If category is an object, try to use its name property if available
        const categoryObj = product.category as { name?: string };
        const categoryName = categoryObj.name || '';
        categoryMatch = categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      }
    }
    
    return nameMatch || categoryMatch;
  });

  const handleAddProduct = async () => {
    try {
      // Prepare data for API
      const productData = {
        name: newProduct.name,
        price: newProduct.price,
        description: `${newProduct.name} - ${newProduct.category}`,
        category: newProduct.category,
        image: newProduct.image || 'https://placehold.co/600x400?text=Product+Image',
        inStock: newProduct.status !== 'Out of Stock',
        rating: 0,
        reviewCount: 0
      };
      
      // Call API to create product
      const createdProduct = await productService.createProduct(productData);
      
      // Add new product to local state
      const newProductWithId: Product = {
        id: createdProduct._id,
        name: createdProduct.name,
        price: createdProduct.price,
        category: createdProduct.category,
        stock: createdProduct.inStock ? newProduct.stock : 0,
        status: createdProduct.inStock ? 'In Stock' : 'Out of Stock',
        image: createdProduct.image
      };
      
      setProducts([...products, newProductWithId]);
      setIsAddDialogOpen(false);
      setNewProduct({
        name: '',
        price: 0,
        category: '',
        stock: 0,
        status: 'In Stock',
        image: ''
      });
      
      toast({
        title: "Product Added",
        description: `${newProduct.name} has been added successfully.`
      });
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!currentProduct) return;
    
    try {
      // Prepare data for API
      const productData = {
        name: currentProduct.name,
        price: currentProduct.price,
        category: typeof currentProduct.category === 'string' ? currentProduct.category : (currentProduct.category as { name: string }).name,
        categoryName: typeof currentProduct.category === 'string' ? currentProduct.category : (currentProduct.category as { name: string }).name,
        image: currentProduct.image,
        inStock: currentProduct.status !== 'Out of Stock',
        rating: 0,
        reviewCount: 0
      };
      
      // Call API to update product
      await productService.updateProduct(currentProduct.id, productData);
      
      // Update product in local state
      setProducts(products.map(p => p.id === currentProduct.id ? currentProduct : p));
      setIsEditDialogOpen(false);
      
      toast({
        title: "Product Updated",
        description: `${currentProduct.name} has been updated successfully.`
      });
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    try {
      // Call API to delete product
      await productService.deleteProduct(currentProduct.id);
      
      // Remove product from local state
      setProducts(products.filter(p => p.id !== currentProduct.id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Product Deleted",
        description: `${currentProduct.name} has been deleted successfully.`
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          <span className="ml-2">Loading products...</span>
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
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new product below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input 
                      id="name" 
                      className="col-span-3" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">Price</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      className="col-span-3" 
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select 
                      name="category"
                      defaultValue=""
                      onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category._id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">Stock</Label>
                    <Input 
                      id="stock" 
                      type="number" 
                      className="col-span-3" 
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select 
                      onValueChange={(value) => setNewProduct({...newProduct, status: value})}
                      defaultValue={newProduct.status}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image" className="text-right">Image URL</Label>
                    <Input 
                      id="image" 
                      className="col-span-3" 
                      value={newProduct.image || ''}
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {newProduct.image && (
                    <div className="flex justify-center mt-2">
                      <img 
                        src={newProduct.image} 
                        alt="Product preview" 
                        className="h-40 w-40 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddProduct}>Add Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? 'No products match your search' : 'No products found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {typeof product.category === 'string' 
                            ? product.category 
                            : (product.category as { name: string }).name}
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            product.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                            product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog open={isEditDialogOpen && currentProduct?.id === product.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (!open) setCurrentProduct(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>
                                  Make changes to the product details below.
                                </DialogDescription>
                              </DialogHeader>
                              {currentProduct && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                                    <Input 
                                      id="edit-name" 
                                      className="col-span-3" 
                                      value={currentProduct.name}
                                      onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-price" className="text-right">Price</Label>
                                    <Input 
                                      id="edit-price" 
                                      type="number" 
                                      className="col-span-3" 
                                      value={currentProduct.price}
                                      onChange={(e) => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-category" className="text-right">Category</Label>
                                    <Select 
                                      name="category"
                                      defaultValue={
                                        typeof currentProduct?.category === 'string' 
                                          ? currentProduct.category 
                                          : currentProduct?.category 
                                            ? (currentProduct.category as { name: string }).name 
                                            : ''
                                      }
                                      onValueChange={(value) => setCurrentProduct({...currentProduct, category: value})}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map(category => (
                                          <SelectItem key={category._id} value={category.name}>
                                            {category.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-stock" className="text-right">Stock</Label>
                                    <Input 
                                      id="edit-stock" 
                                      type="number" 
                                      className="col-span-3" 
                                      value={currentProduct.stock}
                                      onChange={(e) => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-status" className="text-right">Status</Label>
                                    <Select 
                                      onValueChange={(value) => setCurrentProduct({...currentProduct, status: value})}
                                      defaultValue={currentProduct.status}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-image" className="text-right">Image URL</Label>
                                    <Input 
                                      id="edit-image" 
                                      className="col-span-3" 
                                      value={currentProduct.image || ''}
                                      onChange={(e) => setCurrentProduct({...currentProduct, image: e.target.value})}
                                      placeholder="https://example.com/image.jpg"
                                    />
                                  </div>
                                  {currentProduct.image && (
                                    <div className="flex justify-center mt-2">
                                      <img 
                                        src={currentProduct.image} 
                                        alt="Product preview" 
                                        className="h-40 w-40 object-cover rounded-md border border-gray-200"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'https://placehold.co/400x400?text=No+Image';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleEditProduct}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isDeleteDialogOpen && currentProduct?.id === product.id} onOpenChange={(open) => {
                            setIsDeleteDialogOpen(open);
                            if (!open) setCurrentProduct(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setCurrentProduct(product)}>
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Product</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this product? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              {currentProduct && (
                                <div className="py-4">
                                  <p><strong>Name:</strong> {currentProduct.name}</p>
                                  <p><strong>Price:</strong> ${currentProduct.price.toFixed(2)}</p>
                                  <p><strong>Category:</strong> {currentProduct.category}</p>
                                  <p><strong>Status:</strong> {currentProduct.status}</p>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDeleteProduct}>Delete Product</Button>
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

export default AdminProducts;
