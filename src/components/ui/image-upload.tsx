import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, Image as ImageIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  onUpload?: (file: File) => Promise<string>;
  className?: string;
  aspectRatio?: number;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  className,
  aspectRatio = 1,
  disabled = false,
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // If an onUpload function is provided, use it
      if (onUpload) {
        const url = await onUpload(file);
        onChange?.(url);
      } else {
        // Otherwise use a simple FileReader for preview (local only)
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onChange?.(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully."
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div 
        onClick={!disabled && !isUploading ? handleClick : undefined}
        className={cn(
          "border-2 border-dashed rounded-md relative overflow-hidden cursor-pointer",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-muted-foreground/50",
          className
        )}
      >
        <AspectRatio ratio={aspectRatio}>
          {value ? (
            <img 
              src={value} 
              alt="Uploaded" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-2 p-4">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Click to upload an image
              </p>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-white">Uploading...</p>
            </div>
          )}
        </AspectRatio>
      </div>
      
      {value && !disabled && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClick} 
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Change image
        </Button>
      )}
    </div>
  );
}
