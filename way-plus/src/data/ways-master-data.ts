// src/data/ways-master-data.ts
// Single source of truth para los 57 ways. Maite puede editar esto directamente
// o exportarlo desde Google Sheets → JSON.

export type StepNumber = 1 | 2 | 3;
export type Theme = 'relaxation' | 'self-esteem' | 'assertiveness';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type StimulusType = 'text' | 'voice' | 'image';

export interface WayMasterEntry {
  // Identificación
  id: string;           // "s1-w1", "s2-w15", etc.
  step: StepNumber;
  stepTitle: string;    // "STEP Relajación", etc.
  wayNumber: number;    // 1, 2, 3... (para el nombre de archivo way_s1_w1.webp)
  
  // Contenido terapéutico (lo que ve el niño)
  title: string;        // Título corto y claro (petición de Maite: acortado)
  shortDescription: string; // Instrucción breve para el niño
  
  // Estímulo (lo que se muestra en pantalla)
  stimulusType: StimulusType;
  stimulusText?: string;    // Si es tipo 'text'
  stimulusAudioUrl?: string; // Si es tipo 'voice' (URL en Supabase Storage)
  stimulusImageUrl?: string; // Si es tipo 'image' (fallback)
  
  // Doble elección (motor de ways actual)
  choiceA: string;
  choiceB: string;
  correctChoice: 'A' | 'B'; // Qué opción es la correcta
  
  // Metadatos
  theme: Theme;
  difficulty: Difficulty;
  estimatedTimeSeconds: number;
  
  // Assets
  imageFilename: string; // "way_s1_w1.webp" — nomenclatura estricta
  hasRealImage: boolean; // true = imagen fotográfica realista, false = pictograma fallback
  
  // Configuración clínica
  isHomeworkEligible: boolean; // ¿Maite puede prescribirlo como tarea?
  requiredWaysCompleted?: string[]; // IDs de ways previos requeridos (para desbloqueo)
  
  // Tags para analytics y recomendaciones futuras
  skills: string[]; // ["respiración", "calma", "atención"] etc.
}

// ============================================================
// DATOS ACTUALES (16 ways) — Copiados de relaxation.ts, autonomy.ts, assertiveness.ts
// TODO: Completar hasta 57. Formato: rellenar y pegar en Google Sheets para Maite.
// ============================================================

export const waysMasterData: WayMasterEntry[] = [
  // ═══════════════════════════════════════════════════════════
  // STEP 1: RELAJACIÓN (6 ways — actual: 1, faltan: 5)
  // ═══════════════════════════════════════════════════════════
  {
    id: 's1-w1',
    step: 1,
    stepTitle: 'STEP Relajación',
    wayNumber: 1,
    title: 'Respiración Profunda',
    shortDescription: '¿Cómo nos sentimos cuando respiramos despacio?',
    stimulusType: 'text',
    stimulusText: '¿Cómo nos sentimos cuando respiramos despacio?',
    choiceA: 'Feliz',
    choiceB: 'Enfadado',
    correctChoice: 'A',
    theme: 'relaxation',
    difficulty: 'easy',
    estimatedTimeSeconds: 10,
    imageFilename: 'way_s1_w1.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['emotional.regulation'],
  },
  // ═══════════════════════════════════════════════════════════
  // STEP 2: AUTONOMÍA Y AUTOESTIMA (29 ways — actual: 9, faltan: 20)
  // ═══════════════════════════════════════════════════════════
  {
    id: 's2-w1',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 1,
    title: 'Valor Personal',
    shortDescription: '¿Crees que eres una persona valiosa y que haces cosas muy bien?',
    stimulusType: 'text',
    stimulusText: '¿Crees que eres una persona valiosa y que haces cosas muy bien?',
    choiceA: '¡Sí, soy valioso!',
    choiceB: 'A veces dudo',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s2_w1.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['self-esteem.identity'],
  },
  {
    id: 's2-w2',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 2,
    title: 'Vínculo Familiar',
    shortDescription: '¿Sientes que eres una pieza fundamental e importante para tu familia?',
    stimulusType: 'text',
    stimulusText: '¿Sientes que eres una pieza fundamental e importante para tu familia?',
    choiceA: '¡Sí, me quieren!',
    choiceB: 'No estoy seguro',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s2_w2.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['self-esteem.family'],
  },
  {
    id: 's2-w3',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 3,
    title: 'Cuidados y Seguridad',
    shortDescription: '¿Tus papás te cuidan dándote todo lo que necesitas para crecer sano?',
    stimulusType: 'text',
    stimulusText: '¿Tus papás te cuidan dándote todo lo que necesitas para crecer sano?',
    choiceA: 'Sí, me cuidan mucho',
    choiceB: 'A veces falta algo',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s2_w3.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['self-esteem.security'],
  },
  {
    id: 's2-w4',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 4,
    title: 'Afecto y Cariño',
    shortDescription: '¿Recibes abrazos, besos y palabras bonitas de las personas que te quieren?',
    stimulusType: 'text',
    stimulusText: '¿Recibes abrazos, besos y palabras bonitas de las personas que te quieren?',
    choiceA: '¡Sí, recibo mucho amor!',
    choiceB: 'A veces no tanto',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s2_w4.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['self-esteem.affection'],
  },
  {
    id: 's2-w5',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 5,
    title: 'Identidad Propia',
    shortDescription: '¿Sabes decir con orgullo tu nombre, tus apellidos y dónde vives?',
    stimulusType: 'text',
    stimulusText: '¿Sabes decir con orgullo tu nombre, tus apellidos y dónde vives?',
    choiceA: '¡Sí, lo sé todo!',
    choiceB: 'Solo mi nombre',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'medium',
    estimatedTimeSeconds: 45,
    imageFilename: 'way_s2_w5.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['autonomy.identity'],
  },
  {
    id: 's2-w6',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 6,
    title: 'Higiene Dental',
    shortDescription: '¿Cuidas tu sonrisa cepillándote los dientes después de comer?',
    stimulusType: 'text',
    stimulusText: '¿Cuidas tu sonrisa cepillándote los dientes después de comer?',
    choiceA: '¡Sí, siempre!',
    choiceB: 'A veces se me olvida',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s2_w6.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['autonomy.hygiene.teeth'],
  },
  {
    id: 's2-w7',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 7,
    title: 'Autocuidado: Vestirse',
    shortDescription: '¿Eres capaz de elegir tu ropa y vestirte tú solo?',
    stimulusType: 'text',
    stimulusText: '¿Eres capaz de elegir tu ropa y vestirte tú solo?',
    choiceA: '¡Sí, yo puedo!',
    choiceB: 'Necesito ayuda',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'medium',
    estimatedTimeSeconds: 45,
    imageFilename: 'way_s2_w7.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['autonomy.selfcare.dressing'],
  },
  {
    id: 's2-w8',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 8,
    title: 'Responsabilidad',
    shortDescription: '¿Te haces cargo de tus juguetes y los recoges al terminar?',
    stimulusType: 'text',
    stimulusText: '¿Te haces cargo de tus juguetes y los recoges al terminar?',
    choiceA: '¡Sí, soy responsable!',
    choiceB: 'Me cuesta un poco',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s2_w8.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['autonomy.responsibility.tidying'],
  },
  {
    id: 's2-w9',
    step: 2,
    stepTitle: 'STEP Autonomía y Autoestima',
    wayNumber: 9,
    title: 'Higiene de Manos',
    shortDescription: '¿Mantienes tus manos limpias lavándolas antes de cada comida?',
    stimulusType: 'text',
    stimulusText: '¿Mantienes tus manos limpias lavándolas antes de cada comida?',
    choiceA: '¡Sí, manos limpias!',
    choiceB: 'Se me olvida',
    correctChoice: 'A',
    theme: 'self-esteem',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s2_w9.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['autonomy.hygiene.hands'],
  },

  // ═══════════════════════════════════════════════════════════
  // STEP 3: ASERTIVIDAD Y AUTOESTIMA (22 ways — actual: 6, faltan: 16)
  // ═══════════════════════════════════════════════════════════
  {
    id: 's3-w1',
    step: 3,
    stepTitle: 'STEP Asertividad y Autoestima',
    wayNumber: 1,
    title: 'Respetar el espacio de otros',
    shortDescription: '¿Llamas a la puerta y pides permiso para entrar?',
    stimulusType: 'text',
    stimulusText: '¿Llamas a la puerta y pides permiso para entrar?',
    choiceA: 'Sí llamo y pregunto',
    choiceB: 'Entro sin preguntar',
    correctChoice: 'A',
    theme: 'assertiveness',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s3_w1.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['assertiveness.boundaries.knock'],
  },
  {
    id: 's3-w2',
    step: 3,
    stepTitle: 'STEP Asertividad y Autoestima',
    wayNumber: 2,
    title: 'Ayudar a los demás',
    shortDescription: '¿Haces favores y ayudas a otros que te lo piden?',
    stimulusType: 'text',
    stimulusText: '¿Haces favores y ayudas a otros que te lo piden?',
    choiceA: 'Sí, ayudo a los demás',
    choiceB: 'No ayudo ni hago favores',
    correctChoice: 'A',
    theme: 'assertiveness',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s3_w2.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['assertiveness.empathy.help'],
  },
  {
    id: 's3-w3',
    step: 3,
    stepTitle: 'STEP Asertividad y Autoestima',
    wayNumber: 3,
    title: 'Jugar en grupo',
    shortDescription: '¿Juegas con niños y niñas?',
    stimulusType: 'text',
    stimulusText: '¿Juegas con niños y niñas?',
    choiceA: 'Sí, juego mucho con otros niños y niñas',
    choiceB: 'Juego yo solo sin nadie',
    correctChoice: 'A',
    theme: 'assertiveness',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s3_w3.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['assertiveness.social.play'],
  },
  {
    id: 's3-w4',
    step: 3,
    stepTitle: 'STEP Asertividad y Autoestima',
    wayNumber: 4,
    title: 'Digo No',
    shortDescription: '¿Dices \'NO\' cuando algo no te gusta o te hace sentir mal?',
    stimulusType: 'text',
    stimulusText: '¿Dices \'NO\' cuando algo no te gusta o te hace sentir mal?',
    choiceA: 'Sí, digo lo que no me gusta',
    choiceB: 'Me callo y me aguanto',
    correctChoice: 'A',
    theme: 'assertiveness',
    difficulty: 'medium',
    estimatedTimeSeconds: 45,
    imageFilename: 'way_s3_w4.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['assertiveness.boundaries.no'],
  },
  {
    id: 's3-w5',
    step: 3,
    stepTitle: 'STEP Asertividad y Autoestima',
    wayNumber: 5,
    title: 'Pedir perdón',
    shortDescription: '¿Pides perdón si haces algo mal o molestas a alguien sin querer?',
    stimulusType: 'text',
    stimulusText: '¿Pides perdón si haces algo mal o molestas a alguien sin querer?',
    choiceA: 'Sí, pido perdón',
    choiceB: 'No pido perdón nunca',
    correctChoice: 'A',
    theme: 'assertiveness',
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    imageFilename: 'way_s3_w5.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['assertiveness.responsibility.sorry'],
  },
  {
    id: 's3-w6',
    step: 3,
    stepTitle: 'STEP Asertividad y Autoestima',
    wayNumber: 6,
    title: 'Defenderse asertivamente',
    shortDescription: '¿Cómo te defiendes si se burlan de ti o te acusan de algo que es mentira?',
    stimulusType: 'text',
    stimulusText: '¿Cómo te defiendes si se burlan de ti o te acusan de algo que es mentira?',
    choiceA: 'Les digo que me dejen en paz y me voy',
    choiceB: 'Les grito, pego o empujo',
    correctChoice: 'A',
    theme: 'assertiveness',
    difficulty: 'medium',
    estimatedTimeSeconds: 45,
    imageFilename: 'way_s3_w6.webp',
    hasRealImage: true,
    isHomeworkEligible: true,
    skills: ['assertiveness.conflict.defense'],
  },
  {
    "id": "s1-w2",
    "step": 1,
    "stepTitle": "STEP Relajación",
    "wayNumber": 2,
    "title": "Respiro con la Barriga",
    "shortDescription": "Pon tus manos en la barriga y coge aire muy despacio.",
    "stimulusType": "text",
    "stimulusText": "Pon tus manos en la barriga y coge aire muy despacio.",
    "choiceA": "Respiro despacio",
    "choiceB": "Respiro rápido",
    "correctChoice": "A",
    "theme": "relaxation",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s1_w2.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "relaxation.breathing"
    ]
  },
  {
    "id": "s1-w3",
    "step": 1,
    "stepTitle": "STEP Relajación",
    "wayNumber": 3,
    "title": "Aplasto la Nube",
    "shortDescription": "Imagina que aprietas fuerte una nube y luego sueltas las manos.",
    "stimulusType": "text",
    "stimulusText": "Imagina que aprietas fuerte una nube y luego sueltas las manos.",
    "choiceA": "Aprieto y suelto",
    "choiceB": "Grito fuerte",
    "correctChoice": "A",
    "theme": "relaxation",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s1_w3.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "relaxation.muscle"
    ]
  },
  {
    "id": "s1-w4",
    "step": 1,
    "stepTitle": "STEP Relajación",
    "wayNumber": 4,
    "title": "Mi Lugar Seguro",
    "shortDescription": "Cierra los ojos e imagina tu lugar favorito donde estás tranquilo.",
    "stimulusType": "text",
    "stimulusText": "Cierra los ojos e imagina tu lugar favorito donde estás tranquilo.",
    "choiceA": "Pienso en mi lugar",
    "choiceB": "Pienso en cosas malas",
    "correctChoice": "A",
    "theme": "relaxation",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s1_w4.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "relaxation.imagery"
    ]
  },
  {
    "id": "s1-w5",
    "step": 1,
    "stepTitle": "STEP Relajación",
    "wayNumber": 5,
    "title": "5 Cosas que Veo",
    "shortDescription": "Mira a tu alrededor y busca 5 cosas que sean de color azul.",
    "stimulusType": "text",
    "stimulusText": "Mira a tu alrededor y busca 5 cosas que sean de color azul.",
    "choiceA": "Busco los colores",
    "choiceB": "Cierro los ojos",
    "correctChoice": "A",
    "theme": "relaxation",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s1_w5.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "relaxation.grounding"
    ]
  },
  {
    "id": "s1-w6",
    "step": 1,
    "stepTitle": "STEP Relajación",
    "wayNumber": 6,
    "title": "Bailar Despacio",
    "shortDescription": "Mueve los brazos muy despacio como si estuvieras flotando en el agua.",
    "stimulusType": "text",
    "stimulusText": "Mueve los brazos muy despacio como si estuvieras flotando en el agua.",
    "choiceA": "Me muevo lento",
    "choiceB": "Corro muy rápido",
    "correctChoice": "A",
    "theme": "relaxation",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s1_w6.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "relaxation.movement"
    ]
  },
  {
    "id": "s2-w10",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 10,
    "title": "Lavar los Dientes",
    "shortDescription": "¿Qué haces después de comer para cuidar tus dientes?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces después de comer para cuidar tus dientes?",
    "choiceA": "Me cepillo los dientes",
    "choiceB": "Me voy a jugar",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w10.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.hygiene.teeth"
    ]
  },
  {
    "id": "s2-w11",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 11,
    "title": "Peinar el Pelo",
    "shortDescription": "¿Qué usas por la mañana para que tu pelo esté ordenado?",
    "stimulusType": "text",
    "stimulusText": "¿Qué usas por la mañana para que tu pelo esté ordenado?",
    "choiceA": "Uso el peine",
    "choiceB": "Uso un lápiz",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w11.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.hygiene.hair"
    ]
  },
  {
    "id": "s2-w12",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 12,
    "title": "Lavar las Manos",
    "shortDescription": "¿Con qué te lavas las manos cuando están sucias?",
    "stimulusType": "text",
    "stimulusText": "¿Con qué te lavas las manos cuando están sucias?",
    "choiceA": "Agua y jabón",
    "choiceB": "Solo con agua",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w12.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.hygiene.hands"
    ]
  },
  {
    "id": "s2-w13",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 13,
    "title": "Habitación Limpia",
    "shortDescription": "¿Dónde pones la ropa sucia antes de ir a dormir?",
    "stimulusType": "text",
    "stimulusText": "¿Dónde pones la ropa sucia antes de ir a dormir?",
    "choiceA": "En el cesto",
    "choiceB": "En el suelo",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s2_w13.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.hygiene.room"
    ]
  },
  {
    "id": "s2-w14",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 14,
    "title": "Hace Frío",
    "shortDescription": "Si hace mucho frío en la calle, ¿qué ropa te pones?",
    "stimulusType": "text",
    "stimulusText": "Si hace mucho frío en la calle, ¿qué ropa te pones?",
    "choiceA": "Abrigo y bufanda",
    "choiceB": "Pantalón corto",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w14.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.dressing.weather"
    ]
  },
  {
    "id": "s2-w15",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 15,
    "title": "Elegir Ropa",
    "shortDescription": "¿Quién elige la ropa que te pones para ir al parque?",
    "stimulusType": "text",
    "stimulusText": "¿Quién elige la ropa que te pones para ir al parque?",
    "choiceA": "La elijo yo",
    "choiceB": "Espero a mamá",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s2_w15.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.dressing.choice"
    ]
  },
  {
    "id": "s2-w16",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 16,
    "title": "Atar Cordones",
    "shortDescription": "¿Qué haces si se te desatan los cordones de las zapatillas?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces si se te desatan los cordones de las zapatillas?",
    "choiceA": "Me los ato",
    "choiceB": "Sigo caminando",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s2_w16.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.dressing.shoes"
    ]
  },
  {
    "id": "s2-w17",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 17,
    "title": "El Desayuno",
    "shortDescription": "Por la mañana, ¿te sientas en la mesa a tomar tu desayuno?",
    "stimulusType": "text",
    "stimulusText": "Por la mañana, ¿te sientas en la mesa a tomar tu desayuno?",
    "choiceA": "Sí, me siento a comer",
    "choiceB": "Como caminando",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w17.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.eating.breakfast"
    ]
  },
  {
    "id": "s2-w18",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 18,
    "title": "Beber Agua",
    "shortDescription": "¿Qué haces si tienes mucha sed después de correr?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces si tienes mucha sed después de correr?",
    "choiceA": "Bebo un vaso de agua",
    "choiceB": "Me aguanto la sed",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w18.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.eating.water"
    ]
  },
  {
    "id": "s2-w19",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 19,
    "title": "Comer Verdura",
    "shortDescription": "¿Qué haces cuando hay una comida nueva en tu plato?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces cuando hay una comida nueva en tu plato?",
    "choiceA": "La pruebo un poco",
    "choiceB": "Lloro y no como",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s2_w19.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.eating.newfood"
    ]
  },
  {
    "id": "s2-w20",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 20,
    "title": "La Mochila",
    "shortDescription": "¿Qué pones en la mochila para ir a una excursión?",
    "stimulusType": "text",
    "stimulusText": "¿Qué pones en la mochila para ir a una excursión?",
    "choiceA": "Mi almuerzo y agua",
    "choiceB": "Solo mis juguetes",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s2_w20.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.eating.pack"
    ]
  },
  {
    "id": "s2-w21",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 21,
    "title": "Hora de Dormir",
    "shortDescription": "¿Qué haces cuando es la hora de ir a dormir?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces cuando es la hora de ir a dormir?",
    "choiceA": "Me pongo el pijama",
    "choiceB": "Me quedo jugando",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w21.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.routines.sleep"
    ]
  },
  {
    "id": "s2-w22",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 22,
    "title": "Apagar la Tele",
    "shortDescription": "¿Qué haces si papá te dice que es hora de apagar la tele?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces si papá te dice que es hora de apagar la tele?",
    "choiceA": "La apago tranquilo",
    "choiceB": "Me enfado y grito",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s2_w22.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.routines.screens"
    ]
  },
  {
    "id": "s2-w23",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 23,
    "title": "Guardar Juguetes",
    "shortDescription": "¿Qué haces cuando terminas de jugar con tus bloques?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces cuando terminas de jugar con tus bloques?",
    "choiceA": "Los guardo en la caja",
    "choiceB": "Los dejo tirados",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w23.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.routines.tidy"
    ]
  },
  {
    "id": "s2-w24",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 24,
    "title": "La Agenda",
    "shortDescription": "¿Miras tu agenda o tu horario para saber qué toca hoy?",
    "stimulusType": "text",
    "stimulusText": "¿Miras tu agenda o tu horario para saber qué toca hoy?",
    "choiceA": "Miro mi agenda",
    "choiceB": "No miro nada",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s2_w24.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.routines.schedule"
    ]
  },
  {
    "id": "s2-w25",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 25,
    "title": "Estoy Enfadado",
    "shortDescription": "¿Qué haces cuando te sientes muy enfadado en casa?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces cuando te sientes muy enfadado en casa?",
    "choiceA": "Respiro y me calmo",
    "choiceB": "Tiro los juguetes",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s2_w25.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.emotions.anger"
    ]
  },
  {
    "id": "s2-w26",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 26,
    "title": "Estoy Triste",
    "shortDescription": "¿Qué haces si te sientes triste y con ganas de llorar?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces si te sientes triste y con ganas de llorar?",
    "choiceA": "Pido un abrazo",
    "choiceB": "Me escondo solo",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s2_w26.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.emotions.sadness"
    ]
  },
  {
    "id": "s2-w27",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 27,
    "title": "Estoy Contento",
    "shortDescription": "¿Qué haces cuando estás muy feliz porque vamos al parque?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces cuando estás muy feliz porque vamos al parque?",
    "choiceA": "Sonrío y salto un poco",
    "choiceB": "Grito muy fuerte",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s2_w27.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.emotions.happiness"
    ]
  },
  {
    "id": "s2-w28",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 28,
    "title": "Tengo Miedo",
    "shortDescription": "¿Qué haces si te asustas mucho con un ruido fuerte?",
    "stimulusType": "text",
    "stimulusText": "¿Qué haces si te asustas mucho con un ruido fuerte?",
    "choiceA": "Digo \"Me asusté\"",
    "choiceB": "Salgo corriendo sin mirar",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s2_w28.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.emotions.fear"
    ]
  },
  {
    "id": "s2-w29",
    "step": 2,
    "stepTitle": "STEP Autonomía y Autoestima",
    "wayNumber": 29,
    "title": "Pensamiento Positivo",
    "shortDescription": "Si un dibujo no te sale bien, ¿qué te dices a ti mismo?",
    "stimulusType": "text",
    "stimulusText": "Si un dibujo no te sale bien, ¿qué te dices a ti mismo?",
    "choiceA": "\"Puedo intentarlo otra vez\"",
    "choiceB": "\"Soy un desastre\"",
    "correctChoice": "A",
    "theme": "self-esteem",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s2_w29.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "autonomy.selfesteem.resilience"
    ]
  },
  {
    "id": "s3-w7",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 7,
    "title": "Decir que estoy enfadado",
    "shortDescription": "¿Cómo le dices a un amigo que estás enfadado con él?",
    "stimulusType": "text",
    "stimulusText": "¿Cómo le dices a un amigo que estás enfadado con él?",
    "choiceA": "Le hablo tranquilo",
    "choiceB": "Le doy un empujón",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s3_w7.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.express.anger"
    ]
  },
  {
    "id": "s3-w8",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 8,
    "title": "Decir que estoy triste",
    "shortDescription": "Si te sientes triste, ¿qué haces para sentirte mejor?",
    "stimulusType": "text",
    "stimulusText": "Si te sientes triste, ¿qué haces para sentirte mejor?",
    "choiceA": "Digo \"Estoy triste\"",
    "choiceB": "Rompo el papel",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s3_w8.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.express.sadness"
    ]
  },
  {
    "id": "s3-w9",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 9,
    "title": "Decir que estoy contento",
    "shortDescription": "Cuando estás contento, ¿cómo se lo dices a mamá?",
    "stimulusType": "text",
    "stimulusText": "Cuando estás contento, ¿cómo se lo dices a mamá?",
    "choiceA": "Le doy una sonrisa",
    "choiceB": "Le tiro del pelo",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s3_w9.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.express.happiness"
    ]
  },
  {
    "id": "s3-w10",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 10,
    "title": "Decir que tengo miedo",
    "shortDescription": "Si tienes miedo de un perro grande, ¿qué haces?",
    "stimulusType": "text",
    "stimulusText": "Si tienes miedo de un perro grande, ¿qué haces?",
    "choiceA": "Me pongo junto a papá",
    "choiceB": "Grito en la calle",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s3_w10.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.express.fear"
    ]
  },
  {
    "id": "s3-w11",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 11,
    "title": "No quiero jugar",
    "shortDescription": "Si no quieres jugar a la pelota, ¿qué dices?",
    "stimulusType": "text",
    "stimulusText": "Si no quieres jugar a la pelota, ¿qué dices?",
    "choiceA": "\"No, quiero jugar a otra cosa\"",
    "choiceB": "Quito la pelota",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s3_w11.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.sayno.play"
    ]
  },
  {
    "id": "s3-w12",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 12,
    "title": "No me toques",
    "shortDescription": "Si alguien te abraza y tú no quieres, ¿qué haces?",
    "stimulusType": "text",
    "stimulusText": "Si alguien te abraza y tú no quieres, ¿qué haces?",
    "choiceA": "Digo \"No quiero, suéltame\"",
    "choiceB": "Le doy un golpe",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s3_w12.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.sayno.touch"
    ]
  },
  {
    "id": "s3-w13",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 13,
    "title": "No me gusta la broma",
    "shortDescription": "Si un niño te hace una broma que no te gusta, ¿qué haces?",
    "stimulusType": "text",
    "stimulusText": "Si un niño te hace una broma que no te gusta, ¿qué haces?",
    "choiceA": "Le pido que pare",
    "choiceB": "Lloro en el suelo",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s3_w13.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.sayno.jokes"
    ]
  },
  {
    "id": "s3-w14",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 14,
    "title": "No quiero compartir hoy",
    "shortDescription": "Si es tu juguete favorito y hoy no quieres prestarlo, ¿qué dices?",
    "stimulusType": "text",
    "stimulusText": "Si es tu juguete favorito y hoy no quieres prestarlo, ¿qué dices?",
    "choiceA": "\"Hoy quiero jugar solo\"",
    "choiceB": "Le quito el juguete",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s3_w14.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.sayno.share"
    ]
  },
  {
    "id": "s3-w15",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 15,
    "title": "Ayuda con la tarea",
    "shortDescription": "Si no entiendes la tarea de matemáticas, ¿qué haces?",
    "stimulusType": "text",
    "stimulusText": "Si no entiendes la tarea de matemáticas, ¿qué haces?",
    "choiceA": "Levanto la mano y pido ayuda",
    "choiceB": "Me quedo callado",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s3_w15.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.help.homework"
    ]
  },
  {
    "id": "s3-w16",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 16,
    "title": "Ayuda si me caigo",
    "shortDescription": "Si te caes en el recreo y te duele, ¿qué haces?",
    "stimulusType": "text",
    "stimulusText": "Si te caes en el recreo y te duele, ¿qué haces?",
    "choiceA": "Voy a buscar a un profesor",
    "choiceB": "Me escondo en el baño",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s3_w16.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.help.injury"
    ]
  },
  {
    "id": "s3-w17",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 17,
    "title": "Ayuda si pierdo algo",
    "shortDescription": "Si pierdes tu mochila en el colegio, ¿qué haces?",
    "stimulusType": "text",
    "stimulusText": "Si pierdes tu mochila en el colegio, ¿qué haces?",
    "choiceA": "Pido ayuda para buscarla",
    "choiceB": "Lloro sin decir nada",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "medium",
    "estimatedTimeSeconds": 90,
    "imageFilename": "way_s3_w17.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.help.lost"
    ]
  },
  {
    "id": "s3-w18",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 18,
    "title": "Hablar con la Profe",
    "shortDescription": "¿Cómo le hablas a tu profesora cuando necesitas ir al baño?",
    "stimulusType": "text",
    "stimulusText": "¿Cómo le hablas a tu profesora cuando necesitas ir al baño?",
    "choiceA": "\"Profe, ¿puedo ir al baño?\"",
    "choiceB": "Salgo de clase sin permiso",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s3_w18.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.roleplay.teacher"
    ]
  },
  {
    "id": "s3-w19",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 19,
    "title": "Hablar con Papá",
    "shortDescription": "¿Cómo le pides a papá que juegue contigo?",
    "stimulusType": "text",
    "stimulusText": "¿Cómo le pides a papá que juegue contigo?",
    "choiceA": "\"Papá, ¿jugamos un rato?\"",
    "choiceB": "Tiro los juguetes",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s3_w19.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.roleplay.parent"
    ]
  },
  {
    "id": "s3-w20",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 20,
    "title": "Hablar con un Amigo",
    "shortDescription": "¿Cómo le pides a un amigo jugar a las cartas?",
    "stimulusType": "text",
    "stimulusText": "¿Cómo le pides a un amigo jugar a las cartas?",
    "choiceA": "\"¿Quieres jugar a las cartas?\"",
    "choiceB": "Le quito sus juguetes",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "easy",
    "estimatedTimeSeconds": 60,
    "imageFilename": "way_s3_w20.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.roleplay.friend"
    ]
  },
  {
    "id": "s3-w21",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 21,
    "title": "Compartir Juguete",
    "shortDescription": "Si los dos queréis el mismo juguete, ¿qué hacéis?",
    "stimulusType": "text",
    "stimulusText": "Si los dos queréis el mismo juguete, ¿qué hacéis?",
    "choiceA": "Jugamos por turnos",
    "choiceB": "Peleamos por el juguete",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s3_w21.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.conflict.share"
    ]
  },
  {
    "id": "s3-w22",
    "step": 3,
    "stepTitle": "STEP Asertividad y Autoestima",
    "wayNumber": 22,
    "title": "Defensa Propia",
    "shortDescription": "Si alguien te empuja a propósito en el patio, ¿qué haces?",
    "stimulusType": "text",
    "stimulusText": "Si alguien te empuja a propósito en el patio, ¿qué haces?",
    "choiceA": "Le digo \"Para\" y busco un profe",
    "choiceB": "Le pego muy fuerte",
    "correctChoice": "A",
    "theme": "assertiveness",
    "difficulty": "hard",
    "estimatedTimeSeconds": 120,
    "imageFilename": "way_s3_w22.webp",
    "hasRealImage": true,
    "isHomeworkEligible": true,
    "skills": [
      "assertiveness.conflict.defense"
    ]
  }
];

// Helper: Validar que tenemos exactamente 57 ways al completar
export const validateWaysCount = (): void => {
  const expected = { 1: 6, 2: 29, 3: 22 };
  const actual = {
    1: waysMasterData.filter(w => w.step === 1).length,
    2: waysMasterData.filter(w => w.step === 2).length,
    3: waysMasterData.filter(w => w.step === 3).length,
  };
  
  (Object.keys(expected) as unknown as StepNumber[]).forEach(step => {
    if (actual[step] !== expected[step]) {
      console.warn(`⚠️ Step ${step}: ${actual[step]}/${expected[step]} ways completados`);
    }
  });
  
  const total = waysMasterData.length;
  if (total !== 57) {
    console.warn(`⚠️ Total ways: ${total}/57. Faltan ${57 - total} ways por definir.`);
  } else {
    console.log('✅ Todos los 57 ways están definidos.');
  }
};

// Ejecutar al importar en desarrollo
if (import.meta.env?.DEV) {
  validateWaysCount();
}
