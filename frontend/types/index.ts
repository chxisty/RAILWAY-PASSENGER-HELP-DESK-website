export interface HealthResponse {
  status: string;
  version: string;
  llm_provider: string;
  llm_model: string;
  data_loaded: boolean;
  records_count: number;
}

export interface SourceCitation {
  doc: string;
  page?: number | null;
  rule_id?: string;
  score?: number;
  text_snippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: SourceCitation[];
  sql?: string | null;
  dont_know?: boolean;
  timestamp: string;
}

export interface TrainScheduleStop {
  train_number: string;
  stop_sequence: number;
  station_code: string;
  station_name?: string;
  day: number | null;
  arrival: string | null;
  departure: string | null;
  halt_min: number | null;
  is_halt: number;
}

export interface TrainSearchResult {
  train_number: string;
  train_name: string;
  from_station_code: string;
  from_station_name?: string;
  to_station_code: string;
  to_station_name?: string;
  origin_departure: string;
  destination_arrival: string;
  duration_min: number;
  intermediate_stops_count: number;
  running_days?: string[];
  classes?: string[];
  all_stops?: TrainScheduleStop[];
}

export interface StationOption {
  code: string;
  name: string;
  state?: string | null;
  zone?: string | null;
}

