/**
 * Image Utilities
 * 
 * Handles image conversion, compression, and storage for profile pictures
 * and other media within the application
 */

/**
 * Convert image file to base64 data URL
 * Useful for storing images in localStorage
 * 
 * @param file - The image file to convert
 * @returns Promise resolving to base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * Checks file type and size
 * 
 * @param file - The file to validate
 * @param maxSizeMB - Maximum allowed size in MB (default: 5MB)
 * @returns Object with isValid flag and error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 20
): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please use JPEG, PNG, GIF, or WebP.',
    };
  }
  
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit.`,
    };
  }
  
  return { isValid: true };
}

/**
 * Compress image to reduce file size
 * Useful for larger images before storing in localStorage
 * 
 * @param file - The image file to compress
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise resolving to compressed base64 data URL
 */
export async function compressImage(
  file: File,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      
      img.onerror = () => {
        reject(new Error('Could not load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a default avatar with initials
 * Useful as a fallback when user hasn't uploaded a picture
 * 
 * @param name - User's full name
 * @param backgroundColor - Hex color for background (default: #007BFF)
 * @returns SVG data URL
 */
export function generateAvatarFromInitials(
  name: string,
  backgroundColor: string = '#007BFF'
): string {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${backgroundColor}"/>
      <text
        x="50%"
        y="50%"
        dy=".3em"
        text-anchor="middle"
        font-size="80"
        font-weight="bold"
        fill="white"
        font-family="Arial, sans-serif"
      >
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
