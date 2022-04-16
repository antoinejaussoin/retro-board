describe('Home Page', () => {
  it('Should load correctly', () => {
    cy.visit('/');
  
    cy.get('div.marketing-content')
      .should('contain', 'Real-time Retrospectives')
  });
});


function get(name, rest) {
  return cy.get(`[data-cy=${name}]${rest ?? ''}`);
}

describe('Post workflow', () => {
  it('Should login and write a post', () => {
    cy.visit('/');

    // We need to wait until the backend is ready
    cy.wait(+Cypress.env('backend_delay'));
    
    get('login-button').click();
    get('anon-tab').click();
    get('anon-input', ' > input').focus().type('Zelensky');
    get('anon-login-button').click();

    // Home page should display the user name
    cy.get('#content').should('contain', 'Welcome, Zelensky');

    // And then allow creating a new session
    get('new-session-button').click();

    // And write a post
    get('column-input', ' > input').first().focus().type('Slava Ukraini!{enter}');

    // Reload the page
    cy.reload();

    // The post should still be there
    cy.get('#content').should('contain', 'Slava Ukraini!');
  });

  it('Should change language and translate the app', () => {
    cy.visit('/');

    get('login-button').click();
    get('anon-tab').click();
    get('anon-input', ' > input').focus().type('Zelensky');
    get('anon-login-button').click();

    // Home page should display the user name
    cy.get('#content').should('contain', 'Welcome, Zelensky');

    // Change language
    get('side-panel-toggle').click();
    get('language-picker').click();
    get('language-picker-item-fr').click();

    // Home page should now be in French
    cy.get('#content').should('contain', 'Bienvenue, Zelensky');
  });
});
