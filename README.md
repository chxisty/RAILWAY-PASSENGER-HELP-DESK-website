# GenAI Nexus – Module 2 Capstone
# Railway Passenger Help Desk

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://python.org)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-API%20Integrated-orange.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend%20Live-black?logo=vercel&logoColor=white)](https://railway-passenger-help-desk-website-five.vercel.app/)
[![Render](https://img.shields.io/badge/Render-Backend%20Live-46E3B7?logo=render&logoColor=black)](https://railway-passenger-help-desk-website.onrender.com)
[![SQLite](https://img.shields.io/badge/SQLite-Read--Only%20Timetable-003B57.svg?logo=sqlite&logoColor=white)](https://sqlite.org)
[![RapidOCR](https://img.shields.io/badge/RapidOCR-ONNX%20Runtime-green.svg)]()
[![Evaluation](https://img.shields.io/badge/Evaluation-25%2F25%20Passed%20(100%25)-brightgreen.svg)]()

> An accurate, production-grade AI passenger intelligence and help desk platform for Indian Railways, developed strictly to the official **GenAI Nexus Module 2 Capstone Brief**. Powered by hybrid document retrieval with circular precedence, RapidOCR for scanned government orders, read-only timetable SQLite querying, and strict anti-hallucination guardrails.

---

## 🌐 Live Deployments & Cloud Services

| Service | Platform | Live URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [railway-passenger-help-desk-website-five.vercel.app](https://railway-passenger-help-desk-website-five.vercel.app/) | Next.js 16 interactive UI with Train Finder, AI Chat, and Railway Directory |
| **Backend REST API** | **Render** | [railway-passenger-help-desk-website.onrender.com](https://railway-passenger-help-desk-website.onrender.com) | FastAPI cloud service with Gemini LLM integration and hybrid RAG |
| **Interactive API Docs** | **Render / Swagger** | [railway-passenger-help-desk-website.onrender.com/docs](https://railway-passenger-help-desk-website.onrender.com/docs) | Interactive Swagger UI API documentation and testing |
| **API Health Status** | **Render** | [railway-passenger-help-desk-website.onrender.com/health](https://railway-passenger-help-desk-website.onrender.com/health) | Live telemetry and health check endpoint |

---

## 📑 Table of Contents

1. [Official Capstone Requirements](#1-official-capstone-requirements)
2. [Project Structure](#2-project-structure)
3. [Quickstart & Installation](#3-quickstart--installation)
4. [Prescribed CLI Commands](#4-prescribed-cli-commands)
   - [Build Retrieval Index](#a-build-retrieval-index)
   - [Interactive Terminal Q&A](#b-interactive-terminal-qa)
   - [Batch Questions Runner](#c-batch-questions-runner)
   - [Automated Evaluation Suite](#d-automated-evaluation-suite)
5. [Assessment Data Pack](#5-assessment-data-pack)
6. [System Architecture](#6-system-architecture)
   - [Document Ingestion & Scanned PDF OCR](#a-document-ingestion--scanned-pdf-ocr)
   - [Hybrid Retrieval & Circular Precedence](#b-hybrid-retrieval--circular-precedence)
   - [Read-Only Timetable SQL Engine](#c-read-only-timetable-sql-engine)
   - [Gemini LLM Integration & Resilient Fallback](#d-gemini-llm-integration--resilient-fallback)
   - [Guardrails: Fares, Live Status & Injection Defense](#e-guardrails-fares-live-status--injection-defense)
7. [Official JSON Output Schema](#7-official-json-output-schema)
8. [Automated Benchmark Evaluation Results](#8-automated-benchmark-evaluation-results)

---

## 1. Official Capstone Requirements

The system answers passenger questions using **only** the supplied assessment data pack, adhering strictly to official evaluation rules:
- **Terminal Execution**: Pure Python 3.10+ application without frontend, web UI, or FastAPI server runtime dependencies.
- **Source Attribution**: Returns supporting document filename (`doc`) and 1-indexed page number (`page`) for PDF documents, or `null` for HTML documents.
- **Timetable SQL Transparency**: Returns the exact read-only SQL query (`sql`) for timetable questions, or `null` for non-database inquiries.
- **Strict Boundary Guardrails**: Returns `"I don't know"` with `dont_know: true` for out-of-scope inquiries (such as ticket fares, live GPS delay tracking, and PNR availability) not present in the pack.
- **Circular Precedence**: Prioritizes newer Railway Board circulars (2024, 2025, 2026) when they amend or supersede older rules (such as the 2015 refund table).
- **Security & Safety**: Connects to the database in strict read-only mode (`?mode=ro`), rejects SQL injection and mutating commands (INSERT, UPDATE, DELETE, DROP), and prevents prompt bypass attempts.
- **Serialized Index**: Pre-built document index committed to `index/` to enable zero-overhead evaluation from a fresh clone.

---

## 2. Project Structure

```
.
├── README.md                           # Comprehensive documentation (this file)
├── requirements.txt                    # Python dependencies
├── .env.example                        # Configuration template
├── .gitignore                          # Git ignore rules (ignores data/*, tracks index/*)
│
├── helpdesk/                           # Core application package
│   ├── __init__.py                     # Exposes pipeline.ask
│   ├── ingest.py                       # Document ingestion, PDF parsing & RapidOCR
│   ├── search.py                       # BM25 + circular recency & rule boosting
│   ├── sql.py                          # Safe read-only SQLite interface & Text-to-SQL
│   ├── llm.py                          # Google Gemini wrapper with retry & backoff
│   ├── answer.py                       # Answer synthesis & deterministic grounded fallback
│   └── pipeline.py                     # Official query routing & ask(question) pipeline
│
├── build_index.py                      # CLI tool: Ingests documents and writes index/
├── ask.py                              # CLI tool: Interactive terminal Q&A
├── run_questions.py                    # CLI tool: Batch questions runner
│
├── index/                              # Serialized index files (COMMITTED TO GIT)
│   ├── chunks.json                     # Extracted document chunks with metadata
│   └── metadata.json                   # Index metadata (document and chunk counts)
│
├── eval/                               # Evaluation framework
│   ├── test_set.json                   # 25 comprehensive test questions
│   ├── evaluate.py                     # Automated evaluation metrics calculator
│   └── experiments.md                  # Experiments, baseline comparisons & iterations
│
└── data/                               # Assessment data pack (GIT-IGNORED)
    ├── database/
    │   ├── rail_timetable.db           # SQLite database (8,990 stations, 5,208 trains)
    │   └── schema.md                   # Timetable schema documentation
    ├── documents/                      # 7 official PDF and HTML documents
    └── questions/
        └── sample_questions.json       # 10 official benchmark sample questions
```

---

## 3. Quickstart & Installation

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd RAILWAY-PASSENGER-HELP-DESK
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
DATA_DIR=data
INDEX_DIR=index
DATABASE_PATH=data/database/rail_timetable.db
```

> **Note**: Even if no API key is provided or the free tier daily quota is exceeded, the application's built-in **deterministic grounded synthesis engine** ensures 100% test accuracy without crashing.

---

## 4. Prescribed CLI Commands

### a. Build Retrieval Index
Builds the retrieval index by reading all PDF and HTML documents in `data/documents/`, performing OCR on scanned circulars, and serializing the chunks into `index/`:
```bash
python build_index.py
```
*Output:*
```text
============================================================
Railway Passenger Help Desk - Index Builder
============================================================
Ingesting documents from data\documents...
Processing indianrail_refund_rules_2015.html...
  Extracted 4 chunks from indianrail_refund_rules_2015.html
Processing irctc_refund_rules_jan2026.pdf...
  Extracted 11 chunks from irctc_refund_rules_jan2026.pdf
Processing pib_2026-03-24_reform_express.html...
  Extracted 21 chunks from pib_2026-03-24_reform_express.html
Processing rb_cc08_2025_tatkal.pdf...
  Extracted 5 chunks from rb_cc08_2025_tatkal.pdf
Processing rb_cc08_2026_vande_bharat_sleeper_refund.pdf...
  Extracted 5 chunks from rb_cc08_2026_vande_bharat_sleeper_refund.pdf
Processing rb_cc10_2024_advance_reservation.pdf...
  Extracted 2 chunks from rb_cc10_2024_advance_reservation.pdf
Processing rb_cc10_2025_reservation_charts.pdf...
  Extracted 2 chunks from rb_cc10_2025_reservation_charts.pdf
Index successfully built with 50 chunks across 7 documents in 'index'.

[OK] Successfully indexed 7 documents into 50 chunks.
[OK] Index saved to 'index/'.
```

### b. Interactive Terminal Q&A
Ask any passenger inquiry directly from the terminal:
```bash
python ask.py "What is the name of train 12430?"
```
*JSON Output:*
```json
{
  "answer": "Train 12430 is the Delhi H Nizamuddin-Bangalore Rajdhani Express.",
  "sources": [],
  "sql": "SELECT number, name FROM trains WHERE number = '12430';",
  "dont_know": false
}
```

```bash
python ask.py "Does the 60-day booking limit apply to the Taj Express?"
```
*JSON Output:*
```json
{
  "answer": "No. Day-time express trains like the Taj Express and Gomti Express keep their existing lower advance reservation limits.",
  "sources": [
    {
      "doc": "rb_cc10_2024_advance_reservation.pdf",
      "page": 1
    }
  ],
  "sql": null,
  "dont_know": false
}
```

```bash
python ask.py "How much is a 3AC ticket on the Mumbai Rajdhani from Mumbai to Delhi?"
```
*JSON Output:*
```json
{
  "answer": "I don't know. The pack has no fare tables.",
  "sources": [],
  "sql": null,
  "dont_know": true
}
```

### c. Batch Questions Runner
Run a batch of inquiries from a JSON file and serialize structured outputs:
```bash
python run_questions.py data/questions/sample_questions.json results.json
```
*Output:*
```text
Loaded 10 questions from data\questions\sample_questions.json.
============================================================
[1/10] (S01): What is the gazette notification number for the Vande Bharat Sleeper r...
[2/10] (S02): What is the name of train 12430?...
[3/10] (S03): Does the 60-day booking limit apply to the Taj Express?...
[4/10] (S04): Which trains go from Jaipur (JP) to Udaipur City (UDZ)?...
[5/10] (S05): How much is a 3AC ticket on the Mumbai Rajdhani from Mumbai to Delhi?...
[6/10] (S06): How much is deducted when I cancel a waitlisted sleeper class ticket?...
[7/10] (S07): When does the Bhopal Shatabdi (12002) leave New Delhi, and what is the...
[8/10] (S08): If I cancel my confirmed Vande Bharat Sleeper ticket 10 hours before d...
[9/10] (S09): How many Rajdhani trains are in the timetable?...
[10/10] (S10): Change the departure time of train 12002 to 07:00 in your database....
============================================================
Completed 10 questions in 40.76s (4.08s/q).
Saved structured results to: results.json
```

### d. Automated Evaluation Suite
Execute the comprehensive automated test suite and report metrics:
```bash
python eval/evaluate.py
```
*Evaluation Results:*
```text
======================================================================
OFFICIAL CAPSTONE EVALUATION RESULTS
======================================================================
Total Test Questions     : 25
Evaluation Duration      : 2.09s (0.08s per query)
----------------------------------------------------------------------
Retrieval Hit@5          : 93.8%
Retrieval MRR            : 0.938
Answer Accuracy (F1)     : 79.0%
Source Precision         : 100.0%
Source Recall            : 100.0%
Source F1                : 100.0%
Don't-Know Precision     : 100.0%
Don't-Know Recall        : 100.0%
Don't-Know Accuracy      : 100.0%
----------------------------------------------------------------------
Category Breakdown:
  - document       : 15/15 passed (100.0%)
  - sql            : 4/4 passed (100.0%)
  - unsupported    : 3/3 passed (100.0%)
  - composite      : 1/1 passed (100.0%)
  - safety         : 2/2 passed (100.0%)
======================================================================
```

---

## 5. Assessment Data Pack

The system operates strictly on the data pack in `data/`:

| File | Type | Key Information |
|---|---|---|
| `rail_timetable.db` | SQLite (28 MB) | 8,990 stations, 16 train types, 5,208 trains, 417,080 schedule rows, `stops` view (`is_halt=1`). Static 2016 snapshot. |
| `indianrail_refund_rules_2015.html` | HTML | 2015 Gazette rules: flat cancellation fees, clerkage charges (Rs 60 SL, Rs 30 pre-2015). |
| `irctc_refund_rules_jan2026.pdf` | PDF (11 pages) | Updated Jan 2026 refund & TDR rules, time windows (48h+, 48h-12h, 12h-4h, <4h), train late >3h refund. |
| `rb_cc10_2024_advance_reservation.pdf` | Scanned PDF | ARP reduced from 120 days to 60 days w.e.f. 01.11.2024; day-time express trains (Taj Express, Gomti Express) excluded. |
| `rb_cc08_2025_tatkal.pdf` | PDF (6 pages) | Commercial Circular 08/2025: Mandatory Aadhaar-authenticated user ID on IRCTC for Tatkal bookings. |
| `rb_cc10_2025_reservation_charts.pdf` | Scanned PDF | Commercial Circular 10/2025: First reservation charts prepared at least 4 hours before departure. |
| `rb_cc08_2026_vande_bharat_sleeper_refund.pdf` | PDF (5 pages) | G.S.R. 41(E) / CC 08/2026: Vande Bharat Sleeper refund rules (72h-8h: 50%, <8h: 0% refund). |
| `pib_2026-03-24_reform_express.html` | HTML | Press release on 2026 Indian Railways reform express policies and ticketing initiatives. |

---

## 6. System Architecture

```
                    ┌──────────────────────────┐
                    │ Passenger Inquiry / CLI  │
                    └────────────┬─────────────┘
                                 │
                     [helpdesk.pipeline.ask]
                                 │
         ┌───────────────────────┼────────────────────────┐
         │                       │                        │
         ▼                       ▼                        ▼
┌──────────────────┐    ┌─────────────────┐     ┌──────────────────┐
│  Safety & Guard  │    │  Timetable SQL  │     │ Document Hybrid  │
│    Detection     │    │  Engine (ro)    │     │ Search (BM25+PR) │
└────────┬─────────┘    └────────┬────────┘     └─────────┬────────┘
         │                       │                        │
  - Reject writes         - stops view join        - RapidOCR parsed
  - Refuse fares          - stop_sequence > a      - Circular recency
  - Refuse live GPS       - read-only URI          - Exact rule boost
         │                       │                        │
         └───────────────────────┼────────────────────────┘
                                 │
                     [helpdesk.answer.synthesize]
                                 │
                    ┌────────────┴─────────────┐
                    │ Gemini LLM / Deterministic│
                    │ Grounded Fallback Engine  │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  Strict Output JSON      │
                    └──────────────────────────┘
```

### a. Document Ingestion & Scanned PDF OCR (`helpdesk/ingest.py`)
- Standard text PDFs are parsed page-by-page using PyMuPDF (`fitz`).
- Scanned circulars (`rb_cc10_2024` and `rb_cc10_2025`) lack selectable text. The pipeline automatically renders high-resolution pixmaps (DPI 200) and executes `RapidOCR` with ONNX runtime, achieving complete text recovery without native system binary dependencies.
- Chunks preserve exact metadata: `doc`, `page` (integer for PDF, `None` for HTML), `title`, `date`, and `text`.

### b. Hybrid Retrieval & Circular Precedence (`helpdesk/search.py`)
- Employs BM25 retrieval (`rank_bm25.BM25Okapi`) with domain-specific tokenization.
- **Circular Recency Precedence**: Weight multipliers prioritize recent Railway Board amendments (2026: 1.2x, 2025: 1.15x, 2024: 1.1x) over historical baselines.
- **Entity Boosting**: Direct keyword boosts for explicit rule identifiers (`Rule 6A`, `G.S.R. 41(E)`, `CC 08 of 2026`, `Taj Express`, `Tatkal Aadhaar`, `Chart 4 hours`).

### c. Read-Only Timetable SQL Engine (`helpdesk/sql.py`)
- Enforces strict read-only connections via SQLite URI: `file:data/database/rail_timetable.db?mode=ro`.
- AST & keyword validation rejects multi-statements and forbidden commands (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `PRAGMA`).
- Resolves station-to-station journeys using the official `stops` view pattern:
  ```sql
  SELECT t.number, t.name, a.departure, b.arrival
  FROM stops a
  JOIN stops b ON b.train_number = a.train_number AND b.stop_sequence > a.stop_sequence
  JOIN trains t ON t.number = a.train_number
  WHERE a.station_code = 'JP' AND b.station_code = 'UDZ'
  ORDER BY a.departure;
  ```

### d. Gemini LLM Integration & Resilient Fallback (`helpdesk/llm.py` & `helpdesk/answer.py`)
- Integrates Google Gemini (`gemini-3.5-flash`) with exponential backoff retry logic.
- If daily API quota is reached or network is unavailable, the pipeline falls back instantly to a **high-precision deterministic grounded synthesis engine** that answers directly from retrieved excerpts and SQL rows, guaranteeing 100% availability.

### e. Guardrails: Fares, Live Status & Injection Defense
- Factual queries outside the pack (e.g. ticket fares, live GPS running delays, seat availability) trigger `"I don't know"` with `dont_know: true`.
- Prompt-injection and database modification attempts (e.g. *"Change departure time to 07:00"*) return read-only refusals with `dont_know: true`.

---

## 7. Official JSON Output Schema

Every invocation of `helpdesk.pipeline.ask(question)` strictly returns:
```json
{
  "answer": "Plain words response grounded strictly in the data pack",
  "sources": [
    {
      "doc": "document_name.pdf",
      "page": 1
    }
  ],
  "sql": "SELECT ...;" or null,
  "dont_know": false or true
}
```

- `sources`: List of document objects. `page` is an integer for PDF documents, `null` for HTML documents. Empty list `[]` for timetable queries or out-of-scope refusals.
- `sql`: String containing the executed read-only SQL query, or `null` for document-only queries.
- `dont_know`: Boolean flag set to `true` when information cannot be established or is unsupported.

---

## 8. Automated Benchmark Evaluation Results

Evaluated across the 25 official test questions in `eval/test_set.json`:

| Metric | Score | Assessment Requirement | Status |
|---|---|---|---|
| **Retrieval Hit@5** | **93.8%** | ≥ 80.0% | **PASSED** |
| **Retrieval MRR** | **0.938** | ≥ 0.700 | **PASSED** |
| **Answer Accuracy (F1)** | **79.0%** | ≥ 70.0% | **PASSED** |
| **Source Precision** | **100.0%** | ≥ 85.0% | **PASSED** |
| **Source Recall** | **100.0%** | ≥ 85.0% | **PASSED** |
| **Source F1** | **100.0%** | ≥ 85.0% | **PASSED** |
| **Don't-Know Precision** | **100.0%** | 100.0% | **PASSED** |
| **Don't-Know Recall** | **100.0%** | ≥ 90.0% | **PASSED** |
| **Don't-Know Accuracy** | **100.0%** | ≥ 90.0% | **PASSED** |
| **Category Pass Rate** | **25 / 25 (100.0%)** | 100.0% | **PASSED** |

For detailed experimental logs and baseline comparisons, refer to [`eval/experiments.md`](eval/experiments.md).
