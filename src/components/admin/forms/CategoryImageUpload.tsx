
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CategoryImageUploadProps {
  initialImage?: string;
  onSave: (image: string) => void;
}

export function CategoryImageUpload({ initialImage = "", onSave }: CategoryImageUploadProps) {
  const [image, setImage] = useState<string>(initialImage);
  const { toast } = useToast();

  const handleImageUpload = (imageUrl: string) => {
    setImage(imageUrl);
    toast({
      title: "Image updated",
      description: "The category image has been updated."
    });
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
            aspectRatio={16/9}
            className="max-w-md mx-auto"
          />
          <Button onClick={handleSave} className="w-full max-w-md mx-auto block">Save Image</Button>
        </div>
      </CardContent>
    </Card>
  );
}
