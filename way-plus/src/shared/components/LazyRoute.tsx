import { lazy, Suspense, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { GLASS, way } from '@/shared/lib/wayTheme';

interface LazyRouteProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
}

export const LazyRoute = ({ component, fallback }: LazyRouteProps) => {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback || <WaySkeleton />}>
      <LazyComponent />
    </Suspense>
  );
};

// Skeleton nativo WAY+ para pantallas lazy
export const WaySkeleton = () => (
  <motion.div
    className={way('min-h-dvh p-4', GLASS.main)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="mx-auto max-w-md space-y-4">
      <div className="h-8 w-2/3 animate-pulse rounded-2xl bg-white/20" />
      <div className="h-48 animate-pulse rounded-3xl bg-white/10" />
      <div className="h-32 animate-pulse rounded-3xl bg-white/10" />
      <div className="h-32 animate-pulse rounded-3xl bg-white/10" />
    </div>
  </motion.div>
);
