import { elementsAt, resolveTouchDrop } from './drag';

const dragSlop = 8;

type TouchDragOptions = {
  card: HTMLElement;
  onDragging: (dragging: boolean) => void;
  onDrop: (clientX: number, clientY: number) => void;
};

// Native drag-and-drop does not start from a touch swipe, so touch and pen
// gestures on the handle run a pointer drag that lands in the same drop logic.
export function bindTouchDrag(
  handle: HTMLElement,
  options: TouchDragOptions,
): () => void {
  let pointerId = -1;
  let tracking = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let frame = 0;
  let preview: HTMLElement | null = null;
  let highlighted: HTMLElement | null = null;
  let restoreDraggable: (() => void) | null = null;
  let grabX = 0;
  let grabY = 0;

  const clearHighlight = () => {
    highlighted?.removeAttribute('data-touch-drop');
    highlighted = null;
  };

  const highlightAt = (clientX: number, clientY: number) => {
    const resolved = resolveTouchDrop({
      elements: elementsAt(clientX, clientY),
      clientY,
      draggingId: options.card.dataset.postId ?? '',
    });
    const next = resolved?.highlight ?? null;
    if (highlighted === next) {
      return;
    }
    clearHighlight();
    if (!next) {
      return;
    }
    next.setAttribute('data-touch-drop', 'list');
    highlighted = next;
  };

  const stopLoop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const scrollAt = (clientY: number) => {
    const margin = 72;
    const maxStep = 12;
    const height = window.innerHeight;
    let delta = 0;
    if (clientY < margin) {
      delta = -Math.ceil(((margin - clientY) / margin) * maxStep);
    } else if (clientY > height - margin) {
      delta = Math.ceil(((clientY - (height - margin)) / margin) * maxStep);
    }
    if (delta !== 0) {
      window.scrollBy(0, delta);
    }
  };

  const tick = () => {
    scrollAt(lastY);
    highlightAt(lastX, lastY);
    frame = requestAnimationFrame(tick);
  };

  const placePreview = (clientX: number, clientY: number) => {
    if (!preview) {
      return;
    }
    preview.style.transform = `translate3d(${clientX - grabX}px, ${clientY - grabY}px, 0)`;
  };

  const startPreview = (clientX: number, clientY: number) => {
    const rect = options.card.getBoundingClientRect();
    grabX = clientX - rect.left;
    grabY = clientY - rect.top;
    const clone = options.card.cloneNode(true);
    if (!(clone instanceof HTMLElement)) {
      return;
    }
    clone.removeAttribute('id');
    clone.removeAttribute('data-post-id');
    clone.setAttribute('data-drag-preview', 'true');
    clone.setAttribute('aria-hidden', 'true');
    clone.style.position = 'fixed';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.margin = '0';
    clone.style.width = `${rect.width}px`;
    clone.style.zIndex = '30';
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '0.96';
    clone.style.boxShadow = '0 12px 32px rgb(31 41 55 / 0.18)';
    document.body.appendChild(clone);
    preview = clone;
    placePreview(clientX, clientY);
  };

  const suspendNativeDrag = () => {
    const previous = options.card.getAttribute('draggable');
    options.card.setAttribute('draggable', 'false');
    restoreDraggable = () => {
      if (previous === null) {
        options.card.removeAttribute('draggable');
      } else {
        options.card.setAttribute('draggable', previous);
      }
    };
  };

  const finish = (commit: boolean, clientX: number, clientY: number) => {
    if (!tracking) {
      return;
    }
    tracking = false;
    const dropped = commit && dragging;
    const wasDragging = dragging;
    dragging = false;
    stopLoop();
    clearHighlight();
    preview?.remove();
    preview = null;
    restoreDraggable?.();
    restoreDraggable = null;
    document.documentElement.classList.remove('post-touch-drag');
    window.removeEventListener('pointermove', onPointerMove, true);
    window.removeEventListener('pointerup', onPointerUp, true);
    window.removeEventListener('pointercancel', onPointerCancel, true);
    if (wasDragging) {
      options.onDragging(false);
    }
    if (dropped) {
      options.onDrop(clientX, clientY);
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!tracking || event.pointerId !== pointerId) {
      return;
    }
    lastX = event.clientX;
    lastY = event.clientY;
    if (!dragging) {
      const distance = Math.hypot(
        event.clientX - startX,
        event.clientY - startY,
      );
      if (distance < dragSlop) {
        return;
      }
      dragging = true;
      document.documentElement.classList.add('post-touch-drag');
      startPreview(startX, startY);
      options.onDragging(true);
      frame = requestAnimationFrame(tick);
    }
    event.preventDefault();
    placePreview(event.clientX, event.clientY);
    highlightAt(event.clientX, event.clientY);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }
    finish(true, event.clientX, event.clientY);
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }
    finish(false, event.clientX, event.clientY);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' || !event.isPrimary || tracking) {
      return;
    }
    pointerId = event.pointerId;
    tracking = true;
    dragging = false;
    startX = event.clientX;
    startY = event.clientY;
    lastX = event.clientX;
    lastY = event.clientY;
    event.preventDefault();
    suspendNativeDrag();
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // The pointer can already be gone in tests and on some browsers.
    }
    window.addEventListener('pointermove', onPointerMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('pointercancel', onPointerCancel, true);
  };

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      event.preventDefault();
    }
  };

  const onContextMenu = (event: Event) => {
    event.preventDefault();
  };

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('touchstart', onTouchStart, { passive: false });
  handle.addEventListener('contextmenu', onContextMenu);

  return () => {
    finish(false, lastX, lastY);
    handle.removeEventListener('pointerdown', onPointerDown);
    handle.removeEventListener('touchstart', onTouchStart);
    handle.removeEventListener('contextmenu', onContextMenu);
  };
}
