# HealthLens 🩺
### *Your health history, understood over time.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Amplify%20Hosting-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://main.d1sg7hnevaweuu.amplifyapp.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DivyamTheDev/HealthLens)
[![AWS Powered](https://img.shields.io/badge/AWS-Serverless-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)

HealthLens is an AWS-powered health report intelligence platform that turns scattered medical reports into an understandable personal health timeline.

Instead of manually comparing multiple reports, HealthLens extracts recorded measurements, organizes them, compares results across reports, visualizes changes over time, and generates plain-language summaries based only on the available records.

> ⚠️ **Disclaimer**: HealthLens is an informational tool and does not provide medical diagnosis or treatment advice.

---

## 🚀 Live Demo

* **Live Application URL**: [https://main.d1sg7hnevaweuu.amplifyapp.com/](https://main.d1sg7hnevaweuu.amplifyapp.com/)
* **GitHub Repository**: [https://github.com/DivyamTheDev/HealthLens](https://github.com/DivyamTheDev/HealthLens)

👉 **Experience the live deployed application**: **[https://main.d1sg7hnevaweuu.amplifyapp.com/](https://main.d1sg7hnevaweuu.amplifyapp.com/)**

---

## 💡 The Problem

Medical reports often contain useful information, but the information is scattered across PDFs and documents.

When someone has multiple reports over months or years, answering simple questions such as:
- **What changed between my reports?**
- **How has a particular measurement changed over time?**
- **What values were recorded previously?**
- **Can I quickly understand the information in my reports?**

usually requires manually opening and comparing multiple documents.

HealthLens aims to make that process simpler.

---

## 💡 The Solution

HealthLens creates a structured view of a user's health records.

### Core workflow

```
Upload Report
      ↓
Store Original Document
      ↓
Extract Structured Measurements
      ↓
Store Structured Data
      ↓
View Report
      ↓
Compare Reports
      ↓
Track Measurements Over Time
      ↓
Generate Plain-Language Summary
```

The system focuses on organizing and explaining recorded information rather than making medical diagnoses.

---

## ✨ Features

### 📄 Medical Report Upload
Upload supported medical report documents through the web application. The original document is stored securely in Amazon S3.

### 🔎 Structured Data Extraction
HealthLens processes report content and extracts structured measurements such as:
- Measurement name
- Recorded value
- Unit
- Reference range
- Report date
- Report type

**Example:**
```json
{
  "name": "Vitamin D",
  "value": 27,
  "unit": "ng/mL",
  "referenceRange": "30-100"
}
```

### 📊 Report Comparison
Select two reports and compare recorded measurements.

**Example:**
- **Vitamin D**: Previous: `18 ng/mL` | Current: `27 ng/mL` | Change: `+9 ng/mL`
- **Hemoglobin**: Previous: `13.2 g/dL` | Current: `14.0 g/dL` | Change: `+0.8 g/dL`

HealthLens presents these as recorded changes without making a medical judgment about whether a change is good or bad.

### 📈 Health Timeline
Track selected measurements across multiple reports.
For example:
- **Vitamin D**: Jan 2026 → `18 ng/mL` | Mar 2026 → `21 ng/mL` | Jun 2026 → `24 ng/mL` | Sep 2026 → `27 ng/mL`

This provides a simple historical view of recorded values.

### 🤖 AI-Powered Summaries
Amazon Bedrock is used to generate plain-language summaries from structured report information.

The AI is instructed to:
- Use only the information provided
- Avoid inventing medical information
- Avoid diagnosing conditions
- Avoid prescribing treatment
- Clearly describe recorded changes

**Example:**
> *"Compared with the selected previous report, the recorded Vitamin D value changed from 18 to 27 ng/mL, while Hemoglobin changed from 13.2 to 14.0 g/dL."*

### 🧠 Ask My Reports
Users can ask questions about their stored report information, such as:
- *"What changed between my last two reports?"*
- *"Show my Vitamin D history."*
- *"What measurements were recorded in my latest report?"*

Responses are based on the user's stored report data.

---

## ☁️ AWS Architecture

```
┌─────────────────────┐
│        User         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     AWS Amplify     │
│    React + Vite     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     API Gateway     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     AWS Lambda      │
│    Node.js + TS     │
└──────┬──────┬───────┘
       │      │
┌──────┘      └──────────────┐
▼                            ▼
┌─────────────────┐   ┌─────────────────┐
│    Amazon S3    │   │ Amazon DynamoDB │
│ Original Reports│   │ Structured Data │
└─────────────────┘   └─────────────────┘
                             │
                             ▼
                      ┌─────────────────┐
                      │ Amazon Bedrock  │
                      │  AI Summaries   │
                      └─────────────────┘
```

---

## 🛠️ AWS Services Used

| AWS Service | Purpose |
| :--- | :--- |
| **AWS Amplify Hosting** | Hosts and deploys the React frontend |
| **Amazon API Gateway** | Provides HTTP API endpoints |
| **AWS Lambda** | Runs backend application logic |
| **Amazon S3** | Stores uploaded report documents |
| **Amazon DynamoDB** | Stores structured report and measurement data |
| **Amazon Bedrock** | Generates AI-powered summaries and explanations |
| **AWS IAM** | Controls permissions between AWS services |

---

## 🧑‍💻 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- TypeScript
- AWS Lambda
- API Gateway

### Cloud & AI
- Amazon S3
- Amazon DynamoDB
- Amazon Bedrock
- AWS Amplify
- AWS IAM

### Development
- Git & GitHub
- AWS SAM
- AWS CLI
- VS Code

---

## 📁 Project Structure

```text
HealthLens/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── uploadReport.ts
│   │   │   ├── processReport.ts
│   │   │   ├── getReports.ts
│   │   │   ├── getReport.ts
│   │   │   ├── compareReports.ts
│   │   │   ├── getTimeline.ts
│   │   │   ├── generateSummary.ts
│   │   │   ├── askReports.ts
│   │   │   └── seedDemoData.ts
│   │   ├── services/
│   │   │   ├── s3Service.ts
│   │   │   ├── dynamoService.ts
│   │   │   └── bedrockService.ts
│   │   └── lambda.ts
│   ├── template.yaml
│   ├── samconfig.toml
│   └── package.json
│
├── sample-data/
├── README.md
└── package.json
```

---

## 🔌 API Flow

The frontend communicates with the AWS backend through API Gateway.

Example endpoints include:
- `GET /api/reports`
- `GET /api/reports/{id}`
- `POST /api/reports/upload`
- `POST /api/reports/compare`
- `GET /api/timeline`
- `POST /api/reports/summary`
- `POST /api/ask`
- `POST /api/demo/seed`

API Gateway routes requests to the appropriate Lambda backend logic.

---

## 🔐 Security

HealthLens follows several basic security practices:
- AWS credentials are never exposed in the frontend.
- AWS credentials are not committed to Git.
- Secrets and environment files are excluded using `.gitignore`.
- Lambda accesses AWS services through IAM execution permissions.
- The frontend only requires the public API endpoint.
- Demo data is synthetic and should not contain real personal medical information.

---

## 🧪 Demo Data

The project uses synthetic medical reports for demonstration purposes.
No real patient medical records are required to demonstrate the application.

Example measurements include:
- Hemoglobin
- Vitamin D
- HbA1c
- Cholesterol

The application is designed to demonstrate the technical workflow rather than replace professional medical evaluation.

---

## ⚠️ Disclaimer

HealthLens is an informational software project.
It is designed to organize, compare, visualize, and summarize information contained in uploaded reports.
HealthLens does not provide medical diagnosis, treatment recommendations, or professional medical advice.
Users should consult qualified healthcare professionals for medical decisions.

---

## 🤖 AI Usage

Amazon Bedrock is used to generate natural-language summaries from structured report information.
The AI layer is designed to:
- Receive structured measurements from stored reports.
- Compare relevant recorded values.
- Generate a concise plain-language explanation.
- Avoid unsupported medical conclusions.
- Avoid diagnosis or treatment recommendations.

AI-assisted coding tools were also used during development.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- npm
- AWS CLI
- AWS SAM CLI
- AWS account
- Git

### Clone Repository
```bash
git clone https://github.com/DivyamTheDev/HealthLens.git
cd HealthLens
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start locally at `http://localhost:5173`.

### Backend
The backend is deployed using AWS SAM and runs through AWS Lambda and API Gateway.

**Build the backend:**
```bash
cd backend
npm run build
sam build
```

**Deploy:**
```bash
sam deploy
```

AWS credentials should be configured through the AWS CLI or another secure credential provider.
Never commit AWS access keys or secrets to the repository.

---

## 🌎 Deployment

The production frontend is hosted using **AWS Amplify Hosting**.
The backend runs on AWS using:
```
API Gateway → Lambda → S3 + DynamoDB + Bedrock
```
The frontend communicates with the deployed API Gateway endpoint using the configured `VITE_API_URL` environment variable.

---

## 🏗️ Why AWS?

HealthLens uses AWS services for different parts of the application:
- **Amplify**: Provides managed hosting and deployment for the React frontend.
- **API Gateway**: Provides the HTTP interface between the frontend and backend.
- **Lambda**: Runs backend logic without maintaining servers.
- **S3**: Stores uploaded medical report documents.
- **DynamoDB**: Provides scalable storage for structured report information.
- **Bedrock**: Provides the AI layer for generating natural-language summaries.

This serverless architecture keeps infrastructure relatively simple while using managed AWS services.

---

## 🔮 Future Improvements

Potential future improvements include:
- Amazon Cognito authentication
- User-specific report isolation
- Additional document formats
- Better OCR/document extraction
- More advanced timeline visualizations
- Report history search
- Encrypted document processing workflows
- More granular IAM permissions
- Audit logging
- Improved accessibility
- Mobile-friendly experience
- Healthcare-provider sharing workflows

---

## 🏆 Hackathon

- **Built for**: WeMakeDevs × AWS Bharat Builds Tour 2026 — First Commit
- **Team**: DivyamLabs
- **Project**: HealthLens

The project was developed during the hackathon period and uses AWS as a core part of its architecture.

---

## 👨‍💻 Author

**Divyam Chaudhary**
- GitHub: [https://github.com/DivyamTheDev](https://github.com/DivyamTheDev)

---

## ⭐ Support

If you find the project interesting, consider starring the repository!
