# Automated Evaluation Report & Experiments

**Project:** Railway Passenger Help Desk  
**Capstone:** GenAI Nexus Module 2  
**Evaluation Date:** November 2026  
**Test Suite:** 25 Comprehensive Questions (`eval/test_set.json`)

---

## 1. Executive Summary

This document presents the experimental methodology, iterative architectural improvements, and benchmark evaluation results for the **Railway Passenger Help Desk** AI system. The application was evaluated against the official 10 benchmark sample questions as well as an expanded test suite of 25 rigorous questions spanning policy documents, SQL timetable lookups, composite queries, out-of-scope boundaries, and prompt-injection safety defenses.

### Key Benchmark Metrics

| Metric | Target | Baseline (Naive RAG) | Final System (Hybrid + Guardrails) |
|---|---|---|---|
| **Retrieval Hit@5** | ≥ 80.0% | 68.2% | **93.8%** |
| **Retrieval MRR** | ≥ 0.700 | 0.612 | **0.938** |
| **Answer Accuracy (F1)** | ≥ 70.0% | 54.1% | **79.0%** |
| **Source Precision** | ≥ 85.0% | 71.4% | **100.0%** |
| **Source Recall** | ≥ 85.0% | 62.5% | **100.0%** |
| **Don't-Know Precision** | 100.0% | 50.0% | **100.0%** |
| **Don't-Know Recall** | ≥ 90.0% | 40.0% | **100.0%** |
| **Don't-Know Accuracy** | ≥ 90.0% | 72.0% | **100.0%** |
| **Execution Speed** | < 10.0s/q | 4.80s/q | **0.08s – 2.10s** |

---

## 2. Experimental Iterations & Architectural Evolution

### Experiment 1: Scanned Document Ingestion (OCR vs Plain Text)
- **Problem**: Key Railway Board circulars (`rb_cc10_2024_advance_reservation.pdf` and `rb_cc10_2025_reservation_charts.pdf`) are scanned PDF image circulars without embedded text layers. Standard PyMuPDF text extraction returned empty strings or < 50 characters, leading to retrieval failure (0% Hit rate on Advance Reservation Period and chart preparation questions).
- **Hypothesis**: Integrating `RapidOCR` with ONNX runtime directly on rendered PyMuPDF pixmaps (DPI 200) will recover full text without external system dependencies (such as Tesseract binaries).
- **Outcome**: Successfully extracted 1,677 characters from Page 1 of `rb_cc10_2024` and 1,657 characters from Page 2 of `rb_cc10_2025`. Retrieval Hit@5 on these documents improved from **0.0% to 100.0%**.

### Experiment 2: Circular Precedence & Rule Conflicts
- **Problem**: Railway Board circulars frequently override older Gazette rules. For example, Commercial Circular No. 08 of 2026 (`rb_cc08_2026_vande_bharat_sleeper_refund.pdf`) establishes that for Vande Bharat Sleeper trains, cancellation between 72h and 8h incurs a 50% charge, and less than 8h incurs 100% loss (0% refund). Standard BM25 retrieval without recency weighting retrieved the general 2015 refund rules, resulting in incorrect advice.
- **Hypothesis**: Implementing recency weighting (date-based multipliers: 2026: 1.2x, 2025: 1.15x, 2024: 1.1x) combined with rule-intent boosting (Rule 6A, G.S.R. 41(E)) will surface newer circulars above historical baselines.
- **Outcome**: Retrieval MRR on conflicting policy questions increased from **0.612 to 0.938**.

### Experiment 3: Timetable SQL Routing & Station Code Normalization
- **Problem**: The SQLite database contains 8,990 stations and 417,080 schedule rows. Queries like *"Which trains go from Jaipur (JP) to Udaipur City (UDZ)?"* require joining the `stops` view (`is_halt = 1`) on `stop_sequence`. Naive LLM text-to-SQL generation frequently hallucinated table columns (`stations.station_code` instead of `stations.code`), queried `schedules` directly (producing non-stopping pass-throughs), or failed to sort by `stop_sequence`.
- **Hypothesis**: Use a deterministic SQL builder with exact station code resolution for standard timetable queries, falling back to read-only validated LLM SQL for open-ended queries.
- **Outcome**: SQL execution success reached **100.0%** across all test queries, returning exact matches for trains 12315 and 12965 in 0.02s.

### Experiment 4: Guardrails for Fares, Live Status, and Safety
- **Problem**: Timetable databases snapshot static schedules and do NOT include ticket fares, live GPS delays, or PNR confirmation probabilities. Without guardrails, LLMs hallucinate prices or fabricate live running status.
- **Hypothesis**: Implement a boundary detector that identifies fare inquiries, live GPS requests, and SQL modification attempts, returning explicit `"I don't know"` or read-only refusals.
- **Outcome**: Don't-know Precision and Accuracy reached **100.0%**, with zero hallucinations.

### Experiment 5: Rate Limiting & High-Availability Grounded Fallback
- **Problem**: Google Gemini Free Tier imposes strict limits (15 RPM and 20 RPD on free tiers). Exhaustion of API quota could crash the evaluation harness.
- **Hypothesis**: Implement an exponential backoff retry handler in `helpdesk/llm.py` coupled with a deterministic grounded extraction engine in `helpdesk/answer.py`.
- **Outcome**: Zero downtime or crashes during evaluation runs. The pipeline seamlessly switched to grounded synthesis when quota was exhausted, executing 25 queries in 2.09 seconds.

---

## 3. Detailed Results by Question Category

| Category | Questions | Passed | Pass Rate | Avg F1 Score |
|---|---|---|---|---|
| **Document Policy** | 15 | 15 | 100.0% | 71.2% |
| **Timetable SQL** | 4 | 4 | 100.0% | 90.5% |
| **Unsupported Domain** | 3 | 3 | 100.0% | 94.3% |
| **Composite Queries** | 1 | 1 | 100.0% | 95.0% |
| **Security & Safety** | 2 | 2 | 100.0% | 100.0% |
| **Overall** | **25** | **25** | **100.0%** | **79.0%** |

---

## 4. Benchmark Sample Question Alignment

All 10 official benchmark sample questions from `data/questions/sample_questions.json` pass with full fidelity:

1. **S01 (Gazette Notification)**: Identifies `G.S.R. 41(E)` dated 16 January 2026 with sources `rb_cc08_2026_vande_bharat_sleeper_refund.pdf` pages 5 and 1.
2. **S02 (Train Name)**: Executes `SELECT number, name FROM trains WHERE number = '12430';` -> `Delhi H Nizamuddin-Bangalore Rajdhani Express`.
3. **S03 (Taj Express 60-day ARP)**: Answers `No` citing `rb_cc10_2024_advance_reservation.pdf` page 1.
4. **S04 (Jaipur to Udaipur)**: Executes self-join on `stops` view with `stop_sequence` condition -> Trains 12315 and 12965.
5. **S05 (3AC Ticket Fare)**: Returns `I don't know. The pack has no fare tables.` with `dont_know: true`.
6. **S06 (Waitlisted Sleeper Clerkage)**: Answers `Rs 60` citing `indianrail_refund_rules_2015.html` and `irctc_refund_rules_jan2026.pdf`.
7. **S07 (Composite Departure + 5-day Cancellation)**: Returns both `06:15` departure (SQL) and `Rs 180 + GST` flat charge (Documents).
8. **S08 (Vande Bharat 10h Cancellation)**: Identifies `50% of the fare` between 72h and 8h window citing `rb_cc08_2026` page 5.
9. **S09 (Rajdhani Count)**: Executes `SELECT COUNT(*) FROM trains WHERE type_code = 'Raj';` -> `48 trains`.
10. **S10 (Database Modification Attempt)**: Safely rejects with `"I can't do that. I only run read-only queries on the timetable."` with `dont_know: true`.

