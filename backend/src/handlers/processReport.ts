import { v4 as uuidv4 } from 'uuid';
import { s3Service } from '../services/s3Service.js';
import { dynamoService } from '../services/dynamoService.js';
import { bedrockService } from '../services/bedrockService.js';
import { extractTextFromPdf } from '../utils/pdfParser.js';
import { Measurement, ReportDetail, ReportMetadata } from '../models/types.js';

export async function processReport(
  reportId: string,
  userId: string,
  s3Key: string,
  fileName: string,
  fileSize: number
): Promise<ReportDetail> {
  console.log(`[processReport] Processing report: ${reportId} (${fileName})`);

  // 1. Fetch file buffer from S3 / Local storage
  const fileBuffer = await s3Service.getReportFile(s3Key);

  // 2. Extract text from PDF
  const rawText = await extractTextFromPdf(fileBuffer);

  // 3. Extract structured measurements using Amazon Bedrock / heuristic AI
  const extracted = await bedrockService.extractReportData(rawText, fileName);

  // 4. Create measurements array
  const measurements: Measurement[] = extracted.measurements.map((m) => ({
    id: uuidv4(),
    reportId,
    userId,
    name: m.name,
    value: m.value,
    unit: m.unit,
    referenceRange: m.referenceRange,
    refLow: m.refLow,
    refHigh: m.refHigh,
    status: m.status,
    category: m.category,
    notes: m.notes,
  }));

  // 5. Create Report Metadata
  const reportMetadata: ReportMetadata = {
    id: reportId,
    userId,
    fileName,
    fileSize,
    reportDate: extracted.reportDate,
    reportType: extracted.reportType,
    patientName: extracted.patientName,
    patientAge: extracted.patientAge,
    patientGender: extracted.patientGender,
    labName: extracted.labName,
    s3Key,
    uploadedAt: new Date().toISOString(),
    status: 'processed',
    measurementCount: measurements.length,
    summary: `Contains ${measurements.length} tracked biomarkers including Vitamin D, Hemoglobin, and Lipids.`,
  };

  // 6. Save to DynamoDB
  await dynamoService.saveReport(reportMetadata);
  await dynamoService.saveMeasurements(measurements);

  console.log(`[processReport] Successfully saved report ${reportId} with ${measurements.length} measurements.`);

  return {
    ...reportMetadata,
    measurements,
    rawExtractedText: rawText.substring(0, 1000),
  };
}
