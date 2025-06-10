
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CustomerProfileUploadProps {
  initialImage?: string;
  onSave: (image: string) => void;
  customerId: string;
}

export function CustomerProfileUpload({ 
  initialImage = "", 
  onSave,
  customerId
}: CustomerProfileUploadProps) {
  const [image, setImage] = useState<string>(initialImage);
  const { toast } = useToast();

  const handleImageUpload = (imageUrl: string) => {
    setImage(imageUrl);
    toast({
      title: "Profile image updated",
      description: "The customer profile image has been updated."
    });
  };

  const handleSave = () => {
    onSave(image);
    toast({
      title: "Profile saved",
      description: "The customer profile image has been saved successfully."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Profile Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ImageUpload 
            value={image}
            onChange={handleImageUpload}
            aspectRatio={1}
            className="w-40 h-40 mx-auto"
          />
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Customer ID: {customerId}
            </p>
            <Button onClick={handleSave}>Save Profile Image</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
