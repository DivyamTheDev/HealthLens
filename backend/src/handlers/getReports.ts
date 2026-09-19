import { dynamoService } from '../services/dynamoService.js';
import { ReportMetadata } from '../models/types.js';

export async function handleGetReports(userId = 'demo-user-123'): Promise<ReportMetadata[]> {
  const reports = await dynamoService.getReports(userId);
  return reports;
}
