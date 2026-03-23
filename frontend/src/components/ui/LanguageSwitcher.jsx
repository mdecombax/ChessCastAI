import React from 'react';
import { useLang } from '../../LanguageContext.jsx';
import { T } from '../../theme.js';

export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLang();

  return (
    <button
      onClick={toggleLang}
      title={lang === 'fr' ? 'Cambiar a español' : 'Passer en français'}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.r8,
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: 22,
        lineHeight: 1,
        transition: T.transition,
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
    >
      {lang === 'fr' ? '🇪🇸' : '🇫🇷'}
    </button>
  );
}
