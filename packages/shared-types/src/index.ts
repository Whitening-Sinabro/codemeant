// ============================================
// Database Types
// ============================================

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface Credit {
  id: string;
  user_id: string;
  balance: number;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  type: "purchase" | "analysis" | "refund" | "bonus";
  reference_id: string | null;
  created_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  project_name: string;
  tech_stack: TechStack | null;
  file_tree: FileTree | null;
  dependencies: Dependencies | null;
  price_estimation: PriceEstimation | null;
  sales_strategy: SalesStrategy | null;
  credits_used: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
}

// ============================================
// Metadata Types
// ============================================

export interface TechStack {
  languages: string[];
  frameworks: string[];
  databases: string[];
}

export interface FileTree {
  name: string;
  type: "directory" | "file";
  children?: FileTree[];
}

export interface Dependencies {
  npm?: Record<string, string>;
  python?: string[];
}

// ============================================
// Analysis Result Types
// ============================================

export interface PriceEstimation {
  minimum: number;
  maximum: number;
  recommended: number;
  currency: "USD" | "KRW";
  reasoning: string;
  comparable_projects: ComparableProject[];
}

export interface ComparableProject {
  name: string;
  price: number;
  platform: string;
  similarity: string;
}

export interface SalesStrategy {
  recommended_platforms: Platform[];
  target_customers: string[];
  positioning: string;
  key_selling_points: string[];
}

export interface Platform {
  name: string;
  url: string;
  pros: string[];
  cons: string[];
  estimated_reach: string;
}

// ============================================
// API Types
// ============================================

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AnalysisRequest {
  project_name: string;
  tech_stack?: TechStack;
  file_tree?: FileTree;
  dependencies?: Dependencies;
  readme_content?: string;
}

export interface AnalysisResponse {
  id: string;
  status: string;
  message: string;
}
