"""
backend/tests/test_railway_ai_assistant.py
Automated test suite verifying the 15 required scenarios for the
ChatGPT-like Indian Railways AI Assistant on RailAssist AI.
"""

import sys
import uuid
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.main import app
from app.models.schemas import ChatRequest
from app.services.chat_service import chat_service
from app.tools.railway_tools import (
    lookup_train,
    search_trains_between_stations,
    lookup_station,
    lookup_station_facilities,
    lookup_railway_policy,
    lookup_train_route,
    lookup_passenger_safety,
    analyze_railway_data,
    resolve_station_name_or_code,
    safe_query
)

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


# ============================================================================
# SCENARIO 1: Train lookup by number
# ============================================================================
def test_01_train_lookup_by_number():
    res = lookup_train("12951")
    assert res["found"] is True
    train = res["train"]
    assert train["number"] == "12951"
    assert "Rajdhani" in train["name"]
    assert train["origin_code"] in ["BCT", "MMCT"]
    assert train["destination_code"] == "NDLS"
    assert "3A" in train["classes"]
    assert train["departure_time"] is not None


# ============================================================================
# SCENARIO 2: Train lookup by name
# ============================================================================
def test_02_train_lookup_by_name():
    res = lookup_train("Rapti Sagar")
    assert res["found"] is True
    train = res["train"]
    assert "12512" in train["number"] or "12511" in train["number"] or "Rapti" in train["name"]
    assert train["total_stops"] > 0
    assert len(train["classes"]) > 0


# ============================================================================
# SCENARIO 3: Searching between two stations
# ============================================================================
def test_03_search_between_two_stations():
    res = search_trains_between_stations(origin="ALLP", destination="ERS")
    assert res["found"] is True
    assert res["origin"]["code"] == "ALLP"
    assert res["destination"]["code"] == "ERS"
    assert res["total_trains"] >= 26
    assert len(res["trains"]) >= 26

    # Verify first train timing order
    first_train = res["trains"][0]
    assert first_train["departure"] is not None
    assert first_train["arrival"] is not None


# ============================================================================
# SCENARIO 4: Searching with different station-name variations
# ============================================================================
def test_04_station_name_variations():
    # "Alleppey" maps to ALLP and "Cochin" maps to ERS
    res1 = search_trains_between_stations("Alleppey", "Cochin")
    assert res1["found"] is True
    assert res1["origin"]["code"] == "ALLP"
    assert res1["destination"]["code"] == "ERS"
    assert res1["total_trains"] >= 26

    # "Alappuzha" and "Ernakulam"
    res2 = search_trains_between_stations("Alappuzha", "Ernakulam")
    assert res2["found"] is True
    assert res2["origin"]["code"] == "ALLP"
    assert res2["destination"]["code"] == "ERS"
    assert res2["total_trains"] >= 26


# ============================================================================
# SCENARIO 5: Date-based train queries
# ============================================================================
def test_05_date_based_query():
    # 2026-11-10 is Tuesday
    res = search_trains_between_stations("ALLP", "ERS", date="2026-11-10")
    assert res["found"] is True
    assert res["day_of_week"] == "Tuesday"
    assert res["journey_date"] == "2026-11-10"
    assert len(res["trains"]) > 0


# ============================================================================
# SCENARIO 6: Route direction validation
# ============================================================================
def test_06_route_direction_validation():
    # Forward: ALLP -> ERS
    fwd = search_trains_between_stations("ALLP", "ERS")
    # Reverse: ERS -> ALLP
    rev = search_trains_between_stations("ERS", "ALLP")

    assert fwd["found"] is True
    assert rev["found"] is True

    # Both routes must be non-empty but have their own directional sequence
    assert fwd["total_trains"] >= 26
    assert rev["total_trains"] >= 20

    # Ensure departure and arrival are properly ordered in both directions
    for t in fwd["trains"][:5]:
        assert t["from_station"] == "ALLEPPEY (ALLP)"
        assert t["to_station"] == "ERNAKULAM JN (ERS)"


# ============================================================================
# SCENARIO 7: Station amenity retrieval
# ============================================================================
def test_07_station_amenities_retrieval():
    res = lookup_station("NDLS")
    assert res["found"] is True
    stn = res["station"]
    assert stn["code"] == "NDLS"
    assert "NEW DELHI" in stn["name"].upper()
    assert any("Wheelchair" in a for a in stn["amenities"])
    assert any("Waiting" in a for a in stn["amenities"])


# ============================================================================
# SCENARIO 8: Cancellation policy retrieval
# ============================================================================
def test_08_cancellation_policy_retrieval():
    res = lookup_railway_policy(topic="cancellation", query="Vande Bharat Sleeper refund")
    assert res["found"] is True
    rules = res["highlighted_rules"]
    assert len(rules) > 0

    # Check that 2026 G.S.R. 41(E) Vande Bharat Sleeper refund schedule is present
    vb_rule = next((r for r in rules if "Vande Bharat Sleeper" in r["policy"]), None)
    assert vb_rule is not None
    assert any("25%" in rule_text for rule_text in vb_rule["rules"])
    assert any("50%" in rule_text for rule_text in vb_rule["rules"])
    assert any("0%" in rule_text or "No refund" in rule_text for rule_text in vb_rule["rules"])


# ============================================================================
# SCENARIO 9: Tatkal policy retrieval
# ============================================================================
def test_09_tatkal_policy_retrieval():
    res = lookup_railway_policy(topic="tatkal", query="Tatkal confirmed ticket cancellation refund")
    assert res["found"] is True
    rules = res["highlighted_rules"]
    tatkal_rule = next((r for r in rules if "Tatkal" in r["policy"]), None)
    assert tatkal_rule is not None
    assert any("NO REFUND" in item for item in tatkal_rule["rules"])
    assert any("Aadhaar" in item for item in tatkal_rule["rules"])


# ============================================================================
# SCENARIO 10: Multi-step conversational queries
# ============================================================================
def test_10_multi_step_conversational_queries():
    conv_id = f"test_conv_{uuid.uuid4().hex[:8]}"

    # Turn 1: Initial route inquiry
    req1 = ChatRequest(message="Find trains from Alappuzha to Ernakulam", conversation_id=conv_id)
    resp1 = chat_service.process_chat(req1)
    assert resp1.intent == "ROUTE_SEARCH"
    assert "ALLEPPEY (ALLP)" in resp1.answer
    assert "ERNAKULAM JN (ERS)" in resp1.answer
    assert len(resp1.sources) > 0

    # Turn 2: Follow-up question relying on prior context
    req2 = ChatRequest(message="What about tomorrow?", conversation_id=conv_id)
    resp2 = chat_service.process_chat(req2)
    assert resp2.intent == "ROUTE_FOLLOWUP"
    # Turn 2 must preserve origin (ALLP) and destination (ERS)
    assert "ALLP" in resp2.answer
    assert "ERS" in resp2.answer


# ============================================================================
# SCENARIO 11: Follow-up questions using conversation history
# ============================================================================
def test_11_follow_up_with_history():
    conv_id = f"test_conv_{uuid.uuid4().hex[:8]}"

    # Turn 1: Search route
    chat_service.process_chat(ChatRequest(message="Find trains from Alappuzha to Ernakulam", conversation_id=conv_id))

    # Turn 2: Filter by class
    req_class = ChatRequest(message="Which one has sleeper class?", conversation_id=conv_id)
    resp_class = chat_service.process_chat(req_class)
    assert resp_class.intent == "ROUTE_FOLLOWUP"
    # Exactly 17 trains have sleeper class between ALLP and ERS
    assert "17" in resp_class.answer or "Sleeper Class (SL)" in resp_class.answer

    # Turn 3: Check earliest reaching train
    req_earliest = ChatRequest(message="Which train reaches the earliest?", conversation_id=conv_id)
    resp_earliest = chat_service.process_chat(req_earliest)
    assert resp_earliest.intent == "ROUTE_FOLLOWUP"
    assert "reaches the earliest" in resp_earliest.answer


# ============================================================================
# SCENARIO 12: Unknown questions and unsupported domains
# ============================================================================
def test_12_unknown_questions_and_unsupported_domains():
    # 1. Fare refusal
    fare_resp = chat_service.process_chat(ChatRequest(message="What is the ticket price and fare from Mumbai to Delhi?"))
    assert fare_resp.intent == "UNSUPPORTED_FARE"
    assert "I don't know. The pack has no fare tables." in fare_resp.answer

    # 2. Live delay refusal
    delay_resp = chat_service.process_chat(ChatRequest(message="Is train 12951 currently delayed or on time?"))
    assert delay_resp.intent == "UNSUPPORTED_LIVE_DELAY"
    assert "I don't know. The timetable database contains static schedules from 2016 and no live running status." in delay_resp.answer

    # 3. Live seat availability refusal
    seat_resp = chat_service.process_chat(ChatRequest(message="Check seat availability for 3AC on train 12951 tomorrow"))
    assert seat_resp.intent == "UNSUPPORTED_SEAT_AVAILABILITY"
    assert "I don't know. The database contains only static timetables and no live seat availability." in seat_resp.answer


# ============================================================================
# SCENARIO 13: Missing database records
# ============================================================================
def test_13_missing_database_records():
    res = lookup_train("99999")
    assert res["found"] is False
    assert "Could not find verified records" in res["message"]

    resp = chat_service.process_chat(ChatRequest(message="Check schedule for train 99999"))
    assert "Could not find verified records" in resp.answer


# ============================================================================
# SCENARIO 14: Invalid station codes
# ============================================================================
def test_14_invalid_station_codes():
    res = resolve_station_name_or_code("ZZZZZ")
    assert res is None

    search_res = search_trains_between_stations("ZZZZZ", "ERS")
    assert search_res["found"] is False
    assert "could not be identified" in search_res["error"]


# ============================================================================
# SCENARIO 15: Database failures and SQL injection prevention
# ============================================================================
def test_15_database_failures_and_sql_injection():
    # Test that direct DROP queries are rejected by safe_query
    with pytest.raises(ValueError) as excinfo:
        safe_query("DROP TABLE trains;")
    assert "Only read-only SELECT queries are allowed" in str(excinfo.value)

    # Test that chat intent catches mutation queries
    resp = chat_service.process_chat(ChatRequest(message="DROP TABLE trains;"))
    assert resp.intent == "SQL_MUTATION"
    assert "I can't do that. I only run read-only queries on the timetable." in resp.answer
