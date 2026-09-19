import { dynamoService } from '../services/dynamoService.js';
import { s3Service } from '../services/s3Service.js';
import { ReportDetail } from '../models/types.js';

export async function handleGetReport(reportId: string): Promise<(ReportDetail & { downloadUrl: string }) | null> {
  const report = await dynamoService.getReport(reportId);
  if (!report) return null;

  const downloadUrl = await s3Service.getPresignedUrl(report.s3Key);

  return {
    ...report,
    downloadUrl,
  };
}
