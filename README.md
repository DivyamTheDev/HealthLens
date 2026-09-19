# HealthLens 🔬 — Medical Report Intelligence

> **AI-powered personal health analytics platform** that transforms static medical lab reports (PDF/images) into structured digital records, tracks biomarker trends over time, performs safe side-by-side report comparisons with Amazon Bedrock, and enables conversational exploration of patient lab history.

---

## ☁️ Target AWS Architecture

```
                    ┌─────────────────┐
                    │  React + Vite   │
                    │    Frontend     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  API Gateway    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ AWS Lambda      │
                    │ Node + TS       │
                    └───────┬─────────┘
                            │
             ┌──────────────┼───────────────┐
             ▼              ▼               ▼
        ┌─────────┐   ┌───────────┐   ┌──────────┐
        │   S3    │   │ DynamoDB  │   │ Bedrock  │
        │ Reports │   │ Health DB │   │   AI     │
        └─────────┘   └───────────┘   └──────────┘
                            │
                            ▼
                       Health Data
```

### AWS Service Roles
| Service | Role in HealthLens |
| :--- | :--- |
| **Amazon S3** | Encrypted object storage for original medical PDF/image reports (`reports/{userId}/{reportId}/...`) |
| **Amazon DynamoDB** | Fast NoSQL storage for structured biomarker measurements, reports metadata, and historical series |
| **AWS Lambda** | Node.js + TypeScript serverless compute functions (`uploadReport`, `processReport`, `compareReports`, etc.) |
| **Amazon API Gateway** | REST API endpoints exposing serverless handlers with CORS and request validation |
| **Amazon Bedrock** | Document AI extraction, plain-language comparison summaries, and Ask My Reports RAG query engine |
| **AWS Amplify** | Hosting & CI/CD deployment for the React + Vite frontend application |

---

## 🚀 Key Features

### 1. 📄 Feature #1 & #2 — Upload & Extract Report Data (P0)
- Drag-and-drop PDF dropzone with real-time pipeline status animation:
  - **Step 1:** Upload encrypted document to **Amazon S3**
  - **Step 2:** Document AI biomarker extraction with **Amazon Bedrock**
  - **Step 3:** Structured JSON record ingestion in **Amazon DynamoDB**

### 2. 📊 Feature #3 — Health Dashboard (P0)
- Clean, focused clinical dashboard:
  - Total Reports uploaded
  - Total Measurements tracked
  - Latest report date
  - Recent reports archive with instant "View" and "Compare" shortcuts

### 3. 🔍 Feature #4 — Report Details (P0)
- Granular breakdown of lab tests categorized by panel:
  - Complete Blood Count (Hemoglobin, WBC, Platelets)
  - Metabolic Panel (Glucose, HbA1c, Creatinine)
  - Lipid Panel (Total Cholesterol, LDL, HDL)
  - Vitamins & Minerals (Vitamin D 25-OH)
- Preserves exact source report reference intervals and abnormal status flags (Low, Normal, High).
- Raw JSON inspector for technical auditability.

### 4. 🔄 Feature #5 — Side-by-Side Report Comparison (Hero Feature / P1)
- Select two reports across dates (e.g. January 15 vs. September 18).
- Calculates previous value, current value, mathematical difference ($\Delta$), and percentage change.
- Visual trend direction indicators (`↑ increased`, `↓ decreased`, `→ unchanged`).
- Strictly adheres to clinical neutrality without making unfounded medical assumptions.

### 5. 📈 Feature #6 — Biomarker Health Timeline (P3 Visual Wow)
- Interactive time-series area/line charts powered by Recharts.
- Select any biomarker (e.g. Vitamin D, Total Cholesterol, Hemoglobin).
- Chronological trajectory with **normal range reference shading bands** and tooltip inspection.

### 6. 🧠 Feature #7 — Amazon Bedrock Clinical Summary (P2)
- Synthesizes quantitative report differences into plain language.
- **Strict Guardrails:**
  - Does NOT diagnose conditions.
  - Does NOT prescribe medications or dosages.
  - Does NOT invent facts.
  - Only summarizes recorded numbers vs. baseline.

### 7. 💬 Feature #8 — "Ask My Reports" (P3 AI Wow)
- Conversational RAG assistant grounded strictly in patient's stored DynamoDB lab history.
- Pre-built query chips:
  - *"What changed between my last two reports?"*
  - *"Show my Vitamin D measurements over time"*
  - *"Are any of my cholesterol readings high?"*
- Citations indicating exactly which dates and biomarkers were consulted.

---

## ⚡ Quick Start (Local & Hackathon Demo)

HealthLens features a **dual-driver architecture**:
- Works **100% out-of-the-box locally** with synthetic lab data and simulation drivers.
- Automatically connects to **real AWS Cloud services** as soon as AWS credentials are configured in `backend/.env`.

### 1. Prerequisites
- **Node.js 20+**
- **npm**

### 2. Running Frontend & Backend
In the project root:

```bash
# Terminal 1: Start Backend (Port 5001)
npm run dev:backend

# Terminal 2: Start Frontend (Port 5173)
npm run dev:frontend
```

Now open: **`http://localhost:5173`** in your browser.

---

## 🔑 Connecting Live AWS Credentials

To connect HealthLens to your real AWS account, update `backend/.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET_NAME=your-s3-bucket-name
DYNAMODB_REPORTS_TABLE=HealthLensReports
DYNAMODB_MEASUREMENTS_TABLE=HealthLensMeasurements
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
AWS_MODE=auto
```

Whenever these keys are provided, HealthLens automatically routes calls to **live Amazon S3, DynamoDB, and Bedrock**!

---

## 🧪 Synthetic Medical Data Generator

HealthLens includes a realistic medical lab report PDF generator creating authentic lab sheets for synthetic patient **Alex Taylor**:

```bash
npm run generate-samples
```

Generated reports in `sample-data/`:
1. `january_2026_blood_test.pdf` — Baseline (Vitamin D: 18 ng/mL [Low], Hemoglobin: 13.2 g/dL, Cholesterol: 190 mg/dL)
2. `june_2026_blood_test.pdf` — Mid-Year (Vitamin D: 22 ng/mL [Low], Hemoglobin: 13.6 g/dL, Cholesterol: 198 mg/dL)
3. `september_2026_blood_test.pdf` — Current (Vitamin D: 27 ng/mL, Hemoglobin: 14.0 g/dL, Cholesterol: 205 mg/dL)

---

## 📦 Project Structure

```
HealthLens/
├── backend/
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── uploadReport.ts       # S3 upload & ingest
│   │   │   ├── processReport.ts      # Bedrock extraction & DynamoDB write
│   │   │   ├── getReports.ts         # User reports metadata query
│   │   │   ├── getReport.ts          # Granular report & measurements fetch
│   │   │   ├── compareReports.ts     # Numerical delta & trend engine
│   │   │   ├── generateSummary.ts    # Bedrock clinical summarizer
│   │   │   ├── getTimeline.ts        # Historical biomarker time-series
│   │   │   ├── askReports.ts         # RAG conversational Q&A
│   │   │   └── seedDemoData.ts       # Synthetic dataset seeder
│   │   ├── services/
│   │   │   ├── s3Service.ts          # AWS S3 client + local fallback
│   │   │   ├── dynamoService.ts      # AWS DynamoDB client + local store
│   │   │   └── bedrockService.ts     # Amazon Bedrock client + safe prompts
│   │   ├── models/
│   │   │   └── types.ts              # Strict TypeScript contracts
│   │   ├── devServer.ts              # Express API Gateway router for dev
│   │   └── lambda.ts                 # AWS Lambda router for production
│   ├── template.yaml                 # AWS SAM / CloudFormation IaC
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Header & AWS status indicator
│   │   │   ├── MetricCard.tsx        # Dashboard metric cards
│   │   │   ├── ComparisonTable.tsx   # Side-by-side delta table
│   │   │   ├── AIInsightCard.tsx     # Bedrock summary card
│   │   │   ├── TrendChart.tsx        # Recharts timeline visualizer
│   │   │   └── StatusBadge.tsx       # Clinical status pill
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Health overview
│   │   │   ├── UploadReport.tsx      # Drag & drop upload pipeline
│   │   │   ├── ReportsList.tsx       # Reports archive & selector
│   │   │   ├── ReportDetails.tsx     # Categorized test results
│   │   │   ├── CompareReports.tsx    # Hero feature comparison
│   │   │   ├── TimelineView.tsx      # Multi-report biomarker graph
│   │   │   └── AskReports.tsx        # Bedrock RAG chat assistant
│   │   ├── services/
│   │   │   └── api.ts                # Frontend API client
│   │   └── App.tsx
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── sample-data/
│   ├── january_2026_blood_test.pdf
│   ├── june_2026_blood_test.pdf
│   └── september_2026_blood_test.pdf
│
└── README.md
```

---

## 🏛️ Deploying to AWS

### Deploy Backend with AWS SAM
```bash
cd backend
sam build
sam deploy --guided
```

### Deploy Frontend with AWS Amplify
1. Connect your repository to AWS Amplify Console.
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variable `VITE_API_URL` pointing to your API Gateway URL.
