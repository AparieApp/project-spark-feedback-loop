import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
}

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

/**
 * Validates image file before upload
 */
export function validateImageFile(file: File): void {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new ImageUploadError('Please select a valid image file (JPEG, PNG, or WebP)');
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new ImageUploadError('Image file size must be less than 5MB');
  }
}

/**
 * Resizes image to specified dimensions while maintaining aspect ratio
 */
export function resizeImage(file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new ImageUploadError('Failed to resize image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new ImageUploadError('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Uploads profile picture to Supabase storage
 */
export async function uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
  try {
    // Validate file
    validateImageFile(file);

    // Resize image
    const resizedBlob = await resizeImage(file);
    
    // Generate unique filename (always use .jpg since we convert to JPEG)
    const fileName = `${userId}-${Date.now()}.jpg`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, resizedBlob, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new ImageUploadError(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error;
    }
    throw new ImageUploadError('An unexpected error occurred during upload');
  }
}

/**
 * Deletes profile picture from Supabase storage
 */
export async function deleteProfilePicture(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('profile-images')
      .remove([filePath]);

    if (error) {
      throw new ImageUploadError(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error;
    }
    throw new ImageUploadError('An unexpected error occurred during deletion');
  }
}

/**
 * Creates a preview URL for selected file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes a preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
} 