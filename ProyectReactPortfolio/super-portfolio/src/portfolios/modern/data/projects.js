// @ts-nocheck



import localMarketThumbnail from "../../../assets/images/Proyecto1-2.png";
import productivityAppThumbnail from "../../../assets/images/Proyecto2.png";
import movieAppThumbnail from "../../../assets/images/Proyecto3.png";
import expenseTrackerThumbnail from "../../../assets/images/Proyecto4.png";
import localMarketThumbnail2 from "../../../assets/images/Proyecto1.png";
import productivityAppThumbnail2 from "../../../assets/images/Proyecto2-1.png";
import movieAppThumbnail2 from "../../../assets/images/Proyecto3-1.png";
import expenseTrackerThumbnail2 from "../../../assets/images/Proyecto4-1.png";
import calorieTrackerThumbnail from "../../../assets/images/Proyecto5.png";
import calorieTrackerThumbnail2 from "../../../assets/images/Proyecto5-1.png";
import propinasCalculatorThumbnail from "../../../assets/images/Proyecto6.png";
import propinasCalculatorThumbnail2 from "../../../assets/images/Proyecto6-1.png";
import calculadorGastosThumbnail from "../../../assets/images/Proyecto7.png";
import calculadorGastosThumbnail2 from "../../../assets/images/Proyecto7-1.png";
import optaskThumbnail from "../../../assets/images/Proyecto8.png";
import optaskThumbnail2 from "../../../assets/images/Proyecto8-1.png";
import nutricionistaThumbnail from "../../../assets/images/Proyecto9.png";
import nutricionistaThumbnail2 from "../../../assets/images/Proyecto9-1.png";
import nutricionistaThumbnail3 from "../../../assets/images/Proyecto9-2.png";
import nutricionistaThumbnail4 from "../../../assets/images/Proyecto9-3.png";

export const PROJECTS = [
  {
    id: "localmarket",
    title: "LocalMarket",
    description: "Plataforma web para conectar pequeños comercios con clientes locales.",
    longDescription: "LocalMarket es una plataforma completa con backend en Node.js y base de datos MongoDB. Permite registrar productos, gestionar inventario y conectar con usuarios finales mediante una interfaz amigable.",
    thumbnail: localMarketThumbnail,
    images: [localMarketThumbnail, localMarketThumbnail2],
    technologies: ["HTML", "CSS", "JavaScript", "React", "Redux", "Node.js", "Express", "MongoDB"],
    githubLink: "https://github.com/CXarlosss/ProyectoFinal",
    liveDemoLink: "https://flourishing-baklava-adefd3.netlify.app/",
  },
  {
    id: "productivity",
    title: "Página de Productividad",
    description: "Aplicación web para guardar tareas y crear un calendario de productividad.",
    longDescription: "Una app sencilla pero efectiva para la gestión diaria de tareas, hábitos y calendario. Construida con React y Node.js, y con funcionalidades de recordatorios, filtro por etiquetas y almacenamiento persistente.",
    thumbnail: productivityAppThumbnail,
    images: [productivityAppThumbnail, productivityAppThumbnail2],
    technologies: ["HTML", "CSS", "JavaScript", "React", "Redux", "Node.js", "Express", "MongoDB"],
    githubLink: "https://github.com/CXarlosss/Productividad-app",
    liveDemoLink: "https://harmonious-fudge-8adaba.netlify.app/",
  },
  {
    id: "pagina-nutricionista",
    title: "🧠 Página de Nutricionista",
    description: "Web profesional de nutrición con enfoque en SEO, escalabilidad y diseño moderno.",
    longDescription: "Proyecto profesional realizado con Next.js, Tailwind CSS y TypeScript. Incluye estructura optimizada con App Router, blog con sistema de rutas dinámicas para artículos, recetas y pódcast, diseño responsive y enfoque en velocidad de carga y posicionamiento SEO. La web destaca por su limpieza visual, modularidad del código y escalabilidad para futuro contenido profesional.",
    thumbnail: nutricionistaThumbnail,
    images: [nutricionistaThumbnail, nutricionistaThumbnail2, nutricionistaThumbnail3, nutricionistaThumbnail4],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "App Router", "SEO Optimizado", "Vercel", "Markdown", "Framer Motion"],
    githubLink: "https://github.com/CXarlosss/Pagina_De_Nutricionista",
    liveDemoLink: "https://pagina-de-nutricionista-2j9ud676x-carlos-projects-ac914b64.vercel.app/",
  },
  {
    id: "op-task-management",
    title: "🧩 Gestión de Proyectos con Tareas",
    description: "Aplicación web para la gestión de proyectos con funcionalidades de tareas, equipo, roles, autenticación y permisos.",
    longDescription: "Aplicación web Full-stack robusta para la gestión integral de proyectos. Ofrece funcionalidades completas para la administración de tareas, equipos y roles, incluyendo un sistema de autenticación seguro y permisos detallados. Destaca por su panel responsive, diseño moderno con TailwindCSS, visualización de tareas Kanban-like y notificaciones personalizadas. Un proyecto clave que demuestra habilidades avanzadas en desarrollo de aplicaciones.",
    thumbnail: optaskThumbnail,
    images: [optaskThumbnail, optaskThumbnail2],
    technologies: ["React", "TypeScript", "Tailwind CSS", "React Router v6", "TanStack Query", "Headless UI", "React Hook Form", "Vite"],
    githubLink: "https://github.com/CXarlosss/OP_Task",
    liveDemoLink: "https://spiffy-youtiao-e5d23a.netlify.app/",
  },
  {
    id: "movies",
    title: "App de Películas",
    description: "Aplicación para ver las películas actuales en el cine y obtener información de IBM.",
    longDescription: "Esta app utiliza la API de IMDb para mostrar películas en cartelera, puntuaciones y trailers. Permite guardar favoritas y explorar por género. Backend hecho en Express y frontend con React.",
    thumbnail: movieAppThumbnail,
    images: [movieAppThumbnail, movieAppThumbnail2],
    technologies: ["React", "HTML", "CSS", "Node.js", "Express"],
    githubLink: "https://github.com/CXarlosss/Cinema",
    liveDemoLink: "https://chimerical-platypus-822400.netlify.app/",
  },
  {
    id: "expenses",
    title: "Calculadora de Gastos",
    description: "Aplicación para calcular gastos de viajes o gastos compartidos (comunidad).",
    longDescription: "Herramienta simple para dividir gastos de forma justa entre varios participantes. Muestra balances por persona y permite registrar pagos individuales. Hecha en React puro y Node.js.",
    thumbnail: expenseTrackerThumbnail,
    images: [expenseTrackerThumbnail, expenseTrackerThumbnail2],
    technologies: ["React", "HTML", "CSS", "Node.js", "Express"],
    githubLink: "https://github.com/CXarlosss/TripCount",
    liveDemoLink: "https://harmonious-quokka-4ca436.netlify.app/login",
  },
  {
    id: "calorie-tracker",
    title: "🥗 Calorie Tracker",
    description: "Aplicación para registrar y gestionar comidas, ejercicios y calorías diarias.",
    longDescription: "Una aplicación moderna construida con React + TypeScript que permite registrar y gestionar comidas, ejercicios y calorías diarias de manera visual y organizada. Incluye gráficos, historial y funciones CRUD completas.",
    thumbnail: calorieTrackerThumbnail,
    images: [calorieTrackerThumbnail, calorieTrackerThumbnail2],
    technologies: ["React", "TypeScript", "TailwindCSS", "Recharts", "Vite"],
    githubLink: "https://github.com/CXarlosss/CalorieTraker.git",
    liveDemoLink: "https://elegant-crepe-2ef35d.netlify.app/",
  },
  {
    id: "propinas-calculator",
    title: "🧮 Calculadora de Propinas y Consumo",
    description: "Aplicación para calcular el total a pagar de una orden, incluyendo la propina.",
    longDescription: "Aplicación desarrollada con React + TypeScript + TailwindCSS + Vite que permite calcular el total a pagar de una orden, incluyendo la propina, así como gestionar un historial de pedidos por usuario.",
    thumbnail: propinasCalculatorThumbnail,
    images: [propinasCalculatorThumbnail, propinasCalculatorThumbnail2],
    technologies: ["React", "TypeScript", "TailwindCSS", "Vite"],
    githubLink: "https://github.com/CXarlosss/calculador-propinas",
    liveDemoLink: "https://mellifluous-mousse-c34f0f.netlify.app/",
  },
  {
    id: "calculador-gastos",
    title: "💰 Control de Gastos 📊",
    description: "Aplicación web intuitiva para la gestión personal de gastos, permitiendo categorizarlos y visualizarlos.",
    longDescription: "Aplicación FullStack desarrollada con React, TypeScript y Tailwind CSS, optimizada con Vite. Permite a los usuarios llevar un registro detallado de sus ingresos y egresos, categorizar gastos en áreas como Comida, Casa, Varios, etc., con funcionalidades de edición, eliminación y asignación de fechas. Proporciona una visión clara y actualizada en tiempo real del estado financiero, con componentes interactivos para una experiencia de usuario fluida.",
    thumbnail: calculadorGastosThumbnail,
    images: [calculadorGastosThumbnail, calculadorGastosThumbnail2],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Vite", "Headless UI", "Recharts"],
    githubLink: "https://github.com/CXarlosss/control-gastos",
    liveDemoLink: "https://shimmering-dolphin-249528.netlify.app/",
  },
];