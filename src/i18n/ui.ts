import ptBr from './pt-br.json';
import en from './en.json';
import es from './es.json';

export const defaultLang = 'pt-br' as const;
export const supportedLangs = ['pt-br', 'en', 'es'] as const;
export type Lang = (typeof supportedLangs)[number];

export const languages: Record<Lang, { name: string; flag: string }> = {
  'pt-br': { name: 'Português', flag: '🇧🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
};

export const ui = {
  'pt-br': ptBr,
  en,
  es,
} as const;

export function useTranslations(lang: Lang | string = defaultLang) {
  const currentLang = (supportedLangs.includes(lang as Lang) ? lang : defaultLang) as Lang;
  const currentDict = ui[currentLang] || ui[defaultLang];

  return function t(path: string): string {
    const keys = path.split('.');
    let result: any = currentDict;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // Fallback to default language
        let fallbackResult: any = ui[defaultLang];
        for (const fbKey of keys) {
          if (fallbackResult && typeof fallbackResult === 'object' && fbKey in fallbackResult) {
            fallbackResult = fallbackResult[fbKey];
          } else {
            return path;
          }
        }
        return fallbackResult ?? path;
      }
    }
    return typeof result === 'string' ? result : path;
  };
}

export function getLocalizedPath(lang: Lang | string, path: string = ''): string {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  if (lang === defaultLang) {
    return cleanPath ? `/${cleanPath}` : '/';
  }
  return cleanPath ? `/${lang}/${cleanPath}` : `/${lang}/`;
}

