import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  background: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
  primary: string;
  primaryPressed: string;
  good: string;
  warning: string;
  bad: string;
  inputBg: string;
  overlay: string;
}

export const FONT_REGULAR = 'Inter-Regular';
export const FONT_MEDIUM = 'Inter-Medium';
export const FONT_SEMIBOLD = 'Inter-SemiBold';
export const FONT_BOLD = 'Inter-Bold';
export const FONT_EXTRABOLD = 'Inter-ExtraBold';

export const lightTheme: Theme = {
  mode: 'light',
  background: '#f6f7f5',
  surface: '#ffffff',
  border: '#dfe3de',
  text: '#1c231c',
  mutedText: '#5b655a',
  primary: '#2f6b3a',
  primaryPressed: '#234f2b',
  good: '#2f6b3a',
  warning: '#b3541e',
  bad: '#a53232',
  inputBg: '#ffffff',
  overlay: 'rgba(0,0,0,0.4)',
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: '#14161a',
  surface: '#1e2124',
  border: '#2c3038',
  text: '#e8eae6',
  mutedText: '#9aa39a',
  primary: '#2f6b3a',
  primaryPressed: '#234f2b',
  good: '#2f6b3a',
  warning: '#b3541e',
  bad: '#a53232',
  inputBg: '#262a2e',
  overlay: 'rgba(0,0,0,0.6)',
};

export interface AppContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  systemColorScheme: ReturnType<typeof useColorScheme>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
