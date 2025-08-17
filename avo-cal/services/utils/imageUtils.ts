// Image utility functions

/**
 * Converts an image URI to base64 string
 * @param imageUri - The URI of the image to encode
 * @returns Promise<string> - Base64 encoded image data
 */
export async function encodeImageToBase64(imageUri: string): Promise<string> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error encoding image to base64:', error);
    throw new Error('Failed to encode image');
  }
}

/**
 * Validates if the provided URI is a valid image
 * @param imageUri - The URI to validate
 * @returns boolean - True if valid image URI
 */
export function isValidImageUri(imageUri: string): boolean {
  if (!imageUri || typeof imageUri !== 'string') {
    return false;
  }
  
  // Check if it's a file URI, http/https URL, or data URL
  const validPatterns = [
    /^file:\/\//,
    /^https?:\/\//,
    /^data:image\//
  ];
  
  return validPatterns.some(pattern => pattern.test(imageUri));
}

/**
 * Gets the MIME type from an image URI
 * @param imageUri - The image URI
 * @returns string - MIME type (defaults to 'image/jpeg')
 */
export function getImageMimeType(imageUri: string): string {
  if (imageUri.startsWith('data:')) {
    const match = imageUri.match(/data:([^;]+)/);
    return match ? match[1] : 'image/jpeg';
  }
  
  // For file URIs and HTTP URLs, assume JPEG
  return 'image/jpeg';
}
