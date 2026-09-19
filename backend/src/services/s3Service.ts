import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

export class S3Service {
  private client: S3Client | null = null;
  private bucketName: string;
  private isLiveMode: boolean;
  private localStorageDir: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'healthlens-reports-bucket';
    const hasAwsKeys = Boolean(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION
    );
    const forceAuto = process.env.AWS_MODE !== 'mock';
    this.isLiveMode = hasAwsKeys && forceAuto;

    this.localStorageDir = path.resolve(process.cwd(), 'data', 's3_storage');

    if (this.isLiveMode) {
      this.client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      console.log(`[S3Service] Initialized in AWS LIVE mode (Bucket: ${this.bucketName})`);
    } else {
      if (!fs.existsSync(this.localStorageDir)) {
        fs.mkdirSync(this.localStorageDir, { recursive: true });
      }
      console.log(`[S3Service] Initialized in LOCAL SIMULATION mode (Storage: ${this.localStorageDir})`);
    }
  }

  public isLive(): boolean {
    return this.isLiveMode;
  }

  public async uploadReportFile(
    userId: string,
    reportId: string,
    fileName: string,
    buffer: Buffer,
    contentType = 'application/pdf'
  ): Promise<{ s3Key: string; location: string }> {
    const s3Key = `reports/${userId}/${reportId}/${fileName}`;

    if (this.isLiveMode && this.client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: buffer,
          ContentType: contentType,
          Metadata: {
            userId,
            reportId,
            originalName: fileName,
          },
        });
        await this.client.send(command);
        return {
          s3Key,
          location: `s3://${this.bucketName}/${s3Key}`,
        };
      } catch (err) {
        console.warn(`[S3Service] Live S3 upload failed, falling back to local storage:`, err);
      }
    }

    // Local simulation storage
    const targetPath = path.join(this.localStorageDir, userId, reportId);
    fs.mkdirSync(targetPath, { recursive: true });
    const filePath = path.join(targetPath, fileName);
    fs.writeFileSync(filePath, buffer);

    return {
      s3Key,
      location: filePath,
    };
  }

  public async getReportFile(s3Key: string): Promise<Buffer> {
    if (this.isLiveMode && this.client) {
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        });
        const response = await this.client.send(command);
        const byteArray = await response.Body?.transformToByteArray();
        if (byteArray) {
          return Buffer.from(byteArray);
        }
      } catch (err) {
        console.warn(`[S3Service] Live S3 get failed, trying local fallback:`, err);
      }
    }

    // Local file retrieval
    const normalizedKey = s3Key.replace(/^reports\//, '');
    const localFilePath = path.join(this.localStorageDir, normalizedKey);
    if (fs.existsSync(localFilePath)) {
      return fs.readFileSync(localFilePath);
    }

    // Check if it's in sample-data
    const samplePath = path.resolve(process.cwd(), '..', 'sample-data', path.basename(s3Key));
    if (fs.existsSync(samplePath)) {
      return fs.readFileSync(samplePath);
    }

    throw new Error(`Report file not found for key: ${s3Key}`);
  }

  public async getPresignedUrl(s3Key: string, expiresInSeconds = 3600): Promise<string> {
    if (this.isLiveMode && this.client) {
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        });
        return await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
      } catch (err) {
        console.warn(`[S3Service] Could not generate presigned URL:`, err);
      }
    }

    return `/api/files/download?key=${encodeURIComponent(s3Key)}`;
  }
}

export const s3Service = new S3Service();
