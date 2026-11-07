"""
Benchmark Evaluation Suite for Railway Passenger Help Desk.
Tests 30 representative passenger inquiries across all operational railway domains
to verify grounding, precision, zero-hallucination, and edge-case handling.
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.retrieval.engine import RailwayRetrievalEngine
from app.services.chat_service import ChatService
from app.models.schemas import ChatRequest

BENCHMARK_30_QUESTIONS = [
    # --- Category A: Train Schedules & Information (Questions 1-8) ---
    {
        "id": 1,
        "query": "What is the departure time of train 12951 Mumbai Rajdhani?",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["17:00", "mumbai central", "new delhi"]
    },
    {
        "id": 2,
        "query": "Which stations does 12002 Bhopal Shatabdi stop at?",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["mathura", "agra", "gwalior", "jhansi", "bhopal"]
    },
    {
        "id": 3,
        "query": "Tell me about train 20643 Vande Bharat Express",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["chennai", "coimbatore", "vande bharat"]
    },
    {
        "id": 4,
        "query": "What are the travel classes in Kerala Express 12625?",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["1a", "2a", "3a", "sl"]
    },
    {
        "id": 5,
        "query": "Find train between Howrah and New Delhi",
        "expected_intent": "ROUTE_SEARCH",
        "expected_keywords": ["12301", "rajdhani", "howrah"]
    },
    {
        "id": 6,
        "query": "What time does 22436 Vande Bharat reach Varanasi?",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["14:00", "varanasi", "bsb"]
    },
    {
        "id": 7,
        "query": "What days does train 20644 Coimbatore Vande Bharat run on?",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["mon", "tue", "thu", "fri", "sat", "sun"]
    },
    {
        "id": 8,
        "query": "What is the distance covered by 12617 Mangala Lakshadweep Express?",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["2781", "ernakulam", "nizamuddin"]
    },

    # --- Category B: Station Amenities & Accessibility (Questions 9-14) ---
    {
        "id": 9,
        "query": "What facilities are available at New Delhi Railway Station (NDLS)?",
        "expected_intent": "STATION_FACILITY",
        "expected_keywords": ["lounge", "cloak room", "wheelchair", "wifi"]
    },
    {
        "id": 10,
        "query": "Does CSMT Mumbai have emergency medical room facilities?",
        "expected_intent": "STATION_FACILITY",
        "expected_keywords": ["medical", "clinic", "csmt", "mumbai"]
    },
    {
        "id": 11,
        "query": "How many platforms are there at Howrah Junction (HWH)?",
        "expected_intent": "STATION_FACILITY",
        "expected_keywords": ["23", "howrah", "platforms"]
    },
    {
        "id": 12,
        "query": "Is there a direct metro connection at Bangalore City SBC station?",
        "expected_intent": "STATION_FACILITY",
        "expected_keywords": ["metro", "skywalk", "sbc", "bengaluru"]
    },
    {
        "id": 13,
        "query": "Are cloak rooms available at Dr MGR Chennai Central MAS?",
        "expected_intent": "STATION_FACILITY",
        "expected_keywords": ["cloak room", "luggage", "mas", "chennai"]
    },
    {
        "id": 14,
        "query": "What airport standard facilities are provided at Rani Kamalapati RKMP?",
        "expected_intent": "STATION_FACILITY",
        "expected_keywords": ["capsule", "lounge", "air-conditioned", "rkmp"]
    },

    # --- Category C: Tatkal and Booking Regulations (Questions 15-18) ---
    {
        "id": 15,
        "query": "What time does Tatkal ticket booking open for AC classes?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["10:00 am", "1 day in advance"]
    },
    {
        "id": 16,
        "query": "What time does Tatkal booking start for Sleeper class?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["11:00 am", "non-ac", "sleeper"]
    },
    {
        "id": 17,
        "query": "What is the maximum number of passengers allowed on a single Tatkal ticket?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["4 passengers", "pnr"]
    },
    {
        "id": 18,
        "query": "Can I get a refund if I cancel a confirmed Tatkal ticket?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["no refund", "confirmed tatkal"]
    },

    # --- Category D: Cancellation, Refund & Quota Rules (Questions 19-24) ---
    {
        "id": 19,
        "query": "What is the cancellation charge for a confirmed AC 2-Tier ticket before 48 hours?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["200", "passenger"]
    },
    {
        "id": 20,
        "query": "How much is deducted if I cancel a Sleeper ticket 48 hours before departure?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["120", "sleeper"]
    },
    {
        "id": 21,
        "query": "What is the refund rule for waitlisted e-tickets after chart preparation?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["automatically cancelled", "clerkage", "refund"]
    },
    {
        "id": 22,
        "query": "How much luggage can a passenger carry free in AC First Class (1A)?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["70 kg", "first class"]
    },
    {
        "id": 23,
        "query": "Who is eligible for the lower berth quota?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["60", "45", "senior citizen", "pregnant"]
    },
    {
        "id": 24,
        "query": "Can I bring my pet dog inside a train coach?",
        "expected_intent": "POLICY_RULE",
        "expected_keywords": ["1st ac", "coupe", "dog box", "brake van"]
    },

    # --- Category E: Emergency & Helplines (Questions 25-27) ---
    {
        "id": 25,
        "query": "What is the official Rail Madad helpline number for railway emergencies?",
        "expected_intent": "EMERGENCY_HELPLINE",
        "expected_keywords": ["139"]
    },
    {
        "id": 26,
        "query": "How can a passenger get a doctor during a medical emergency on a train?",
        "expected_intent": "EMERGENCY_HELPLINE",
        "expected_keywords": ["tte", "139", "doctor", "station"]
    },
    {
        "id": 27,
        "query": "What is the procedure if I lose my bag or phone on a railway station?",
        "expected_intent": "EMERGENCY_HELPLINE",
        "expected_keywords": ["rpf", "rail madad", "lost property", "139"]
    },

    # --- Category F: Edge Cases & Boundaries (Questions 28-30) ---
    {
        "id": 28,
        "query": "What is the schedule of train 999888?",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["not locate", "not have", "records", "139"]
    },
    {
        "id": 29,
        "query": "Write a Python script to sort a list using quicksort",
        "expected_intent": "OUT_OF_SCOPE",
        "expected_keywords": ["railway passenger help desk", "unrelated", "cannot"]
    },
    {
        "id": 30,
        "query": "deparrture of rajdhany 12951 from mumbay",
        "expected_intent": "TRAIN_SEARCH",
        "expected_keywords": ["17:00", "mumbai central", "12951"]
    }
]

@pytest.fixture(scope="module")
def engine():
    return RailwayRetrievalEngine()

@pytest.fixture(scope="module")
def chat():
    return ChatService()

@pytest.mark.parametrize("item", BENCHMARK_30_QUESTIONS)
def test_benchmark_question(chat, engine, item):
    """Executes each of the 30 benchmark questions to measure grounding and intent precision."""
    res = chat.process_chat(ChatRequest(message=item["query"]))
    
    # Intent verification
    assert res.intent == item["expected_intent"], f"Question {item['id']} expected intent {item['expected_intent']} got {res.intent}"
    
    # Grounding & Keyword Verification
    answer_lower = res.answer.lower()
    sources_text = " ".join([s.snippet.lower() for s in res.sources])
    combined_text = answer_lower + " " + sources_text
    
    matched_keywords = [kw for kw in item["expected_keywords"] if kw in combined_text]
    assert len(matched_keywords) >= 1, (
        f"Question {item['id']} '{item['query']}' failed keyword match. "
        f"Expected one of: {item['expected_keywords']}. Got answer: {res.answer[:200]}"
    )

