import { v4 as uuidv4 } from 'uuid';
import { s3Service } from '../services/s3Service.js';
import { processReport } from './processReport.js';
import { ReportDetail } from '../models/types.js';

export async function handleUploadReport(
  buffer: Buffer,
  originalFileName: string,
  contentType: string,
  userId = 'demo-user-123'
): Promise<ReportDetail> {
  const reportId = uuidv4();
  const safeName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');

  console.log(`[handleUploadReport] Uploading file for user: ${userId}, file: ${safeName}`);

  // 1. Upload to S3
  const { s3Key } = await s3Service.uploadReportFile(
    userId,
    reportId,
    safeName,
    buffer,
    contentType
  );

  // 2. Process the report through Bedrock and DynamoDB
  const reportDetail = await processReport(
    reportId,
    userId,
    s3Key,
    safeName,
    buffer.length
  );

  return reportDetail;
}
