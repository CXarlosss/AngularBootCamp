// @ts-nocheck
import React from 'react';
import styles from '../../styles/components/curriculum/lenguages.module.css';

// Puedes pasar los datos como prop; si no, usa el fallback.
const DEFAULT_LANGUAGES = [
  {
    code: 'es',
    language: 'ESPAÑOL',
    level: 'Nativo',
    description:
      'Dominio completo del idioma, tanto oral como escrito, con capacidad para comunicarse de manera fluida y precisa en cualquier contexto.',
    progress: 100,
  },
  {
    code: 'en',
    language: 'INGLÉS',
    level: 'B2',
    description:
      'Nivel intermedio-alto, con capacidad para comprender y producir textos complejos, así como mantener conversaciones fluidas sobre una variedad de temas.',
    progress: 75,
  },
];

// Mapeo simple de banderas por si quieres mostrarlas
const FLAGS = {
  es: '🇪🇸',
  en: '🇬🇧',
};

function LanguagesList({ languages = DEFAULT_LANGUAGES, showFlags = true, showProgress = false }) {
  return (
    <section className={styles.languagesSection} aria-labelledby="languages-title">
      <h2 id="languages-title" className={styles.mainTitle}>
        Idiomas
      </h2>

      {/* Lista semántica */}
      <ul className={styles.languagesGrid}>
        {languages.map((lang) => {
          const key = lang.code || lang.language;
          const flag = showFlags ? FLAGS[lang.code] : null;
          return (
            <li key={key} className={styles.languagePill}>
              <div className={styles.languageHeader}>
                <span className={styles.languageName}>
                  {flag && <span aria-hidden="true" style={{ marginRight: '.5rem' }}>{flag}</span>}
                  <span>{lang.language}</span>
                </span>
                <span className={styles.languageLevel} aria-label={`Nivel ${lang.level}`}>
                  {lang.level}
                </span>
              </div>

              {lang.description && (
                <p className={styles.languageDescription}>{lang.description}</p>
              )}

              {/* Progreso opcional (no altera estilos si showProgress = false) */}
              {showProgress && typeof lang.progress === 'number' && (
                <div style={{ width: '100%' }}>
                  <meter
                    min={0}
                    max={100}
                    value={lang.progress}
                    aria-label={`Progreso ${lang.language} ${lang.progress}%`}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default LanguagesList;
