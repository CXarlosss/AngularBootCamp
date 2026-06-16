'use client';

import { motion } from 'framer-motion';
import { Mail, ExternalLink, Code2, Database, ShoppingCart, Rocket, Terminal, Layers, Code } from 'lucide-react';

const projects = [
  {
    title: 'FluxForge',
    description: 'Orquestador visual de workflows con sandbox seguro y exportación a n8n.',
    stack: ['React Flow', 'Fastify', 'WebSocket', 'QuickJS'],
    demo: '#',
    repo: '#',
    icon: <Layers className="text-indigo-400" size={24} />,
    color: 'from-indigo-500/20 to-blue-500/5',
    border: 'border-indigo-500/30'
  },
  {
    title: 'CodeSynapse',
    description: 'Inteligencia semántica 100% local sobre repositorios de código.',
    stack: ['Xenova Transformers', 'sqlite-vec', 'RAG', 'Force Graph'],
    demo: '#',
    repo: '#',
    icon: <Database className="text-emerald-400" size={24} />,
    color: 'from-emerald-500/20 to-teal-500/5',
    border: 'border-emerald-500/30'
  },
  {
    title: 'MarketMesh',
    description: 'Marketplace predictivo: grafo de co-compras en tiempo real, alertas de stock con velocidad de venta, y checkout inteligente.',
    stack: ['Angular 17+', 'D3.js', 'Fastify', 'WebSocket'],
    demo: 'https://marketmesh.vercel.app',
    repo: 'https://github.com/CarlosDePetronila/marketmesh',
    icon: <Rocket className="text-pink-400" size={24} />,
    color: 'from-pink-500/20 to-rose-500/5',
    border: 'border-pink-500/30'
  },
  {
    title: 'LocalMarket',
    description: 'Marketplace con optimización de carga del 35% y métricas perfectas en Lighthouse.',
    stack: ['Angular 21', 'TypeScript', 'Lighthouse', 'RxJS'],
    demo: '#',
    repo: '#',
    icon: <ShoppingCart className="text-amber-400" size={24} />,
    color: 'from-amber-500/20 to-orange-500/5',
    border: 'border-amber-500/30'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30 font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-32">
        {/* HERO SECTION */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-32 flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm font-medium text-slate-300 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Available for new opportunities
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Full-Stack Developer<br/>& Systems Architect.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            Construyendo soluciones escalables, desde orquestadores de workflows hasta motores RAG 100% locales. Especializado en arquitecturas de alto rendimiento.
          </p>
          
          <div className="flex gap-4">
            <a href="#labs" className="px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
              Ver proyectos <Rocket size={18} />
            </a>
            <a href="#contact" className="px-6 py-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 border border-slate-700 transition-colors">
              Contactar
            </a>
          </div>
        </motion.header>

        {/* LABS SECTION */}
        <section id="labs" className="mb-32 scroll-mt-24">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-12"
          >
            <Terminal className="text-indigo-400" size={28} />
            <h2 className="text-3xl font-bold">The Labs</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative rounded-2xl bg-slate-900/40 backdrop-blur-md border ${project.border} p-6 flex flex-col hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                
                <div className="relative z-10 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700">
                    {project.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.stack.map(tech => (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700/50">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex gap-4 mt-auto pt-4 border-t border-slate-800">
                  <a href={project.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    <ExternalLink size={16} /> Demo
                  </a>
                  <a href={project.repo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    <Code size={16} /> Code
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="mb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-slate-900/30 border border-slate-800 p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Code2 className="text-indigo-400" /> Sobre mí
                </h2>
                <div className="space-y-4 text-slate-400 leading-relaxed">
                  <p>
                    Forjado en la exigencia técnica de <strong className="text-white font-medium">42 Madrid</strong> y especializado en arquitecturas web modernas a través de <strong className="text-white font-medium">Neoland</strong>.
                  </p>
                  <p>
                    Mi enfoque no se limita a construir interfaces bonitas, sino a diseñar <strong className="text-white font-medium">sistemas resilientes</strong>. Desde orquestación de microservicios y bases de datos vectoriales hasta optimización extrema del renderizado en cliente y servidor.
                  </p>
                  <p>
                    Me apasiona resolver problemas complejos (como ejecutar sandboxes seguros en el navegador o crear análisis estático mediante AST) manteniendo siempre una experiencia de usuario impecable.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center md:justify-end">
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-6xl text-slate-600 font-bold group-hover:scale-110 transition-transform duration-500">DEV</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Construimos algo increíble?</h2>
            <p className="text-slate-400 max-w-lg mb-10">
              Siempre estoy abierto a discutir nuevos proyectos, oportunidades o simplemente charlar sobre arquitectura de software.
            </p>
            
            <div className="flex gap-6">
              <a href="#" className="p-4 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all hover:-translate-y-1 font-bold text-sm">
                GH
              </a>
              <a href="#" className="p-4 rounded-full bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all hover:-translate-y-1 font-bold text-sm">
                IN
              </a>
              <a href="mailto:tuemail@ejemplo.com" className="p-4 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all hover:-translate-y-1">
                <Mail size={24} />
              </a>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-800 pt-8 mt-20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} — Diseñado y construido con Next.js & Tailwind</p>
          <p>Desplegado en Vercel</p>
        </footer>
      </div>
    </div>
  );
}
