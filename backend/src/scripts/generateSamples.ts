import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface LabReportSpec {
  fileName: string;
  reportDate: string;
  collectionTime: string;
  reportId: string;
  results: Array<{
    name: string;
    result: string;
    unit: string;
    refRange: string;
    flag: string;
  }>;
}

const sampleReports: LabReportSpec[] = [
  {
    fileName: 'january_2026_blood_test.pdf',
    reportDate: '2026-01-15',
    collectionTime: '08:15 AM',
    reportId: 'HL-2026-0115-084',
    results: [
      { name: 'Hemoglobin', result: '13.2', unit: 'g/dL', refRange: '13.0 - 17.0', flag: 'NORMAL' },
      { name: 'Vitamin D (25-OH)', result: '18.0', unit: 'ng/mL', refRange: '30.0 - 100.0', flag: 'LOW' },
      { name: 'HbA1c', result: '5.4', unit: '%', refRange: '4.0 - 5.6', flag: 'NORMAL' },
      { name: 'Total Cholesterol', result: '190.0', unit: 'mg/dL', refRange: '< 200.0', flag: 'NORMAL' },
      { name: 'Fasting Blood Glucose', result: '92.0', unit: 'mg/dL', refRange: '70.0 - 99.0', flag: 'NORMAL' },
      { name: 'LDL Cholesterol', result: '110.0', unit: 'mg/dL', refRange: '< 100.0', flag: 'HIGH' },
      { name: 'HDL Cholesterol', result: '48.0', unit: 'mg/dL', refRange: '> 40.0', flag: 'NORMAL' },
      { name: 'White Blood Cell Count', result: '6.4', unit: 'x10^3/uL', refRange: '4.5 - 11.0', flag: 'NORMAL' },
      { name: 'Platelets', result: '245.0', unit: 'x10^3/uL', refRange: '150.0 - 450.0', flag: 'NORMAL' },
      { name: 'Serum Creatinine', result: '0.95', unit: 'mg/dL', refRange: '0.7 - 1.3', flag: 'NORMAL' },
    ],
  },
  {
    fileName: 'june_2026_blood_test.pdf',
    reportDate: '2026-06-10',
    collectionTime: '08:45 AM',
    reportId: 'HL-2026-0610-142',
    results: [
      { name: 'Hemoglobin', result: '13.6', unit: 'g/dL', refRange: '13.0 - 17.0', flag: 'NORMAL' },
      { name: 'Vitamin D (25-OH)', result: '22.0', unit: 'ng/mL', refRange: '30.0 - 100.0', flag: 'LOW' },
      { name: 'HbA1c', result: '5.5', unit: '%', refRange: '4.0 - 5.6', flag: 'NORMAL' },
      { name: 'Total Cholesterol', result: '198.0', unit: 'mg/dL', refRange: '< 200.0', flag: 'NORMAL' },
      { name: 'Fasting Blood Glucose', result: '95.0', unit: 'mg/dL', refRange: '70.0 - 99.0', flag: 'NORMAL' },
      { name: 'LDL Cholesterol', result: '116.0', unit: 'mg/dL', refRange: '< 100.0', flag: 'HIGH' },
      { name: 'HDL Cholesterol', result: '49.0', unit: 'mg/dL', refRange: '> 40.0', flag: 'NORMAL' },
      { name: 'White Blood Cell Count', result: '6.8', unit: 'x10^3/uL', refRange: '4.5 - 11.0', flag: 'NORMAL' },
      { name: 'Platelets', result: '250.0', unit: 'x10^3/uL', refRange: '150.0 - 450.0', flag: 'NORMAL' },
      { name: 'Serum Creatinine', result: '0.98', unit: 'mg/dL', refRange: '0.7 - 1.3', flag: 'NORMAL' },
    ],
  },
  {
    fileName: 'september_2026_blood_test.pdf',
    reportDate: '2026-09-18',
    collectionTime: '08:30 AM',
    reportId: 'HL-2026-0918-295',
    results: [
      { name: 'Hemoglobin', result: '14.0', unit: 'g/dL', refRange: '13.0 - 17.0', flag: 'NORMAL' },
      { name: 'Vitamin D (25-OH)', result: '27.0', unit: 'ng/mL', refRange: '30.0 - 100.0', flag: 'LOW' },
      { name: 'HbA1c', result: '5.6', unit: '%', refRange: '4.0 - 5.6', flag: 'NORMAL' },
      { name: 'Total Cholesterol', result: '205.0', unit: 'mg/dL', refRange: '< 200.0', flag: 'HIGH' },
      { name: 'Fasting Blood Glucose', result: '98.0', unit: 'mg/dL', refRange: '70.0 - 99.0', flag: 'NORMAL' },
      { name: 'LDL Cholesterol', result: '122.0', unit: 'mg/dL', refRange: '< 100.0', flag: 'HIGH' },
      { name: 'HDL Cholesterol', result: '50.0', unit: 'mg/dL', refRange: '> 40.0', flag: 'NORMAL' },
      { name: 'White Blood Cell Count', result: '7.1', unit: 'x10^3/uL', refRange: '4.5 - 11.0', flag: 'NORMAL' },
      { name: 'Platelets', result: '255.0', unit: 'x10^3/uL', refRange: '150.0 - 450.0', flag: 'NORMAL' },
      { name: 'Serum Creatinine', result: '1.02', unit: 'mg/dL', refRange: '0.7 - 1.3', flag: 'NORMAL' },
    ],
  },
];

async function generatePdf(spec: LabReportSpec) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const primaryTeal = rgb(0.05, 0.58, 0.53);
  const darkSlate = rgb(0.12, 0.16, 0.22);
  const mutedGray = rgb(0.4, 0.45, 0.5);
  const lightBg = rgb(0.96, 0.98, 0.98);
  const flagRed = rgb(0.85, 0.2, 0.2);
  const flagBlue = rgb(0.15, 0.4, 0.8);
  const flagGreen = rgb(0.1, 0.6, 0.3);

  // Header Banner
  page.drawRectangle({
    x: 36,
    y: 720,
    width: 540,
    height: 48,
    color: primaryTeal,
  });

  page.drawText('HEALTHLENS DIAGNOSTIC LABORATORIES', {
    x: 48,
    y: 742,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('CLIA ID: 99D0876543 | CAP Accredited | Direct Clinical Reporting', {
    x: 48,
    y: 728,
    size: 8,
    font: fontRegular,
    color: rgb(0.9, 0.95, 0.95),
  });

  // Patient Info Box
  page.drawRectangle({
    x: 36,
    y: 630,
    width: 540,
    height: 75,
    color: lightBg,
    borderColor: rgb(0.85, 0.9, 0.9),
    borderWidth: 1,
  });

  // Left column
  page.drawText('PATIENT NAME:', { x: 48, y: 686, size: 8, font: fontBold, color: mutedGray });
  page.drawText('Alex Taylor', { x: 120, y: 686, size: 9, font: fontBold, color: darkSlate });

  page.drawText('DOB / AGE:', { x: 48, y: 668, size: 8, font: fontBold, color: mutedGray });
  page.drawText('1988-04-12 (38 Yrs) / Male', { x: 120, y: 668, size: 9, font: fontRegular, color: darkSlate });

  page.drawText('PATIENT ID:', { x: 48, y: 650, size: 8, font: fontBold, color: mutedGray });
  page.drawText('PT-948210', { x: 120, y: 650, size: 9, font: fontRegular, color: darkSlate });

  // Right column
  page.drawText('COLLECTION DATE:', { x: 340, y: 686, size: 8, font: fontBold, color: mutedGray });
  page.drawText(`${spec.reportDate} @ ${spec.collectionTime}`, { x: 430, y: 686, size: 9, font: fontBold, color: darkSlate });

  page.drawText('REPORT ID:', { x: 340, y: 668, size: 8, font: fontBold, color: mutedGray });
  page.drawText(spec.reportId, { x: 430, y: 668, size: 9, font: fontRegular, color: darkSlate });

  page.drawText('ORDERING MD:', { x: 340, y: 650, size: 8, font: fontBold, color: mutedGray });
  page.drawText('Dr. Sarah Chen, MD', { x: 430, y: 650, size: 9, font: fontRegular, color: darkSlate });

  // Table Header
  const tableTop = 595;
  page.drawRectangle({
    x: 36,
    y: tableTop,
    width: 540,
    height: 22,
    color: rgb(0.9, 0.93, 0.95),
  });

  page.drawText('TEST NAME', { x: 46, y: tableTop + 6, size: 8, font: fontBold, color: darkSlate });
  page.drawText('RESULT', { x: 230, y: tableTop + 6, size: 8, font: fontBold, color: darkSlate });
  page.drawText('FLAG', { x: 290, y: tableTop + 6, size: 8, font: fontBold, color: darkSlate });
  page.drawText('UNITS', { x: 350, y: tableTop + 6, size: 8, font: fontBold, color: darkSlate });
  page.drawText('REFERENCE INTERVAL', { x: 420, y: tableTop + 6, size: 8, font: fontBold, color: darkSlate });

  // Rows
  let rowY = tableTop - 24;
  for (let i = 0; i < spec.results.length; i++) {
    const item = spec.results[i];
    
    if (i % 2 === 1) {
      page.drawRectangle({
        x: 36,
        y: rowY - 6,
        width: 540,
        height: 24,
        color: rgb(0.98, 0.99, 0.99),
      });
    }

    page.drawText(item.name, { x: 46, y: rowY + 2, size: 9, font: fontBold, color: darkSlate });
    page.drawText(item.result, { x: 230, y: rowY + 2, size: 9, font: fontBold, color: darkSlate });

    let flagColor = flagGreen;
    if (item.flag === 'HIGH') flagColor = flagRed;
    else if (item.flag === 'LOW') flagColor = flagBlue;

    page.drawText(item.flag, { x: 290, y: rowY + 2, size: 8, font: fontBold, color: flagColor });
    page.drawText(item.unit, { x: 350, y: rowY + 2, size: 8, font: fontRegular, color: mutedGray });
    page.drawText(item.refRange, { x: 420, y: rowY + 2, size: 8, font: fontRegular, color: mutedGray });

    page.drawLine({
      start: { x: 36, y: rowY - 6 },
      end: { x: 576, y: rowY - 6 },
      thickness: 0.5,
      color: rgb(0.9, 0.92, 0.94),
    });

    rowY -= 26;
  }

  // Clinical Notes Box
  page.drawRectangle({
    x: 36,
    y: 130,
    width: 540,
    height: 90,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.88, 0.9, 0.92),
    borderWidth: 1,
  });

  page.drawText('LABORATORY DIRECTOR CLINICAL COMMENTS', {
    x: 48,
    y: 202,
    size: 8,
    font: fontBold,
    color: primaryTeal,
  });

  page.drawText(
    '1. Vitamin D (25-Hydroxy): Values < 20 ng/mL indicate deficiency; 20-29 ng/mL indicate insufficiency.',
    { x: 48, y: 186, size: 8, font: fontRegular, color: darkSlate }
  );
  page.drawText(
    '2. Lipid Panel: Fasting state confirmed (12 hours). Total cholesterol > 200 mg/dL may suggest borderline risk.',
    { x: 48, y: 172, size: 8, font: fontRegular, color: darkSlate }
  );
  page.drawText(
    '3. Specimen verified and tested in accordance with CLIA standards. Electronic signature authorized by Dr. E. Vance, MD, PhD.',
    { x: 48, y: 158, size: 8, font: fontRegular, color: mutedGray }
  );

  page.drawText(
    'HealthLens Laboratory System - Automated Electronic Transmission - Confidential Health Record',
    { x: 120, y: 40, size: 7, font: fontRegular, color: mutedGray }
  );

  const pdfBytes = await pdfDoc.save();
  const sampleDir = path.resolve(process.cwd(), '..', 'sample-data');
  if (!fs.existsSync(sampleDir)) {
    fs.mkdirSync(sampleDir, { recursive: true });
  }
  const outPath = path.join(sampleDir, spec.fileName);
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`[generateSamples] Created PDF: ${outPath} (${pdfBytes.length} bytes)`);
}

async function main() {
  console.log('Generating realistic synthetic medical report PDFs...');
  for (const spec of sampleReports) {
    await generatePdf(spec);
  }
  console.log('All synthetic lab reports generated successfully!');
}

main().catch(console.error);
