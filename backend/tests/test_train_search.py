import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_get_stations_endpoint(client):
    response = client.get("/api/stations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 15
    codes = [s["station_code"] for s in data]
    assert "NDLS" in codes
    assert "ERS" in codes
    assert "TVC" in codes

def test_get_stations_filter(client):
    response = client.get("/api/stations?q=Ernakulam")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any("Ernakulam" in s["station_name"] or s["station_code"] == "ERS" for s in data)

def test_search_trains_valid_route_ers_to_tvc(client):
    response = client.get("/api/trains/search?from_station=ERS&to_station=TVC")
    assert response.status_code == 200
    data = response.json()
    assert data["from_station"]["station_code"] == "ERS"
    assert data["to_station"]["station_code"] == "TVC"
    assert data["total_trains"] >= 2
    
    train_nums = [t["train_number"] for t in data["trains"]]
    # 12075, 20631, 12626 run from ERS to TVC
    assert "12075" in train_nums
    assert "20631" in train_nums
    
    # Check direction sequence: TVC -> ERS trains must NOT be included!
    assert "12076" not in train_nums
    assert "20632" not in train_nums
    assert "12625" not in train_nums

    # Verify duration and intermediate stops are computed
    for t in data["trains"]:
        assert "duration" in t
        assert t["duration_minutes"] > 0
        assert "classes" in t
        assert len(t["classes"]) > 0

def test_search_trains_reverse_route_tvc_to_ers(client):
    response = client.get("/api/trains/search?from_station=TVC&to_station=ERS")
    assert response.status_code == 200
    data = response.json()
    train_nums = [t["train_number"] for t in data["trains"]]
    # 12076, 20632, 12625 run from TVC to ERS
    assert "12076" in train_nums
    assert "20632" in train_nums
    
    # ERS -> TVC trains must NOT be included
    assert "12075" not in train_nums
    assert "20631" not in train_nums
    assert "12626" not in train_nums

def test_search_trains_city_alias(client):
    # Tests resolution of alias "Ernakulam" and "Trivandrum"
    response = client.get("/api/trains/search?from_station=Ernakulam&to_station=Trivandrum")
    assert response.status_code == 200
    data = response.json()
    assert data["from_station"]["station_code"] == "ERS"
    assert data["to_station"]["station_code"] == "TVC"
    assert len(data["trains"]) >= 2

def test_search_trains_same_station_rejected(client):
    response = client.get("/api/trains/search?from_station=NDLS&to_station=NDLS")
    assert response.status_code == 400
    data = response.json()
    assert "same" in data["detail"].lower()

def test_search_trains_unknown_station(client):
    response = client.get("/api/trains/search?from_station=UNKNOWNSTATION99&to_station=NDLS")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()

def test_search_trains_date_handling(client):
    # 2026-11-05 is Thursday. 20631 Vande Bharat runs Mon, Tue, Wed, Fri, Sat, Sun (not Thu)
    response = client.get("/api/trains/search?from_station=ERS&to_station=TVC&date=2026-11-05")
    assert response.status_code == 200
    data = response.json()
    assert data["day_of_week"] == "Thu"
    for t in data["trains"]:
        if t["train_number"] == "20631":
            assert t["runs_on_date"] is False
        elif t["train_number"] == "12075":
            assert t["runs_on_date"] is True

def test_get_train_details_endpoint(client):
    response = client.get("/api/trains/12951")
    assert response.status_code == 200
    data = response.json()
    assert data["train_number"] == "12951"
    assert "Mumbai Central" in data["origin_name"]
    assert "New Delhi" in data["destination_name"]
    assert len(data["route_schedule"]) >= 5
    assert len(data["classes"]) >= 1

def test_get_train_route_endpoint(client):
    response = client.get("/api/trains/12075/route")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 7
    # Verify stops are ordered
    for i, stop in enumerate(data):
        assert stop["stop_number"] == i + 1

def test_chatbot_route_search_query(client):
    payload = {
        "message": "Which trains are available from Ernakulam to Trivandrum tomorrow?",
        "conversation_id": "test-route-conv-1"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "ROUTE_SEARCH"
    assert "12075" in data["answer"] or "20631" in data["answer"]
    assert "Ernakulam" in data["answer"]
    assert "TVC" in data["answer"] or "Thiruvananthapuram" in data["answer"] or "Trivandrum" in data["answer"]
    assert len(data["suggested_followups"]) > 0

def test_chatbot_route_followup_earliest(client):
    conv_id = "test-route-followup-conv"
    # First query
    init_res = client.post("/api/chat", json={
        "message": "Find trains from Ernakulam to Trivandrum",
        "conversation_id": conv_id
    })
    assert init_res.status_code == 200

    # Follow-up query: earliest arrival
    followup_res = client.post("/api/chat", json={
        "message": "Which train reaches the earliest?",
        "conversation_id": conv_id
    })
    assert followup_res.status_code == 200
    data = followup_res.json()
    assert data["intent"] == "ROUTE_FOLLOWUP"
    # 20631 arrives at 15:05, earlier than 12075 (21:25) and 12626 (21:55)
    assert "20631" in data["answer"]
    assert "15:05" in data["answer"]

def test_chatbot_route_followup_shortest_duration(client):
    conv_id = "test-route-followup-conv-2"
    # First query
    client.post("/api/chat", json={
        "message": "Trains between Ernakulam and Trivandrum",
        "conversation_id": conv_id
    })
    # Follow-up query: shortest journey time
    followup_res = client.post("/api/chat", json={
        "message": "Which train has the shortest journey time?",
        "conversation_id": conv_id
    })
    assert followup_res.status_code == 200
    data = followup_res.json()
    assert data["intent"] == "ROUTE_FOLLOWUP"
    assert "3h 17m" in data["answer"] or "20631" in data["answer"]

def test_chatbot_route_followup_intermediate_stations(client):
    conv_id = "test-route-followup-conv-3"
    client.post("/api/chat", json={
        "message": "Show trains from Ernakulam to Trivandrum",
        "conversation_id": conv_id
    })
    followup_res = client.post("/api/chat", json={
        "message": "Show the intermediate stations",
        "conversation_id": conv_id
    })
    assert followup_res.status_code == 200
    data = followup_res.json()
    assert data["intent"] == "ROUTE_FOLLOWUP"
    assert "Alappuzha" in data["answer"] or "Kollam" in data["answer"]

def test_chatbot_route_followup_reach_kollam(client):
    conv_id = "test-route-followup-conv-4"
    client.post("/api/chat", json={
        "message": "Trains from Ernakulam to Trivandrum",
        "conversation_id": conv_id
    })
    followup_res = client.post("/api/chat", json={
        "message": "What time does it reach Kollam?",
        "conversation_id": conv_id
    })
    assert followup_res.status_code == 200
    data = followup_res.json()
    assert data["intent"] == "ROUTE_FOLLOWUP"
    assert "Kollam" in data["answer"]
    assert "13:38" in data["answer"] or "19:43" in data["answer"] or "18:10" in data["answer"]
