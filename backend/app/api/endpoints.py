from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Path as FPath
from fastapi.responses import StreamingResponse
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
    RailwayInfoResponse,
    DashboardInsights,
    HealthResponse,
    StationItem,
    TrainStop,
    TrainSearchResponse,
    TrainDetailResponse
)
from app.retrieval.engine import retrieval_engine
from app.services.chat_service import chat_service
from app.services.llm_client import llm_client
from app.core.config import settings
from app.db.users_db import users_db

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["System"])
def get_health():
    """Health check endpoint providing system status and dataset metrics."""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        dataset_loaded=retrieval_engine.get_total_records_count() > 0,
        dataset_status=retrieval_engine.dataset_status,
        records_count=retrieval_engine.get_total_records_count(),
        loaded_files=retrieval_engine.loaded_files,
        llm_provider=settings.LLM_PROVIDER,
        llm_active=bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY or settings.GROQ_API_KEY)
    )

@router.post("/chat", response_model=ChatResponse, tags=["AI Assistant"])
def chat(request: ChatRequest):
    """Processes passenger questions through the grounded RAG pipeline."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Question message cannot be empty.")
    try:
        return chat_service.process_chat(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing inquiry: {str(e)}")

@router.post("/chat/stream", tags=["AI Assistant"])
async def chat_stream(request: ChatRequest):
    """Real-time SSE streaming endpoint for ChatGPT-like conversational assistant."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Question message cannot be empty.")
    try:
        return StreamingResponse(
            chat_service.stream_chat(request),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming error: {str(e)}")

@router.post("/chat/regenerate", response_model=ChatResponse, tags=["AI Assistant"])
def regenerate_chat(request: ChatRequest):
    """Regenerates response for the last user message in the specified conversation."""
    conv_id = request.conversation_id
    if not conv_id:
        raise HTTPException(status_code=400, detail="Conversation ID is required for regeneration.")

    msgs = users_db.get_chat_messages(conv_id)
    user_msgs = [m for m in msgs if m["role"] == "user"]
    if not user_msgs:
        # Fallback to current request message
        if request.message and request.message.strip():
            return chat_service.process_chat(request)
        raise HTTPException(status_code=400, detail="No prior user message found in this conversation to regenerate.")

    last_query = user_msgs[-1]["content"]
    new_request = ChatRequest(
        message=last_query,
        conversation_id=conv_id,
        history=request.history
    )
    return chat_service.process_chat(new_request)

@router.get("/conversations", tags=["AI Assistant"])
def list_conversations(
    user_id: Optional[str] = Query(default=None, description="Optional user ID filter")
):
    """Returns conversation sessions with last message preview and timestamp."""
    try:
        return users_db.list_conversations(user_id=user_id, limit=50)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing conversations: {str(e)}")

@router.get("/conversations/{conversation_id}", tags=["AI Assistant"])
def get_conversation_details(
    conversation_id: str = FPath(..., description="Unique conversation ID")
):
    """Returns conversation metadata and all historical chat messages."""
    try:
        conv = users_db.get_conversation(conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found.")
        messages = users_db.get_chat_messages(conversation_id)
        return {
            "conversation": conv,
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversation: {str(e)}")

@router.delete("/conversations/{conversation_id}", tags=["AI Assistant"])
def delete_conversation(
    conversation_id: str = FPath(..., description="Unique conversation ID")
):
    """Permanently deletes a conversation and its messages."""
    try:
        success = users_db.delete_conversation(conversation_id)
        chat_service.clear_history(conversation_id)
        return {"status": "deleted" if success else "not_found", "conversation_id": conversation_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")

@router.delete("/conversations", tags=["AI Assistant"])
def clear_all_conversations(
    user_id: Optional[str] = Query(default=None, description="Optional user ID filter")
):
    """Clears all conversations for user or all guest conversations."""
    try:
        count = users_db.clear_all_conversations(user_id=user_id)
        return {"status": "cleared", "deleted_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing conversations: {str(e)}")

@router.get("/history/{conversation_id}", response_model=list[ChatMessage], tags=["AI Assistant"])
def get_conversation_history(conversation_id: str = FPath(..., description="Unique conversation ID")):
    """Retrieves session history for a conversation."""
    return chat_service.get_history(conversation_id)

@router.delete("/history/{conversation_id}", tags=["AI Assistant"])
def clear_conversation_history(conversation_id: str = FPath(..., description="Unique conversation ID")):
    """Clears history for a conversation."""
    success = chat_service.clear_history(conversation_id)
    return {"status": "cleared" if success else "not_found", "conversation_id": conversation_id}

@router.get("/railway-info", response_model=RailwayInfoResponse, tags=["Railway Directory"])
def get_railway_info(
    category: Optional[str] = Query(default=None, description="Optional category filter: Train, Station, Policy, FAQ"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page")
):
    """Retrieves structured railway information records."""
    items, total = retrieval_engine.get_all_railway_info(category=category, page=page, page_size=page_size)
    total_pages = max(1, (total + page_size - 1) // page_size)
    return RailwayInfoResponse(
        items=items,
        total=total,
        category=category,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/railway-info/{category}", response_model=RailwayInfoResponse, tags=["Railway Directory"])
def get_railway_info_by_category(
    category: str = FPath(..., description="Category: trains, stations, policies, faqs"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100)
):
    """Retrieves records strictly for a specific category."""
    items, total = retrieval_engine.get_all_railway_info(category=category, page=page, page_size=page_size)
    total_pages = max(1, (total + page_size - 1) // page_size)
    return RailwayInfoResponse(
        items=items,
        total=total,
        category=category,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/dashboard/insights", response_model=DashboardInsights, tags=["Dashboard"])
def get_dashboard_insights():
    """Returns real dataset metrics, status, and query statistics."""
    breakdown = retrieval_engine.get_category_breakdown()
    recent = chat_service.get_recent_queries(limit=8)
    return DashboardInsights(
        total_records=retrieval_engine.get_total_records_count(),
        categories_count=len(breakdown),
        category_breakdown=breakdown,
        dataset_status=retrieval_engine.dataset_status,
        loaded_files=retrieval_engine.loaded_files,
        recent_queries=recent,
        system_health="Operational",
        active_llm=f"{settings.LLM_PROVIDER} ({settings.GEMINI_MODEL if settings.LLM_PROVIDER == 'gemini' else settings.OPENAI_MODEL})"
    )

@router.post("/dataset/reload", tags=["Dataset Management"])
def reload_dataset():
    """Re-scans the data directory and refreshes indices dynamically."""
    try:
        retrieval_engine.load_dataset()
        return {
            "status": "success",
            "dataset_status": retrieval_engine.dataset_status,
            "total_records": retrieval_engine.get_total_records_count(),
            "loaded_files": retrieval_engine.loaded_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reload dataset: {str(e)}")

# ============================================================================
# TRAIN SEARCH & TIMETABLE ENDPOINTS
# ============================================================================

@router.get("/stations", response_model=list[StationItem], tags=["Train Search"])
def get_stations(
    q: Optional[str] = Query(default=None, description="Search term for station name, code, or city")
):
    """Retrieves railway stations with autocomplete filtering."""
    try:
        stations = retrieval_engine.get_all_stations(query=q)
        return [StationItem(**s) for s in stations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stations: {str(e)}")

@router.get("/trains/search", response_model=TrainSearchResponse, tags=["Train Search"])
def search_trains(
    from_station: str = Query(..., description="Origin station name or code (e.g. ERS, Ernakulam, NDLS)"),
    to_station: str = Query(..., description="Destination station name or code (e.g. TVC, Trivandrum)"),
    date: Optional[str] = Query(default=None, description="Journey date in YYYY-MM-DD format")
):
    """
    Finds trains running between two stations in the correct route direction.
    Validates route sequence order (destination strictly after origin), computes accurate segment duration,
    and checks running day operations.
    """
    clean_from = from_station.strip()
    clean_to = to_station.strip()
    if not clean_from or not clean_to:
        raise HTTPException(status_code=400, detail="Both 'from_station' and 'to_station' are required.")

    try:
        result = retrieval_engine.search_trains_between_stations(
            from_station=clean_from,
            to_station=clean_to,
            date_str=date
        )
        return TrainSearchResponse(**result)
    except ValueError as ve:
        err_msg = str(ve)
        if "not found in the railway database" in err_msg or "not recognized" in err_msg:
            raise HTTPException(status_code=404, detail=err_msg)
        raise HTTPException(status_code=400, detail=err_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching trains: {str(e)}")

@router.get("/trains/{train_number}", response_model=TrainDetailResponse, tags=["Train Search"])
def get_train_details(
    train_number: str = FPath(..., description="4-5 digit train number")
):
    """Retrieves full information and timetable schedule for a specific train."""
    train = retrieval_engine.get_train_by_number(train_number)
    if not train:
        raise HTTPException(status_code=404, detail=f"Train number '{train_number}' not found in database.")

    schedule_data = retrieval_engine.get_train_route_schedule(train_number) or []
    schedule_items = [TrainStop(**s) for s in schedule_data]

    classes = train.get("classes", [])
    if isinstance(classes, str):
        classes = [c.strip() for c in classes.split(",")]

    return TrainDetailResponse(
        train_number=str(train.get("train_number")),
        train_name=train.get("train_name", ""),
        train_type=train.get("train_type", "Superfast"),
        origin_code=train.get("origin_code", ""),
        origin_name=train.get("origin_name", ""),
        destination_code=train.get("destination_code", ""),
        destination_name=train.get("destination_name", ""),
        departure_time=train.get("departure_time", ""),
        arrival_time=train.get("arrival_time", ""),
        duration=train.get("duration", "N/A"),
        duration_minutes=int(train.get("duration_minutes", 0)),
        distance_km=int(train.get("distance_km", 0)),
        runs_on=train.get("runs_on", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
        classes=classes,
        pantry=train.get("pantry"),
        major_halts=train.get("major_halts", []),
        route_schedule=schedule_items
    )

@router.get("/trains/{train_number}/route", response_model=list[TrainStop], tags=["Train Search"])
def get_train_route(
    train_number: str = FPath(..., description="4-5 digit train number")
):
    """Retrieves the ordered station sequence timetable for a specific train."""
    schedule = retrieval_engine.get_train_route_schedule(train_number)
    if schedule is None:
        raise HTTPException(status_code=404, detail=f"Route timetable for train '{train_number}' not found.")
    return [TrainStop(**s) for s in schedule]


