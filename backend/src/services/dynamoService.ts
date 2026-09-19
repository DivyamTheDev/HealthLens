import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import path from 'path';
import { Measurement, ReportDetail, ReportMetadata } from '../models/types.js';

export class DynamoService {
  private docClient: DynamoDBDocumentClient | null = null;
  private reportsTable: string;
  private measurementsTable: string;
  private isLiveMode: boolean;
  private localDbDir: string;
  private reportsFile: string;
  private measurementsFile: string;

  constructor() {
    this.reportsTable = process.env.DYNAMODB_REPORTS_TABLE || 'HealthLensReports';
    this.measurementsTable = process.env.DYNAMODB_MEASUREMENTS_TABLE || 'HealthLensMeasurements';

    const hasAwsKeys = Boolean(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION
    );
    const forceAuto = process.env.AWS_MODE !== 'mock';
    this.isLiveMode = hasAwsKeys && forceAuto;

    this.localDbDir = path.resolve(process.cwd(), 'data', 'dynamo_db');
    this.reportsFile = path.join(this.localDbDir, 'reports.json');
    this.measurementsFile = path.join(this.localDbDir, 'measurements.json');

    if (this.isLiveMode) {
      const client = new DynamoDBClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      this.docClient = DynamoDBDocumentClient.from(client, {
        marshallOptions: { removeUndefinedValues: true },
      });
      console.log(`[DynamoService] Initialized in AWS LIVE mode (Tables: ${this.reportsTable}, ${this.measurementsTable})`);
    } else {
      this.ensureLocalStore();
      console.log(`[DynamoService] Initialized in LOCAL SIMULATION mode (Dir: ${this.localDbDir})`);
    }
  }

  public isLive(): boolean {
    return this.isLiveMode;
  }

  private ensureLocalStore() {
    if (!fs.existsSync(this.localDbDir)) {
      fs.mkdirSync(this.localDbDir, { recursive: true });
    }
    if (!fs.existsSync(this.reportsFile)) {
      fs.writeFileSync(this.reportsFile, JSON.stringify([]));
    }
    if (!fs.existsSync(this.measurementsFile)) {
      fs.writeFileSync(this.measurementsFile, JSON.stringify([]));
    }
  }

  private readLocalReports(): ReportMetadata[] {
    this.ensureLocalStore();
    try {
      const data = fs.readFileSync(this.reportsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private writeLocalReports(reports: ReportMetadata[]) {
    this.ensureLocalStore();
    fs.writeFileSync(this.reportsFile, JSON.stringify(reports, null, 2));
  }

  private readLocalMeasurements(): Measurement[] {
    this.ensureLocalStore();
    try {
      const data = fs.readFileSync(this.measurementsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private writeLocalMeasurements(measurements: Measurement[]) {
    this.ensureLocalStore();
    fs.writeFileSync(this.measurementsFile, JSON.stringify(measurements, null, 2));
  }

  public async saveReport(report: ReportMetadata): Promise<void> {
    if (this.isLiveMode && this.docClient) {
      try {
        await this.docClient.send(
          new PutCommand({
            TableName: this.reportsTable,
            Item: report,
          })
        );
        return;
      } catch (err) {
        console.warn(`[DynamoService] Failed to save report to AWS DynamoDB, saving locally:`, err);
      }
    }

    const reports = this.readLocalReports();
    const index = reports.findIndex((r) => r.id === report.id);
    if (index >= 0) {
      reports[index] = report;
    } else {
      reports.push(report);
    }
    this.writeLocalReports(reports);
  }

  public async getReports(userId: string): Promise<ReportMetadata[]> {
    if (this.isLiveMode && this.docClient) {
      try {
        const response = await this.docClient.send(
          new QueryCommand({
            TableName: this.reportsTable,
            KeyConditionExpression: 'userId = :uid',
            ExpressionAttributeValues: {
              ':uid': userId,
            },
            ScanIndexForward: false,
          })
        );
        return (response.Items as ReportMetadata[]) || [];
      } catch (err) {
        console.warn(`[DynamoService] Failed to query reports from AWS DynamoDB, reading locally:`, err);
      }
    }

    const reports = this.readLocalReports();
    return reports
      .filter((r) => r.userId === userId || userId === 'all')
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }

  public async getReport(reportId: string): Promise<ReportDetail | null> {
    let reportMetadata: ReportMetadata | null = null;

    if (this.isLiveMode && this.docClient) {
      try {
        // Query by id using scan or query depending on PK
        const response = await this.docClient.send(
          new QueryCommand({
            TableName: this.reportsTable,
            IndexName: 'ReportIdIndex',
            KeyConditionExpression: 'id = :rid',
            ExpressionAttributeValues: { ':rid': reportId },
          })
        );
        if (response.Items && response.Items.length > 0) {
          reportMetadata = response.Items[0] as ReportMetadata;
        }
      } catch {
        // Fallback to local
      }
    }

    if (!reportMetadata) {
      const reports = this.readLocalReports();
      reportMetadata = reports.find((r) => r.id === reportId) || null;
    }

    if (!reportMetadata) return null;

    const measurements = await this.getMeasurements(reportId);
    return {
      ...reportMetadata,
      measurements,
    };
  }

  public async saveMeasurements(measurements: Measurement[]): Promise<void> {
    if (measurements.length === 0) return;

    if (this.isLiveMode && this.docClient) {
      try {
        for (const item of measurements) {
          await this.docClient.send(
            new PutCommand({
              TableName: this.measurementsTable,
              Item: item,
            })
          );
        }
        return;
      } catch (err) {
        console.warn(`[DynamoService] Failed saving measurements to AWS DynamoDB, saving locally:`, err);
      }
    }

    const existing = this.readLocalMeasurements();
    const newMap = new Map(measurements.map((m) => [m.id, m]));
    const updated = existing.filter((m) => !newMap.has(m.id)).concat(measurements);
    this.writeLocalMeasurements(updated);
  }

  public async getMeasurements(reportId: string): Promise<Measurement[]> {
    if (this.isLiveMode && this.docClient) {
      try {
        const response = await this.docClient.send(
          new QueryCommand({
            TableName: this.measurementsTable,
            KeyConditionExpression: 'reportId = :rid',
            ExpressionAttributeValues: { ':rid': reportId },
          })
        );
        return (response.Items as Measurement[]) || [];
      } catch (err) {
        console.warn(`[DynamoService] Failed reading measurements from AWS DynamoDB, reading locally:`, err);
      }
    }

    const all = this.readLocalMeasurements();
    return all.filter((m) => m.reportId === reportId);
  }

  public async getMeasurementsByName(userId: string, biomarkerName: string): Promise<Measurement[]> {
    const all = this.readLocalMeasurements();
    const normalizedName = biomarkerName.trim().toLowerCase();

    const matches = all.filter(
      (m) =>
        (m.userId === userId || userId === 'all') &&
        m.name.trim().toLowerCase() === normalizedName
    );

    return matches;
  }

  public async deleteReport(reportId: string, userId: string): Promise<void> {
    if (this.isLiveMode && this.docClient) {
      try {
        await this.docClient.send(
          new DeleteCommand({
            TableName: this.reportsTable,
            Key: { userId, id: reportId },
          })
        );
      } catch (err) {
        console.warn(`[DynamoService] Delete from AWS failed:`, err);
      }
    }

    const reports = this.readLocalReports().filter((r) => r.id !== reportId);
    this.writeLocalReports(reports);

    const measurements = this.readLocalMeasurements().filter((m) => m.reportId !== reportId);
    this.writeLocalMeasurements(measurements);
  }

  public async clearAll(): Promise<void> {
    this.writeLocalReports([]);
    this.writeLocalMeasurements([]);
  }
}

export const dynamoService = new DynamoService();
