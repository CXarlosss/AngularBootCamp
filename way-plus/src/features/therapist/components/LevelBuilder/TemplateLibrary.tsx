/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ TemplateLibrary — Galería visual de plantillas clínicas
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GLASS, BTN, TEXT, way } from '@/shared/lib/wayTheme';
import { useReduceMotion } from '@/core/stores/configStore';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';
import { useTemplateLibrary } from './useTemplateLibrary';
import { TEMPLATE_CATEGORIES, type LevelTemplate } from './levelTemplates';
import { TemplateDetailModal } from './TemplateDetailModal';

export const TemplateLibrary: React.FC<{ onApply?: () => void }> = ({ onApply }) => {
  const { systemTemplates, isLoading, getByCategory, applyTemplate, isApplying } = useTemplateLibrary();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<LevelTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const reduceMotion = useReduceMotion();

  const filtered = systemTemplates.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.targetSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.recommendedFor.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-indigo-50/20">
      <header className={way(GLASS.header, 'sticky top-0 z-40')}>
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className={TEXT.title}>Biblioteca de plantillas</h1>
          <p className={way(TEXT.micro, 'mt-1')}>Niveles pre-diseñados por objetivo terapéutico</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, habilidad o diagnóstico..."
            className={way(
              'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm',
              'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none'
            )}
          />
        </div>

        {/* Categories */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            className={way(
              'rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all',
              activeCategory === 'all'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white/60 text-slate-600 hover:border-indigo-300'
            )}
            onClick={() => {
              hapticService.click();
              setActiveCategory('all');
            }}
          >
            Todas
          </button>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={way(
                'rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all',
                activeCategory === cat.id
                  ? way(cat.color, 'border-current')
                  : 'border-slate-200 bg-white/60 text-slate-600 hover:border-indigo-300'
              )}
              onClick={() => {
                hapticService.click();
                setActiveCategory(cat.id);
              }}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Cargando plantillas...</div>
        ) : filtered.length === 0 ? (
          <div className={way(GLASS.card, 'rounded-2xl p-8 text-center')}>
            <div className="mb-2 text-4xl">🔍</div>
            <p className={TEXT.subtitle}>No se encontraron plantillas</p>
            <p className={way(TEXT.micro, 'mt-1')}>Prueba con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template, index) => {
              const cat = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);
              return (
                <motion.div
                  key={template.id}
                  className={way(
                    GLASS.card,
                    'group cursor-pointer rounded-2xl p-5 transition-all hover:shadow-lg'
                  )}
                  initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    hapticService.click();
                    setSelectedTemplate(template);
                  }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
                      {template.emoji}
                    </div>
                    <span className={way('rounded-full px-2.5 py-0.5 text-xs font-bold border', cat?.color)}>
                      {cat?.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {template.title}
                  </h3>
                  <p className={way('mt-1 text-sm text-slate-600 line-clamp-2')}>{template.description}</p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.targetSkills.slice(0, 2).map((skill) => (
                      <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {skill}
                      </span>
                    ))}
                    {template.targetSkills.length > 2 && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        +{template.targetSkills.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>⏱️ {template.estimatedMinutes} min</span>
                    <span>📊 Dif. {template.difficulty}/10</span>
                    <span>🧩 {template.tasks.length} tareas</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.recommendedFor.map((rec) => (
                      <span key={rec} className="text-xs text-slate-400">
                        {rec}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <TemplateDetailModal
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onApply={async (patientIds, customize) => {
              await applyTemplate({ template: selectedTemplate, patientIds, customize });
              setSelectedTemplate(null);
              onApply?.();
            }}
            isApplying={isApplying}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateLibrary;
