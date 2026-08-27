export type BusinessCategory = 'Dairy' | 'Retail' | 'Textiles';
export type Community = 'SC' | 'ST' | 'OBC' | 'General';
export type MoratoriumMode = 'CAPITALISED' | 'SERVICED' | 'WAIVED';

export interface AssessRequest {
  location: string;
  budget: number;
  category: BusinessCategory;
  community?: Community;
  annual_income?: number;
  is_defaulter?: boolean;
  moratorium_mode?: MoratoriumMode;
}

export interface LocationInfo {
  location_id: string;
  lgd_code: string;
  village: string;
  block: string;
  district: string;
  region: string;
  state: string;
  latitude: number;
  longitude: number;
  urban_rural_flag: string;
  data_source: string;
  data_vintage_date: string;
}

export interface Eligibility {
  passed: boolean;
  reasons: string[];
}

export interface SchemeInfo {
  scheme_key: string;
  project_cost: number;
  raw_loan_share: number;
  loan_amount: number;
  margin_required: number;
  effective_loan_share_pct: number;
  cap_bound: boolean;
  interest_rate_pct: number;
  tenure_months: number;
  moratorium_months: number;
}

export interface FinancialStructuring {
  naive_max_project_cost: number;
  affordable_max_project_cost: number;
  operational_project_cost: number;
  recommended_project_cost: number;
  capex: number;
  working_capital: number;
  note: string;
  scheme: SchemeInfo;
}

export interface RevenueRange {
  value: number;
  low: number;
  high: number;
}

export interface RiskInfo {
  key_risk_factors: string[];
  risk_severity_score: number;
}

export interface SwotItem {
  dimension: 'strength' | 'weakness' | 'opportunity' | 'threat';
  description: string;
}

export interface Feasibility {
  catchment_population_5km: number;
  catchment_population_10km: number;
  competitor_count: number;
  nearest_competitor_km: number;
  demand_gap_pct: number;
  price_modal_inr: number;
  estimated_monthly_revenue: RevenueRange;
  opportunity_class: string;
  risk: RiskInfo;
  swot: SwotItem[];
}

export interface RepaymentViability {
  quarterly_installment: number;
  monthly_opex: number;
  schedule_length: number;
  moratorium_mode: string;
  verdict: string;
  repayable_count: number;
  n_scenarios: number;
  total_repayment: number;
}

export interface TraceStep {
  step: string;
  inputs: Record<string, unknown>;
  formula: string;
  output: string | number | object;
  sources: string[];
}

export interface AssessResponse {
  report_id: string;
  generated_at: string;
  data_snapshot_version: string;
  location: LocationInfo;
  eligibility: Eligibility;
  financial_structuring: FinancialStructuring | Record<string, never>;
  feasibility: Feasibility | Record<string, never>;
  repayment_viability: RepaymentViability | Record<string, never>;
  trace: TraceStep[];
}

export interface ApiError {
  error: string;
}
