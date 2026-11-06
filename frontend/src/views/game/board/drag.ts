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

export function isPostDropData(
  data: Record<string | symbol, unknown>,
): data is PostDragData {
  return data.type === 'post' && typeof data.postId === 'string';
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

export function edgeOf(
  card: Element,
  clientY: number,
): 'top' | 'bottom' | 'center' {
  const rect = card.getBoundingClientRect();
  if (rect.height === 0) {
    return 'center';
  }
  const ratio = (clientY - rect.top) / rect.height;
  if (ratio < 0.25) {
    return 'top';
  }
  if (ratio > 0.75) {
    return 'bottom';
  }
  return 'center';
}

export function indexBeside(
  container: Element,
  card: Element,
  edge: 'top' | 'bottom',
  draggingId: string,
): number {
  const cards = cardsIn(container, draggingId);
  const id = card.getAttribute('data-post-id');
  const index = cards.findIndex((item) => item.dataset.postId === id);
  if (index === -1) {
    return cards.length;
  }
  return edge === 'top' ? index : index + 1;
}
