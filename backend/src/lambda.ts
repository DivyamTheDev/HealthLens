import { handleGetReports } from './handlers/getReports.js';
import { handleGetReport } from './handlers/getReport.js';
import { handleCompareReports } from './handlers/compareReports.js';
import { handleGenerateSummary } from './handlers/generateSummary.js';
import { handleGetTimeline } from './handlers/getTimeline.js';
import { handleAskReports } from './handlers/askReports.js';
import { handleUploadReport } from './handlers/uploadReport.js';
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
    const body = event.body ? JSON.parse(event.body) : {};

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
      const fileBuffer = Buffer.from(body.fileBase64, 'base64');
      const report = await handleUploadReport(
        fileBuffer,
        body.fileName || 'report.pdf',
        body.contentType || 'application/pdf',
        body.userId || 'demo-user-123'
      );
      return successResponse(report, 201);
    }

    return errorResponse(`Route not found: ${method} ${path}`, 404);
  } catch (err: any) {
    console.error('[LambdaHandler] Uncaught Error:', err);
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
