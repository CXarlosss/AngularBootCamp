import React from 'react';
import { wayTheme } from '../lib/wayTheme';
import { wayResponsive } from '../lib/wayResponsive';
import { Button } from './Button';
import { InteractiveCard } from './InteractiveCard';

/**
 * WAY+ Cheatsheet - Componente de referencia con ejemplos listos para copiar y pegar
 */
export const WAY_Cheatsheet = () => {
  return (
    <div className={`p-8 min-h-screen ${wayTheme.GLASS.dark} text-white`}>
      <h1 className={wayTheme.TEXT.title}>WAY+ Cheatsheet</h1>
      <p className={`${wayTheme.TEXT.subtitle} mb-8`}>Referencia rápida de tokens y componentes</p>

      <div className="space-y-12">
        {/* 1. Botón con Haptic */}
        <section>
          <h2 className={`${wayTheme.TEXT.subtitle} mb-4`}>1. Botones (con Haptics automáticos)</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="claim">Claim Reward</Button>
            <Button variant="remind">Remind Me</Button>
          </div>
        </section>

        {/* 2. Interactive Card */}
        <section>
          <h2 className={`${wayTheme.TEXT.subtitle} mb-4`}>2. Interactive Card (Glassmorphism + Animación)</h2>
          <div className={wayResponsive.CONTAINERS.maxWidthMobile}>
            <InteractiveCard 
              title="Nivel 3: El Bosque"
              description="Ayuda al personaje a encontrar el camino"
              status="current"
              progress={65}
              progressColor="emerald"
              badge="En progreso"
              actionLabel="Continuar"
            />
          </div>
        </section>

        {/* 3. Grids Responsive */}
        <section>
          <h2 className={`${wayTheme.TEXT.subtitle} mb-4`}>3. Grids Responsive</h2>
          <div className={wayResponsive.GRIDS.gridShop}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-24 rounded-xl ${wayTheme.GLASS.card} flex items-center justify-center`}>
                Item {i}
              </div>
            ))}
          </div>
        </section>

        {/* 4. Estados Visuales */}
        <section>
          <h2 className={`${wayTheme.TEXT.subtitle} mb-4`}>4. Estados Visuales</h2>
          <div className="flex flex-wrap gap-4">
            <span className={`px-3 py-1 rounded-full ${wayTheme.STATUS.completed}`}>Completado</span>
            <span className={`px-3 py-1 rounded-full ${wayTheme.STATUS.current}`}>En Progreso</span>
            <span className={`px-3 py-1 rounded-full ${wayTheme.STATUS.locked}`}>Bloqueado</span>
            <span className={`px-3 py-1 rounded-full ${wayTheme.STATUS.warning}`}>Advertencia</span>
            <span className={`px-3 py-1 rounded-full ${wayTheme.STATUS.error}`}>Error</span>
          </div>
        </section>

        {/* 5. Progress Bar */}
        <section>
          <h2 className={`${wayTheme.TEXT.subtitle} mb-4`}>5. Progress Bar (Track & Fill)</h2>
          <div className="space-y-4 max-w-md">
            <div className={wayTheme.PROGRESS.track}>
              <div className={wayTheme.PROGRESS.fill.indigo} style={{ width: '40%' }}></div>
            </div>
            <div className={wayTheme.PROGRESS.track}>
              <div className={wayTheme.PROGRESS.fill.emerald} style={{ width: '75%' }}></div>
            </div>
            <div className={wayTheme.PROGRESS.track}>
              <div className={wayTheme.PROGRESS.fill.amber} style={{ width: '60%' }}></div>
            </div>
            <div className={wayTheme.PROGRESS.track}>
              <div className={wayTheme.PROGRESS.fill.violet} style={{ width: '90%' }}></div>
            </div>
          </div>
        </section>

        {/* 6. Typography */}
        <section>
          <h2 className={`${wayTheme.TEXT.subtitle} mb-4`}>6. Tipografía (Jerarquía)</h2>
          <div className="space-y-2">
            <h1 className={wayTheme.TEXT.title}>Title: El rápido zorro marrón</h1>
            <h2 className={wayTheme.TEXT.subtitle}>Subtitle: Salta sobre el perro perezoso</h2>
            <p className={wayTheme.TEXT.label}>Label: ESTADO DE LA CUENTA</p>
            <p className={wayTheme.TEXT.micro}>Micro: Última actualización hace 5 minutos</p>
          </div>
        </section>
      </div>
    </div>
  );
};
