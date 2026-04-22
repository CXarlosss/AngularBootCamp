import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      "welcome": "¡Hola, {{name}}!",
      "start": "EMPEZAR",
      "locked": "Bloqueado",
      // ... más traducciones
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
