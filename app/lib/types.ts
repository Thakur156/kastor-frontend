export interface AuthState {
  idToken: string | null;
  refreshToken: string | null;
  expiresIn?: number | null;
  login: (
    email: string,
    password: string,
    navigate: (path: string) => void
  ) => Promise<void>;
  logout: () => void;
  refresh: () => void;
}

export interface LoginResponse {
  idToken: string;
  refreshToken: string;
  expiresIn?: number;
}
export type RefreshTokenResponse = Partial<LoginResponse>;
export interface LoginDto {
  email: string;
  password: string;
}
export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}
export interface RefreshTokenDto {
  refreshToken: string;
}

export interface CellObj {
  cellId: string;
  show?: "both" | "table" | "graph";
  cellType: string;
  query: string;
  columns?: { title: string; key: string }[];
  data?: { [key: string]: unknown }[];
  graphOptions?: {
    metrics: { column: string; aggregateFunction: string }[];
    dimensions: { value: string; label: string }[];
    filters: { column: string; filterType: string; filterValue: string }[];
    chartType: string;
    chartTitle: string;
    locationOptions: { value: string; label: string }[];
  };
  pagination?: {
    current_page: number;
    next_page: boolean;
    has_more: boolean;
    total_pages: number;
    total_records: number;
  };
}
