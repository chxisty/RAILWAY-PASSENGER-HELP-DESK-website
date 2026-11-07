from typing import Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender: user, assistant, system")
    content: str = Field(..., description="Content of the message")
    timestamp: Optional[str] = Field(default_factory=utc_now_iso)

class RetrievedSource(BaseModel):
    record_id: str
    category: str
    title: str
    snippet: str
    score: float = 1.0
    file_source: str = "internal"
    metadata: dict[str, Any] = Field(default_factory=dict)

class ChatRequest(BaseModel):
    message: str = Field(default="", description="Passenger inquiry")
    conversation_id: Optional[str] = Field(default=None, description="Optional conversation identifier")
    history: Optional[list[ChatMessage]] = Field(default_factory=list, description="Prior conversational context")

class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    intent: str
    entities: dict[str, Any] = Field(default_factory=dict)
    sources: list[RetrievedSource] = Field(default_factory=list)
    suggested_followups: list[str] = Field(default_factory=list)
    confidence: float = 1.0
    dataset_grounded: bool = True
    timestamp: str = Field(default_factory=utc_now_iso)

class RailwayInfoItem(BaseModel):
    id: str
    category: str
    name: str
    code: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    departure: Optional[str] = None
    arrival: Optional[str] = None
    facilities: Optional[list[str]] = None
    details: Optional[str] = None
    source: str = "dataset"
    raw_data: Optional[dict[str, Any]] = None

class RailwayInfoResponse(BaseModel):
    items: list[RailwayInfoItem]
    total: int
    category: Optional[str] = None
    page: int = 1
    page_size: int = 20
    total_pages: int = 1

class DashboardInsights(BaseModel):
    total_records: int
    categories_count: int
    category_breakdown: dict[str, int]
    dataset_status: str
    loaded_files: list[str]
    recent_queries: list[dict[str, Any]]
    system_health: str
    active_llm: str
    timestamp: str = Field(default_factory=utc_now_iso)

class HealthResponse(BaseModel):
    status: str
    version: str
    dataset_loaded: bool
    dataset_status: str
    records_count: int
    loaded_files: list[str]
    llm_provider: str
    llm_active: bool
    timestamp: str = Field(default_factory=utc_now_iso)

class StationItem(BaseModel):
    station_code: str
    station_name: str
    city: str
    state: str
    zone: Optional[str] = None
    division: Optional[str] = None
    platforms: Optional[int] = None
    facilities: Optional[list[str]] = None

class TrainStop(BaseModel):
    stop_number: int
    station_code: str
    station_name: str
    arrival: str
    departure: str
    halt_mins: int
    day: int
    distance_km: int

class TrainSearchResult(BaseModel):
    train_number: str
    train_name: str
    train_type: str
    origin_code: str
    origin_name: str
    destination_code: str
    destination_name: str
    from_station_code: str
    from_station_name: str
    to_station_code: str
    to_station_name: str
    departure_time: str
    arrival_time: str
    duration: str
    duration_minutes: int
    day_difference: int
    distance_km: int
    runs_on: list[str]
    runs_on_date: Optional[bool] = None
    classes: list[str]
    pantry: Optional[str] = None
    intermediate_stops_count: int
    intermediate_stations: list[str]
    is_direct: bool = True

class TrainSearchResponse(BaseModel):
    from_station: StationItem
    to_station: StationItem
    journey_date: Optional[str] = None
    day_of_week: Optional[str] = None
    total_trains: int
    trains: list[TrainSearchResult]
    timestamp: str = Field(default_factory=utc_now_iso)

class TrainDetailResponse(BaseModel):
    train_number: str
    train_name: str
    train_type: str
    origin_code: str
    origin_name: str
    destination_code: str
    destination_name: str
    departure_time: str
    arrival_time: str
    duration: str
    duration_minutes: int
    distance_km: int
    runs_on: list[str]
    classes: list[str]
    pantry: Optional[str] = None
    major_halts: list[str] = Field(default_factory=list)
    route_schedule: list[TrainStop] = Field(default_factory=list)
    timestamp: str = Field(default_factory=utc_now_iso)


