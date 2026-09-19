import { handleCompareReports } from './compareReports.js';
import { bedrockService } from '../services/bedrockService.js';

export async function handleGenerateSummary(
  prevReportId: string,
  currReportId: string
): Promise<{ aiSummary: string }> {
  const comparison = await handleCompareReports(prevReportId, currReportId, false);
  const summary = await bedrockService.generateComparisonSummary(
    comparison.prevReport,
    comparison.currReport,
    comparison.items
  );

  return { aiSummary: summary };
}
