import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react-native';
import { useApp } from '@/lib/theme';
import { Card } from '@/components/Card';
import { SettingsModal } from '@/components/SettingsModal';
import { assess, NetworkError, ApiError } from '@/lib/api';
import { resultStore } from '@/lib/resultStore';
import type {
  BusinessCategory,
  Community,
  MoratoriumMode,
} from '@/types/api';

const CATEGORIES: BusinessCategory[] = ['Dairy', 'Retail', 'Textiles'];
const COMMUNITIES: Community[] = ['SC', 'ST', 'OBC', 'General'];
const MORATORIUM_MODES: { value: MoratoriumMode; label: string }[] = [
  { value: 'SERVICED', label: 'Serviced (pay interest during moratorium)' },
  { value: 'CAPITALISED', label: 'Capitalised (interest added to principal)' },
  { value: 'WAIVED', label: 'Waived (no interest during moratorium)' },
];

interface FormState {
  location: string;
  budget: string;
  category: BusinessCategory;
  community: Community;
  annualIncome: string;
  isDefaulter: boolean;
  moratoriumMode: MoratoriumMode;
}

export default function AssessmentForm() {
  const { theme, apiUrl } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    location: '',
    budget: '',
    category: 'Dairy',
    community: 'SC',
    annualIncome: '120000',
    isDefaulter: false,
    moratoriumMode: 'SERVICED',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ location?: string; budget?: string }>({});
  const [settingsOpen, setSettingsOpen] = useState(false);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const validate = (): boolean => {
    const e: { location?: string; budget?: string } = {};
    if (!form.location.trim()) e.location = 'Location is required';
    const budgetNum = parseFloat(form.budget);
    if (!form.budget || isNaN(budgetNum) || budgetNum <= 0) {
      e.budget = 'Budget must be a positive number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await assess(apiUrl, {
        location: form.location.trim(),
        budget: parseFloat(form.budget),
        category: form.category,
        community: form.community,
        annual_income: parseFloat(form.annualIncome) || 120000,
        is_defaulter: form.isDefaulter,
        moratorium_mode: form.moratoriumMode,
      });
      resultStore.set(result, { ...form });
      router.push('/results');
    } catch (err) {
      if (err instanceof NetworkError) {
        setError(
          "Can't reach the backend — check that your phone and laptop are on the same WiFi network and the API address is correct.",
        );
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={[styles.appTitle, { color: theme.text }]}>ARTHA SETU</Text>
          <Text style={[styles.appSubtitle, { color: theme.mutedText }]}>
            Feasibility & Financial Structuring
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setSettingsOpen(true)}
          style={[styles.iconBtn, { borderColor: theme.border }]}
        >
          <Settings size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Assessment Details
            </Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Location
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: errors.location ? theme.bad : theme.border,
                    color: theme.text,
                  },
                ]}
                value={form.location}
                onChangeText={(v) => update('location', v)}
                placeholder="e.g. Chengalpattu, Koramangala, Rajasthan..."
                placeholderTextColor={theme.mutedText}
              />
              {errors.location ? (
                <Text style={[styles.errorText, { color: theme.bad }]}>
                  {errors.location}
                </Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Budget available (₹)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: errors.budget ? theme.bad : theme.border,
                    color: theme.text,
                  },
                ]}
                value={form.budget}
                onChangeText={(v) => update('budget', v)}
                placeholder="e.g. 15000"
                placeholderTextColor={theme.mutedText}
                keyboardType="numeric"
              />
              {errors.budget ? (
                <Text style={[styles.errorText, { color: theme.bad }]}>
                  {errors.budget}
                </Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Business category
              </Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => update('category', cat)}
                    style={[
                      styles.categoryBtn,
                      {
                        backgroundColor:
                          form.category === cat ? theme.primary : theme.inputBg,
                        borderColor:
                          form.category === cat ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: form.category === cat ? '#fff' : theme.text,
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.collapsibleHeader, { borderColor: theme.border }]}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Text style={[styles.collapsibleTitle, { color: theme.text }]}>
                Eligibility details
              </Text>
              {showDetails ? (
                <ChevronUp size={20} color={theme.mutedText} />
              ) : (
                <ChevronDown size={20} color={theme.mutedText} />
              )}
            </TouchableOpacity>

            {showDetails && (
              <View style={styles.collapsibleContent}>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.mutedText }]}>
                    Community
                  </Text>
                  <View style={styles.pickerRow}>
                    {COMMUNITIES.map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => update('community', c)}
                        style={[
                          styles.pickerBtn,
                          {
                            backgroundColor:
                              form.community === c ? theme.primary : theme.inputBg,
                            borderColor:
                              form.community === c ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerText,
                            {
                              color: form.community === c ? '#fff' : theme.text,
                            },
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.mutedText }]}>
                    Annual family income (₹)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    value={form.annualIncome}
                    onChangeText={(v) => update('annualIncome', v)}
                    placeholder="120000"
                    placeholderTextColor={theme.mutedText}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.mutedText }]}>
                    Moratorium interest mode
                  </Text>
                  <View style={styles.moratoriumOptions}>
                    {MORATORIUM_MODES.map((m) => (
                      <TouchableOpacity
                        key={m.value}
                        onPress={() => update('moratoriumMode', m.value)}
                        style={[
                          styles.moratoriumBtn,
                          {
                            backgroundColor:
                              form.moratoriumMode === m.value
                                ? theme.primary
                                : theme.inputBg,
                            borderColor:
                              form.moratoriumMode === m.value
                                ? theme.primary
                                : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.moratoriumText,
                            {
                              color:
                                form.moratoriumMode === m.value
                                  ? '#fff'
                                  : theme.text,
                            },
                          ]}
                        >
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: theme.text, flex: 1 }]}>
                    Existing loan default on record?
                  </Text>
                  <TouchableOpacity
                    onPress={() => update('isDefaulter', !form.isDefaulter)}
                    style={[
                      styles.toggle,
                      {
                        backgroundColor: form.isDefaulter
                          ? theme.bad
                          : theme.inputBg,
                        borderColor: form.isDefaulter ? theme.bad : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: form.isDefaulter ? '#fff' : theme.text },
                      ]}
                    >
                      {form.isDefaulter ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>

          {error && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: theme.bad + '15',
                  borderColor: theme.bad + '40',
                },
              ]}
            >
              <AlertCircle size={20} color={theme.bad} />
              <Text style={[styles.errorBannerText, { color: theme.bad }]}>
                {error}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.background,
            paddingBottom: insets.bottom + 12,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Get Assessment</Text>
          )}
        </TouchableOpacity>
      </View>

      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  appSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 20,
    paddingTop: 8,
    gap: 16,
    flexGrow: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    marginTop: 4,
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  collapsibleContent: {
    paddingTop: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  moratoriumOptions: {
    gap: 8,
  },
  moratoriumBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  moratoriumText: {
    fontSize: 13,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggle: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
