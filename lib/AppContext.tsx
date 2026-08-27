import { useEffect, useRef, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppContext,
  lightTheme,
  darkTheme,
  type Theme,
  type ThemeMode,
} from './theme';

const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.1.42:8000';

const THEME_KEY = 'arthasetu_theme';
const API_KEY = 'arthasetu_api_url';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [apiUrl, setApiUrlState] = useState<string>(DEFAULT_API_URL);
  const loadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const [storedTheme, storedApi] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(API_KEY),
      ]);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeModeState(storedTheme);
      } else if (systemScheme === 'dark') {
        setThemeModeState('dark');
      }
      if (storedApi) setApiUrlState(storedApi);
      loadedRef.current = true;
    })();
  }, [systemScheme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const setApiUrl = useCallback((url: string) => {
    setApiUrlState(url);
    AsyncStorage.setItem(API_KEY, url);
  }, []);

  const theme: Theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <AppContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        toggleTheme,
        apiUrl,
        setApiUrl,
        systemColorScheme: systemScheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
