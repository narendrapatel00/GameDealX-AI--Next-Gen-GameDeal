export interface Game {
  id: number;
  title: string;
  genre: string;
  original_price: number;
  current_price: number;
  discount_percent: number;
  rating: number;
  store: string;
  deal_score: number;
  deal_tier: 'S' | 'A' | 'B' | 'C';
  image_url: string;
  url: string;
  last_updated: string;
}

export interface ScraperStatus {
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  last_run: string | null;
  games_scraped: number;
  error: string | null;
  logs: string[];
}

export interface Stats {
  total_games: number;
  total_deals: number;
  avg_price: number;
  max_discount: number;
  max_rating: number;
  best_rated_game: string;
}

export interface GenreStat {
  genre: string;
  count: number;
  avg_price: number;
}

export interface StoreStat {
  store: string;
  count: number;
  avg_discount: number;
}

export interface DistributionItem {
  range: string;
  count: number;
}

export interface AnalyticsData {
  stats: Stats;
  genres: GenreStat[];
  stores: StoreStat[];
  price_distribution: DistributionItem[];
  discount_distribution: DistributionItem[];
}

export interface QueryFilters {
  search?: string;
  genre?: string; // Comma separated or single
  store?: string; // Comma separated or single
  max_price?: number;
  min_discount?: number;
  min_rating?: number;
  deal_tier?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface GamesResponse {
  games: Game[];
  total: number;
  limit: number;
  offset: number;
}
