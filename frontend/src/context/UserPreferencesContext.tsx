import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  pageSize: number;
  autoSave: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'ar',
  tableDensity: 'comfortable',
  pageSize: 25,
  autoSave: true,
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // Apply theme - .light class for light mode, no class for dark mode
    document.documentElement.classList.toggle('light', preferences.theme === 'light');
    
    // Apply language
    document.documentElement.lang = preferences.language;
    document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}
