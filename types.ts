export type StrategyKey =
  | 'COOPERATIVE_ALIGN'
  | 'GENTLE_PERSUASION'
  | 'ASSERT_BOUNDARIES'
  | 'BUILD_RAPPORT'
  | 'DEESCALATE_CONFLICT'
  | 'PROVIDE_CLARITY';

export interface HistoryItem {
  id: number;
  strategy: StrategyKey | 'N/A';
  response: string;
  timestamp: string;
}

export interface Stats {
  responses: number;
  timeSaved: number; // in minutes
}

export interface SingleResponse {
  reply: string;
  analysis: string;
}

export interface Variation {
    title: string;
    reply: string;
}

export interface VariationsResponse {
    variations: Variation[];
}

export interface ComparisonItem {
    strategyName: string;
    reply: string;
    analysis: string;
}

export interface ComparisonResponse {
    comparison: ComparisonItem[];
    bestStrategy: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

export type ActiveTab = 'single' | 'multiple' | 'compare';
