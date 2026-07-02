'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import translations, { type Lang } from './translations';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof translations['en'];
}

const Ctx = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'ar' || saved === 'en') setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang: setLangState, t: translations[lang] }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);
