import { useLayoutEffect, type RefObject } from 'react';

const tops = new Map<string, number>();

export function useFlip(
  ref: RefObject<HTMLElement | null>,
  signature: string,
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const node of root.querySelectorAll<HTMLElement>('[data-flip-id]')) {
      const id = node.dataset.flipId;
      if (!id) {
        continue;
      }
      for (const animation of node.getAnimations()) {
        animation.cancel();
      }
      const top = node.getBoundingClientRect().top + window.scrollY;
      const previous = tops.get(id);
      if (!reduce && previous != null && Math.abs(previous - top) > 1) {
        node.animate(
          [
            { transform: `translateY(${previous - top}px)` },
            { transform: 'translateY(0)' },
          ],
          { duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
        );
      }
      tops.set(id, top);
    }
  }, [ref, signature]);
}
