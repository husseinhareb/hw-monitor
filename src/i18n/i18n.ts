import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { invoke } from '@tauri-apps/api/tauri';

import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationDE from '../locales/de/translation.json';
import translationUK from '../locales/uk/translation.json';

// Define the expected shape of the configuration object
interface Config {
  language: string;
}

const resources = {
  en: { translation: translationEN },
  fr: { translation: translationFR },
  de: { translation: translationDE },
  uk: { translation: translationUK },

};

// Function to fetch language configuration
const fetchLanguageConfig = async (): Promise<string> => {
  try {
    // Apply type assertion here
    const config = await invoke<Config>('get_configs');
    return config?.language || 'en'; // Default to 'en' if no language is found
  } catch (error) {
    console.error('Error fetching language configuration:', error);
    return 'en'; // Default to 'en' on error
  }
};

// Initialize i18n with fetched language
const initializeI18n = async () => {
  const language = await fetchLanguageConfig();

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

initializeI18n();

export default i18n;
