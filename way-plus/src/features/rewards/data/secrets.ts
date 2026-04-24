export interface SecretCard {
  id: string;
  name: string;
  condition: string;
  hint: string;
  stickerId: string; // La carta que desbloquea
}

export const SECRET_CARDS: SecretCard[] = [
  {
    id: 'sec-curious',
    name: 'El Curioso',
    condition: 'Tocar la mascota 10 veces seguidas en la home',
    hint: 'A tu mascota le encantan las caricias...',
    stickerId: 'card-cri-5' // Gato Cósmico
  },
  {
    id: 'sec-nocturnal',
    name: 'Nocturno',
    condition: 'Entrar a la app entre las 00:00 y 02:00',
    hint: 'Algunos guardianes solo aparecen bajo la luna.',
    stickerId: 'card-cri-6' // Lobo Lunar
  },
  {
    id: 'sec-patient',
    name: 'El Paciente',
    condition: 'Quedarse 30 segundos en la pantalla de carga',
    hint: 'La paciencia es una virtud de maestros.',
    stickerId: 'card-cri-7' // Tortuga Sabia
  },
  {
    id: 'sec-collector',
    name: 'El Coleccionista',
    condition: 'Tener exactamente 100 monedas',
    hint: 'Ni una más, ni una menos. La perfección del 100.',
    stickerId: 'card-emo-8' // Guardián Zen
  },
  {
    id: 'sec-brave',
    name: 'El Valiente',
    condition: 'Fallar un WAY 5 veces seguidas sin usar boosts',
    hint: 'Caerse es parte del camino al éxito.',
    stickerId: 'card-emo-4' // Valentía León
  },
  {
    id: 'sec-explorer',
    name: 'El Explorador',
    condition: 'Visitar todas las pestañas en menos de 10 segundos',
    hint: 'Conoce cada rincón de tu mundo a toda velocidad.',
    stickerId: 'card-cri-4' // Grifo Veloz
  },
  {
    id: 'sec-loyal',
    name: 'El Leal',
    condition: 'Mantener una racha de exactamente 7 días',
    hint: 'Siete llamas, una semana de fuego perfecto.',
    stickerId: 'card-cri-3' // Fénix Renacido
  }
];
