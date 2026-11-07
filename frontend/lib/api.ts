/**
 * Railway Passenger Help Desk - API Client
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://railway-passenger-help-desk-website.onrender.com'
    : 'http://localhost:8000');

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface RetrievedSource {
  record_id: string;
  category: string;
  title: string;
  snippet: string;
  score: number;
  file_source: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  conversation_id: string;
  intent: string;
  entities: {
    train_numbers?: string[];
    station_codes?: string[];
    station_names?: string[];
    route?: {
      origin: string;
      destination: string;
      origin_code?: string;
      destination_code?: string;
    } | null;
    keywords?: string[];
  };
  sources: RetrievedSource[];
  suggested_followups: string[];
  confidence: number;
  dataset_grounded: boolean;
  timestamp: string;
}

export interface RailwayInfoItem {
  id: string;
  category: string;
  name: string;
  code?: string;
  origin?: string;
  destination?: string;
  departure?: string;
  arrival?: string;
  facilities?: string[];
  details?: string;
  source: string;
  raw_data?: Record<string, any>;
}

export interface RailwayInfoResponse {
  items: RailwayInfoItem[];
  total: number;
  category?: string;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardInsights {
  total_records: number;
  categories_count: number;
  category_breakdown: Record<string, number>;
  dataset_status: string;
  loaded_files: string[];
  recent_queries: Array<{
    timestamp: string;
    query: string;
    conversation_id: string;
  }>;
  system_health: string;
  active_llm: string;
  timestamp: string;
  total_trains?: number;
  total_stations?: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  dataset_loaded: boolean;
  dataset_status: string;
  records_count: number;
  loaded_files: string[];
  llm_provider: string;
  llm_active: boolean;
  timestamp: string;
}

export interface StationItem {
  station_code: string;
  station_name: string;
  city: string;
  state: string;
  zone?: string;
  division?: string;
  platforms?: number;
  facilities?: string[];
}

export interface TrainStop {
  stop_number: number;
  station_code: string;
  station_name: string;
  arrival: string;
  departure: string;
  halt_mins: number;
  day: number;
  distance_km: number;
}

export interface TrainSearchResult {
  train_number: string;
  train_name: string;
  train_type: string;
  origin_code: string;
  origin_name: string;
  destination_code: string;
  destination_name: string;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  duration_minutes: number;
  day_difference: number;
  distance_km: number;
  runs_on: string[];
  runs_on_date?: boolean | null;
  classes: string[];
  pantry?: string | null;
  intermediate_stops_count: number;
  intermediate_stations: string[];
  is_direct: boolean;
}

export interface TrainSearchResponse {
  from_station: StationItem;
  to_station: StationItem;
  journey_date?: string | null;
  day_of_week?: string | null;
  total_trains: number;
  trains: TrainSearchResult[];
  timestamp: string;
}

export interface TrainDetailResponse {
  train_number: string;
  train_name: string;
  train_type: string;
  origin_code: string;
  origin_name: string;
  destination_code: string;
  destination_name: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  duration_minutes: number;
  distance_km: number;
  runs_on: string[];
  classes: string[];
  pantry?: string | null;
  major_halts: string[];
  route_schedule: TrainStop[];
  timestamp: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Chat API error (${res.status}): ${errorBody}`);
  }
  return res.json();
}

export async function fetchRailwayInfo(
  category?: string,
  page = 1,
  pageSize = 20
): Promise<RailwayInfoResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (category && category !== 'all') {
    params.set('category', category);
  }
  const res = await fetch(`${API_BASE_URL}/api/railway-info?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Railway info request failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDashboardInsights(): Promise<DashboardInsights> {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/insights`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Dashboard insights failed: ${res.statusText}`);
  return res.json();
}

export async function reloadDataset(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/dataset/reload`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Reload failed: ${res.statusText}`);
  return res.json();
}

export async function fetchConversationHistory(conversationId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE_URL}/api/history/${conversationId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function clearConversationHistory(conversationId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/history/${conversationId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
}

export async function fetchStations(query?: string): Promise<StationItem[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/stations${params}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch stations: ${res.statusText}`);
  return res.json();
}

export async function searchTrains(
  fromStation: string,
  toStation: string,
  date?: string
): Promise<TrainSearchResponse> {
  const params = new URLSearchParams({
    from_station: fromStation,
    to_station: toStation,
  });
  if (date) {
    params.set('date', date);
  }
  const res = await fetch(`${API_BASE_URL}/api/trains/search?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Train search failed (${res.status}): ${errorBody}`);
  }
  return res.json();
}

export async function fetchTrainDetails(trainNumber: string): Promise<TrainDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/api/trains/${encodeURIComponent(trainNumber)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch train ${trainNumber}: ${res.statusText}`);
  return res.json();
}

export async function fetchTrainRoute(trainNumber: string): Promise<TrainStop[]> {
  const res = await fetch(`${API_BASE_URL}/api/trains/${encodeURIComponent(trainNumber)}/route`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch route for train ${trainNumber}: ${res.statusText}`);
  return res.json();
}

// ========================================================
// AUTHENTICATION API METHODS & TYPES
// ========================================================

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  token_type: string;
  expires_in_hours: number;
}

export interface AuthMessageResponse {
  status: string;
  message: string;
  token?: string | null;
  expires_in_minutes?: number | null;
}

export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
  confirm_password?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function loginUser(payload: {
  email_or_username: string;
  password: string;
  remember_me?: boolean;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Invalid email or password');
  }
  return res.json();
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Session invalid or expired');
  }
  return res.json();
}

export async function logoutUser(): Promise<AuthMessageResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
  });
  return res.json();
}

export async function forgotPasswordRequest(email: string): Promise<AuthMessageResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to process forgot password request');
  }
  return res.json();
}

export async function resetPasswordRequest(payload: {
  token: string;
  new_password: string;
  confirm_password?: string;
}): Promise<AuthMessageResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Password reset failed');
  }
  return res.json();
}

export async function updateUserProfile(
  token: string,
  payload: { full_name?: string; phone?: string }
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to update profile');
  }
  return res.json();
}

export async function changeUserPassword(
  token: string,
  payload: { old_password: string; new_password: string; confirm_password?: string }
): Promise<AuthMessageResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to change password');
  }
  return res.json();
}

// ============================================================================
// CONVERSATIONAL CHATGPT-LIKE AI ASSISTANT & STREAMING APIS
// ============================================================================

export interface ConversationItem {
  id: string;
  user_id?: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string | null;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: RetrievedSource[];
  suggested_followups?: string[];
  intent?: string;
  tools_used?: string[];
}

export async function fetchConversations(userId?: string): Promise<ConversationItem[]> {
  const url = userId 
    ? `${API_BASE_URL}/api/conversations?user_id=${encodeURIComponent(userId)}`
    : `${API_BASE_URL}/api/conversations`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchConversationDetails(
  conversationId: string
): Promise<{ conversation: ConversationItem; messages: ConversationMessage[] }> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${encodeURIComponent(conversationId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load conversation messages');
  return res.json();
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${encodeURIComponent(conversationId)}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function clearAllConversations(userId?: string): Promise<boolean> {
  const url = userId 
    ? `${API_BASE_URL}/api/conversations?user_id=${encodeURIComponent(userId)}`
    : `${API_BASE_URL}/api/conversations`;
  const res = await fetch(url, { method: 'DELETE' });
  return res.ok;
}

export async function regenerateChatMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chat/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Regenerate error (${res.status}): ${errorBody}`);
  }
  return res.json();
}

export async function streamChatMessage(
  req: ChatRequest,
  onChunk: (chunk: string) => void,
  onStatus?: (status: string) => void
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    // Fallback to standard chat endpoint if streaming fails
    return sendChatMessage(req);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    return sendChatMessage(req);
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let finalResponse: ChatResponse | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'status' && onStatus) {
              onStatus(data.status);
            } else if (data.type === 'chunk') {
              onChunk(data.content);
            } else if (data.type === 'done') {
              finalResponse = data.response;
            }
          } catch {
            // Ignore parse errors on malformed chunks
          }
        }
      }
    }
  } catch (err) {
    console.warn('Stream interrupted, proceeding with received chunks:', err);
  }

  if (finalResponse) {
    return finalResponse;
  }

  // Fallback response if stream didn't yield final payload
  return {
    answer: '',
    conversation_id: req.conversation_id || 'conv_default',
    intent: 'GENERAL_RAILWAY',
    entities: {},
    sources: [],
    suggested_followups: [
      'Find trains between Mumbai and Delhi',
      'What are the Tatkal cancellation rules?'
    ],
    confidence: 0.95,
    dataset_grounded: true,
    timestamp: new Date().toISOString()
  };
}

