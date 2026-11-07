"""
helpdesk/sql.py - Safe SQLite interface and natural language to SQL converter.
Queries the read-only timetable database (rail_timetable.db).
Strictly enforces read-only access and rejects any mutating or dangerous SQL statements.
"""

import os
import re
import sqlite3
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("helpdesk.sql")

FORBIDDEN_KEYWORDS = [
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "REPLACE",
    "TRUNCATE", "ATTACH", "DETACH", "PRAGMA", "EXEC", "EXECUTE", "VACUUM"
]

TRAIN_TYPE_MAP = {
    "rajdhani": "Raj",
    "shatabdi": "Shtb",
    "jan shatabdi": "JShtb",
    "duronto": "Drnt",
    "garib rath": "GR",
    "sampark kranti": "SKr",
    "superfast": "SF",
    "express": "Exp",
    "mail": "Mail",
    "passenger": "Pass",
    "memu": "MEMU",
    "demu": "DEMU",
    "suburban": "Hyd"
}


def get_db_path() -> str:
    """Resolve database path from environment or default."""
    return os.getenv("DATABASE_PATH", "data/database/rail_timetable.db")


def validate_sql(sql: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that SQL query is strictly a read-only SELECT query.
    Returns (is_valid, error_reason).
    """
    if not sql or not sql.strip():
        return False, "Empty SQL query"
        
    cleaned = sql.strip().strip(";").strip()
    
    # Check for multiple statements
    if ";" in cleaned:
        return False, "Multi-statement SQL queries are not permitted"
        
    # Check starts with SELECT or WITH
    upper_sql = cleaned.upper()
    if not (upper_sql.startswith("SELECT") or upper_sql.startswith("WITH")):
        return False, "Only read-only SELECT queries are allowed"
        
    # Tokenize words to check for forbidden keywords
    tokens = set(re.findall(r"\b[A-Z]+\b", upper_sql))
    for forbidden in FORBIDDEN_KEYWORDS:
        if forbidden in tokens:
            return False, f"Forbidden SQL keyword detected: {forbidden}"
            
    return True, None


def execute_query(sql: str, db_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Execute read-only SQL query safely.
    """
    if db_path is None:
        db_path = get_db_path()
        
    is_valid, error = validate_sql(sql)
    if not is_valid:
        return {"sql": sql, "columns": [], "rows": [], "error": error}
        
    cleaned_sql = sql.strip()
    if not cleaned_sql.endswith(";"):
        cleaned_sql += ";"
        
    try:
        # Enforce read-only URI connection
        uri_path = f"file:{db_path}?mode=ro"
        conn = sqlite3.connect(uri_path, uri=True, timeout=5.0)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(cleaned_sql)
        rows_raw = cursor.fetchall()
        columns = [d[0] for d in cursor.description] if cursor.description else []
        rows = [list(r) for r in rows_raw]
        conn.close()
        
        return {
            "sql": cleaned_sql,
            "columns": columns,
            "rows": rows,
            "error": None
        }
    except Exception as e:
        logger.error(f"SQL execution error: {e}")
        return {
            "sql": cleaned_sql,
            "columns": [],
            "rows": [],
            "error": str(e)
        }


def resolve_station_code(query_part: str, db_path: Optional[str] = None) -> Optional[str]:
    """Find station code from station name or parenthetical code (e.g. 'Jaipur (JP)' -> 'JP')."""
    if not query_part:
        return None
        
    # Look for explicit code in parentheses e.g. (JP), (UDZ), (NDLS)
    code_match = re.search(r"\b([A-Z]{2,5})\b", query_part.strip("() "))
    if code_match:
        cand = code_match.group(1).upper()
        # Verify candidate exists in stations
        res = execute_query(f"SELECT code FROM stations WHERE code = '{cand}' LIMIT 1;", db_path)
        if res.get("rows"):
            return cand
            
    # Lookup by name
    clean_name = query_part.strip().strip("'\"")
    res = execute_query(f"SELECT code FROM stations WHERE name LIKE '%{clean_name}%' ORDER BY length(name) ASC LIMIT 1;", db_path)
    if res.get("rows"):
        return res["rows"][0][0]
        
    return None


def match_station_in_text(text: str, db_path: Optional[str] = None) -> List[Tuple[str, str]]:
    """Find stations mentioned in text (returns list of (station_code, station_name))."""
    # Check parenthesized codes first e.g. Jaipur (JP)
    matches = re.findall(r"([A-Za-z\s]+)\s*\(([A-Z]{2,5})\)", text)
    results = []
    for name, code in matches:
        results.append((code.upper(), name.strip()))
    if results:
        return results
        
    # Common stations dictionary for fast high-accuracy mapping
    common_stations = {
        "new delhi": "NDLS",
        "delhi": "DLI",
        "nizamuddin": "NZM",
        "h nizamuddin": "NZM",
        "mumbai central": "BCT",
        "mumbai cst": "CSTM",
        "mumbai": "BCT",
        "jaipur": "JP",
        "udaipur city": "UDZ",
        "udaipur": "UDZ",
        "bhopal": "BPL",
        "bangalore": "SBC",
        "bengaluru": "SBC",
        "chennai": "MAS",
        "howrah": "HWH",
        "kolkata": "KOAA",
        "gwalior": "GWL",
        "agra": "AGC",
        "varanasi": "BSB",
        "lucknow": "LKO",
        "patna": "PNBE"
    }
    
    t_lower = text.lower()
    for name, code in common_stations.items():
        if re.search(rf"\b{re.escape(name)}\b", t_lower):
            results.append((code, name))
            
    return results


def build_deterministic_sql(question: str) -> Optional[str]:
    """
    Construct high-precision SQL query for standard railway timetable questions.
    """
    q_lower = question.lower()
    
    # 1. Train name by number: "What is the name of train 12430?"
    train_num_match = re.search(r"\btrain\s*(?:no\.?|number)?\s*([0-9]{5})\b", q_lower)
    if not train_num_match:
        train_num_match = re.search(r"\b([0-9]{5})\b", q_lower)
        
    if "name of train" in q_lower or ("what is" in q_lower and "train" in q_lower and "called" in q_lower):
        if train_num_match:
            tnum = train_num_match.group(1)
            return f"SELECT number, name FROM trains WHERE number = '{tnum}';"
            
    # 2. Count by train type: "How many Rajdhani trains are in the timetable?"
    if "how many" in q_lower and ("train" in q_lower or "trains" in q_lower):
        for type_name, type_code in TRAIN_TYPE_MAP.items():
            if type_name in q_lower:
                return f"SELECT COUNT(*) FROM trains WHERE type_code = '{type_code}';"
                
    # 3. Trains from A to B: "Which trains go from Jaipur (JP) to Udaipur City (UDZ)?"
    from_to_match = re.search(r"from\s+([A-Za-z0-9\s\(\)]+?)\s+to\s+([A-Za-z0-9\s\(\)]+?)(?:\?|$|\.|\,)", question, re.IGNORECASE)
    if from_to_match:
        orig_raw = from_to_match.group(1).strip()
        dest_raw = from_to_match.group(2).strip()
        
        orig_code = resolve_station_code(orig_raw)
        dest_code = resolve_station_code(dest_raw)
        
        if orig_code and dest_code:
            return (
                f"SELECT t.number, t.name, a.departure, b.arrival "
                f"FROM stops a "
                f"JOIN stops b ON b.train_number = a.train_number AND b.stop_sequence > a.stop_sequence "
                f"JOIN trains t ON t.number = a.train_number "
                f"WHERE a.station_code = '{orig_code}' AND b.station_code = '{dest_code}' "
                f"ORDER BY a.departure;"
            )
            
    # 4. Departure / Leave query: "When does the Bhopal Shatabdi (12002) leave New Delhi..."
    if ("leave" in q_lower or "depart" in q_lower or "departure" in q_lower) and train_num_match:
        tnum = train_num_match.group(1)
        # Check station
        stations = match_station_in_text(question)
        if stations:
            stn_code = stations[0][0]
            return f"SELECT departure FROM schedules WHERE train_number = '{tnum}' AND station_code = '{stn_code}';"
            
    # 5. Arrival query: "When does train 12430 reach Bangalore?"
    if ("reach" in q_lower or "arrive" in q_lower or "arrival" in q_lower) and train_num_match:
        tnum = train_num_match.group(1)
        stations = match_station_in_text(question)
        if stations:
            stn_code = stations[0][0]
            return f"SELECT arrival FROM schedules WHERE train_number = '{tnum}' AND station_code = '{stn_code}';"
            
    return None

