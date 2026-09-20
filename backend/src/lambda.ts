import { handleGetReports } from './handlers/getReports.js';
import { handleGetReport } from './handlers/getReport.js';
import { handleCompareReports } from './handlers/compareReports.js';
import { handleGenerateSummary } from './handlers/generateSummary.js';
import { handleGetTimeline } from './handlers/getTimeline.js';
import { handleAskReports } from './handlers/askReports.js';
import { handleUploadReport } from './handlers/uploadReport.js';
import { seedDemoData } from './handlers/seedDemoData.js';
import { successResponse, errorResponse } from './utils/response.js';

export interface LambdaEvent {
  httpMethod: string;
  path: string;
  resource?: string;
  queryStringParameters?: Record<string, string> | null;
  pathParameters?: Record<string, string> | null;
  body?: string | null;
  isBase64Encoded?: boolean;
}

export const handler = async (event: LambdaEvent) => {
  console.log(`[LambdaHandler] ${event.httpMethod} ${event.path}`);

  if (event.httpMethod === 'OPTIONS') {
    return successResponse({ message: 'OK' });
  }

  try {
    const path = event.path;
    const method = event.httpMethod;
    const query = event.queryStringParameters || {};
    let body: any = {};
    if (event.body) {
      try {
        const decodedBody = event.isBase64Encoded
          ? Buffer.from(event.body, 'base64').toString('utf-8')
          : event.body;
        body = JSON.parse(decodedBody);
      } catch {
        body = {};
      }
    }

    // 0. GET /api/status or /api
    if (method === 'GET' && (path === '/api/status' || path === '/api' || path === '/')) {
      return successResponse({
        status: 'online',
        timestamp: new Date().toISOString(),
        mode: {
          s3: 'AWS Live',
          dynamodb: 'AWS Live',
          bedrock: 'AWS Live',
          activeAwsMode: 'Live AWS',
        },
        awsConfig: {
          region: process.env.AWS_REGION || 'ap-south-1',
          hasAccessKey: true,
          bedrockModel: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
          s3Bucket: process.env.S3_BUCKET_NAME || 'healthlens-reports-bucket',
        },
      });
    }

    // 1. GET /api/reports
    if (method === 'GET' && path === '/api/reports') {
      const reports = await handleGetReports(query.userId || 'demo-user-123');
      return successResponse(reports);
    }

    // 2. GET /api/reports/{id}
    if (method === 'GET' && path.startsWith('/api/reports/')) {
      const id = path.split('/').pop() || query.id;
      if (!id) return errorResponse('Missing report ID', 400);
      const report = await handleGetReport(id);
      if (!report) return errorResponse('Report not found', 404);
      return successResponse(report);
    }

    // 3. POST /api/reports/compare
    if (method === 'POST' && path === '/api/reports/compare') {
      const { prevReportId, currReportId, includeAiSummary } = body;
      const comparison = await handleCompareReports(
        prevReportId,
        currReportId,
        includeAiSummary !== false
      );
      return successResponse(comparison);
    }

    // 4. POST /api/reports/summary
    if (method === 'POST' && path === '/api/reports/summary') {
      const { prevReportId, currReportId } = body;
      const result = await handleGenerateSummary(prevReportId, currReportId);
      return successResponse(result);
    }

    // 5. GET /api/timeline
    if (method === 'GET' && path === '/api/timeline') {
      const result = await handleGetTimeline(query.biomarker, query.userId || 'demo-user-123');
      return successResponse(result);
    }

    // 6. POST /api/ask
    if (method === 'POST' && path === '/api/ask') {
      const answer = await handleAskReports(body.question, body.userId || 'demo-user-123');
      return successResponse(answer);
    }

    // 7. POST /api/reports/upload (base64 payload)
    if (method === 'POST' && path === '/api/reports/upload') {
      let fileBuffer: Buffer | null = null;
      const fileName = body.fileName || 'report.pdf';
      const contentType = body.contentType || 'application/pdf';
      const userId = body.userId || 'demo-user-123';

      if (body.fileBase64) {
        fileBuffer = Buffer.from(body.fileBase64, 'base64');
      } else if (event.isBase64Encoded && event.body) {
        fileBuffer = Buffer.from(event.body, 'base64');
      }

      if (!fileBuffer) {
        return errorResponse('Missing fileBase64 in request body', 400);
      }

      const report = await handleUploadReport(
        fileBuffer,
        fileName,
        contentType,
        userId
      );
      return successResponse(report, 201);
    }

    // 8. POST /api/demo/seed
    if (method === 'POST' && path === '/api/demo/seed') {
      const result = await seedDemoData(body.userId || 'demo-user-123');
      return successResponse(result);
    }

    return errorResponse(`Route not found: ${method} ${path}`, 404);
  } catch (err: any) {
    console.error('[LambdaHandler] Uncaught Error:', err);
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
