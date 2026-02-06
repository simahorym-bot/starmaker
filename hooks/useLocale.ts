import { fr, Locale } from '@/constants/locales/fr';

// Hook to get French translations
export const useLocale = (): Locale => {
  return fr;
};

// Helper function for direct access
export const t = fr;
