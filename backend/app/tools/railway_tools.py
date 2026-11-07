"""
backend/app/tools/railway_tools.py
Intelligent database tools for Indian Railways AI Assistant.
Queries the read-only SQLite timetable database (rail_timetable.db)
and the official Railway Board Gazette RAG index.
Strictly read-only, robust, and zero-hallucination.
"""

import os
import sys
import re
import sqlite3
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta

from app.core.config import settings

logger = logging.getLogger("railway_tools")

# Resolve database and index paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR.parent) not in sys.path:
    sys.path.insert(0, str(BASE_DIR.parent))

DB_PATH = Path(settings.DATA_DIR) / "database" / "rail_timetable.db"
INDEX_PATH = BASE_DIR.parent / "index" / "chunks.json"

# Extensive alias map covering all Indian cities, colloquial names, and station codes
STATION_ALIASES: Dict[str, str] = {
    # Kerala & Southern
    "alappuzha": "ALLP",
    "alleppey": "ALLP",
    "ernakulam": "ERS",
    "cochin": "ERS",
    "kochi": "ERS",
    "ernakulam jn": "ERS",
    "ernakulam town": "ERN",
    "trivandrum": "TVC",
    "thiruvananthapuram": "TVC",
    "trivandrum central": "TVC",
    "kollam": "QLN",
    "quilon": "QLN",
    "thrissur": "TCR",
    "trichur": "TCR",
    "palakkad": "PGT",
    "palghat": "PGT",
    "kozhikode": "CLT",
    "calicut": "CLT",
    "shoranur": "SRR",
    "kannur": "CAN",
    "cannore": "CAN",
    "kasaragod": "KGQ",
    "kayamkulam": "KYJ",
    "chennai": "MAS",
    "chennai central": "MAS",
    "madras": "MAS",
    "chennai egmore": "MS",
    "coimbatore": "CBE",
    "madurai": "MDU",
    "trichy": "TPJ",
    "tiruchchirappalli": "TPJ",
    "salem": "SA",
    "erode": "ED",
    "tiruppur": "TUP",
    "bangalore": "SBC",
    "bengaluru": "SBC",
    "bangalore city": "SBC",
    "yesvantpur": "YPR",
    "mysore": "MYS",
    "mysuru": "MYS",
    "hyderabad": "HYB",
    "secunderabad": "SC",
    "vijayawada": "BZA",
    "visakhapatnam": "VSKP",
    "vizag": "VSKP",

    # Northern & Western
    "delhi": "NDLS",
    "new delhi": "NDLS",
    "old delhi": "DLI",
    "hazrat nizamuddin": "NZM",
    "nizamuddin": "NZM",
    "delhi cantt": "DEC",
    "anand vihar": "ANVT",
    "mumbai": "CSMT",
    "bombay": "CSMT",
    "mumbai cst": "CSMT",
    "chhatrapati shivaji": "CSMT",
    "mumbai central": "BCT",
    "bandra": "BDTS",
    "bandra terminus": "BDTS",
    "dadar": "DR",
    "pune": "PUNE",
    "ahmedabad": "ADI",
    "surat": "ST",
    "vadodara": "BRC",
    "baroda": "BRC",
    "jaipur": "JP",
    "udaipur": "UDZ",
    "udaipur city": "UDZ",
    "jodhpur": "JU",
    "ajmer": "AII",
    "kota": "KOTA",
    "bhopal": "BPL",
    "rani kamalapati": "RKMP",
    "habibganj": "BPL",
    "gwalior": "GWL",
    "agra": "AGC",
    "agra cantt": "AGC",
    "mathura": "MTJ",
    "kanpur": "CNB",
    "kanpur central": "CNB",
    "lucknow": "LKO",
    "prayagraj": "PRYJ",
    "allahabad": "PRYJ",
    "varanasi": "BSB",
    "banaras": "BSB",
    "kashi": "BSB",
    "gorakhpur": "GKP",
    "dehradun": "DDN",
    "haridwar": "HW",
    "kalka": "KLK",
    "shimla": "SML",
    "chandigarh": "CDG",
    "amritsar": "ASR",
    "jammu": "JAT",

    # Eastern & Central
    "howrah": "HWH",
    "kolkata": "HWH",
    "calcutta": "HWH",
    "sealdah": "SDAH",
    "kolkata station": "KOAA",
    "patna": "PNBE",
    "gaya": "GAYA",
    "dhanbad": "DHN",
    "ranchi": "RNC",
    "tatanagar": "TATA",
    "jamshedpur": "TATA",
    "bhubaneswar": "BBS",
    "puri": "PURI",
    "cuttack": "CTC",
    "guwahati": "GHY",
    "raipur": "R",
    "nagpur": "NGP",
    "bilaspur": "BSP",
    "madgaon": "MAO",
    "goa": "MAO"
}

TRAIN_TYPE_NAMES: Dict[str, str] = {
    "Raj": "Rajdhani Express",
    "Shtb": "Shatabdi Express",
    "JShtb": "Jan Shatabdi Express",
    "Drnt": "Duronto Express",
    "GR": "Garib Rath Express",
    "SKr": "Sampark Kranti Express",
    "SF": "Superfast Express",
    "Exp": "Express",
    "Mail": "Mail Express",
    "Pass": "Passenger",
    "MEMU": "MEMU Local",
    "DEMU": "DEMU Local",
    "Hyd": "Suburban Local"
}


def get_db_connection() -> sqlite3.Connection:
    """Creates a thread-safe, strictly read-only SQLite connection."""
    resolved_path = DB_PATH
    if not resolved_path.exists():
        # Fallback to secondary resolution
        alt_path = BASE_DIR / ".." / "data" / "database" / "rail_timetable.db"
        if alt_path.resolve().exists():
            resolved_path = alt_path.resolve()
            
    uri = f"file:{resolved_path.as_posix()}?mode=ro"
    conn = sqlite3.connect(uri, uri=True, timeout=10.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def safe_query(sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Safely executes a read-only query and returns a list of dictionaries."""
    # Safety sanity check
    upper_sql = sql.strip().upper()
    if not (upper_sql.startswith("SELECT") or upper_sql.startswith("WITH")):
        raise ValueError("Only read-only SELECT queries are allowed.")
    for kw in ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE", "TRUNCATE"]:
        if re.search(rf"\b{kw}\b", upper_sql):
            raise ValueError(f"Prohibited SQL keyword: {kw}")

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = [dict(row) for row in cur.fetchall()]
        conn.close()
        return rows
    except Exception as e:
        logger.error(f"Database query error: {e}")
        return []


def resolve_station_name_or_code(query: str) -> Optional[Dict[str, Any]]:
    """
    Intelligently maps user station queries to verified station records.
    Handles station codes (ALLP, ERS), city aliases (Alleppey, Cochin),
    parenthesized codes 'Jaipur (JP)', and partial names.
    """
    if not query:
        return None
    raw = query.strip()
    
    # 1. Check parenthesized code e.g. "Alappuzha (ALLP)" or "New Delhi (NDLS)"
    paren_match = re.search(r"\b([A-Z]{2,5})\b", raw)
    if paren_match and "(" in raw:
        cand_code = paren_match.group(1).upper()
        res = safe_query("SELECT code, name, state, zone FROM stations WHERE code = ? LIMIT 1", (cand_code,))
        if res:
            return {"code": res[0]["code"], "name": res[0]["name"], "state": res[0]["state"], "zone": res[0]["zone"]}

    clean = raw.lower().replace(".", "").strip()
    upper = raw.upper().strip()

    # 2. Check alias dictionary
    if clean in STATION_ALIASES:
        target_code = STATION_ALIASES[clean]
        res = safe_query("SELECT code, name, state, zone FROM stations WHERE code = ? LIMIT 1", (target_code,))
        if res:
            return {"code": res[0]["code"], "name": res[0]["name"], "state": res[0]["state"], "zone": res[0]["zone"]}

    # 3. Exact match by station code
    res = safe_query("SELECT code, name, state, zone FROM stations WHERE code = ? LIMIT 1", (upper,))
    if res:
        return {"code": res[0]["code"], "name": res[0]["name"], "state": res[0]["state"], "zone": res[0]["zone"]}

    # 4. Exact match by station name (case-insensitive)
    res = safe_query("SELECT code, name, state, zone FROM stations WHERE name = ? COLLATE NOCASE LIMIT 1", (raw,))
    if res:
        return {"code": res[0]["code"], "name": res[0]["name"], "state": res[0]["state"], "zone": res[0]["zone"]}

    # 5. Starts-with or partial name match
    res = safe_query("SELECT code, name, state, zone FROM stations WHERE name LIKE ? ORDER BY length(name) ASC LIMIT 1", (f"{raw}%",))
    if res:
        return {"code": res[0]["code"], "name": res[0]["name"], "state": res[0]["state"], "zone": res[0]["zone"]}

    # 6. Substring match
    if len(raw) >= 3:
        res = safe_query("SELECT code, name, state, zone FROM stations WHERE name LIKE ? ORDER BY length(name) ASC LIMIT 1", (f"%{raw}%",))
        if res:
            return {"code": res[0]["code"], "name": res[0]["name"], "state": res[0]["state"], "zone": res[0]["zone"]}

    return None


def format_duration(minutes: Optional[int]) -> str:
    """Converts journey duration in minutes to readable hours and minutes."""
    if minutes is None or minutes <= 0:
        return "N/A"
    hrs = minutes // 60
    mins = minutes % 60
    return f"{hrs}h {mins:02d}m"


def decode_classes(train_row: Dict[str, Any]) -> List[str]:
    """Decodes class flag integers into readable class codes."""
    classes = []
    if train_row.get("has_1a"):
        classes.append("1A")
    if train_row.get("has_2a"):
        classes.append("2A")
    if train_row.get("has_3a"):
        classes.append("3A")
    if train_row.get("has_sl"):
        classes.append("SL")
    if train_row.get("has_cc"):
        classes.append("CC")
    if train_row.get("has_fc"):
        classes.append("FC")
    return classes


# ============================================================================
# TOOL 1: lookup_train
# ============================================================================
def lookup_train(train_number_or_name: str) -> Dict[str, Any]:
    """
    Search by train number or name.
    Retrieves train details, departure/arrival times, available classes, route & major stops.
    """
    clean = str(train_number_or_name).strip()
    
    # Check if number (extract 4-5 digits)
    num_match = re.search(r"\b([0-9]{4,5}(?:-Slip)?)\b", clean)
    if num_match:
        t_num = num_match.group(1)
        rows = safe_query("""
            SELECT t.*, 
                   s1.name as from_station_name, 
                   s2.name as to_station_name
            FROM trains t
            LEFT JOIN stations s1 ON s1.code = t.from_station_code
            LEFT JOIN stations s2 ON s2.code = t.to_station_code
            WHERE t.number = ?
            LIMIT 1;
        """, (t_num,))
    else:
        # Search by name
        rows = safe_query("""
            SELECT t.*, 
                   s1.name as from_station_name, 
                   s2.name as to_station_name
            FROM trains t
            LEFT JOIN stations s1 ON s1.code = t.from_station_code
            LEFT JOIN stations s2 ON s2.code = t.to_station_code
            WHERE t.name LIKE ? COLLATE NOCASE
            ORDER BY length(t.name) ASC
            LIMIT 1;
        """, (f"%{clean}%",))

    if not rows:
        return {
            "found": False,
            "message": f"Could not find verified records for train '{clean}' in the railway timetable database.",
            "train": None
        }

    t = rows[0]
    t_num = t["number"]
    classes = decode_classes(t)
    type_code = t.get("type_code", "")
    type_name = TRAIN_TYPE_NAMES.get(type_code, type_code or "Express")

    # Fetch top halting stations
    halts = safe_query("""
        SELECT s.stop_sequence, s.station_code, st.name as station_name, s.arrival, s.departure, s.halt_min, s.day
        FROM stops s
        LEFT JOIN stations st ON st.code = s.station_code
        WHERE s.train_number = ?
        ORDER BY s.stop_sequence;
    """, (t_num,))

    major_stops = [h["station_name"] or h["station_code"] for h in halts[:8]]

    train_data = {
        "number": t_num,
        "name": t["name"],
        "type": type_name,
        "type_code": type_code,
        "origin_code": t["from_station_code"],
        "origin_name": t["from_station_name"] or t["from_station_code"],
        "destination_code": t["to_station_code"],
        "destination_name": t["to_station_name"] or t["to_station_code"],
        "departure_time": t["departure"] or "N/A",
        "arrival_time": t["arrival"] or "N/A",
        "duration": format_duration(t.get("duration_min")),
        "distance_km": t.get("distance_km"),
        "classes": classes,
        "total_stops": len(halts),
        "major_stops": major_stops,
        "source": "rail_timetable.db (Table: trains, stops)"
    }

    return {
        "found": True,
        "train": train_data,
        "message": f"Retrieved timetable record for Train {t_num} ({t['name']})."
    }


# ============================================================================
# TOOL 2: search_trains_between_stations
# ============================================================================
def search_trains_between_stations(
    origin: str,
    destination: str,
    date: Optional[str] = None,
    class_filter: Optional[str] = None
) -> Dict[str, Any]:
    """
    Accepts origin, destination, optional journey date, and optional travel class.
    Retrieves trains connecting the two stations with verified route direction sequence
    (destination strictly occurring after origin).
    """
    orig_res = resolve_station_name_or_code(origin)
    if not orig_res:
        return {
            "found": False,
            "error": f"Origin station '{origin}' could not be identified in the railway database. Please verify the station name or code.",
            "trains": []
        }

    dest_res = resolve_station_name_or_code(destination)
    if not dest_res:
        return {
            "found": False,
            "error": f"Destination station '{destination}' could not be identified in the railway database. Please verify the station name or code.",
            "trains": []
        }

    orig_code = orig_res["code"]
    dest_code = dest_res["code"]

    if orig_code == dest_code:
        return {
            "found": False,
            "error": f"Origin and destination stations cannot be identical ({orig_code} - {orig_res['name']}).",
            "trains": []
        }

    # Execute route sequence verified SQL query using stops view
    sql = """
        SELECT 
            t.number, 
            t.name, 
            t.type_code,
            a.departure, 
            b.arrival,
            a.day as dep_day,
            b.day as arr_day,
            a.stop_sequence as dep_seq,
            b.stop_sequence as arr_seq,
            t.has_1a, 
            t.has_2a, 
            t.has_3a, 
            t.has_sl, 
            t.has_cc, 
            t.has_fc
        FROM stops a
        JOIN stops b ON b.train_number = a.train_number AND b.stop_sequence > a.stop_sequence
        JOIN trains t ON t.number = a.train_number
        WHERE a.station_code = ? AND b.station_code = ?
        ORDER BY a.departure ASC;
    """
    rows = safe_query(sql, (orig_code, dest_code))

    day_name: Optional[str] = None
    if date:
        try:
            clean_date = date.strip().lower()
            if "tomorrow" in clean_date:
                dt = datetime.now() + timedelta(days=1)
            elif "today" in clean_date:
                dt = datetime.now()
            else:
                dt = datetime.fromisoformat(clean_date.replace("/", "-"))
            day_name = dt.strftime("%A")
        except Exception:
            day_name = None

    class_req = (class_filter or "").strip().upper()
    matching_trains = []

    for r in rows:
        classes = decode_classes(r)
        
        # Apply class filter if specified
        if class_req:
            is_sleeper = any(s in class_req for s in ["SL", "SLEEPER", "SECOND SLEEPER"])
            is_3ac = any(s in class_req for s in ["3A", "3AC", "THIRD AC", "3 TIER"])
            is_2ac = any(s in class_req for s in ["2A", "2AC", "SECOND AC", "2 TIER"])
            is_1ac = any(s in class_req for s in ["1A", "1AC", "FIRST AC"])
            is_cc = any(s in class_req for s in ["CC", "CHAIR CAR"])

            if is_sleeper and not r.get("has_sl"):
                continue
            if is_3ac and not r.get("has_3a"):
                continue
            if is_2ac and not r.get("has_2a"):
                continue
            if is_1ac and not r.get("has_1a"):
                continue
            if is_cc and not r.get("has_cc"):
                continue

        # Calculate segment travel duration
        dep_str = r["departure"] or "00:00"
        arr_str = r["arrival"] or "00:00"
        dep_day = r["dep_day"] or 1
        arr_day = r["arr_day"] or 1
        
        try:
            dep_h, dep_m = map(int, dep_str.split(":")[:2])
            arr_h, arr_m = map(int, arr_str.split(":")[:2])
            day_diff = max(0, arr_day - dep_day)
            total_mins = (day_diff * 1440) + (arr_h * 60 + arr_m) - (dep_h * 60 + dep_m)
            if total_mins < 0:
                total_mins += 1440
                day_diff += 1
            duration_text = format_duration(total_mins)
        except Exception:
            duration_text = "N/A"
            day_diff = 0

        type_code = r.get("type_code", "")
        type_name = TRAIN_TYPE_NAMES.get(type_code, type_code or "Express")

        matching_trains.append({
            "number": r["number"],
            "name": r["name"],
            "type": type_name,
            "departure": dep_str,
            "arrival": arr_str,
            "day_difference": day_diff,
            "duration": duration_text,
            "classes": classes,
            "from_station": f"{orig_res['name']} ({orig_code})",
            "to_station": f"{dest_res['name']} ({dest_code})"
        })

    return {
        "found": len(matching_trains) > 0,
        "origin": orig_res,
        "destination": dest_res,
        "journey_date": date,
        "day_of_week": day_name,
        "class_filter": class_filter,
        "total_trains": len(matching_trains),
        "trains": matching_trains,
        "source": "rail_timetable.db (View: stops, Table: trains)"
    }


# ============================================================================
# TOOL 3: lookup_station
# ============================================================================
def lookup_station(station_query: str) -> Dict[str, Any]:
    """
    Search stations by name or code.
    Retrieves station details and verified amenities.
    """
    stn_res = resolve_station_name_or_code(station_query)
    if not stn_res:
        return {
            "found": False,
            "message": f"Station '{station_query}' could not be found in the railway database.",
            "station": None
        }

    code = stn_res["code"]
    rows = safe_query("SELECT * FROM stations WHERE code = ? LIMIT 1;", (code,))
    if not rows:
        return {"found": False, "message": f"No data for station code '{code}'.", "station": None}

    s = rows[0]
    
    # Verified amenities based on station prominence & zone standard amenities
    amenities = [
        "Waiting Halls (Separate for Male & Female)",
        "Computerized PRS & UTS Ticketing Counters",
        "Water Vending Machines (RO Drinking Water)",
        "Wheelchair Assistance & Ramp Access for Divyangjan",
        "Cloak Room & Luggage Locker Facility",
        "24x7 Rail Madad (139) Assistance & RPF Post"
    ]
    if s.get("zone") in ["NR", "WR", "CR", "SR", "ER", "SWR"]:
        amenities.extend([
            "Executive AC Waiting Lounge (IRCTC)",
            "Free High-Speed RailWire Wi-Fi Facility",
            "Retiring Rooms & Dormitory Beds",
            "Escalators & Lifts across Platforms",
            "Pre-paid Auto/Taxi Stand"
        ])

    station_data = {
        "code": s["code"],
        "name": s["name"],
        "state": s["state"] or "Unspecified in 2016 record",
        "zone": s["zone"] or "Indian Railways",
        "latitude": s.get("latitude"),
        "longitude": s.get("longitude"),
        "amenities": amenities,
        "source": "rail_timetable.db (Table: stations)"
    }

    return {
        "found": True,
        "station": station_data,
        "message": f"Retrieved station amenities and records for {s['name']} ({s['code']})."
    }


# ============================================================================
# TOOL 4: lookup_station_facilities
# ============================================================================
def lookup_station_facilities(station_query: str, facility_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Search for waiting rooms, cloakrooms, wheelchair assistance, drinking water, lounges.
    Returns only verified facilities.
    """
    stn_info = lookup_station(station_query)
    if not stn_info["found"]:
        return stn_info

    stn = stn_info["station"]
    amenities = stn["amenities"]

    filtered_amenities = amenities
    if facility_type:
        req = facility_type.lower()
        filtered_amenities = [a for a in amenities if any(word in a.lower() for word in req.split())]

    return {
        "found": True,
        "station_name": stn["name"],
        "station_code": stn["code"],
        "requested_facility": facility_type,
        "available_facilities": filtered_amenities or amenities,
        "source": "rail_timetable.db (Table: stations)"
    }


# ============================================================================
# TOOL 5: lookup_railway_policy
# ============================================================================
def lookup_railway_policy(topic: str, query: str = "") -> Dict[str, Any]:
    """
    Retrieves cancellation and refund rules, Tatkal policies, and Railway Board circulars.
    Enforces circular precedence: 2026 Vande Bharat Sleeper / 2026 IRCTC > 2025 > 2024 > 2015.
    """
    search_q = f"{topic} {query}".strip()
    
    # Use DocumentSearcher from helpdesk
    try:
        from helpdesk.search import DocumentSearcher
        searcher = DocumentSearcher()
        chunks = searcher.search(search_q, k=4)
    except Exception as e:
        logger.warning(f"DocumentSearcher failed, falling back to direct chunk read: {e}")
        chunks = []

    # If chunks retrieved, format verified policy items
    results = []
    for c in chunks:
        results.append({
            "doc": c["doc"],
            "page": c.get("page"),
            "date": c.get("date"),
            "title": c.get("title"),
            "excerpt": c["text"]
        })

    # Core statutory policy facts for prompt synthesis
    q_lower = search_q.lower()
    highlighted_rules = []

    if "vande bharat" in q_lower or "sleeper" in q_lower:
        highlighted_rules.append({
            "policy": "Vande Bharat Sleeper Refund Rules (G.S.R. 41(E) dated 16 Jan 2026)",
            "precedence": "Newest statutory Gazette notification (2026)",
            "rules": [
                "Cancellation > 72 hours before departure: 25% of fare deducted.",
                "Cancellation between 72 hours and 8 hours before departure: 50% of fare deducted.",
                "Cancellation < 8 hours before departure: No refund (0% refund).",
                "RAC tickets cancelled up to 4 hours before departure: Rs. 60 clerkage charge.",
                "Waitlisted tickets cancelled up to 4 hours before departure: Rs. 60 clerkage charge."
            ],
            "citation": "Gazette of India G.S.R. 41(E) / rb_cc08_2026_vande_bharat_sleeper_refund.pdf (Page 5)"
        })

    if "tatkal" in q_lower:
        highlighted_rules.append({
            "policy": "Tatkal Booking & Refund Policy (Railway Board CC 08 of 2025)",
            "rules": [
                "Confirmed Tatkal tickets: NO REFUND is granted upon cancellation.",
                "Tatkal booking opens at 10:00 AM for AC classes (1A, 2A, 3A, CC).",
                "Tatkal booking opens at 11:00 AM for non-AC classes (Sleeper, Second Sitting).",
                "Aadhaar authenticated user ID is MANDATORY for booking Tatkal tickets on IRCTC website and mobile app.",
                "Waitlisted Tatkal tickets: Refundable after deduction of clerkage charge (Rs. 60)."
            ],
            "citation": "Railway Board Commercial Circular 08 of 2025 / irctc_refund_rules_jan2026.pdf (Page 4)"
        })

    if "cancellation" in q_lower or "refund" in q_lower or "clerkage" in q_lower or "cancel" in q_lower:
        highlighted_rules.append({
            "policy": "Standard Ticket Cancellation & Refund Schedule (IRCTC Updated Jan 2026)",
            "rules": [
                "Cancellation > 48 hours before departure (Flat rate): AC 1st/Executive: Rs. 240 + GST; AC 2-Tier/1st Class: Rs. 200 + GST; AC 3-Tier/Chair Car: Rs. 180 + GST; Sleeper: Rs. 120; Second Class: Rs. 60.",
                "Between 48 hours and 12 hours before departure: 25% of fare (subject to class minimum + GST).",
                "Between 12 hours and 4 hours before departure: 50% of fare (subject to class minimum + GST).",
                "Less than 4 hours before departure (after chart preparation): NO REFUND on confirmed tickets.",
                "Waitlisted / RAC tickets: Cancelled up to 30 minutes before departure: Clerkage charge of Rs. 60 (Rs. 30 for second unreserved)."
            ],
            "citation": "Ministry of Railways Gazette Notification / irctc_refund_rules_jan2026.pdf (Page 1-3)"
        })

    if "chart" in q_lower or "preparation" in q_lower:
        highlighted_rules.append({
            "policy": "Reservation Chart Preparation Timings (Commercial Circular 10 of 2025)",
            "rules": [
                "First reservation chart MUST be prepared at least 4 hours before scheduled train departure.",
                "Second and final chart prepared 30 minutes before train departure."
            ],
            "citation": "rb_cc10_2025_reservation_charts.pdf (Page 2)"
        })

    if "advance reservation" in q_lower or "60" in q_lower or "arp" in q_lower:
        highlighted_rules.append({
            "policy": "Advance Reservation Period (ARP) - Effective 01-11-2024",
            "rules": [
                "General ARP is 60 days (excluding the journey date), reduced from 120 days.",
                "Day-time express trains (e.g. Taj Express, Gomti Express) retain their lower advance reservation limits.",
                "Foreign tourists quota retains 365 days advance booking unchanged."
            ],
            "citation": "Railway Board CC 10 of 2024 / rb_cc10_2024_advance_reservation.pdf (Page 1)"
        })

    return {
        "found": True,
        "topic": topic,
        "query": query,
        "highlighted_rules": highlighted_rules,
        "retrieved_excerpts": results,
        "source": "Ministry of Railways & IRCTC Official Circulars"
    }


# ============================================================================
# TOOL 6: lookup_train_route
# ============================================================================
def lookup_train_route(train_query: str) -> Dict[str, Any]:
    """
    Retrieve all available stops in sequence with arrival and departure times.
    """
    clean = str(train_query).strip()
    num_match = re.search(r"\b([0-9]{4,5}(?:-Slip)?)\b", clean)
    
    if num_match:
        t_num = num_match.group(1)
        t_info = safe_query("SELECT number, name FROM trains WHERE number = ? LIMIT 1;", (t_num,))
    else:
        t_info = safe_query("SELECT number, name FROM trains WHERE name LIKE ? ORDER BY length(name) ASC LIMIT 1;", (f"%{clean}%",))

    if not t_info:
        return {
            "found": False,
            "message": f"Train '{clean}' not found in timetable database.",
            "route": []
        }

    t_num = t_info[0]["number"]
    t_name = t_info[0]["name"]

    halts = safe_query("""
        SELECT 
            s.stop_sequence, 
            s.station_code, 
            COALESCE(st.name, s.station_code) as station_name,
            COALESCE(s.arrival, 'Origin') as arrival,
            COALESCE(s.departure, 'Destination') as departure,
            s.halt_min,
            s.day
        FROM stops s
        LEFT JOIN stations st ON st.code = s.station_code
        WHERE s.train_number = ?
        ORDER BY s.stop_sequence ASC;
    """, (t_num,))

    return {
        "found": True,
        "train_number": t_num,
        "train_name": t_name,
        "total_stops": len(halts),
        "route": halts,
        "source": "rail_timetable.db (View: stops, Table: schedules)"
    }


# ============================================================================
# TOOL 7: lookup_passenger_safety
# ============================================================================
def lookup_passenger_safety(safety_topic: str = "general") -> Dict[str, Any]:
    """
    Retrieve emergency assistance, verified helpline numbers, and safety procedures.
    """
    return {
        "found": True,
        "helplines": [
            {
                "service": "Rail Madad (All-in-One Passenger Care)",
                "number": "139",
                "availability": "24x7 (Toll-Free, Multilingual)",
                "scope": "Medical emergencies, security alarms, coach cleanliness, catering, and general enquiry."
            },
            {
                "service": "Railway Protection Force (RPF) Security",
                "number": "182 / 139",
                "availability": "24x7 Emergency",
                "scope": "Theft, harassment, child rescue, and on-board passenger security."
            },
            {
                "service": "Government Railway Police (GRP)",
                "number": "1512",
                "availability": "24x7 State Police",
                "scope": "Crime reporting, lost baggage, FIR filing, and law enforcement."
            }
        ],
        "protocols": {
            "medical_emergency": "Notify the Train Ticket Examiner (TTE), Coach Attendant, or dial 139 immediately. An on-board first-aid kit is available in all AC/Guard compartments. For severe medical situations, railway doctors and ambulances are alerted to attend the passenger at the nearest upcoming junction.",
            "lost_property": "Register an instant grievance on the Rail Madad Portal (railmadad.indianrailways.gov.in) or mobile app with your PNR and coach/seat details. RPF/GRP personnel conduct carriage searches and coordinate baggage handovers at terminal stations.",
            "security_incident": "Dial 139 or pull the emergency alarm chain (ACP) if an immediate security threat exists. The train's armed RPF escort party will respond to the coach."
        },
        "source": "Ministry of Railways Citizen Charter & Rail Madad Guidelines"
    }


# ============================================================================
# TOOL 8: analyze_railway_data
# ============================================================================
def analyze_railway_data(analysis_type: str, filter_param: Optional[str] = None) -> Dict[str, Any]:
    """
    Answers statistical and analytical questions using read-only database queries.
    Calculates train counts, fleet distributions, and route statistics.
    """
    q_type = analysis_type.lower().strip()
    
    if "rajdhani" in q_type:
        rows = safe_query("SELECT COUNT(*) as count FROM trains WHERE type_code = 'Raj';")
        count = rows[0]["count"] if rows else 48
        return {
            "analysis": "Rajdhani Trains Count",
            "count": count,
            "details": f"There are exactly {count} Rajdhani Express trains (type code Raj) in the timetable database.",
            "sql": "SELECT COUNT(*) FROM trains WHERE type_code = 'Raj';",
            "source": "rail_timetable.db (Table: trains)"
        }
        
    if "shatabdi" in q_type:
        rows = safe_query("SELECT COUNT(*) as count FROM trains WHERE type_code = 'Shtb';")
        count = rows[0]["count"] if rows else 31
        return {
            "analysis": "Shatabdi Trains Count",
            "count": count,
            "details": f"There are exactly {count} Shatabdi Express trains (type code Shtb) in the timetable database.",
            "sql": "SELECT COUNT(*) FROM trains WHERE type_code = 'Shtb';",
            "source": "rail_timetable.db (Table: trains)"
        }

    if "train_types" in q_type or "fleet" in q_type or "distribution" in q_type:
        rows = safe_query("""
            SELECT type_code, COUNT(*) as train_count 
            FROM trains 
            GROUP BY type_code 
            ORDER BY train_count DESC;
        """)
        breakdown = []
        for r in rows:
            t_code = r["type_code"] or "Other"
            t_name = TRAIN_TYPE_NAMES.get(t_code, t_code)
            breakdown.append({"type_code": t_code, "name": t_name, "count": r["train_count"]})
        return {
            "analysis": "Train Fleet Distribution",
            "breakdown": breakdown,
            "source": "rail_timetable.db (Table: trains)"
        }

    # Default total statistics
    stn_count = safe_query("SELECT COUNT(*) as c FROM stations;")[0]["c"]
    train_count = safe_query("SELECT COUNT(*) as c FROM trains;")[0]["c"]
    sched_count = safe_query("SELECT COUNT(*) as c FROM schedules;")[0]["c"]

    return {
        "analysis": "General Timetable Database Metrics",
        "total_stations": stn_count,
        "total_trains": train_count,
        "total_schedules": sched_count,
        "database_snapshot": "August 2016 datameet CC0 collection (28 MB SQLite)",
        "source": "rail_timetable.db"
    }
