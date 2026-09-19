import {
  AskReportsResponse,
  BiomarkerTimeline,
  ComparisonResult,
  ReportDetail,
  ReportMetadata,
  SystemStatus,
} from '../types/health.js';

const API_BASE = '/api';

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
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  const res = await fetch(`${API_BASE}/reports/upload`, {
    method: 'POST',
    body: formData,
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
