import { dynamoService } from '../services/dynamoService.js';
import { bedrockService } from '../services/bedrockService.js';
import {
  ComparisonItem,
  ComparisonResult,
  TrendDirection,
} from '../models/types.js';

export async function handleCompareReports(
  prevReportId: string,
  currReportId: string,
  includeAiSummary = true
): Promise<ComparisonResult> {
  const prev = await dynamoService.getReport(prevReportId);
  const curr = await dynamoService.getReport(currReportId);

  if (!prev) throw new Error(`Previous report not found (ID: ${prevReportId})`);
  if (!curr) throw new Error(`Current report not found (ID: ${currReportId})`);

  // Ensure chronological order if user selected in reverse
  let older = prev;
  let newer = curr;
  if (new Date(prev.reportDate) > new Date(curr.reportDate)) {
    older = curr;
    newer = prev;
  }

  const olderMap = new Map(older.measurements.map((m) => [m.name.trim().toLowerCase(), m]));
  const newerMap = new Map(newer.measurements.map((m) => [m.name.trim().toLowerCase(), m]));

  const allNames = Array.from(new Set([...olderMap.keys(), ...newerMap.keys()]));

  const items: ComparisonItem[] = [];

  for (const nameKey of allNames) {
    const oldM = olderMap.get(nameKey);
    const newM = newerMap.get(nameKey);

    const displayName = newM ? newM.name : oldM!.name;
    const unit = newM ? newM.unit : oldM!.unit;
    const category = newM ? newM.category : oldM!.category;
    const referenceRange = newM ? newM.referenceRange : oldM!.referenceRange;

    const prevVal = oldM ? oldM.value : null;
    const currVal = newM ? newM.value : null;

    let change: number | null = null;
    let percentChange: number | null = null;
    let direction: TrendDirection = 'unchanged';

    if (prevVal !== null && currVal !== null) {
      change = parseFloat((currVal - prevVal).toFixed(2));
      if (prevVal !== 0) {
        percentChange = parseFloat((((currVal - prevVal) / prevVal) * 100).toFixed(1));
      }
      if (change > 0) direction = 'increased';
      else if (change < 0) direction = 'decreased';
      else direction = 'unchanged';
    } else if (prevVal === null && currVal !== null) {
      direction = 'new';
    } else if (prevVal !== null && currVal === null) {
      direction = 'missing';
    }

    items.push({
      biomarker: displayName,
      unit,
      category,
      referenceRange,
      prevValue: prevVal,
      currValue: currVal,
      change,
      percentChange,
      direction,
      prevStatus: oldM?.status,
      currStatus: newM?.status,
    });
  }

  // Generate Key Highlights
  const keyHighlights: string[] = [];
  const notable = items.filter(
    (i) => i.change !== null && Math.abs(i.percentChange ?? 0) >= 5
  );
  for (const item of notable.slice(0, 4)) {
    const sign = (item.change ?? 0) > 0 ? '+' : '';
    keyHighlights.push(
      `${item.biomarker}: changed by ${sign}${item.change} ${item.unit} (${sign}${item.percentChange}%)`
    );
  }

  // Generate Bedrock plain-language summary if requested
  let aiSummary: string | undefined;
  if (includeAiSummary) {
    aiSummary = await bedrockService.generateComparisonSummary(older, newer, items);
  }

  return {
    prevReport: older,
    currReport: newer,
    items,
    aiSummary,
    keyHighlights,
    generatedAt: new Date().toISOString(),
  };
}
