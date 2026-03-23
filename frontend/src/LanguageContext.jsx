import React, { createContext, useContext, useState } from 'react';
import { translations } from './i18n.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lang') || 'fr'; } catch { return 'fr'; }
  });

  function toggleLang() {
    const next = lang === 'fr' ? 'es' : 'fr';
    setLang(next);
    try { localStorage.setItem('lang', next); } catch {}
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
