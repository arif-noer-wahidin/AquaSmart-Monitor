export interface RealtimeData {
  relay1: string; // 'on' | 'off'
  relay2: string; // 'on' | 'off'
  Timestamp: string;
  timer1On: string;
  timer1Off: string;
  timer2On: string;
  timer2Off: string;
  suhu: number | string;
  ph: number | string;
  tds: number | string;
  fuzzy_rekomendasi: string;
  suhu_status: string;
  ph_status: string;
  tds_status: string;
}

export interface HistoryItem {
  timestamp: string;
  relay1: string;
  relay2: string;
  suhu: number;
  ph: number;
  tds: number;
  fuzzy_rekomendasi: string;
}

export interface RangeDefinition {
  Variabel: string;
  Kategori: string;
  Min: number;
  Max: number;
}

export interface FuzzyRule {
  RuleID: number;
  Suhu: string;
  pH: string;
  TDS: string;
  'Aksi Direkomendasikan': string;
}

export interface CalibrationData {
  [key: string]: string;
}

export type HistoryPeriod = '1hour' | '1day' | '1week';

export interface ApiResponse<T> {
  status?: string;
  message?: string;
  // Dynamic parsing often results in direct array or object depending on endpoint
  [key: string]: any; 
}