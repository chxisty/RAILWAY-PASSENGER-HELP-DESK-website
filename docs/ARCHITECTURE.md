# Architecture & Ingestion Design: Railway Passenger Help Desk

This document explains the technical architecture, data processing, retrieval mechanisms, and grounding protocols powering the **Railway Passenger Help Desk**.

---

## 1. System Overview

```
                                      +------------------------------------+
                                      |        Passenger User Interface     |
                                      |  Next.js (App Router) + TypeScript |
                                      +------------------+-----------------+
                                                         |  REST API / JSON
                                                         v
                                      +------------------------------------+
                                      |         FastAPI Backend            |
                                      |    (Endpoints, CORS, Validation)   |
                                      +------------------+-----------------+
                                                         |
                                 +-----------------------+-----------------------+
                                 |                                               |
                                 v                                               v
                   +---------------------------+                   +---------------------------+
                   |  Intent & Entity Parser   |                   | Dynamic Dataset Ingestor  |
                   | - Train Numbers (\b\d{5}\b|                   | - data/ (.csv, .json,     |
                   | - Station Codes & Aliases |                   |   .xlsx, .txt, .md)       |
                   | - Route Extractor         |                   | - Header auto-mapping     |
                   | - Policy / Grievance      |                   | - In-Memory Hash Tables   |
                   +-------------+-------------+                   +-------------+-------------+
                                 |                                               |
                                 +-----------------------+-----------------------+
                                                         |
                                                         v
                                      +------------------------------------+
                                      |    Hybrid Grounding Engine         |
                                      | - Exact Hash Matches (Score 1.0)   |
                                      | - Domain Intent Boosting           |
                                      | - TF-IDF Bigram Vector Search      |
                                      +------------------+-----------------+
                                                         |
                                                         v
                                      +------------------------------------+
                                      |    Strict Grounding Synthesizer    |
                                      | - Multi-provider (Gemini / Local)  |
                                      | - Zero Hallucination Constraint    |
                                      | - Source Attribution & Follow-ups  |
                                      +------------------------------------+
```

---

## 2. Ingestion & Dynamic Schema Discovery

### 2.1 File Detection
The ingestion engine (`app/retrieval/engine.py`) automatically scans `data/` for:
- Tabular files: `.csv`, `.xlsx`
- Structured documents: `.json`
- Textual and Markdown circulars: `.txt`, `.md`

### 2.2 Flexible Field Mapping
Instead of relying on rigid schemas, the engine normalizes column headers (`lower()`, stripped, underscores replaced) and applies regex matching:
- **Train numbers**: `train_no`, `train_number`, `trainno`, `number`, `train_num`
- **Train names**: `train_name`, `name`, `trainname`
- **Station codes**: `station_code`, `stn_code`, `code`, `stn`
- **Station names**: `station_name`, `station`, `name`
- **Origins & Destinations**: `origin`, `source`, `from`, `destination`, `dest`, `to`
- **Timings**: `departure`, `dept_time`, `arrival`, `arr_time`
- **Facilities & Policies**: `facility`, `amenities`, `rule`, `policy`, `question`, `answer`

### 2.3 Baseline Fallback Mode
If no files exist in `data/`, the engine safely initializes with **33 verified, authentic Indian Railways baseline records** (real trains such as 12951, 20643, 12002; major stations NDLS, CSMT, MAS, SBC, HWH; official cancellation and refund charges; Tatkal booking windows; luggage allowances; and Rail Madad 139 protocols).

When an external dataset is extracted into `data/`, calling `POST /api/dataset/reload` or restarting the server immediately prioritizes and indexes the new data.

---

## 3. Retrieval Mechanisms

### 3.1 Exact Identifier Lookups
Exact numerical and code lookups bypass vector approximations to prevent hallucinations:
1. **Train Number Lookup**: 4-to-5 digit tokens map to `trains_by_number`.
2. **Station Code & Alias Lookup**: 2-to-5 uppercase characters and common city names (e.g. "Bangalore" -> `SBC`, "Bombay" -> `CSMT`) map directly to `stations_by_code`.
3. **Route Search**: Queries with "from X to Y" filter train origins and destinations.

### 3.2 Semantic / TF-IDF Vector Search
For general inquiries, passenger rules, concessions, and facility inquiries:
- Documents are chunked into self-contained text records with metadata.
- A `TfidfVectorizer` (unigrams + bigrams, sublinear TF) indexes all records.
- Cosine similarity identifies relevant policy clauses with adaptive thresholding.

### 3.3 Strict Grounding Prompt Contract
The LLM prompt enforces the following rules:
1. **No Out-of-Context Claims**: Answers are generated strictly from the retrieved chunks.
2. **Missing Information Declaration**: If a train number or policy is absent, the system states:
   > "I do not have official records regarding this query in the loaded railway dataset. Please verify with the railway enquiry counter or contact the 24x7 Rail Madad Helpline at 139."
3. **Emergency Elevation**: Any health, security, or safety query prominently features **139** and RPF/GRP assistance.

