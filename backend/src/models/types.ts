export type BiomarkerStatus = 'normal' | 'low' | 'high' | 'critical';
export type BiomarkerCategory =
  | 'Vitamins & Minerals'
  | 'Metabolic Panel'
  | 'Lipid Panel'
  | 'Complete Blood Count'
  | 'Thyroid & Endocrine'
  | 'Other';

export interface Measurement {
  id: string;
  reportId: string;
  userId: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  refLow?: number;
  refHigh?: number;
  status: BiomarkerStatus;
  category: BiomarkerCategory;
  notes?: string;
}

export interface ReportMetadata {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  reportDate: string; // YYYY-MM-DD
  reportType: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  labName: string;
  s3Key: string;
  uploadedAt: string;
  status: 'processing' | 'processed' | 'error';
  measurementCount: number;
  summary?: string;
}

export interface ReportDetail extends ReportMetadata {
  measurements: Measurement[];
  rawExtractedText?: string;
}

export type TrendDirection = 'increased' | 'decreased' | 'unchanged' | 'new' | 'missing';

export interface ComparisonItem {
  biomarker: string;
  unit: string;
  category: BiomarkerCategory;
  referenceRange: string;
  prevValue: number | null;
  currValue: number | null;
  change: number | null;
  percentChange: number | null;
  direction: TrendDirection;
  prevStatus?: BiomarkerStatus;
  currStatus?: BiomarkerStatus;
}

export interface ComparisonResult {
  prevReport: ReportMetadata;
  currReport: ReportMetadata;
  items: ComparisonItem[];
  aiSummary?: string;
  keyHighlights?: string[];
  generatedAt: string;
}

export interface TimelinePoint {
  date: string;
  value: number;
  reportId: string;
  reportDate: string;
  status: BiomarkerStatus;
  refLow?: number;
  refHigh?: number;
  unit: string;
}

export interface BiomarkerTimeline {
  biomarker: string;
  unit: string;
  category: BiomarkerCategory;
  referenceRange: string;
  refLow?: number;
  refHigh?: number;
  dataPoints: TimelinePoint[];
}

export interface AskReportsRequest {
  question: string;
  userId?: string;
}

export interface AskReportsResponse {
  question: string;
  answer: string;
  relevantReports: {
    id: string;
    date: string;
    type: string;
  }[];
  referencedBiomarkers: string[];
  caveat: string;
  generatedAt: string;
}
