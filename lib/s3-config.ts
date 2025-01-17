import { S3Client } from '@aws-sdk/client-s3';

const REGION = process.env.AWS_REGION || 'us-east-2';
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'hearthful-pics-bucket';

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Let AWS SDK handle the endpoint construction
  forcePathStyle: true,
});

export const S3_CONFIG = {
  region: REGION,
  bucketName: BUCKET_NAME,
  // Use virtual-hosted style URL for public access
  publicUrl: `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`,
}; 