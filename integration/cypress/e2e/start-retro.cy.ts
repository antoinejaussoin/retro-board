const timeout = +Cypress.env('backend_delay');

function get(name: string) {
  return cy.get(`[data-cy=${name}]`, { timeout });
}

describe('Start a retro', () => {
  beforeEach(() => {
    cy.setCookie('wpcc', 'dismiss');
  });

  it('Should start a new retro from the home page', () => {
    cy.visit('/');

    cy.get('#content').get('h1', { timeout }).should('contain', 'Welcome!');

    get('login-anonymous').click();

    cy.get('#content', { timeout }).should('contain', 'Welcome,');
    cy.get('#content', { timeout }).should('contain', 'Anonymous User');

    cy.intercept('POST', '/api/create').as('createRetro');
    get('new-session-button').click();

    cy.wait('@createRetro', { timeout }).then((interception) => {
      expect(interception.response?.statusCode, 'POST /api/create').to.eq(200);
      expect(interception.response?.body?.id, 'session id').to.be.a('string');
      expect(interception.response?.body?.columns, 'columns').to.have.length(3);
    });

    cy.location('pathname', { timeout }).should('match', /^\/game\/[^/]+$/);
    get('column-input').should('have.length', 3);
  });
});
