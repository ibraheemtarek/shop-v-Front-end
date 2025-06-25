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
import productService, { getFullImageUrl } from '@/services/productService';
import categoryService, { Category } from '@/services/categoryService';
import { ProductImageUpload } from './forms/ProductImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [tempUploadedImage, setTempUploadedImage] = useState<string>('');
  const [tempEditUploadedImage, setTempEditUploadedImage] = useState<string>('');

  const { toast } = useToast();

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if admin is authenticated with admin token
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          setError('Admin authentication required. Please log in as an admin.');
          setLoading(false);
          return;
        }
        
        // Fetch products using admin method
        const productsResponse = await productService.getAdminProducts();
        
        // Fetch categories for dropdown using admin method
        const categoriesData = await categoryService.getAdminCategories();
        
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
      // Validate inputs
      if (!newProduct.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Product name is required",
          variant: "destructive"
        });
        return;
      }

      if (!newProduct.category) {
        toast({
          title: "Validation Error",
          description: "Product category is required",
          variant: "destructive"
        });
        return;
      }

      // Prepare the image for the API call
      let imageToUse = newProduct.image || '';
      let hasBase64Image = false;
      let fileToUpload: File | null = null;
      
      // If we have a base64 image, prepare it for upload
      if (tempUploadedImage && tempUploadedImage.startsWith('data:')) {
        hasBase64Image = true;
        
        try {
          // Convert base64 to file for later upload
          const base64Response = await fetch(tempUploadedImage);
          const blob = await base64Response.blob();
          
          // Determine the file extension from the MIME type
          const mimeType = blob.type || 'image/jpeg';
          const fileExtension = mimeType.split('/')[1] || 'jpg';
          
          // Create a file with a proper name and type
          fileToUpload = new File(
            [blob], 
            `product-image.${fileExtension}`, 
            { type: mimeType }
          );
          
          // Use a placeholder URL for now
          imageToUse = 'https://placehold.co/600x400?text=' + encodeURIComponent(newProduct.name);
        } catch (error) {
          console.error('Error preparing image file:', error);
          toast({
            title: "Error",
            description: "Failed to process the image. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Prepare data for API
      // Find the category ID based on the selected category name
      const selectedCategory = categories.find(cat => 
        cat.name === newProduct.category || 
        (typeof newProduct.category === 'object' && newProduct.category?.name === cat.name)
      );
      
      const categoryId = selectedCategory?._id || '';
      const categoryName = selectedCategory?.name || 
        (typeof newProduct.category === 'string' ? newProduct.category : 
         typeof newProduct.category === 'object' ? newProduct.category.name : '');
      
      const productData = {
        name: newProduct.name,
        price: newProduct.price,
        description: `${newProduct.name} - ${categoryName}`,
        category: categoryId, // Send the category ID instead of the name
        categoryName: categoryName,
        image: imageToUse, // Use the image URL or placeholder
        inStock: newProduct.status !== 'Out of Stock',
        rating: 0,
        reviewCount: 0
      };
      
      console.log('Creating product with data:', productData);
      
      // Call API to create product
      const createdProduct = await productService.createProduct(productData);
      
      console.log('Created product response:', createdProduct);
      
      // If we have a base64 image that was prepared for upload, upload it now
      if (hasBase64Image && fileToUpload) {
        try {
          console.log(`Uploading image file: ${fileToUpload.name} (${fileToUpload.size} bytes, ${fileToUpload.type})`);
          
          // Upload the file to the newly created product
          const updatedProduct = await productService.uploadProductImage(createdProduct._id, fileToUpload);
          console.log('Image upload successful:', updatedProduct);
          
          // Update the product with the new image URL
          createdProduct.image = updatedProduct.image;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Warning",
            description: "Product was created but there was an error uploading the image.",
            variant: "destructive"
          });
          // Continue anyway since the product was created
        }
      }
      
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
      
      // If the image is a relative path, convert it to a full URL for display
      if (newProductWithId.image && !newProductWithId.image.startsWith('http')) {
        const apiConfig = await import('@/config/api').then(module => module.default);
        newProductWithId.image = `${apiConfig.BASE_URL}${newProductWithId.image}`;
      }
      
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
      setTempUploadedImage('');
      
      toast({
        title: "Product Added",
        description: `${newProduct.name} has been added successfully.`
      });
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: "Error",
        description: typeof err === 'object' && err !== null && 'message' in err 
          ? String(err.message) 
          : "Failed to add product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!currentProduct) return;
    
    try {
      // Validate inputs
      if (!currentProduct.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Product name is required",
          variant: "destructive"
        });
        return;
      }

      if (!currentProduct.category) {
        toast({
          title: "Validation Error",
          description: "Product category is required",
          variant: "destructive"
        });
        return;
      }

      // Prepare the image for the API call
      let imageToUse = currentProduct.image || '';
      let hasBase64Image = false;
      let fileToUpload: File | null = null;
      
      // If we have a base64 image, prepare it for upload
      if (tempEditUploadedImage && tempEditUploadedImage.startsWith('data:')) {
        hasBase64Image = true;
        
        try {
          // Convert base64 to file for later upload
          const base64Response = await fetch(tempEditUploadedImage);
          const blob = await base64Response.blob();
          
          // Determine the file extension from the MIME type
          const mimeType = blob.type || 'image/jpeg';
          const fileExtension = mimeType.split('/')[1] || 'jpg';
          
          // Create a file with a proper name and type
          fileToUpload = new File(
            [blob], 
            `product-image-${currentProduct.id}.${fileExtension}`, 
            { type: mimeType }
          );
          
          // Keep the existing image URL for now, we'll update after upload
          imageToUse = currentProduct.image || '';
        } catch (error) {
          console.error('Error preparing image file:', error);
          toast({
            title: "Error",
            description: "Failed to process the image. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Prepare data for API
      const categoryName = typeof currentProduct.category === 'string' 
        ? currentProduct.category 
        : currentProduct.category.name;
      
      // Find the category ID based on the selected category name
      const selectedCategory = categories.find(cat => cat.name === categoryName);
      const categoryId = selectedCategory?._id || '';

      const productData = {
        name: currentProduct.name,
        price: currentProduct.price,
        description: `${currentProduct.name} - ${categoryName}`,
        category: categoryId, // Send the category ID instead of the name
        image: imageToUse,
        inStock: currentProduct.status !== 'Out of Stock',
        categoryName: categoryName
      };
      
      console.log('Updating product with data:', productData);
      
      // Call API to update product
      const updatedProduct = await productService.updateProduct(currentProduct.id, productData);
      
      console.log('Updated product response:', updatedProduct);
      
      // If we have a base64 image that was prepared for upload, upload it now
      if (hasBase64Image && fileToUpload) {
        try {
          console.log(`Uploading image file for product ${currentProduct.id}: ${fileToUpload.name} (${fileToUpload.size} bytes, ${fileToUpload.type})`);
          
          // Upload the file to the updated product
          const productWithImage = await productService.uploadProductImage(currentProduct.id, fileToUpload);
          console.log('Image upload successful:', productWithImage);
          
          // Update the product with the new image URL
          updatedProduct.image = productWithImage.image;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Warning",
            description: "Product was updated but there was an error uploading the image.",
            variant: "destructive"
          });
          // Continue anyway since the product was updated
        }
      }
      
      // Convert the image path to a full URL for display using our helper function
      const displayImageUrl = getFullImageUrl(updatedProduct.image);
      
      // Update local state
      setProducts(products.map(product => 
        product.id === currentProduct.id ? {
          ...currentProduct,
          image: displayImageUrl
        } : product
      ));
      
      setIsEditDialogOpen(false);
      setTempEditUploadedImage('');
      
      toast({
        title: "Product Updated",
        description: `${currentProduct.name} has been updated successfully.`
      });
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: "Error",
        description: typeof err === 'object' && err !== null && 'message' in err 
          ? String(err.message) 
          : "Failed to update product. Please try again.",
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
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new product below.
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Product Details</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4 py-4">
                    <div className="grid gap-4">
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
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="images">
                    <div className="space-y-4 py-4">
                      {tempUploadedImage ? (
                        <div className="relative">
                          <img 
                            src={tempUploadedImage} 
                            alt="Product preview" 
                            className="w-full max-h-64 object-contain rounded-md border border-gray-200"
                          />
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="absolute top-2 right-2" 
                            onClick={() => setTempUploadedImage('')}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-4">Upload a product image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setTempUploadedImage(event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full"
                          />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">Or Image URL</Label>
                        <Input 
                          id="image" 
                          className="col-span-3" 
                          value={newProduct.image || ''}
                          onChange={(e) => {
                            setNewProduct({...newProduct, image: e.target.value});
                            // Clear the temp uploaded image if URL is provided
                            if (e.target.value) setTempUploadedImage('');
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      {newProduct.image && !tempUploadedImage && (
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
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setTempUploadedImage('');
                  }}>Cancel</Button>
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
                            : product.category && typeof product.category === 'object' 
                              ? ((product.category as { name?: string }).name || 'Uncategorized')
                              : 'Uncategorized'}
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
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>
                                  Make changes to the product details below.
                                </DialogDescription>
                              </DialogHeader>
                              {currentProduct && (
                                <Tabs defaultValue="details" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="details">Product Details</TabsTrigger>
                                    <TabsTrigger value="images">Images</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="details" className="space-y-4 py-4">
                                    <div className="grid gap-4">
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
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="images" className="space-y-4 py-4">
                                    {tempEditUploadedImage ? (
                                      <div className="relative">
                                        <img 
                                          src={tempEditUploadedImage} 
                                          alt="Product preview" 
                                          className="w-full max-h-64 object-contain rounded-md border border-gray-200"
                                        />
                                        <Button 
                                          variant="destructive" 
                                          size="sm" 
                                          className="absolute top-2 right-2" 
                                          onClick={() => setTempEditUploadedImage('')}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground mb-4">Upload a product image</p>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (event) => {
                                                if (event.target?.result) {
                                                  setTempEditUploadedImage(event.target.result as string);
                                                }
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                          className="w-full"
                                        />
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-image" className="text-right">Or Image URL</Label>
                                      <Input 
                                        id="edit-image" 
                                        className="col-span-3" 
                                        value={currentProduct.image || ''}
                                        onChange={(e) => {
                                          setCurrentProduct({...currentProduct, image: e.target.value});
                                          // Clear the temp uploaded image if URL is provided
                                          if (e.target.value) setTempEditUploadedImage('');
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                      />
                                    </div>
                                    
                                    {currentProduct.image && !tempEditUploadedImage && (
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
                                  </TabsContent>
                                </Tabs>
                              )}
                              <DialogFooter className="mt-4">
                                <Button variant="outline" onClick={() => {
                                  setIsEditDialogOpen(false);
                                  setTempEditUploadedImage('');
                                }}>Cancel</Button>
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
                                  <p><strong>Category:</strong> {currentProduct.categoryName}</p>
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
