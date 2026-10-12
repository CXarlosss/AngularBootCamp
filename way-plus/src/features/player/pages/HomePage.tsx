/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ HomePage — Limpia, minimalista, funcional
 * Sin saturación. Sin efectos que bloqueen. Solo lo esencial.
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GLASS, TEXT, way } from '@/shared/lib/wayTheme';
import { useReduceMotion } from '@/core/stores/configStore';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';

/* ═══════════════════════════════════════════════════════════════
   ANIMACIONES
   ═══════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ═══════════════════════════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════════════════════════ */

const Section = memo<{ children: React.ReactNode; className?: string; id?: string }>(
  ({ children, className, id }) => {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const reduceMotion = useReduceMotion();

    return (
      <motion.section
        ref={ref}
        id={id}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate={isInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className={className}
      >
        {children}
      </motion.section>
    );
  }
);
Section.displayName = 'Section';

/* ═══════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════ */

const Navbar = memo(() => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const navLinks = [
    { label: 'Características', id: 'caracteristicas' },
    { label: 'Cómo funciona', id: 'como-funciona' },
    { label: 'Precios', id: 'precios' },
  ];

  return (
    <header
      className={way(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/90 shadow-sm backdrop-blur-md' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={() => navigate('/')} className="text-lg font-bold text-slate-900">
          WAY<span className="text-indigo-600">+</span>
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
            Iniciar sesión
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/auth')}>
            Empezar
          </Button>
        </div>

        <button
          className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((p) => !p)}
        >
          <span className={`block h-0.5 w-4 bg-slate-700 transition-transform ${mobileOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`block h-0.5 w-4 bg-slate-700 transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-4 bg-slate-700 transition-transform ${mobileOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </button>
              ))}
              <hr className="my-2 border-slate-100" />
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => navigate('/auth')}>
                Iniciar sesión
              </Button>
              <Button variant="primary" size="sm" className="justify-start" onClick={() => navigate('/auth')}>
                Empezar gratis
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});
Navbar.displayName = 'Navbar';

/* ═══════════════════════════════════════════════════════════════
   HERO — Limpio, sin blobs, sin saturación
   ═══════════════════════════════════════════════════════════════ */

const HeroSection = memo(() => {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-[90dvh] items-center justify-center px-4 pt-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Terapia ABA gamificada
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Aprender <span className="text-indigo-600">jugando</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            WAY+ transforma las sesiones de terapia ABA en aventuras interactivas.
            Tu hijo aprende habilidades sociales, comunicación y autonomía mientras juega.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => { hapticService.success(); navigate('/auth'); }}
            >
              Comenzar gratis
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver cómo funciona
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            {[
              { value: '2,400+', label: 'Familias' },
              { value: '150+', label: 'Terapeutas' },
              { value: '98%', label: 'Satisfacción' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-lg font-bold text-slate-900 sm:text-xl">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
});
HeroSection.displayName = 'HeroSection';

/* ═══════════════════════════════════════════════════════════════
   FEATURES — Cards limpias, blancas, sin fondos de color
   ═══════════════════════════════════════════════════════════════ */

const features = [
  { icon: '🎮', title: 'Juegos adaptativos', desc: 'La dificultad se ajusta automáticamente al ritmo de cada niño.' },
  { icon: '📊', title: 'Progreso en tiempo real', desc: 'Gráficas claras y reportes automáticos para terapeutas y familias.' },
  { icon: '🎯', title: 'Objetivos ABA integrados', desc: 'Cada juego trabaja habilidades sociales, comunicación y autonomía.' },
  { icon: '🏆', title: 'Motivación natural', desc: 'Recompensas y celebraciones que mantienen al niño enganchado.' },
  { icon: '🔒', title: 'Privacidad total', desc: 'Datos cifrados, cumplimiento GDPR y control parental completo.' },
  { icon: '📱', title: 'Multi-dispositivo', desc: 'iPad, tablet, móvil o escritorio. WAY+ se adapta a cualquier pantalla.' },
];

const FeaturesSection = memo(() => (
  <Section id="caracteristicas" className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20">
    <div className="mx-auto max-w-6xl">
      <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Diseñado para el éxito de tu hijo</h2>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          Cada detalle de WAY+ está pensado para que la terapia ABA sea efectiva, divertida y sin fricciones.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </Section>
));
FeaturesSection.displayName = 'FeaturesSection';

/* ═══════════════════════════════════════════════════════════════
   CÓMO FUNCIONA — Sin demo interactiva (bloqueaba clicks)
   ═══════════════════════════════════════════════════════════════ */

const steps = [
  { num: '1', title: 'Crea un perfil', desc: 'Registra a tu hijo en menos de 2 minutos. WAY+ adapta los juegos a su edad y necesidades.', emoji: '👤' },
  { num: '2', title: 'Juega y aprende', desc: 'Explora mundos interactivos mientras trabaja habilidades sociales, comunicación y autonomía.', emoji: '🎮' },
  { num: '3', title: 'Sigue el progreso', desc: 'Gráficas claras y reportes automáticos para compartir con el terapeuta.', emoji: '📈' },
];

const HowItWorksSection = memo(() => (
  <Section id="como-funciona" className="px-4 py-16 sm:px-6 sm:py-20">
    <div className="mx-auto max-w-6xl">
      <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Tres pasos para empezar</h2>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          Sin configuración compleja. En menos de 5 minutos tu hijo ya está jugando.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <motion.div key={step.num} variants={fadeUp} className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              {step.emoji}
            </div>
            <div className="mt-3 text-xs font-bold text-indigo-600">Paso {step.num}</div>
            <h3 className="mt-1 text-sm font-bold text-slate-900">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </Section>
));
HowItWorksSection.displayName = 'HowItWorksSection';

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIOS — Estáticos, sin auto-rotate, sin emojis raros
   ═══════════════════════════════════════════════════════════════ */

const testimonials = [
  { name: 'María G.', role: 'Madre de Lucas, 6 años', text: 'Antes era una lucha que Lucas hiciera sus ejercicios. Con WAY+ pide él mismo jugar. Ha mejorado su comunicación en semanas.' },
  { name: 'Dr. Carlos R.', role: 'Terapeuta ABA', text: 'Uso WAY+ en todas mis sesiones. El seguimiento de datos es excepcional y los niños se mantienen motivados de principio a fin.' },
  { name: 'Ana P.', role: 'Madre de Sofía, 5 años', text: 'La gamificación es brillante. Sofía no se da cuenta de que está haciendo terapia. Para ella es solo un juego divertido.' },
];

const TestimonialsSection = memo(() => (
  <Section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20">
    <div className="mx-auto max-w-6xl">
      <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Lo que dicen las familias</h2>
      </motion.div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {testimonials.map((t) => (
          <motion.div
            key={t.name}
            variants={fadeUp}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm leading-relaxed text-slate-600">"{t.text}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {t.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </Section>
));
TestimonialsSection.displayName = 'TestimonialsSection';

/* ═══════════════════════════════════════════════════════════════
   PRECIOS — Limpio, sin escalados raros
   ═══════════════════════════════════════════════════════════════ */

const plans = [
  { name: 'Free', price: '0€', period: '/mes', desc: 'Para probar', features: ['1 perfil', '5 juegos básicos', 'Progreso semanal'], cta: 'Crear cuenta', highlight: false },
  { name: 'Premium', price: '9,99€', period: '/mes', desc: 'Para familias', features: ['Perfiles ilimitados', 'Todos los juegos', 'Reportes para terapeuta', 'Soporte prioritario'], cta: 'Empezar gratis', highlight: true },
  { name: 'Profesional', price: '29,99€', period: '/mes', desc: 'Para terapeutas', features: ['Hasta 20 pacientes', 'Dashboard terapeuta', 'Exportar datos', 'Soporte dedicado'], cta: 'Contactar', highlight: false },
];

const PricingSection = memo(() => {
  const navigate = useNavigate();
  return (
    <Section id="precios" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Planes simples</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">Sin sorpresas. Cancela cuando quieras.</p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={way(
                'flex flex-col rounded-2xl border p-5',
                plan.highlight
                  ? 'border-indigo-200 bg-white shadow-lg'
                  : 'border-slate-200 bg-white shadow-sm'
              )}
            >
              {plan.highlight && (
                <span className="mb-3 inline-block self-start rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  Más popular
                </span>
              )}
              <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-500">{plan.desc}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-xs text-slate-500">{plan.period}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-emerald-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? 'primary' : 'ghost'}
                size="sm"
                className={`mt-4 w-full ${plan.highlight ? '' : 'border border-slate-200'}`}
                onClick={() => navigate('/auth')}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
});
PricingSection.displayName = 'PricingSection';

/* ═══════════════════════════════════════════════════════════════
   CTA FINAL — Simple, sin ruido visual
   ═══════════════════════════════════════════════════════════════ */

const CTASection = memo(() => {
  const navigate = useNavigate();
  return (
    <Section className="px-4 py-16 sm:px-6 sm:py-20">
      <motion.div
        variants={fadeUp}
        className="mx-auto max-w-2xl rounded-2xl bg-indigo-600 p-8 text-center text-white sm:p-12"
      >
        <h2 className="text-xl font-bold sm:text-2xl">Empieza hoy mismo</h2>
        <p className="mt-2 text-sm text-indigo-100">Primer mes gratis. Sin tarjeta de crédito.</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="secondary"
            size="lg"
            className="w-full bg-white text-indigo-600 hover:bg-indigo-50 sm:w-auto"
            onClick={() => { hapticService.success(); navigate('/auth'); }}
          >
            Crear cuenta gratuita
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full text-white hover:bg-white/10 sm:w-auto"
            onClick={() => navigate('/auth')}
          >
            Ya tengo cuenta →
          </Button>
        </div>
      </motion.div>
    </Section>
  );
});
CTASection.displayName = 'CTASection';

/* ═══════════════════════════════════════════════════════════════
   FOOTER — Minimalista
   ═══════════════════════════════════════════════════════════════ */

const Footer = memo(() => (
  <footer className="border-t border-slate-100 bg-white px-4 py-10 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-lg font-bold text-slate-900">
            WAY<span className="text-indigo-600">+</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Terapia ABA gamificada para niños con TEA.
          </p>
        </div>
        {[
          { title: 'Producto', links: ['Características', 'Cómo funciona', 'Precios'] },
          { title: 'Recursos', links: ['Blog', 'Guía para padres', 'Contacto'] },
          { title: 'Legal', links: ['Privacidad', 'Términos', 'GDPR'] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">{col.title}</h4>
            <ul className="mt-2 space-y-1.5">
              {col.links.map((link) => (
                <li key={link}>
                  <button className="text-xs text-slate-500 hover:text-slate-900">{link}</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t border-slate-50 pt-4 text-center text-[10px] text-slate-400">
        © 2026 WAY+. Todos los derechos reservados.
      </div>
    </div>
  </footer>
));
Footer.displayName = 'Footer';

/* ═══════════════════════════════════════════════════════════════
   ORQUESTADOR
   ═══════════════════════════════════════════════════════════════ */

export const HomePage: React.FC = () => {
  return (
    <main className="min-h-dvh bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default HomePage;
