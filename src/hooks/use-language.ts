import { useLanguage as useLanguageFromProvider } from '../components/language-provider';

// Re-export the useLanguage hook with a rename for the translate function for consistency
export const useLanguage = () => {
  const { t: translate, ...rest } = useLanguageFromProvider();
  return { translate, ...rest };
}; 