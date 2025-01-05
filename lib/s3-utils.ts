import { PutObjectCommand, PutBucketCorsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_CONFIG } from './s3-config';

// Configure CORS for the S3 bucket
export async function configureBucketCors() {
  const command = new PutBucketCorsCommand({
    Bucket: S3_CONFIG.bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  });

  try {
    await s3Client.send(command);
    console.log('Successfully configured CORS for S3 bucket');
  } catch (error) {
    console.error('Error configuring CORS for S3 bucket:', error);
    throw error;
  }
}

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'photos'
): Promise<{ key: string; url: string }> {
  // Sanitize the filename to prevent S3 path issues
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${Date.now()}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: S3_CONFIG.bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // Cache for 1 year
    ACL: 'public-read',
  });

  try {
    await s3Client.send(command);
    const url = `${S3_CONFIG.publicUrl}/${key}`;
    return { key, url };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

export async function getSignedFileUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_CONFIG.bucketName,
    Key: key,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000',
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: S3_CONFIG.bucketName,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
} 