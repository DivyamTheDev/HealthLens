import { dynamoService } from '../services/dynamoService.js';
import { bedrockService } from '../services/bedrockService.js';
import { AskReportsResponse, ReportDetail } from '../models/types.js';

export async function handleAskReports(
  question: string,
  userId = 'demo-user-123'
): Promise<AskReportsResponse> {
  if (!question || question.trim().length === 0) {
    throw new Error('Question must not be empty');
  }

  const reports = await dynamoService.getReports(userId);
  const detailedReports: ReportDetail[] = [];

  for (const r of reports) {
    const detail = await dynamoService.getReport(r.id);
    if (detail) {
      detailedReports.push(detail);
    }
  }

  const result = await bedrockService.askReports(question, detailedReports);

  return {
    question,
    answer: result.answer,
    relevantReports: result.referencedReports,
    referencedBiomarkers: result.referencedBiomarkers,
    caveat:
      'Information provided by HealthLens AI based on recorded lab documents. Not a clinical diagnosis or treatment recommendation.',
    generatedAt: new Date().toISOString(),
  };
}
