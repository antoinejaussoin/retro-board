const timeout = +Cypress.env('backend_delay');

function get(name: string) {
  return cy.get(`[data-cy=${name}]`, { timeout });
}

function column(index: number) {
  return cy.get(`[data-drop-id="column#${index}"]`, { timeout });
}

function startRetro() {
  cy.visit('/');
  cy.get('#content').get('h1', { timeout }).should('contain', 'Welcome!');
  get('login-anonymous').click();
  cy.get('#content', { timeout }).should('contain', 'Anonymous User');
  get('new-session-button').click();
  get('column-input').should('have.length', 3);
}

function addPost(index: number, text: string) {
  get('column-input').eq(index).focus().type(`${text}{enter}`);
  column(index).should('contain', text);
}

function dragEvent(
  view: Window,
  type: string,
  dataTransfer: DataTransfer,
  x: number,
  y: number,
) {
  return new view.DragEvent(type, {
    bubbles: true,
    cancelable: true,
    dataTransfer,
    clientX: x,
    clientY: y,
  });
}

// The board uses native drag on desktop. The drag has to start on the handle,
// then move and drop with the same DataTransfer the browser would keep.
function dragPostTo(text: string, columnIndex: number) {
  column(columnIndex).scrollIntoView();
  cy.contains('[data-post-id]', text).then(($card) => {
    const card = $card[0];
    const view = card.ownerDocument.defaultView;
    const handle = card.querySelector<HTMLElement>('[data-cy=drag-handle]');
    const target = card.ownerDocument.querySelector<HTMLElement>(
      `[data-drop-id="column#${columnIndex}"]`,
    );
    if (!view || !handle || !target) {
      throw new Error('Could not find the card handle or the drop column');
    }
    handle.style.pointerEvents = 'auto';
    const handleBox = handle.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const dataTransfer = new view.DataTransfer();
    card.dispatchEvent(
      dragEvent(
        view,
        'dragstart',
        dataTransfer,
        handleBox.left + handleBox.width / 2,
        handleBox.top + handleBox.height / 2,
      ),
    );
    const x = targetBox.left + targetBox.width / 2;
    const y = targetBox.top + Math.min(48, targetBox.height / 2);
    target.dispatchEvent(dragEvent(view, 'dragenter', dataTransfer, x, y));
    target.dispatchEvent(dragEvent(view, 'dragover', dataTransfer, x, y));
    target.dispatchEvent(dragEvent(view, 'drop', dataTransfer, x, y));
    card.dispatchEvent(dragEvent(view, 'dragend', dataTransfer, x, y));
  });
}

function pointerEvent(
  view: Window,
  type: string,
  x: number,
  y: number,
) {
  return new view.PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    clientX: x,
    clientY: y,
  });
}

function touchDragPostTo(text: string, columnIndex: number) {
  column(columnIndex).scrollIntoView();
  cy.contains('[data-post-id]', text).then(($card) => {
    const card = $card[0];
    const view = card.ownerDocument.defaultView;
    const handle = card.querySelector<HTMLElement>('[data-cy=drag-handle]');
    const target = card.ownerDocument.querySelector<HTMLElement>(
      `[data-drop-id="column#${columnIndex}"]`,
    );
    if (!view || !handle || !target) {
      throw new Error('Could not find the card handle or the drop column');
    }
    const start = handle.getBoundingClientRect();
    const startX = start.left + start.width / 2;
    const startY = start.top + start.height / 2;
    handle.dispatchEvent(pointerEvent(view, 'pointerdown', startX, startY));
    view.dispatchEvent(
      pointerEvent(view, 'pointermove', startX + 24, startY + 24),
    );
    const columnBox = target.getBoundingClientRect();
    const endX = columnBox.left + columnBox.width / 2;
    const endY = columnBox.top + columnBox.height / 2;
    view.dispatchEvent(pointerEvent(view, 'pointermove', endX, endY));
    view.dispatchEvent(pointerEvent(view, 'pointerup', endX, endY));
  });
}

describe('Drag and drop', () => {
  beforeEach(() => {
    cy.setCookie('wpcc', 'dismiss');
  });

  it('moves a card into another column with the mouse', () => {
    cy.viewport(1400, 900);
    startRetro();
    addPost(0, 'Carry this across');

    dragPostTo('Carry this across', 1);

    column(1).should('contain', 'Carry this across');
    column(0).should('not.contain', 'Carry this across');

    cy.reload();
    column(1).should('contain', 'Carry this across');
    column(0).should('not.contain', 'Carry this across');
  });

  it('moves a card into another column with a touch drag', () => {
    cy.viewport(390, 844);
    startRetro();
    addPost(0, 'Carry this across');

    touchDragPostTo('Carry this across', 1);

    column(1).should('contain', 'Carry this across');
    column(0).should('not.contain', 'Carry this across');

    cy.reload();
    column(1).should('contain', 'Carry this across');
    column(0).should('not.contain', 'Carry this across');
  });
});
