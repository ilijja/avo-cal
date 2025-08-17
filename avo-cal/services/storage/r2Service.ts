import AWS from 'aws-sdk';
import * as FileSystem from 'expo-file-system';

// R2 Configuration
const R2_ENDPOINT = 'https://6bc24a6da75f9aedc7d5475b5bf622d5.r2.cloudflarestorage.com';
const R2_BUCKET = 'avo-cal';
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY!;

// Validate environment variables
if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('R2 credentials not found in environment variables');
  console.error('R2_ACCESS_KEY_ID:', R2_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
  console.error('R2_SECRET_ACCESS_KEY:', R2_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
}

// Note: CORS should include React Native origins
// Update CORS in Cloudflare R2 to include:
// - "http://localhost:3000"
// - "http://localhost:8081" 
// - "exp://localhost:8081"
// - "exp://192.168.x.x:8081" (your local IP)
// - "https://pub-bef2535ba6fd4a17b0323f352863c571.r2.dev"

// Configure AWS SDK for R2
const s3 = new AWS.S3({
  endpoint: R2_ENDPOINT,
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: 'auto', // R2 doesn't use regions
  s3ForcePathStyle: true, // Required for R2
});

export class R2Service {
  /**
   * Uploads an image to R2 storage
   * @param imageUri - Local URI of the image
   * @param userId - User ID for organizing files
   * @returns Promise<string> - Public URL of the uploaded image
   */
  static async uploadImage(imageUri: string, userId: string): Promise<string> {
    try {
      console.log('Starting image upload to R2...');
      console.log('Image URI:', imageUri);
      console.log('User ID:', userId);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `${userId}/${timestamp}_${randomId}.jpg`;
      console.log('Generated filename:', filename);
      
      // Read image file as base64
      console.log('Reading image file...');
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Image read successfully, size:', base64Image.length);
      
      // Convert base64 to Uint8Array for AWS SDK
      console.log('Converting to binary...');
      const binaryString = atob(base64Image);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('Binary conversion complete, size:', bytes.length);
      
      // Upload to R2
      console.log('Uploading to R2...');
      const uploadParams = {
        Bucket: R2_BUCKET,
        Key: filename,
        Body: bytes,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };

      const result = await s3.upload(uploadParams).promise();
      
      console.log('Image uploaded successfully:', result.Location);
      console.log('AWS SDK Location:', result.Location);
      
      // Use the public R2 URL format
      const publicUrl = `https://pub-bef2535ba6fd4a17b0323f352863c571.r2.dev/${filename}`;
      console.log('Final Public URL:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image to R2:', error);
      throw new Error(`Failed to upload image: ${error}`);
    }
  }



  /**
   * Deletes an image from R2 storage
   * @param imageUrl - Public URL of the image to delete
   * @returns Promise<void>
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract key from URL
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(-2).join('/'); // Get userId/filename
      
      const deleteParams = {
        Bucket: R2_BUCKET,
        Key: key,
      };

      await s3.deleteObject(deleteParams).promise();
      console.log('Image deleted successfully:', key);
    } catch (error) {
      console.error('Error deleting image from R2:', error);
      throw new Error('Failed to delete image');
    }
  }
}
