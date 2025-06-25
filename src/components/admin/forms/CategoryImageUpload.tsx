
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import categoryService from "@/services/categoryService";

interface CategoryImageUploadProps {
  initialImage?: string;
  categoryId?: string;
  onSave: (image: string) => void;
  onUploadComplete?: () => void;
}

export function CategoryImageUpload({ 
  initialImage = "", 
  categoryId,
  onSave,
  onUploadComplete
}: CategoryImageUploadProps) {
  const [image, setImage] = useState<string>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (imageUrl: string) => {
    setImage(imageUrl);
    toast({
      title: "Image updated",
      description: "The category image has been updated."
    });
  };

  const handleFileUpload = async (file: File): Promise<string> => {
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

      // If we have a categoryId, upload directly to the category
      if (categoryId) {
        console.log(`Uploading image for category ${categoryId}`);
        const updatedCategory = await categoryService.uploadCategoryImage(categoryId, file);
        
        console.log('Upload successful, updated category:', updatedCategory);
        
        // Call the onUploadComplete callback if provided
        if (onUploadComplete) {
          onUploadComplete();
        }
        
        // The backend returns the relative path, but we need the full URL
        // Check if the image path is already a full URL
        let imageUrl = updatedCategory.image;
        if (imageUrl && !imageUrl.startsWith('http')) {
          // If it's a relative path, prepend the API base URL
          const apiConfig = await import('@/config/api').then(module => module.default);
          imageUrl = `${apiConfig.BASE_URL}${imageUrl}`;
        }
        
        return imageUrl;
      } else {
        // For new categories (no ID yet), use FileReader for temporary preview
        console.log('Creating temporary preview for new category image');
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
      console.error("Error uploading category image:", error);
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

  const handleSave = () => {
    onSave(image);
    toast({
      title: "Image saved",
      description: "Your category image has been saved successfully."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ImageUpload 
            value={image}
            onChange={handleImageUpload}
            onUpload={handleFileUpload}
            aspectRatio={16/9}
            className="max-w-md mx-auto"
            disabled={isUploading}
          />
          <Button 
            onClick={handleSave} 
            className="w-full max-w-md mx-auto block"
            disabled={isUploading}
          >
            Save Image
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
