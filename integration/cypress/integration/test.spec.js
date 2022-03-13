describe('Home Page', () => {
  it('Should load correctly', () => {
    cy.visit('/')
  
    cy.get('div.marketing-content')
      .should('contain', 'Real-time Retrospectives')
  });

  function get(name, rest) {
    return cy.get(`[data-cy=${name}] ${rest ?? ''}`);
  }

  it('Should login and write a post', () => {
    get('login-button').click();
    get('anon-tab').click();
    get('anon-input', ' > input').focus().type('Zelensky');
    get('anon-login-button').click();

    // Home page should display the user name
    cy.get('#content').should('contain', 'Welcome, Zelensky');

    // And then allow creating a new session
    get('new-session-button').click();

    // And write a post
    cy.get('input[placeholder*="What went well"]').focus().type('Slava Ukraini!{enter}');

    // Reload the page
    cy.reload();

    // The post should still be there
    cy.get('#content').should('contain', 'Slava Ukraini!');
  });
});
