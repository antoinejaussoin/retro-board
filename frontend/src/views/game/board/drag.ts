export type PostDragData = {
  type: 'post';
  postId: string;
};

export type ListDropData = {
  type: 'column' | 'group';
  targetId: string;
};

export function isPostDragData(
  data: Record<string, unknown>,
): data is PostDragData {
  return data.type === 'post' && typeof data.postId === 'string';
}

export function isListDropData(
  data: Record<string | symbol, unknown>,
): data is ListDropData {
  return (
    (data.type === 'column' || data.type === 'group') &&
    typeof data.targetId === 'string'
  );
}

function cardsIn(container: Element, draggingId: string): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-post-id]'),
  ).filter((card) => card.dataset.postId !== draggingId);
}

export function insertionIndex(
  container: Element,
  clientY: number,
  draggingId: string,
): number {
  const cards = cardsIn(container, draggingId);
  const index = cards.findIndex((card) => {
    const rect = card.getBoundingClientRect();
    return clientY < rect.top + rect.height / 2;
  });
  return index === -1 ? cards.length : index;
}

export type DropIntent = {
  type: 'move';
  sourceId: string;
  targetId: string;
  index: number;
};

export type ResolvedTouchDrop = {
  intent: DropIntent;
  highlight: HTMLElement;
};

type NativeDropTarget = {
  element: Element;
  data: Record<string | symbol, unknown>;
};

function htmlElement(element: Element | null): HTMLElement | null {
  return element instanceof HTMLElement ? element : null;
}

function withoutPreview(elements: Element[]): HTMLElement[] {
  return elements.filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && !element.closest('[data-drag-preview]'),
  );
}

const dragOverEvent = 'retro-drag-over';

export function publishDragOver(targetId: string | null) {
  window.dispatchEvent(
    new CustomEvent(dragOverEvent, { detail: { targetId } }),
  );
}

export function subscribeDragOver(
  onChange: (targetId: string | null) => void,
): () => void {
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ targetId: string | null }>).detail;
    onChange(detail?.targetId ?? null);
  };
  window.addEventListener(dragOverEvent, listener);
  return () => window.removeEventListener(dragOverEvent, listener);
}

export function elementsAt(clientX: number, clientY: number): Element[] {
  if (typeof document.elementsFromPoint !== 'function') {
    return [];
  }
  return document.elementsFromPoint(clientX, clientY);
}

export function resolveTouchDrop(input: {
  elements: Element[];
  clientY: number;
  draggingId: string;
}): ResolvedTouchDrop | null {
  const stack = withoutPreview(input.elements);
  const list = stack
    .map((element) => htmlElement(element.closest('[data-drop-id]')))
    .find((element) => element?.dataset.dropId);
  if (!list?.dataset.dropId) {
    return null;
  }
  return {
    intent: {
      type: 'move',
      sourceId: input.draggingId,
      targetId: list.dataset.dropId,
      index: insertionIndex(list, input.clientY, input.draggingId),
    },
    highlight: list,
  };
}

export function intentFromNativeDrop(
  sourceData: Record<string, unknown>,
  dropTargets: readonly NativeDropTarget[],
  clientY: number,
): DropIntent | null {
  if (!isPostDragData(sourceData)) {
    return null;
  }
  const list = dropTargets.find((candidate) => isListDropData(candidate.data));
  if (!list || !isListDropData(list.data)) {
    return null;
  }
  return {
    type: 'move',
    sourceId: sourceData.postId,
    targetId: list.data.targetId,
    index: insertionIndex(list.element, clientY, sourceData.postId),
  };
}
