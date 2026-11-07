# Evaluator Guide: Testing with 30 Hidden Questions

This guide is intended for examiners and evaluators assessing the **Railway Passenger Help Desk** application.

---

## 1. How to Load Your Assessment Dataset

1. Place your dataset file(s) into the `data/` folder:
   ```
   RAILWAY PASSENGER HELP DESK/
     data/
       your_trains.csv
       your_stations.xlsx
       your_policies.json
       (any supported format)
   ```
2. The dataset directory is ignored by `.gitignore` to ensure assessment confidentiality.
3. Reload the dataset without restarting the server:
   - Click the **"Reload Dataset"** button on the web Dashboard (`http://localhost:3000/dashboard`), or
   - Send an HTTP POST request:
     ```bash
     curl -X POST http://localhost:8000/api/dataset/reload
     ```
4. Verify that the Dashboard reports your new file count and total record tally.

---

## 2. Running Automated Tests

A dedicated 30-question evaluation suite is included in `backend/tests/test_assessment_questions.py`.

To execute the test suite:
```bash
# From project root
python -m pytest backend/tests/ -v
```

This verifies:
1. **Train Timetables & Schedules**: Exact departure/arrival lookups, intermediate stops, days of operation.
2. **Station Amenities & Lounges**: Wheelchair services, cloak rooms, executive lounges, RailWire Wi-Fi.
3. **Tatkal & Booking Regulations**: 10:00 AM AC / 11:00 AM Non-AC opening timings, 4 passenger limit per PNR.
4. **Cancellation & Refunds**: ₹240 (1A), ₹200 (2A), ₹180 (3A), ₹120 (Sleeper) flat deductions; waitlist auto-refunds.
5. **Luggage, Quotas & Concessions**: 40 kg free limit in 3A, lower berth quota (male 60+, female 45+), pet travel rules.
6. **Emergencies & Security**: Rail Madad (139), RPF (182), GRP (1512), lost & found procedures.
7. **Edge Cases**: Unknown trains (safe refusal, no hallucination), non-railway questions (OUT_OF_SCOPE rejection), misspelled station names.

---

## 3. Live Demonstration Checklist

1. **Ask Train Inquiries**:
   - *"What is the schedule of train 12951?"*
   - *"Which train runs between Chennai and Coimbatore?"*
2. **Ask Station Facility Inquiries**:
   - *"What facilities are available at New Delhi Railway Station (NDLS)?"*
   - *"Does Mumbai CSMT have emergency medical room facilities?"*
3. **Ask Policy Inquiries**:
   - *"What time does Tatkal booking open for AC coaches?"*
   - *"What is the cancellation charge for confirmed 3rd AC?"*
4. **Ask Emergency Inquiries**:
   - *"What is the railway emergency phone number?"*
   - *"How can a passenger get a doctor on a running train?"*
5. **Verify Source Attribution**:
   - Expand the **"Grounded Sources"** section below each answer to inspect the exact retrieved snippet and score.

