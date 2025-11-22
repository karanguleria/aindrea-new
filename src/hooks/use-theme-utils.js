import { useTheme } from '@/contexts/ThemeContext';

// Custom hook for theme-related utilities
export const useThemeUtils = () => {
  const { theme, resolvedTheme, changeTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';
  const isSystem = theme === 'system';

  const toggleTheme = () => {
    if (resolvedTheme === 'light') {
      changeTheme('dark');
    } else {
      changeTheme('light');
    }
  };

  return {
    theme,
    resolvedTheme,
    changeTheme,
    toggleTheme,
    isDark,
    isLight,
    isSystem,
  };
};
