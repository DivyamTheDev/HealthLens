import { dynamoService } from '../services/dynamoService.js';
import { BiomarkerTimeline, TimelinePoint } from '../models/types.js';

export async function handleGetTimeline(
  biomarkerName?: string,
  userId = 'demo-user-123'
): Promise<BiomarkerTimeline | { availableBiomarkers: string[] }> {
  const reports = await dynamoService.getReports(userId);
  const allReportsDetails = await Promise.all(
    reports.map((r) => dynamoService.getReport(r.id))
  );

  const validReports = allReportsDetails.filter(Boolean);

  // If no biomarker specified, return list of available biomarkers
  if (!biomarkerName) {
    const biomarkerSet = new Set<string>();
    for (const r of validReports) {
      if (r?.measurements) {
        for (const m of r.measurements) {
          biomarkerSet.add(m.name);
        }
      }
    }
    return {
      availableBiomarkers: Array.from(biomarkerSet).sort(),
    };
  }

  const normalizedTarget = biomarkerName.trim().toLowerCase();
  const points: TimelinePoint[] = [];
  let unit = '';
  let referenceRange = '';
  let category: any = 'Other';
  let refLow: number | undefined;
  let refHigh: number | undefined;

  for (const rep of validReports) {
    if (!rep) continue;
    const match = rep.measurements.find(
      (m) => m.name.trim().toLowerCase() === normalizedTarget
    );
    if (match) {
      unit = match.unit;
      referenceRange = match.referenceRange;
      category = match.category;
      refLow = match.refLow;
      refHigh = match.refHigh;

      points.push({
        date: rep.reportDate,
        value: match.value,
        reportId: rep.id,
        reportDate: rep.reportDate,
        status: match.status,
        refLow: match.refLow,
        refHigh: match.refHigh,
        unit: match.unit,
      });
    }
  }

  // Sort chronological (oldest to newest)
  points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    biomarker: biomarkerName,
    unit,
    category,
    referenceRange,
    refLow,
    refHigh,
    dataPoints: points,
  };
}
