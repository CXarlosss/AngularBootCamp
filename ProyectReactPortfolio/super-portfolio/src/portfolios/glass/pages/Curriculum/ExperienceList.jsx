import React from 'react';
// @ts-ignore
import styles from "../../styles/components/curriculum/experience.module.css";

function ExperienceList() {
  const experience = [
  {
  title: 'Mozo de Almacén',
  company: 'Logística Inditex',
  date: 'ENERO 2024 - DICIEMBRE 2024',
  description:
    'Operaciones de recepción, ubicación, preparación de pedidos y expedición siguiendo estándares de calidad y seguridad. Manejo de herramientas de picking, radiofrecuencia (RF) y sistemas SGA/WMS para asegurar la trazabilidad y rotación de stock.',
  highlights: [
    'Preparación de pedidos con precisión >98% y cumplimiento de tiempos de corte.',
    'Reabastecimiento y ubicación de mercancía aplicando FIFO/FEFO para una rotación eficiente.',
    'Uso de terminal RF y WMS para inventario cíclico y control de incidencias.',
    'Colaboración en picos de actividad (rebajas/campañas), manteniendo KPIs de productividad.',
    'Cumplimiento de normas PRL y buenas prácticas en manipulación de cargas.',
  ],
}
,
{
  title: 'Técnico Instalador de Paneles Solares',
  company: 'SIPAMA',
  date: 'MARZO 2024 - JUNIO 2024',
  description:
    'Instalación, configuración y mantenimiento de sistemas fotovoltaicos en entornos residenciales y comerciales, garantizando el cumplimiento de normativas eléctricas y de seguridad. Coordinación con ingenieros y clientes para asegurar la eficiencia energética y la correcta puesta en marcha.',
  highlights: [
    'Instalación de más de 50 sistemas fotovoltaicos en viviendas y empresas.',
    'Cableado, conexionado y configuración de inversores y cuadros eléctricos.',
    'Verificación de rendimiento energético y resolución de incidencias técnicas.',
    'Aplicación de protocolos de seguridad en trabajos en altura y riesgo eléctrico.',
    'Soporte postventa y formación básica a usuarios sobre uso de los sistemas.',
  ],
},
{
  title: 'Soporte Informático',
  company: 'Plenum-Ingenieros',
  date: 'SEPTIEMBRE 2023 - FEBRERO 2024',
  description:
    'Atención y resolución de incidencias de hardware, software y red, asegurando la continuidad operativa de los usuarios internos. Implementación de soluciones preventivas y soporte directo de primer y segundo nivel en un entorno corporativo multidisciplinar.',
  highlights: [
    'Gestión de tickets mediante sistema de helpdesk, reduciendo tiempos de respuesta en un 30%.',
    'Instalación, configuración y mantenimiento de equipos informáticos y periféricos.',
    'Administración básica de redes locales (LAN) y resolución de problemas de conectividad.',
    'Soporte remoto y presencial para más de 100 usuarios internos.',
    'Documentación de procedimientos y creación de guías de uso para empleados.',
  ],
},
{
  title: 'Desarrollador Web Freelance',
  company: 'Autónomo',
  date: '2023 - Presente',
  description:
    'Diseño, desarrollo y despliegue de sitios web y aplicaciones a medida, enfocados en la experiencia de usuario, la optimización de rendimiento y la adaptabilidad responsive. Gestión completa del ciclo de vida de proyectos, desde la reunión inicial con el cliente hasta la entrega final y soporte postlanzamiento.',
  highlights: [
    'Desarrollo de páginas corporativas y e-commerce con React, Next.js y NodeJS.',
    'Diseño responsive y optimización SEO para mejorar la visibilidad online de los clientes.',
    'Integración de bases de datos (MongoDB, Firebase) y pasarelas de pago seguras.',
    'Colaboración con diseñadores y marketers para soluciones digitales completas.',
    'Gestión de proyectos end-to-end, incluyendo despliegue en Netlify, Vercel y otros hosting.',
  ],
}
];

  return (
    <section className={styles.experience}>
      <h2 className={styles.mainTitle}>Experiencia Laboral</h2>

      <div className={styles.experienceItemsContainer}>
        {experience.map((item, index) => (
          <article key={index} className={styles.experienceItem}>
            <h3 className={styles.experienceTitle}>{item.title}</h3>

            {/* Línea meta con empresa + fecha */}
            <div className={styles.meta}>
              <span className={styles.experienceCompany}>{item.company}</span>
              <span className={styles.experienceDate}>{item.date}</span>
            </div>

            <p className={styles.experienceDescription}>{item.description}</p>

            {/* Bullets opcionales */}
            {item.highlights && (
              <ul className={styles.experienceHighlights}>
                {item.highlights.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default ExperienceList;
