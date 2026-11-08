import { afterEach, describe, expect, it, vi } from 'vitest';
import { intentFromNativeDrop, resolveTouchDrop, rowsForPreview } from '../drag';
import { bindTouchDrag } from '../touch-drag';

function box(element: HTMLElement, top: number, height: number) {
  element.getBoundingClientRect = () =>
    ({
      x: 0,
      y: top,
      top,
      left: 0,
      right: 200,
      bottom: top + height,
      width: 200,
      height,
      toJSON() {
        return {};
      },
    }) as DOMRect;
}

function card(id: string) {
  const element = document.createElement('div');
  element.dataset.postId = id;
  return element;
}

function columnOf(id: string, ...cards: HTMLElement[]) {
  const column = document.createElement('div');
  column.dataset.dropId = id;
  column.append(...cards);
  return column;
}

describe('resolveTouchDrop', () => {
  it('reorders when a touch lands on the centre of another card', () => {
    const first = card('a');
    const second = card('b');
    const column = columnOf('column#0', first, second);
    box(first, 0, 100);
    box(second, 100, 100);

    const resolved = resolveTouchDrop({
      elements: [second, column],
      clientY: 150,
      draggingId: 'a',
    });

    expect(resolved?.intent).toEqual({
      type: 'move',
      sourceId: 'a',
      targetId: 'column#0',
      index: 1,
    });
    expect(resolved?.highlight).toBe(column);
  });

  it('inserts beside a card when the touch is on its edge', () => {
    const first = card('a');
    const second = card('b');
    const column = columnOf('column#0', first, second);
    box(first, 0, 100);
    box(second, 100, 100);

    const above = resolveTouchDrop({
      elements: [second, column],
      clientY: 110,
      draggingId: 'c',
    });
    const below = resolveTouchDrop({
      elements: [second, column],
      clientY: 190,
      draggingId: 'c',
    });

    expect(above?.intent).toEqual({
      type: 'move',
      sourceId: 'c',
      targetId: 'column#0',
      index: 1,
    });
    expect(below?.intent).toEqual({
      type: 'move',
      sourceId: 'c',
      targetId: 'column#0',
      index: 2,
    });
    expect(above?.highlight).toBe(column);
  });

  it('drops into an existing group', () => {
    const grouped = card('a');
    const group = columnOf('group#g', grouped);
    box(grouped, 0, 80);

    const resolved = resolveTouchDrop({
      elements: [grouped, group],
      clientY: 10,
      draggingId: 'z',
    });

    expect(resolved?.intent).toEqual({
      type: 'move',
      sourceId: 'z',
      targetId: 'group#g',
      index: 0,
    });
  });

  it('ignores the floating preview and the card being dragged', () => {
    const source = card('a');
    const target = card('b');
    const column = columnOf('column#0', source, target);
    const preview = document.createElement('div');
    preview.dataset.dragPreview = 'true';
    const ghost = card('ghost');
    preview.append(ghost);
    box(source, 0, 100);
    box(target, 100, 100);

    const resolved = resolveTouchDrop({
      elements: [ghost, preview, source, column],
      clientY: 20,
      draggingId: 'a',
    });

    expect(resolved?.intent).toEqual({
      type: 'move',
      sourceId: 'a',
      targetId: 'column#0',
      index: 0,
    });
  });

  it('returns null when the finger is not over a column or group', () => {
    expect(
      resolveTouchDrop({
        elements: [document.createElement('div')],
        clientY: 10,
        draggingId: 'a',
      }),
    ).toBeNull();
  });
});

describe('intentFromNativeDrop', () => {
  it('reorders inside the column when a card is dropped on another card', () => {
    const first = card('a');
    const second = card('b');
    const column = columnOf('column#1', first, second);
    box(first, 0, 100);
    box(second, 100, 100);
    const targets = [
      { element: second, data: { type: 'post', postId: 'b' } },
      { element: column, data: { type: 'column', targetId: 'column#1' } },
    ];

    expect(
      intentFromNativeDrop({ type: 'post', postId: 'a' }, targets, 150),
    ).toEqual({
      type: 'move',
      sourceId: 'a',
      targetId: 'column#1',
      index: 1,
    });
    expect(
      intentFromNativeDrop({ type: 'post', postId: 'c' }, targets, 190),
    ).toEqual({
      type: 'move',
      sourceId: 'c',
      targetId: 'column#1',
      index: 2,
    });
  });

  it('inserts into the list when the drop target is the column', () => {
    const only = card('b');
    const column = columnOf('column#0', only);
    box(only, 0, 100);

    expect(
      intentFromNativeDrop(
        { type: 'post', postId: 'a' },
        [{ element: column, data: { type: 'column', targetId: 'column#0' } }],
        80,
      ),
    ).toEqual({
      type: 'move',
      sourceId: 'a',
      targetId: 'column#0',
      index: 1,
    });
  });
});

function pointer(
  type: string,
  phase: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  x: number,
  y: number,
) {
  const event = new MouseEvent(phase, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: type },
    isPrimary: { value: true },
  });
  return event;
}

describe('rowsForPreview', () => {
  const posts = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('opens a gap where the card will land and collapses the card being dragged', () => {
    expect(
      rowsForPreview(
        posts,
        { type: 'move', sourceId: 'b', targetId: 'column#0', index: 0 },
        'column#0',
      ),
    ).toEqual([
      { kind: 'slot' },
      { kind: 'post', post: { id: 'a' }, collapsed: false },
      { kind: 'post', post: { id: 'b' }, collapsed: true },
      { kind: 'post', post: { id: 'c' }, collapsed: false },
    ]);
  });

  it('removes the dragged card from its old list without a gap', () => {
    expect(
      rowsForPreview(
        posts,
        { type: 'move', sourceId: 'a', targetId: 'group#g', index: 0 },
        'column#0',
      ).map((row) => (row.kind === 'slot' ? 'slot' : `${row.post.id}:${row.collapsed}`)),
    ).toEqual(['a:true', 'b:false', 'c:false']);
  });
});

describe('bindTouchDrag', () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.classList.remove('post-touch-drag');
  });

  it('drags from a touch swipe and drops at the release point', () => {
    const cardElement = document.createElement('div');
    const handle = document.createElement('div');
    cardElement.dataset.postId = 'a';
    cardElement.setAttribute('draggable', 'true');
    cardElement.append(handle);
    document.body.append(cardElement);
    const onDragging = vi.fn();
    const onDrop = vi.fn();
    const cleanup = bindTouchDrag(handle, {
      card: cardElement,
      onDragging,
      onPreview: vi.fn(),
      onDrop,
    });

    handle.dispatchEvent(pointer('touch', 'pointerdown', 10, 10));
    handle.dispatchEvent(pointer('touch', 'pointermove', 30, 40));

    expect(onDragging).toHaveBeenCalledWith(true);
    expect(cardElement.getAttribute('draggable')).toBe('false');
    expect(document.querySelector('[data-drag-preview]')).not.toBeNull();

    handle.dispatchEvent(pointer('touch', 'pointerup', 30, 40));

    expect(onDrop).toHaveBeenCalledWith(30, 40);
    expect(onDragging).toHaveBeenLastCalledWith(false);
    expect(document.querySelector('[data-drag-preview]')).toBeNull();
    expect(cardElement.getAttribute('draggable')).toBe('true');
    cleanup();
  });

  it('does not start a drag for a mouse pointer or a small movement', () => {
    const cardElement = document.createElement('div');
    const handle = document.createElement('div');
    cardElement.setAttribute('draggable', 'true');
    cardElement.append(handle);
    document.body.append(cardElement);
    const onDrop = vi.fn();
    const onDragging = vi.fn();
    const cleanup = bindTouchDrag(handle, {
      card: cardElement,
      onDragging,
      onPreview: vi.fn(),
      onDrop,
    });

    handle.dispatchEvent(pointer('mouse', 'pointerdown', 0, 0));
    handle.dispatchEvent(pointer('mouse', 'pointermove', 40, 40));
    handle.dispatchEvent(pointer('mouse', 'pointerup', 40, 40));
    handle.dispatchEvent(pointer('touch', 'pointerdown', 0, 0));
    handle.dispatchEvent(pointer('touch', 'pointermove', 2, 2));
    handle.dispatchEvent(pointer('touch', 'pointerup', 2, 2));

    expect(onDrop).not.toHaveBeenCalled();
    expect(onDragging).not.toHaveBeenCalled();
    expect(cardElement.getAttribute('draggable')).toBe('true');
    cleanup();
  });

  it('cancels a touch drag without dropping', () => {
    const cardElement = document.createElement('div');
    const handle = document.createElement('div');
    cardElement.append(handle);
    document.body.append(cardElement);
    const onDrop = vi.fn();
    const cleanup = bindTouchDrag(handle, {
      card: cardElement,
      onDragging: vi.fn(),
      onPreview: vi.fn(),
      onDrop,
    });

    handle.dispatchEvent(pointer('touch', 'pointerdown', 0, 0));
    handle.dispatchEvent(pointer('touch', 'pointermove', 20, 0));
    handle.dispatchEvent(pointer('touch', 'pointercancel', 20, 0));

    expect(onDrop).not.toHaveBeenCalled();
    expect(document.querySelector('[data-drag-preview]')).toBeNull();
    cleanup();
  });
});
