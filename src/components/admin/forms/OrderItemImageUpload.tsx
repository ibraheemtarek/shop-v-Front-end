
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface OrderItemImageUploadProps {
  initialImage?: string;
  onSave: (image: string) => void;
  itemName: string;
}

export function OrderItemImageUpload({ 
  initialImage = "", 
  onSave,
  itemName
}: OrderItemImageUploadProps) {
  const [image, setImage] = useState<string>(initialImage);
  const { toast } = useToast();

  const handleImageUpload = (imageUrl: string) => {
    setImage(imageUrl);
    toast({
      title: "Item image updated",
      description: `The image for ${itemName} has been updated.`
    });
  };

  const handleSave = () => {
    onSave(image);
    toast({
      title: "Image saved",
      description: `The image for ${itemName} has been saved successfully.`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Item Image: {itemName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ImageUpload 
            value={image}
            onChange={handleImageUpload}
            aspectRatio={4/3}
            className="max-w-xs mx-auto"
          />
          <Button onClick={handleSave} className="w-full max-w-xs mx-auto block">Save Image</Button>
        </div>
      </CardContent>
    </Card>
  );
}
