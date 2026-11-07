import pytest
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.retrieval.engine import RailwayRetrievalEngine
from app.services.chat_service import ChatService
from app.models.schemas import ChatRequest

@pytest.fixture(scope="module")
def engine():
    return RailwayRetrievalEngine()

@pytest.fixture(scope="module")
def chat():
    return ChatService()

def test_exact_train_number_lookup(engine):
    """Verifies that 12951 extracts and retrieves the Mumbai Rajdhani record."""
    entities = engine.extract_entities("Can you tell me about train 12951?")
    assert "12951" in entities["train_numbers"]
    
    results = engine.retrieve("train 12951")
    assert len(results) > 0
    top = results[0]
    assert top.category == "Train"
    assert "12951" in top.record_id
    assert "Mumbai Central" in top.snippet or "NDLS" in top.snippet

def test_exact_station_code_lookup(engine):
    """Verifies that station code NDLS retrieves New Delhi Railway Station."""
    entities = engine.extract_entities("What facilities are available at NDLS?")
    assert "NDLS" in entities["station_codes"]
    
    results = engine.retrieve("facilities at NDLS station")
    assert len(results) > 0
    top = results[0]
    assert top.category == "Station"
    assert "NDLS" in top.record_id
    assert "Executive Lounge" in top.snippet or "Wheelchair" in top.snippet

def test_city_alias_resolution(engine):
    """Verifies that city aliases like 'Bangalore' resolve to SBC."""
    entities = engine.extract_entities("Tell me about Bangalore station facilities")
    assert "SBC" in entities["station_codes"]

def test_policy_cancellation_rules_retrieval(engine):
    """Verifies that cancellation questions retrieve the official cancellation policy."""
    results = engine.retrieve("What is the ticket cancellation charge for confirmed AC 3 tier?")
    assert len(results) > 0
    snippets = " ".join([r.snippet for r in results])
    assert "180" in snippets or "Cancellation" in snippets or "Refund" in snippets

def test_tatkal_rules_retrieval(engine):
    """Verifies that Tatkal inquiry retrieves Tatkal rules (10:00 AM AC, 11:00 AM non-AC)."""
    results = engine.retrieve("What time does Tatkal booking open for AC coaches?")
    assert len(results) > 0
    snippets = " ".join([r.snippet for r in results])
    assert "10:00 AM" in snippets or "Tatkal" in snippets

def test_emergency_helpline_retrieval(engine):
    """Verifies that medical/emergency inquiries retrieve the 139 Rail Madad helpline."""
    results = engine.retrieve("What is the railway emergency phone number for medical help?")
    assert len(results) > 0
    snippets = " ".join([r.snippet for r in results])
    assert "139" in snippets

def test_out_of_scope_intent(chat):
    """Verifies that non-railway questions are flagged as OUT_OF_SCOPE and rejected politely."""
    res = chat.process_chat(ChatRequest(message="Can you give me a recipe for chocolate brownies?"))
    assert res.intent == "OUT_OF_SCOPE"
    assert "Railway Passenger Help Desk" in res.answer
    assert res.dataset_grounded is False

def test_unknown_train_handling(chat):
    """Verifies that a non-existent train number is handled gracefully without hallucinating false schedules."""
    res = chat.process_chat(ChatRequest(message="What is the schedule of train 99999?"))
    # Should either retrieve 0 sources or clearly state no records found
    if not res.sources:
        assert "not locate" in res.answer.lower() or "not have" in res.answer.lower() or "139" in res.answer

