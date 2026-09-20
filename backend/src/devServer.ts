import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { handleUploadReport } from './handlers/uploadReport.js';
import { handleGetReports } from './handlers/getReports.js';
import { handleGetReport } from './handlers/getReport.js';
import { handleCompareReports } from './handlers/compareReports.js';
import { handleGenerateSummary } from './handlers/generateSummary.js';
import { handleGetTimeline } from './handlers/getTimeline.js';
import { handleAskReports } from './handlers/askReports.js';
import { seedDemoData } from './handlers/seedDemoData.js';
import { s3Service } from './services/s3Service.js';
import { dynamoService } from './services/dynamoService.js';
import { bedrockService } from './services/bedrockService.js';

const app = express();
const port = parseInt(process.env.PORT || '5001', 10);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// System Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    mode: {
      s3: s3Service.isLive() ? 'AWS Live' : 'Local Storage',
      dynamodb: dynamoService.isLive() ? 'AWS Live' : 'Local JSON Store',
      bedrock: bedrockService.isLive() ? 'AWS Live' : 'Local Heuristic AI',
      activeAwsMode: s3Service.isLive() && dynamoService.isLive() && bedrockService.isLive() ? 'Live AWS' : 'Simulation Mode',
    },
    awsConfig: {
      region: process.env.AWS_REGION || 'us-east-1',
      hasAccessKey: Boolean(process.env.AWS_ACCESS_KEY_ID),
      bedrockModel: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
      s3Bucket: process.env.S3_BUCKET_NAME || 'healthlens-reports-bucket',
    },
  });
});

// Upload Report (supports both JSON Base64 for Lambda parity and multipart/form-data)
app.post('/api/reports/upload', upload.single('file'), async (req, res) => {
  try {
    let fileBuffer: Buffer;
    let fileName = 'report.pdf';
    let contentType = 'application/pdf';
    let userId = (req.body?.userId as string) || 'demo-user-123';

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
      contentType = req.file.mimetype;
    } else if (req.body && req.body.fileBase64) {
      fileBuffer = Buffer.from(req.body.fileBase64, 'base64');
      fileName = req.body.fileName || fileName;
      contentType = req.body.contentType || contentType;
    } else {
      return res.status(400).json({ error: 'No file uploaded (expected file form-data or fileBase64 JSON)' });
    }

    const report = await handleUploadReport(
      fileBuffer,
      fileName,
      contentType,
      userId
    );

    res.status(201).json(report);
  } catch (err: any) {
    console.error('Error in upload report:', err);
    res.status(500).json({ error: err.message || 'Failed to upload report' });
  }
});

// Get All Reports
app.get('/api/reports', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'demo-user-123';
    const reports = await handleGetReports(userId);
    res.json(reports);
  } catch (err: any) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch reports' });
  }
});

// Get Specific Report
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await handleGetReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err: any) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch report' });
  }
});

// Compare Reports
app.post('/api/reports/compare', async (req, res) => {
  try {
    const { prevReportId, currReportId, includeAiSummary } = req.body;
    if (!prevReportId || !currReportId) {
      return res.status(400).json({ error: 'prevReportId and currReportId are required' });
    }

    const comparison = await handleCompareReports(
      prevReportId,
      currReportId,
      includeAiSummary !== false
    );
    res.json(comparison);
  } catch (err: any) {
    console.error('Error comparing reports:', err);
    res.status(500).json({ error: err.message || 'Failed to compare reports' });
  }
});

// Generate / Regenerate AI Summary
app.post('/api/reports/summary', async (req, res) => {
  try {
    const { prevReportId, currReportId } = req.body;
    if (!prevReportId || !currReportId) {
      return res.status(400).json({ error: 'prevReportId and currReportId are required' });
    }

    const result = await handleGenerateSummary(prevReportId, currReportId);
    res.json(result);
  } catch (err: any) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: err.message || 'Failed to generate summary' });
  }
});

// Timeline View
app.get('/api/timeline', async (req, res) => {
  try {
    const biomarker = req.query.biomarker as string | undefined;
    const userId = (req.query.userId as string) || 'demo-user-123';
    const result = await handleGetTimeline(biomarker, userId);
    res.json(result);
  } catch (err: any) {
    console.error('Error fetching timeline:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch timeline' });
  }
});

// Ask My Reports (RAG Q&A)
app.post('/api/ask', async (req, res) => {
  try {
    const { question, userId } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await handleAskReports(question, userId || 'demo-user-123');
    res.json(answer);
  } catch (err: any) {
    console.error('Error answering question:', err);
    res.status(500).json({ error: err.message || 'Failed to answer question' });
  }
});

// Seed Demo Data
app.post('/api/demo/seed', async (req, res) => {
  try {
    const userId = (req.body.userId as string) || 'demo-user-123';
    const result = await seedDemoData(userId);
    res.json(result);
  } catch (err: any) {
    console.error('Error seeding demo data:', err);
    res.status(500).json({ error: err.message || 'Failed to seed demo data' });
  }
});

// Local file download helper
app.get('/api/files/download', async (req, res) => {
  try {
    const key = req.query.key as string;
    if (!key) return res.status(400).send('Missing key');
    const buffer = await s3Service.getReportFile(key);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${key.split('/').pop() || 'report.pdf'}"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(404).send(err.message || 'File not found');
  }
});

// Auto-seed if empty on start
(async () => {
  try {
    const existing = await dynamoService.getReports('demo-user-123');
    if (existing.length === 0) {
      console.log('[DevServer] No reports found, auto-seeding initial demo data...');
      await seedDemoData('demo-user-123');
    }
  } catch (err) {
    console.warn('[DevServer] Auto-seeding check failed:', err);
  }
})();

app.listen(port, () => {
  console.log(`\n======================================================`);
  console.log(`  HealthLens Backend Service running on port ${port}`);
  console.log(`  API Base: http://localhost:${port}/api`);
  console.log(`  Status Check: http://localhost:${port}/api/status`);
  console.log(`======================================================\n`);
});
