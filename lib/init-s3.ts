import { configureBucketCors } from './s3-utils';

// Initialize S3 CORS configuration
export async function initializeS3() {
  try {
    await configureBucketCors();
    console.log('S3 CORS configuration completed');
  } catch (error) {
    console.error('Failed to initialize S3 CORS:', error);
  }
} 