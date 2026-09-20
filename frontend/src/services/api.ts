import {
  AskReportsResponse,
  BiomarkerTimeline,
  ComparisonResult,
  ReportDetail,
  ReportMetadata,
  SystemStatus,
} from '../types/health.js';

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE = getApiBase();

export async function fetchStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchReports(userId = 'demo-user-123'): Promise<ReportMetadata[]> {
  const res = await fetch(`${API_BASE}/reports?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchReport(reportId: string): Promise<ReportDetail> {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}`);
  if (!res.ok) throw new Error(`Failed to fetch report with id ${reportId}`);
  return res.json();
}

export async function uploadReport(file: File, userId = 'demo-user-123'): Promise<ReportDetail> {
  // Convert file to Base64 to ensure 100% compatibility across both AWS Lambda/SAM and local development
  const toBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => {
        const res = reader.result as string;
        const base64 = res.includes(',') ? res.split(',')[1] : res;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
    });

  const fileBase64 = await toBase64(file);

  const res = await fetch(`${API_BASE}/reports/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileBase64,
      fileName: file.name,
      contentType: file.type || 'application/pdf',
      userId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload report');
  }

  return res.json();
}

export async function compareReports(
  prevReportId: string,
  currReportId: string,
  includeAiSummary = true
): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE}/reports/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prevReportId, currReportId, includeAiSummary }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to compare reports');
  }

  return res.json();
}

export async function generateSummary(
  prevReportId: string,
  currReportId: string
): Promise<{ aiSummary: string }> {
  const res = await fetch(`${API_BASE}/reports/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prevReportId, currReportId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate summary');
  }

  return res.json();
}

export async function fetchTimeline(
  biomarker?: string,
  userId = 'demo-user-123'
): Promise<BiomarkerTimeline | { availableBiomarkers: string[] }> {
  const url = biomarker
    ? `${API_BASE}/timeline?biomarker=${encodeURIComponent(biomarker)}&userId=${encodeURIComponent(userId)}`
    : `${API_BASE}/timeline?userId=${encodeURIComponent(userId)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function askReports(question: string, userId = 'demo-user-123'): Promise<AskReportsResponse> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to answer question');
  }

  return res.json();
}

export async function seedDemoData(userId = 'demo-user-123'): Promise<{ success: boolean; count: number }> {
  const res = await fetch(`${API_BASE}/demo/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) throw new Error('Failed to seed demo data');
  return res.json();
}
