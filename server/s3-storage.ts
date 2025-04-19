import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  ListObjectsV2Command,
  CreateBucketCommand,
  HeadBucketCommand
} from '@aws-sdk/client-s3';
import { s3Client, DEFAULT_BUCKET_NAME } from './aws-config';
import { v4 as uuid } from 'uuid';
import { Readable } from 'stream';
import { Request, Response } from 'express';

// Interface for file metadata
export interface FileMetadata {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  key: string;
  entityType: string;
  entityId: string;
  uploadedBy: string;
  uploadedAt: string;
}

export class S3FileStorage {
  private bucketName: string;

  constructor(bucketName = DEFAULT_BUCKET_NAME) {
    this.bucketName = bucketName;
    this.ensureBucketExists();
  }

  // Ensure bucket exists
  private async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      await s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log(`Bucket ${this.bucketName} exists`);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        // Create bucket if doesn't exist
        try {
          await s3Client.send(new CreateBucketCommand({ 
            Bucket: this.bucketName,
            // Default region is implied by client config
          }));
          console.log(`Bucket ${this.bucketName} created`);
        } catch (createError) {
          console.error(`Error creating bucket ${this.bucketName}:`, createError);
          throw createError;
        }
      } else {
        console.error(`Error checking bucket ${this.bucketName}:`, error);
        throw error;
      }
    }
  }

  // Upload file
  async uploadFile(
    fileBuffer: Buffer, 
    originalFilename: string, 
    contentType: string,
    entityType: string,
    entityId: string,
    userId: string
  ): Promise<FileMetadata> {
    const fileId = uuid();
    const fileExtension = originalFilename.split('.').pop() || '';
    const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${entityType}/${entityId}/${fileId}-${safeFilename}`;

    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: {
          originalFilename: safeFilename,
          entityType,
          entityId,
          uploadedBy: userId,
        },
      }));

      const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        id: fileId,
        filename: safeFilename,
        contentType,
        size: fileBuffer.length,
        url: fileUrl,
        key,
        entityType,
        entityId,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error uploading file ${originalFilename}:`, error);
      throw error;
    }
  }

  // Stream file to response
  async streamFileToResponse(key: string, res: Response): Promise<void> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      // Set response headers
      if (response.ContentType) {
        res.setHeader('Content-Type', response.ContentType);
      }
      
      if (response.ContentLength) {
        res.setHeader('Content-Length', response.ContentLength);
      }
      
      // Stream the file data to the response
      if (response.Body instanceof Readable) {
        response.Body.pipe(res);
      } else {
        res.status(500).send('Unexpected response format from S3');
      }
    } catch (error) {
      console.error(`Error streaming file ${key}:`, error);
      res.status(404).send('File not found');
    }
  }

  // Delete file
  async deleteFile(key: string): Promise<boolean> {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
      
      return true;
    } catch (error) {
      console.error(`Error deleting file ${key}:`, error);
      return false;
    }
  }

  // List files for an entity
  async listFiles(entityType: string, entityId: string): Promise<FileMetadata[]> {
    try {
      const prefix = `${entityType}/${entityId}/`;
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await s3Client.send(command);
      
      if (!response.Contents || response.Contents.length === 0) {
        return [];
      }

      return response.Contents.map(item => {
        const key = item.Key!;
        const fileId = key.split('-')[0].split('/').pop() || '';
        const filename = key.substring(key.indexOf('-') + 1);
        
        return {
          id: fileId,
          filename,
          contentType: item.ETag || 'application/octet-stream', // We would need to fetch each object to get ContentType
          size: item.Size || 0,
          url: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
          key,
          entityType,
          entityId,
          uploadedBy: 'unknown', // Would need to fetch object metadata
          uploadedAt: item.LastModified?.toISOString() || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error(`Error listing files for ${entityType}/${entityId}:`, error);
      return [];
    }
  }

  // Upload handler for Express with multer
  createUploadMiddleware(entityType: string, entityId: string) {
    return async (req: Request & { file?: any, user?: any }, res: Response) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        const fileMetadata = await this.uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          entityType,
          entityId,
          req.user?.id || 'anonymous'
        );

        res.status(201).json(fileMetadata);
      } catch (error) {
        console.error('Error in upload middleware:', error);
        res.status(500).json({ error: 'Failed to upload file' });
      }
    };
  }
}

// Create and export instance
export const s3FileStorage = new S3FileStorage();