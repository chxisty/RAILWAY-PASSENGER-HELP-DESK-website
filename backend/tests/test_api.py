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

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["records_count"] > 0
    assert "version" in data

def test_api_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_dashboard_insights(client):
    response = client.get("/api/dashboard/insights")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] > 0
    assert "Trains" in data["category_breakdown"]
    assert "system_health" in data

def test_railway_info_list(client):
    response = client.get("/api/railway-info?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) <= 10
    assert data["total"] > 0

def test_railway_info_category_trains(client):
    response = client.get("/api/railway-info/trains")
    assert response.status_code == 200
    data = response.json()
    assert all(item["category"] == "Train" for item in data["items"])

def test_railway_info_category_stations(client):
    response = client.get("/api/railway-info/stations")
    assert response.status_code == 200
    data = response.json()
    assert all(item["category"] == "Station" for item in data["items"])

def test_chat_endpoint_valid_question(client):
    payload = {"message": "What is the departure time of train 12951?"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 0
    assert "12951" in data["answer"] or "Mumbai" in data["answer"]
    assert "sources" in data
    assert "conversation_id" in data

def test_chat_endpoint_empty_message(client):
    payload = {"message": "   "}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400

def test_conversation_history_lifecycle(client):
    conv_id = "test-session-123"
    payload = {"message": "Tell me about train 20643 Vande Bharat", "conversation_id": conv_id}
    client.post("/api/chat", json=payload)
    
    # Get history
    hist_resp = client.get(f"/api/history/{conv_id}")
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) >= 2  # user + assistant
    
    # Clear history
    del_resp = client.delete(f"/api/history/{conv_id}")
    assert del_resp.status_code == 200
    
    # Verify cleared
    hist_resp_after = client.get(f"/api/history/{conv_id}")
    assert len(hist_resp_after.json()) == 0

def test_dataset_reload(client):
    response = client.post("/api/dataset/reload")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_records"] > 0

