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

export type PreviewRow<T> =
  | { kind: 'post'; post: T; collapsed: boolean }
  | { kind: 'slot' };

export function rowsForPreview<T extends { id: string }>(
  posts: T[],
  preview: DropIntent | null,
  listId: string,
): PreviewRow<T>[] {
  if (!preview) {
    return posts.map((post) => ({ kind: 'post', post, collapsed: false }));
  }
  const rows: PreviewRow<T>[] = [];
  const remaining = posts.filter((post) => post.id !== preview.sourceId);
  const slotAt =
    preview.targetId === listId
      ? Math.max(0, Math.min(preview.index, remaining.length))
      : -1;
  let placed = 0;
  for (const post of posts) {
    if (post.id === preview.sourceId) {
      rows.push({ kind: 'post', post, collapsed: true });
      continue;
    }
    if (placed === slotAt) {
      rows.push({ kind: 'slot' });
    }
    rows.push({ kind: 'post', post, collapsed: false });
    placed += 1;
  }
  if (placed === slotAt) {
    rows.push({ kind: 'slot' });
  }
  return rows;
}

type DragFrame = {
  preview: DropIntent | null;
  height: number;
  landedId: string | null;
};

let frame: DragFrame = { preview: null, height: 0, landedId: null };
const frameListeners = new Set<() => void>();
let landedTimer = 0;

function emitFrame() {
  for (const listener of frameListeners) {
    listener();
  }
}

function samePreview(left: DropIntent | null, right: DropIntent | null) {
  return (
    left?.sourceId === right?.sourceId &&
    left?.targetId === right?.targetId &&
    left?.index === right?.index
  );
}

function measureCardHeight(postId: string): number {
  const cards = document.querySelectorAll<HTMLElement>(
    `[data-post-id="${postId}"]`,
  );
  for (const card of cards) {
    if (card.closest('[data-drag-preview]')) {
      continue;
    }
    if (card.offsetHeight > 0) {
      return card.offsetHeight;
    }
  }
  return 0;
}

export function getDragFrame(): DragFrame {
  return frame;
}

export function subscribeDragFrame(listener: () => void): () => void {
  frameListeners.add(listener);
  return () => {
    frameListeners.delete(listener);
  };
}

export function setDragPreview(preview: DropIntent | null) {
  const height = preview
    ? measureCardHeight(preview.sourceId) || frame.height || 96
    : 0;
  if (samePreview(frame.preview, preview) && frame.height === height) {
    return;
  }
  frame = { ...frame, preview, height };
  emitFrame();
}

export function clearDragPreview() {
  if (!frame.preview && frame.height === 0) {
    return;
  }
  frame = { ...frame, preview: null, height: 0 };
  emitFrame();
}

export function markDropped(postId: string) {
  window.clearTimeout(landedTimer);
  frame = { preview: null, height: 0, landedId: postId };
  emitFrame();
  landedTimer = window.setTimeout(() => {
    if (frame.landedId !== postId) {
      return;
    }
    frame = { ...frame, landedId: null };
    emitFrame();
  }, 1800);
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
