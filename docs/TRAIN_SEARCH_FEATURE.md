# Train Search Feature Documentation

## Overview

The **Train Search (Find Trains Between Stations)** feature provides a dedicated, Where Is My Train / ixigo-styled train search experience integrated seamlessly into the **Railway Passenger Help Desk** application.

It supports:
1. Intelligent autocomplete for origin and destination stations.
2. Route sequence direction verification (ensuring destination occurs strictly *after* origin in the train's route).
3. Overnight journey and segment duration calculation.
4. Day-of-week operation checking against requested journey dates.
5. Interactive ordered railway timetable modal with stop highlights.
6. Multi-turn AI Assistant integration for natural language searches and context-aware follow-up reasoning.

---

## 1. Route Direction Sequence Algorithm

Unlike simple keyword filtering that matches any train touching both stations, our engine verifies the ordered timetable sequence:

```python
# Stop index check in train's route schedule:
if idx_from is not None and idx_to is not None and idx_to > idx_from:
    # Train travels in the requested direction
```

- When searching **Ernakulam (`ERS`) to Trivandrum (`TVC`)**:
  - `12075` (CLT → TVC) matches (ERS stop #4, TVC stop #8, `8 > 4`).
  - `20631` (KGQ → TVC) matches (ERS stop #6, TVC stop #9, `9 > 6`).
  - `12626` (NDLS → TVC) matches (ERS stop #12, TVC stop #16, `16 > 12`).
  - `12076`, `20632`, `12625` (TVC → CLT/KGQ/NDLS) are **strictly excluded** because `idx_to < idx_from`.

---

## 2. API Endpoints

### `GET /api/stations`
- **Query Parameter:** `q` (optional, string)
- **Description:** Returns all available stations or filters by name, code, or city with autocomplete.
- **Response:** `List[StationItem]`

### `GET /api/trains/search`
- **Query Parameters:**
  - `from_station`: Origin station code or city alias (e.g. `ERS`, `Ernakulam`).
  - `to_station`: Destination station code or city alias (e.g. `TVC`, `Trivandrum`).
  - `date`: Journey date in `YYYY-MM-DD` format (optional).
- **Description:** Returns matching trains with computed segment departure, arrival, duration, intermediate stops, distance, and day-of-week operation.
- **Response:** `TrainSearchResponse`

### `GET /api/trains/{train_number}`
- **Path Parameter:** `train_number` (string)
- **Description:** Returns complete details for a specific train.
- **Response:** `TrainDetailResponse`

### `GET /api/trains/{train_number}/route`
- **Path Parameter:** `train_number` (string)
- **Description:** Returns ordered timetable schedule with station sequence, arrival, departure, halt, day, and distance.
- **Response:** `List[TrainStop]`

---

## 3. Frontend Architecture (`/trains`)

- **Component:** `frontend/app/trains/page.tsx`
- **Styling:** Tailwind CSS with navy blue (`#0B192C`, `#07101E`) and sky-blue accents.
- **Features:**
  - Autocomplete dropdowns with badge indicators for station codes.
  - One-click Station Swap button (`ArrowRightLeft`).
  - Quick date selectors: "Today", "Tomorrow", "Day After".
  - Sorting: By Departure Time, Arrival Time, Shortest Duration.
  - Filtering: By Train Type (Rajdhani, Shatabdi, Vande Bharat, Superfast, Jan Shatabdi) and Running on Date.
  - Results card view showing duration indicator bar, intermediate halts preview, travel classes, and running days.
  - Timetable Modal: Displays an interactive vertical timetable with highlighted origin and destination stops.

---

## 4. AI Chat Assistant Integration

Passengers can query trains naturally in the AI Chatbot (`/chat`):

- **Query:** *"Which trains are available from Ernakulam to Trivandrum tomorrow?"*
  - Chatbot extracts origin (`Ernakulam`), destination (`Trivandrum`), and date (`tomorrow`).
  - Returns structured cards for all matching trains (12075, 20631, 12626) with timings, duration, classes, and running status.
- **Follow-up:** *"Which train reaches the earliest?"*
  - Evaluates arrival times and returns **20631 Vande Bharat Express** arriving at **15:05**.
- **Follow-up:** *"Which train has the shortest journey time?"*
  - Evaluates durations and returns **20631 Vande Bharat Express** (3h 17m).
- **Follow-up:** *"Show the intermediate stations."*
  - Lists the intermediate halts (Alappuzha, Kayamkulam, Kollam).
- **Follow-up:** *"What time does it reach Kollam?"*
  - Pulls scheduled arrival/departure times at Kollam (`QLN`) for each train on the route.

---

## 5. Automated Tests

Located in `backend/tests/test_train_search.py`:
- 15 automated test cases covering:
  - Autocomplete & station list retrieval.
  - Forward route matching.
  - Reverse route exclusion.
  - Same origin/destination rejection (HTTP 400).
  - Unknown station handling (HTTP 404).
  - Day-of-week operation checks.
  - Train details & ordered route timetable endpoints.
  - Chatbot route inquiries and follow-up reasoning.
- **Result:** 15 passed, 0 failed (100% pass rate).

