
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProductImageUploadProps {
  initialImages?: string[];
  onSave: (images: string[]) => void;
}

export function ProductImageUpload({ initialImages = [], onSave }: ProductImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const { toast } = useToast();

  const handleImageUpload = (imageUrl: string) => {
    setImages((prev) => [...prev, imageUrl]);
    toast({
      title: "Image added",
      description: "The image has been added to the product gallery."
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Image removed",
      description: "The image has been removed from the product gallery."
    });
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
              className="h-40"
            />
          </div>
          <Button onClick={handleSave}>Save Images</Button>
        </div>
      </CardContent>
    </Card>
  );
}
