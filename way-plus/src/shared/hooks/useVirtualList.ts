import { useRef, useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
}

interface VirtualListResult<T> {
  virtualItems: { item: T; index: number; style: React.CSSProperties }[];
  containerRef: React.RefObject<HTMLDivElement>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
}

export function useVirtualList<T>(
  items: T[],
  { itemHeight, overscan = 5 }: VirtualListOptions
): VirtualListResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const { virtualItems, totalHeight, startIndex } = useMemo(() => {
    const totalH = items.length * itemHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + (containerRef.current?.clientHeight || 600)) / itemHeight) + overscan
    );

    const vItems = [];
    for (let i = start; i < end; i++) {
      vItems.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          height: itemHeight,
          left: 0,
          right: 0,
        },
      });
    }
    return { virtualItems: vItems, totalHeight: totalH, startIndex: start };
  }, [items, scrollTop, itemHeight, overscan]);

  const scrollToIndex = useCallback((index: number) => {
    containerRef.current?.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
  }, [itemHeight]);

  // @ts-ignore
  return { virtualItems, containerRef, totalHeight, scrollToIndex };
}
