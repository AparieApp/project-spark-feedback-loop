import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Upload, X, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createImagePreview, revokeImagePreview, validateImageFile, ImageUploadError } from '@/lib/imageUpload';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  isUploading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'avatar' | 'card';
}

export function ImageUpload({
  currentImageUrl,
  onImageSelect,
  onImageRemove,
  isUploading = false,
  className,
  size = 'md',
  variant = 'avatar'
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = useCallback((file: File) => {
    try {
      validateImageFile(file);
      setError(null);
      
      // Create preview
      if (previewUrl) {
        revokeImagePreview(previewUrl);
      }
      const newPreviewUrl = createImagePreview(file);
      setPreviewUrl(newPreviewUrl);
      
      onImageSelect(file);
    } catch (err) {
      if (err instanceof ImageUploadError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  }, [previewUrl, onImageSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      revokeImagePreview(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl, onImageRemove]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  if (variant === 'avatar') {
    return (
      <div className={cn('relative', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          <Avatar className="w-full h-full">
            <AvatarImage src={displayImageUrl || undefined} alt="Profile picture" />
            <AvatarFallback>
              <User className="h-1/2 w-1/2 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          
          {/* Upload overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
               onClick={openFileDialog}>
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </div>
          
          {/* Remove button */}
          {displayImageUrl && !isUploading && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          error && 'border-red-300'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {displayImageUrl ? (
              <div className="relative">
                <img
                  src={displayImageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                {displayImageUrl ? 'Click to change image' : 'Upload profile picture'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {displayImageUrl && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remove Image
          </Button>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
} 