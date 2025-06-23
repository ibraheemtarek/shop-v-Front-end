
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import productService, { getFullImageUrl } from "@/services/productService";

interface ProductImageUploadProps {
  initialImages?: string[];
  productId?: string; // Add product ID for direct uploads
  onSave: (images: string[]) => void;
}

export function ProductImageUpload({ initialImages = [], productId, onSave }: ProductImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Handle file upload for existing product
  const handleFileUpload = async (file: File): Promise<string> => {
    if (!file) return '';
    
    setIsUploading(true);
    try {
      // Validate file type and size
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, GIF, or WebP image.",
          variant: "destructive"
        });
        throw new Error("Invalid file type");
      }
      
      // 5MB max size
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB.",
          variant: "destructive"
        });
        throw new Error("File too large");
      }

      // If we have a productId, upload directly to the product
      if (productId) {
        console.log(`Uploading image for product ${productId}`);
        const updatedProduct = await productService.uploadProductImage(productId, file);
        
        console.log('Upload successful, updated product:', updatedProduct);
        
        // The image URL should already be processed by the productService
        // but we'll ensure it's a full URL using our helper function
        const imageUrl = getFullImageUrl(updatedProduct.image);
        
        return imageUrl;
      } else {
        // For new products (no ID yet), use FileReader for temporary preview
        console.log('Creating temporary preview for new product image');
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const result = event.target.result as string;
              console.log('Created temporary image preview');
              resolve(result);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (error) {
      console.error("Error uploading product image:", error);
      toast({
        title: "Upload failed",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : "There was an error uploading your image.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    setImages((prev) => [...prev, imageUrl]);
    toast({
      title: "Image added",
      description: "The image has been added to the product gallery."
    });
  };

  const handleRemoveImage = async (index: number) => {
    try {
      // If we have a productId, try to delete the image on the server
      if (productId) {
        await productService.deleteProductImage(productId, index);
      }
      
      // Update local state
      setImages((prev) => prev.filter((_, i) => i !== index));
      
      toast({
        title: "Image removed",
        description: "The image has been removed from the product gallery."
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "Failed to remove the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    onSave(images);
    toast({
      title: "Images saved",
      description: "Your product images have been saved successfully."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Product image ${index + 1}`} 
                  className="w-full h-40 object-cover rounded-md"
                />
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <ImageUpload 
              aspectRatio={4/3}
              onChange={handleImageUpload}
              onUpload={handleFileUpload}
              className="h-40"
              disabled={isUploading}
            />
          </div>
          <Button onClick={handleSave}>Save Images</Button>
        </div>
      </CardContent>
    </Card>
  );
}
