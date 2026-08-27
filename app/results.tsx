import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react-native';
import { useApp } from '@/lib/theme';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { SectionHeader } from '@/components/SectionHeader';
import { ResultRow } from '@/components/ResultRow';
import { resultStore } from '@/lib/resultStore';
import {
  formatINR,
  formatINRDecimal,
  formatNumber,
  formatPercent,
  formatKm,
} from '@/lib/format';
import type {
  AssessResponse,
  FinancialStructuring,
  Feasibility,
  RepaymentViability,
  TraceStep,
} from '@/types/api';

export default function ResultsScreen() {
  const { theme } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);

  const data = resultStore.result;
  if (!data) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.mutedText }]}>
          No assessment results to display.
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backBtnText}>Back to form</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const eligible = data.eligibility.passed;
  const fs = data.financial_structuring as FinancialStructuring | Record<string, never>;
  const fe = data.feasibility as Feasibility | Record<string, never>;
  const rv = data.repayment_viability as RepaymentViability | Record<string, never>;
  const hasFs = 'note' in fs;
  const hasFe = 'opportunity_class' in fe;
  const hasRv = 'verdict' in rv;

  const isSynthetic = data.location.data_source?.toLowerCase().includes('auto_generated');

  const copyReportId = async () => {
    await Clipboard.setStringAsync(data.report_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const opportunityVariant = (cls: string): 'good' | 'warning' | 'neutral' => {
    if (cls === 'underserved') return 'good';
    if (cls === 'saturated') return 'warning';
    return 'neutral';
  };

  const verdictVariant = (count: number): 'good' | 'warning' | 'bad' => {
    if (count >= 8) return 'good';
    if (count >= 5) return 'warning';
    return 'bad';
  };

  const swotGroups = hasFe
    ? (['strength', 'weakness', 'opportunity', 'threat'] as const).map((dim) => ({
        dim,
        items: (fe as Feasibility).swot.filter((s) => s.dimension === dim),
      }))
    : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={styles.iconBtn}
        >
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Assessment Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Report ID row */}
        <View style={styles.reportIdRow}>
          <Text
            style={[styles.reportId, { color: theme.mutedText }]}
            numberOfLines={1}
          >
            {data.report_id}
          </Text>
          <TouchableOpacity onPress={copyReportId} style={styles.copyBtn}>
            {copied ? (
              <Check size={16} color={theme.good} />
            ) : (
              <Copy size={16} color={theme.mutedText} />
            )}
          </TouchableOpacity>
        </View>
        {copied && (
          <Text style={[styles.copiedText, { color: theme.good }]}>Copied!</Text>
        )}

        {/* A. Location & Eligibility */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <MapPin size={18} color={theme.primary} />
            <SectionHeader title="Location & Eligibility" />
          </View>
          <View style={{ marginTop: 8 }}>
            <ResultRow
              label="Village / Locality"
              value={data.location.village || '—'}
            />
            <ResultRow label="Block" value={data.location.block || '—'} />
            <ResultRow label="District" value={data.location.district || '—'} />
            <ResultRow label="State" value={data.location.state || '—'} />
            <ResultRow
              label="Area type"
              value={data.location.urban_rural_flag || '—'}
            />
            {isSynthetic && (
              <Text style={[styles.syntheticNote, { color: theme.mutedText }]}>
                Location data estimated — not in the curated dataset
              </Text>
            )}
            <View style={styles.divider} />
            <View style={styles.eligibilityRow}>
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Eligibility
              </Text>
              <Badge
                label={eligible ? 'PASSED' : 'NOT MET'}
                variant={eligible ? 'good' : 'bad'}
              />
            </View>
            {!eligible && data.eligibility.reasons.length > 0 && (
              <View style={styles.reasonsContainer}>
                {data.eligibility.reasons.map((reason, i) => (
                  <View
                    key={i}
                    style={[
                      styles.reasonItem,
                      { backgroundColor: theme.bad + '12', borderColor: theme.bad + '30' },
                    ]}
                  >
                    <AlertTriangle size={16} color={theme.bad} />
                    <Text style={[styles.reasonText, { color: theme.text }]}>
                      {reason}
                    </Text>
                  </View>
                ))}
                <Text style={[styles.noDataNote, { color: theme.mutedText }]}>
                  No financial or feasibility figures were computed for this
                  profile.
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* B. Financial Structuring */}
        {hasFs && (
          <Card>
            <View style={styles.cardHeaderRow}>
              <DollarSign size={18} color={theme.primary} />
              <SectionHeader title="Financial Structuring" />
            </View>
            <View style={{ marginTop: 8 }}>
              {/* Three cost comparison bars */}
              <View style={styles.costComparison}>
                <CostBar
                  label="Naive max cost"
                  value={(fs as FinancialStructuring).naive_max_project_cost}
                  color={theme.mutedText}
                  theme={theme}
                />
                <CostBar
                  label="Affordable max cost"
                  value={(fs as FinancialStructuring).affordable_max_project_cost}
                  color={theme.warning}
                  theme={theme}
                />
                <CostBar
                  label="Recommended cost"
                  value={(fs as FinancialStructuring).recommended_project_cost}
                  color={theme.primary}
                  theme={theme}
                  highlight
                />
              </View>
              <View style={styles.divider} />
              <ResultRow
                label="Operational project cost"
                value={formatINR((fs as FinancialStructuring).operational_project_cost)}
              />
              <ResultRow
                label="Capex"
                value={formatINR((fs as FinancialStructuring).capex)}
              />
              <ResultRow
                label="Working capital"
                value={formatINR((fs as FinancialStructuring).working_capital)}
              />
              <View style={styles.divider} />
              <Text style={[styles.subHeader, { color: theme.text }]}>
                Scheme details
              </Text>
              <ResultRow
                label="Scheme"
                value={schemeLabel((fs as FinancialStructuring).scheme.scheme_key)}
              />
              <ResultRow
                label="Project cost"
                value={formatINR((fs as FinancialStructuring).scheme.project_cost)}
              />
              <ResultRow
                label="Loan amount"
                value={formatINR((fs as FinancialStructuring).scheme.loan_amount)}
                bold
              />
              <ResultRow
                label="Margin required"
                value={formatINR((fs as FinancialStructuring).scheme.margin_required)}
              />
              <ResultRow
                label="Effective loan share"
                value={formatPercent((fs as FinancialStructuring).scheme.effective_loan_share_pct)}
              />
              <ResultRow
                label="Interest rate"
                value={(fs as FinancialStructuring).scheme.interest_rate_pct.toFixed(2) + '%'}
              />
              <ResultRow
                label="Tenure"
                value={`${(fs as FinancialStructuring).scheme.tenure_months} months`}
              />
              <ResultRow
                label="Moratorium period"
                value={`${(fs as FinancialStructuring).scheme.moratorium_months} months`}
              />
              {(fs as FinancialStructuring).scheme.cap_bound && (
                <Text style={[styles.capNote, { color: theme.warning }]}>
                  Loan amount was capped by the scheme's maximum limit.
                </Text>
              )}
              <View style={[styles.noteBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                <Info size={16} color={theme.primary} />
                <Text style={[styles.noteText, { color: theme.text }]}>
                  {(fs as FinancialStructuring).note}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* C. Feasibility */}
        {hasFe && (
          <Card>
            <View style={styles.cardHeaderRow}>
              <TrendingUp size={18} color={theme.primary} />
              <SectionHeader title="Feasibility" />
            </View>
            <View style={{ marginTop: 8 }}>
              <ResultRow
                label="Catchment (5km)"
                value={formatNumber((fe as Feasibility).catchment_population_5km)}
              />
              <ResultRow
                label="Catchment (10km)"
                value={formatNumber((fe as Feasibility).catchment_population_10km)}
              />
              <ResultRow
                label="Competitors"
                value={String((fe as Feasibility).competitor_count)}
              />
              <ResultRow
                label="Nearest competitor"
                value={formatKm((fe as Feasibility).nearest_competitor_km)}
              />
              <ResultRow
                label="Demand gap"
                value={formatPercent((fe as Feasibility).demand_gap_pct)}
              />
              <View style={styles.eligibilityRow}>
                <Text style={[styles.label, { color: theme.mutedText }]}>
                  Opportunity
                </Text>
                <Badge
                  label={(fe as Feasibility).opportunity_class}
                  variant={opportunityVariant((fe as Feasibility).opportunity_class)}
                />
              </View>
              <ResultRow
                label="Modal price"
                value={formatINRDecimal((fe as Feasibility).price_modal_inr)}
              />
              <View style={styles.divider} />
              <Text style={[styles.subHeader, { color: theme.text }]}>
                Estimated monthly revenue
              </Text>
              <View style={styles.revenueBox}>
                <Text style={[styles.revenueValue, { color: theme.text }]}>
                  {formatINRDecimal((fe as Feasibility).estimated_monthly_revenue.value)}
                </Text>
                <Text style={[styles.revenueRange, { color: theme.mutedText }]}>
                  {formatINRDecimal((fe as Feasibility).estimated_monthly_revenue.low)} –{' '}
                  {formatINRDecimal((fe as Feasibility).estimated_monthly_revenue.high)}
                </Text>
              </View>
              <View style={styles.divider} />
              <Text style={[styles.subHeader, { color: theme.text }]}>
                Risk factors
              </Text>
              <View style={styles.chipsContainer}>
                {(fe as Feasibility).risk.key_risk_factors.map((risk, i) => (
                  <View
                    key={i}
                    style={[styles.chip, { backgroundColor: theme.warning + '15', borderColor: theme.warning + '40' }]}
                  >
                    <Text style={[styles.chipText, { color: theme.warning }]}>
                      {risk}
                    </Text>
                  </View>
                ))}
              </View>
              <ResultRow
                label="Risk severity score"
                value={`${(fe as Feasibility).risk.risk_severity_score.toFixed(1)} / 10`}
              />
              <View style={styles.divider} />
              <Text style={[styles.subHeader, { color: theme.text }]}>SWOT</Text>
              {swotGroups.map((group) => (
                <View key={group.dim} style={styles.swotGroup}>
                  <Text style={[styles.swotDim, { color: swotDimColor(group.dim, theme) }]}>
                    {swotDimLabel(group.dim)}
                  </Text>
                  {group.items.map((item, i) => (
                    <Text
                      key={i}
                      style={[styles.swotItem, { color: theme.text }]}
                    >
                      {'\u2022'} {item.description}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* D. Repayment & Viability */}
        {hasRv && (
          <Card>
            <View style={styles.cardHeaderRow}>
              <ShieldCheck size={18} color={theme.primary} />
              <SectionHeader title="Repayment & Viability" />
            </View>
            <View style={{ marginTop: 8 }}>
              <ResultRow
                label="Moratorium mode"
                value={moratoriumLabel((rv as RepaymentViability).moratorium_mode)}
              />
              <ResultRow
                label="Quarterly installment"
                value={formatINRDecimal((rv as RepaymentViability).quarterly_installment)}
                bold
              />
              <ResultRow
                label="Monthly operating cost"
                value={formatINR((rv as RepaymentViability).monthly_opex)}
              />
              <ResultRow
                label="Schedule length"
                value={`${(rv as RepaymentViability).schedule_length} quarters`}
              />
              <ResultRow
                label="Total repayment"
                value={formatINRDecimal((rv as RepaymentViability).total_repayment)}
              />
              <View style={styles.divider} />
              <View style={styles.verdictContainer}>
                <Badge
                  label={(rv as RepaymentViability).verdict}
                  variant={verdictVariant((rv as RepaymentViability).repayable_count)}
                />
                <Text style={[styles.verdictCaption, { color: theme.mutedText }]}>
                  Based on {(rv as RepaymentViability).repayable_count} of{' '}
                  {(rv as RepaymentViability).n_scenarios} scenarios across
                  uncertainty bands — not a guaranteed outcome.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* E. Calculation Trace */}
        <Card>
          <TouchableOpacity
            style={styles.traceHeader}
            onPress={() => setTraceOpen(!traceOpen)}
          >
            <View style={styles.traceHeaderLeft}>
              <PieChart size={18} color={theme.mutedText} />
              <Text style={[styles.traceTitle, { color: theme.text }]}>
                Calculation trace
              </Text>
            </View>
            {traceOpen ? (
              <ChevronUp size={20} color={theme.mutedText} />
            ) : (
              <ChevronDown size={20} color={theme.mutedText} />
            )}
          </TouchableOpacity>
          {traceOpen && (
            <View style={{ marginTop: 12, gap: 12 }}>
              {data.trace.map((step: TraceStep, i: number) => (
                <View
                  key={i}
                  style={[styles.traceStep, { borderColor: theme.border }]}
                >
                  <Text style={[styles.traceStepName, { color: theme.primary }]}>
                    {step.step.replace(/_/g, ' ')}
                  </Text>
                  {step.formula ? (
                    <Text style={[styles.traceFormula, { color: theme.text }]}>
                      {step.formula}
                    </Text>
                  ) : null}
                  {step.sources.length > 0 && (
                    <Text style={[styles.traceSources, { color: theme.mutedText }]}>
                      Sources: {step.sources.join(', ')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

function CostBar({
  label,
  value,
  color,
  theme,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  theme: ReturnType<typeof useApp>['theme'];
  highlight?: boolean;
}) {
  return (
    <View style={styles.costBar}>
      <Text style={[styles.costBarLabel, { color: theme.mutedText }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.costBarValue,
          { color: highlight ? theme.primary : theme.text },
          highlight && { fontWeight: '700' },
        ]}
      >
        {formatINR(value)}
      </Text>
    </View>
  );
}

function schemeLabel(key: string): string {
  if (key === 'micro_credit_finance') return 'Micro Credit Finance';
  if (key === 'term_loan') return 'Term Loan';
  return key.replace(/_/g, ' ');
}

function moratoriumLabel(mode: string): string {
  if (mode === 'SERVICED') return 'Serviced';
  if (mode === 'CAPITALISED') return 'Capitalised';
  if (mode === 'WAIVED') return 'Waived';
  return mode;
}

function swotDimLabel(dim: string): string {
  const map: Record<string, string> = {
    strength: 'Strengths',
    weakness: 'Weaknesses',
    opportunity: 'Opportunities',
    threat: 'Threats',
  };
  return map[dim] ?? dim;
}

function swotDimColor(dim: string, theme: ReturnType<typeof useApp>['theme']): string {
  const map: Record<string, string> = {
    strength: theme.good,
    weakness: theme.bad,
    opportunity: theme.primary,
    threat: theme.warning,
  };
  return map[dim] ?? theme.text;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  reportIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportId: {
    fontSize: 13,
    flex: 1,
  },
  copyBtn: {
    padding: 6,
  minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copiedText: {
    fontSize: 12,
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
  fontWeight: '500',
  },
  syntheticNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'transparent',
    marginVertical: 4,
  },
  eligibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reasonsContainer: {
    marginTop: 12,
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  noDataNote: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  costComparison: {
    gap: 10,
  },
  costBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  costBarLabel: {
    fontSize: 14,
  },
  costBarValue: {
    fontSize: 15,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  capNote: {
    fontSize: 13,
    marginTop: 8,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  revenueBox: {
    paddingVertical: 8,
  gap: 4,
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  revenueRange: {
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  swotGroup: {
    marginTop: 8,
  gap: 4,
  },
  swotDim: {
    fontSize: 14,
    fontWeight: '700',
  },
  swotItem: {
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 4,
  },
  verdictContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  verdictCaption: {
    fontSize: 13,
    lineHeight: 18,
  },
  traceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  traceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  traceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  traceStep: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  traceStepName: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  traceFormula: {
    fontSize: 13,
    lineHeight: 18,
  },
  traceSources: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
