# PitchPerfect — AI Hackathon Pitch Coach & Honest Judge

PitchPerfect is an AI-powered hackathon pitch-coaching platform built with React 18, Vite, Tailwind CSS, and AWS Serverless (API Gateway + AWS Lambda) integrating Google Gemini 2.5 Flash.

It helps hackathon builders:
- **Pitch Studio**: Draft a structured 5-part pitch (Pain Point, Solution, Competitive Moat, Architecture, and a 60-second verbal delivery script).
- **Idea Health & Viability Audit**: Run automated gap analysis to detect weak problem statements, ambiguous beachhead personas, and missing architectural moats.
- **Simulated Judge Practice (Honest Judge Mode)**: Face tough, project-specific questions tailored to your exact tech stack, evaluated against a demanding 5-point technical rubric.
- **Pitch Vault**: Persist, inspect, restore, and manage pitch drafts in safe browser storage with quota protection and deduplication.
- **Pitch Playbook**: Rehearse demo-day delivery guidelines.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       React 18 / Vite UI                   │
│   (Dashboard, PitchBuilder, IdeaImprover, JudgePractice)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                coachingEngine.js (Client Orchestrator)
              (AbortController, Fallback Engine, Heuristics)
                               │
                               ▼
               AWS HTTP API Gateway (us-east-1)
           POST /coach (CORS, 29s timeout boundary)
                               │
                               ▼
               AWS Lambda (pitchperfect-coach-api)
                  Python 3.12 Serverless Handler
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   Deterministic Pre-Validator            Gemini 2.5 Flash API
 (Nonsense, idk, Keyboard Mash,          (thinkingBudget: 0,
   Spam -> 0 Score / Misconception)      18s urllib timeout)
```

### Resilient Fallback Design
When network connectivity is unavailable, the backend is unreachable, or an API error occurs, `coachingEngine.js` automatically engages its local client-side heuristics. Fallback responses are explicitly labeled in the UI (`Local Heuristics` vs `Gemini AI Question`) to ensure complete transparency without confusing or blocking the user.

---

## Honest Judge Mode Scoring Rubric

Honest Judge Mode rejects superficial length-based scoring and evaluates the actual technical merit of the answer:

1. **Technical Correctness (30%)**: Verifiable technical claims, sound architecture, and correct library/protocol roles. Blatant false claims (e.g. claiming React scales the backend or guarantees offline availability without service workers) are explicitly identified in `misconceptions` and penalized heavily.
2. **Relevance to Question (25%)**: Directly addresses the specific architectural question asked rather than pivoting to unrelated marketing talk.
3. **Evidence & Specificity (20%)**: Cites concrete components, libraries, error handlers, data stores, or metrics.
4. **Completeness & Trade-offs (15%)**: Acknowledges real constraints, failure modes, and operational trade-offs. Honest admissions of uncertainty accompanied by sound investigation plans receive partial credit.
5. **Clarity (10%)**: Crisp, direct communication. Short, correct answers score highly and are not penalized for brevity.

### Quality Labels (Synchronized with 0–100 Score)
- **85–100**: Excellent
- **70–84**: Good
- **50–69**: Partially Correct
- **30–49**: Weak
- **0–29**: Fundamentally Incorrect

---

## API Contract (AWS Lambda & Coaching Engine)

Endpoint: `POST https://g390y91167.execute-api.us-east-1.amazonaws.com/coach`

### 1. `getInitialJudgeQuestions`
- **Request**:
  ```json
  {
    "action": "getInitialJudgeQuestions",
    "project": {
      "title": "PulseGuard",
      "problem": "Campus emergency response latency",
      "targetUsers": "Security and student paramedics",
      "technologies": "React, Web Bluetooth, FastAPI, PostGIS"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "action": "getInitialJudgeQuestions",
    "result": [
      {
        "id": "q1",
        "question": "For PulseGuard, Web Bluetooth connections can drop or face browser permission hurdles...",
        "aspect": "Technical Feasibility",
        "difficulty": "Hard"
      }
    ]
  }
  ```

### 2. `evaluateJudgeAnswer`
- **Request**:
  ```json
  {
    "action": "evaluateJudgeAnswer",
    "question": "How do you handle Web Bluetooth disconnects during an emergency?",
    "answer": "We cache events in IndexedDB and retry pairing with exponential backoff."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "action": "evaluateJudgeAnswer",
    "result": {
      "score": 82,
      "quality": "Good",
      "feedback": "Direct, technically sound answer. You cite concrete technical mechanisms...",
      "missingInfo": "Specific failure thresholds (e.g. max retry attempts, TTL).",
      "proTip": "Add one numerical threshold (e.g., '3 retries with 500ms exponential jitter').",
      "misconceptions": null,
      "rubricBreakdown": {
        "technicalCorrectness": 26,
        "relevance": 22,
        "evidence": 16,
        "completeness": 10,
        "clarity": 8
      }
    }
  }
  ```

### 3. `generatePitch`
- Generates 5 structured sections (`problem`, `solution`, `differentiator`, `technicalApproach`, `sixtySecondPitch`).

### 4. `improveIdea`
- Returns viability score (`0-100`), `strengths`, `critiques` (with severity levels), and `suggestions`.

---

## Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v25)
- Python 3.12+ (for backend unit testing)

### Install dependencies
```bash
npm install
```

### Start development server
```bash
npm run dev -- --host 0.0.0.0
```
Open `http://localhost:3000`.

### Build for production
```bash
npm run build
```

---

## Running Automated Tests

The repository includes comprehensive unit and integration tests covering nonsense detection, false claims penalties, persistence, and backend Lambda routing.

### Run frontend tests (Vitest)
```bash
npm test
```
*Executes 35 automated frontend tests across `acceptanceCriteria.test.js`, `coachingEngine.test.js`, `pitchPersistence.test.jsx`, and `judgePractice.test.jsx`.*

### Run backend Lambda tests (Python unittest)
```bash
npm run test:backend
```
*Executes 9 automated backend tests across `backend/test_lambda.py`.*

---

## AWS Lambda Deployment Guidance

The repaired Lambda backend code is located at `backend/lambda_function.py`, and a deployment package has been built at `backend/lambda_package.zip`.

> **Note on Cloud Deployment**: Per security and governance policies, cloud resources were audited in read-only mode and not modified during this audit.

To update the live AWS Lambda function (`pitchperfect-coach-api` in `us-east-1`), run the following AWS CLI command with appropriate permissions:

```bash
aws lambda update-function-code \
  --function-name pitchperfect-coach-api \
  --zip-file fileb://backend/lambda_package.zip \
  --region us-east-1
```

### Lambda Environment Configuration
- **Runtime**: Python 3.12
- **Handler**: `lambda_function.lambda_handler`
- **Memory**: 128 MB – 256 MB
- **Timeout**: 30 seconds
- **Environment Variables**:
  - `GEMINI_API_KEY`: Google AI Studio Gemini API key (never hardcoded in source code or frontend).

---

## Current Boundaries & Limitations
- Browser persistence uses `localStorage`; browser storage quota limitations apply (typically 5–10MB per origin).
- Fallback heuristics operate entirely offline; complex novel technical claims benefit from the live Gemini AI backend.
- Voice/audio input is not currently natively captured; speech pitch practice is delivered via written script rehearsal.
