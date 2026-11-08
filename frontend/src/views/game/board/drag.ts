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

export type DropIntent =
  | { type: 'combine'; sourceId: string; targetPostId: string }
  | { type: 'move'; sourceId: string; targetId: string; index: number };

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
  const post = stack
    .map((element) => htmlElement(element.closest('[data-post-id]')))
    .find((element) => element && element.dataset.postId !== input.draggingId);
  const list =
    htmlElement(post?.closest('[data-drop-id]') ?? null) ??
    stack
      .map((element) => htmlElement(element.closest('[data-drop-id]')))
      .find((element) => element != null);
  if (!list?.dataset.dropId) {
    return null;
  }
  if (post?.dataset.postDrop === 'true' && post.dataset.postId) {
    const edge = edgeOf(post, input.clientY);
    if (edge === 'center') {
      return {
        intent: {
          type: 'combine',
          sourceId: input.draggingId,
          targetPostId: post.dataset.postId,
        },
        highlight: post,
      };
    }
    return {
      intent: {
        type: 'move',
        sourceId: input.draggingId,
        targetId: list.dataset.dropId,
        index: indexBeside(list, post, edge, input.draggingId),
      },
      highlight: list,
    };
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
  const target = dropTargets[0];
  if (!target || !isPostDragData(sourceData)) {
    return null;
  }
  const postId = sourceData.postId;
  if (isPostDropData(target.data) && target.data.postId !== postId) {
    const edge = edgeOf(target.element, clientY);
    if (edge === 'center') {
      return {
        type: 'combine',
        sourceId: postId,
        targetPostId: target.data.postId,
      };
    }
    const parent = dropTargets.find((candidate) =>
      isListDropData(candidate.data),
    );
    if (parent && isListDropData(parent.data)) {
      return {
        type: 'move',
        sourceId: postId,
        targetId: parent.data.targetId,
        index: indexBeside(parent.element, target.element, edge, postId),
      };
    }
    return null;
  }
  if (isListDropData(target.data)) {
    return {
      type: 'move',
      sourceId: postId,
      targetId: target.data.targetId,
      index: insertionIndex(target.element, clientY, postId),
    };
  }
  return null;
}
