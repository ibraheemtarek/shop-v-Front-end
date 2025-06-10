
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageUploadProps {
  initialImage?: string;
  onSave: (image: string) => void;
}

export function ProfileImageUpload({ initialImage = "", onSave }: ProfileImageUploadProps) {
  const [image, setImage] = useState<string>(initialImage);
  const { toast } = useToast();

  const handleImageUpload = (imageUrl: string) => {
    setImage(imageUrl);
  };

  const handleSave = () => {
    onSave(image);
    toast({
      title: "Profile updated",
      description: "Your profile image has been updated successfully."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Image</CardTitle>
        <CardDescription>Update your admin profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ImageUpload 
            value={image}
            onChange={handleImageUpload}
            aspectRatio={1}
            className="w-32 h-32 mx-auto"
          />
          <div className="flex justify-center">
            <Button onClick={handleSave} className="mt-4">Save Profile Image</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
