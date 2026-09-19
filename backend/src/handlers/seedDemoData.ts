import { v4 as uuidv4 } from 'uuid';
import { dynamoService } from '../services/dynamoService.js';
import { Measurement, ReportMetadata } from '../models/types.js';

export async function seedDemoData(userId = 'demo-user-123') {
  console.log(`[seedDemoData] Seeding demo medical records for user: ${userId}`);

  // Clear existing demo data if any
  await dynamoService.clearAll();

  const reportConfigs = [
    {
      id: 'report-jan-2026',
      date: '2026-01-15',
      fileName: 'january_2026_blood_test.pdf',
      type: 'Comprehensive Metabolic & Hematology Panel',
      measurements: [
        { name: 'Hemoglobin', value: 13.2, unit: 'g/dL', referenceRange: '13.0 - 17.0', refLow: 13.0, refHigh: 17.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Vitamin D (25-OH)', value: 18.0, unit: 'ng/mL', referenceRange: '30.0 - 100.0', refLow: 30.0, refHigh: 100.0, status: 'low' as const, category: 'Vitamins & Minerals' as const },
        { name: 'HbA1c', value: 5.4, unit: '%', referenceRange: '4.0 - 5.6', refLow: 4.0, refHigh: 5.6, status: 'normal' as const, category: 'Metabolic Panel' as const },
        { name: 'Total Cholesterol', value: 190.0, unit: 'mg/dL', referenceRange: '< 200.0', refLow: 125.0, refHigh: 200.0, status: 'normal' as const, category: 'Lipid Panel' as const },
        { name: 'Fasting Blood Glucose', value: 92.0, unit: 'mg/dL', referenceRange: '70.0 - 99.0', refLow: 70.0, refHigh: 99.0, status: 'normal' as const, category: 'Metabolic Panel' as const },
        { name: 'LDL Cholesterol', value: 110.0, unit: 'mg/dL', referenceRange: '< 100.0', refLow: 50.0, refHigh: 100.0, status: 'high' as const, category: 'Lipid Panel' as const },
        { name: 'HDL Cholesterol', value: 48.0, unit: 'mg/dL', referenceRange: '> 40.0', refLow: 40.0, refHigh: 80.0, status: 'normal' as const, category: 'Lipid Panel' as const },
        { name: 'White Blood Cell Count', value: 6.4, unit: 'x10^3/uL', referenceRange: '4.5 - 11.0', refLow: 4.5, refHigh: 11.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Platelets', value: 245.0, unit: 'x10^3/uL', referenceRange: '150.0 - 450.0', refLow: 150.0, refHigh: 450.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', referenceRange: '0.7 - 1.3', refLow: 0.7, refHigh: 1.3, status: 'normal' as const, category: 'Metabolic Panel' as const },
      ],
    },
    {
      id: 'report-jun-2026',
      date: '2026-06-10',
      fileName: 'june_2026_blood_test.pdf',
      type: 'Comprehensive Metabolic & Hematology Panel',
      measurements: [
        { name: 'Hemoglobin', value: 13.6, unit: 'g/dL', referenceRange: '13.0 - 17.0', refLow: 13.0, refHigh: 17.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Vitamin D (25-OH)', value: 22.0, unit: 'ng/mL', referenceRange: '30.0 - 100.0', refLow: 30.0, refHigh: 100.0, status: 'low' as const, category: 'Vitamins & Minerals' as const },
        { name: 'HbA1c', value: 5.5, unit: '%', referenceRange: '4.0 - 5.6', refLow: 4.0, refHigh: 5.6, status: 'normal' as const, category: 'Metabolic Panel' as const },
        { name: 'Total Cholesterol', value: 198.0, unit: 'mg/dL', referenceRange: '< 200.0', refLow: 125.0, refHigh: 200.0, status: 'normal' as const, category: 'Lipid Panel' as const },
        { name: 'Fasting Blood Glucose', value: 95.0, unit: 'mg/dL', referenceRange: '70.0 - 99.0', refLow: 70.0, refHigh: 99.0, status: 'normal' as const, category: 'Metabolic Panel' as const },
        { name: 'LDL Cholesterol', value: 116.0, unit: 'mg/dL', referenceRange: '< 100.0', refLow: 50.0, refHigh: 100.0, status: 'high' as const, category: 'Lipid Panel' as const },
        { name: 'HDL Cholesterol', value: 49.0, unit: 'mg/dL', referenceRange: '> 40.0', refLow: 40.0, refHigh: 80.0, status: 'normal' as const, category: 'Lipid Panel' as const },
        { name: 'White Blood Cell Count', value: 6.8, unit: 'x10^3/uL', referenceRange: '4.5 - 11.0', refLow: 4.5, refHigh: 11.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Platelets', value: 250.0, unit: 'x10^3/uL', referenceRange: '150.0 - 450.0', refLow: 150.0, refHigh: 450.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Serum Creatinine', value: 0.98, unit: 'mg/dL', referenceRange: '0.7 - 1.3', refLow: 0.7, refHigh: 1.3, status: 'normal' as const, category: 'Metabolic Panel' as const },
      ],
    },
    {
      id: 'report-sep-2026',
      date: '2026-09-18',
      fileName: 'september_2026_blood_test.pdf',
      type: 'Comprehensive Metabolic & Hematology Panel',
      measurements: [
        { name: 'Hemoglobin', value: 14.0, unit: 'g/dL', referenceRange: '13.0 - 17.0', refLow: 13.0, refHigh: 17.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Vitamin D (25-OH)', value: 27.0, unit: 'ng/mL', referenceRange: '30.0 - 100.0', refLow: 30.0, refHigh: 100.0, status: 'low' as const, category: 'Vitamins & Minerals' as const },
        { name: 'HbA1c', value: 5.6, unit: '%', referenceRange: '4.0 - 5.6', refLow: 4.0, refHigh: 5.6, status: 'normal' as const, category: 'Metabolic Panel' as const },
        { name: 'Total Cholesterol', value: 205.0, unit: 'mg/dL', referenceRange: '< 200.0', refLow: 125.0, refHigh: 200.0, status: 'high' as const, category: 'Lipid Panel' as const },
        { name: 'Fasting Blood Glucose', value: 98.0, unit: 'mg/dL', referenceRange: '70.0 - 99.0', refLow: 70.0, refHigh: 99.0, status: 'normal' as const, category: 'Metabolic Panel' as const },
        { name: 'LDL Cholesterol', value: 122.0, unit: 'mg/dL', referenceRange: '< 100.0', refLow: 50.0, refHigh: 100.0, status: 'high' as const, category: 'Lipid Panel' as const },
        { name: 'HDL Cholesterol', value: 50.0, unit: 'mg/dL', referenceRange: '> 40.0', refLow: 40.0, refHigh: 80.0, status: 'normal' as const, category: 'Lipid Panel' as const },
        { name: 'White Blood Cell Count', value: 7.1, unit: 'x10^3/uL', referenceRange: '4.5 - 11.0', refLow: 4.5, refHigh: 11.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Platelets', value: 255.0, unit: 'x10^3/uL', referenceRange: '150.0 - 450.0', refLow: 150.0, refHigh: 450.0, status: 'normal' as const, category: 'Complete Blood Count' as const },
        { name: 'Serum Creatinine', value: 1.02, unit: 'mg/dL', referenceRange: '0.7 - 1.3', refLow: 0.7, refHigh: 1.3, status: 'normal' as const, category: 'Metabolic Panel' as const },
      ],
    },
  ];

  for (const rep of reportConfigs) {
    const reportMetadata: ReportMetadata = {
      id: rep.id,
      userId,
      fileName: rep.fileName,
      fileSize: 42500,
      reportDate: rep.date,
      reportType: rep.type,
      patientName: 'Alex Taylor',
      patientAge: 38,
      patientGender: 'Male',
      labName: 'HealthLens Diagnostic Laboratories',
      s3Key: `reports/${userId}/${rep.id}/${rep.fileName}`,
      uploadedAt: new Date(rep.date).toISOString(),
      status: 'processed',
      measurementCount: rep.measurements.length,
      summary: `Standard routine blood panel with ${rep.measurements.length} tracked biomarkers.`,
    };

    const measurements: Measurement[] = rep.measurements.map((m) => ({
      id: uuidv4(),
      reportId: rep.id,
      userId,
      name: m.name,
      value: m.value,
      unit: m.unit,
      referenceRange: m.referenceRange,
      refLow: m.refLow,
      refHigh: m.refHigh,
      status: m.status,
      category: m.category,
    }));

    await dynamoService.saveReport(reportMetadata);
    await dynamoService.saveMeasurements(measurements);
  }

  console.log(`[seedDemoData] Seeding complete with 3 chronological reports.`);
  return { success: true, count: 3 };
}
