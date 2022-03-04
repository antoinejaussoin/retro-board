describe('Home Page', () => {
  it('Should load correctly', () => {
    cy.visit('/')
  
    cy.get('div.marketing-content')
      .should('contain', 'Real-time Retrospectives')
  });

  it('Should login and write a post', () => {
    cy.get('.MuiButton-root').click();
    cy.get('.MuiTabs-flexContainer > [tabindex="-1"]').click();
    cy.get('.MuiInput-input').focus().type('Zelensky');
    cy.get('.MuiDialogContent-root .MuiButton-root').click();

    // Home page should display the user name
    cy.get('#content').should('contain', 'Welcome, Zelensky');

    // And then allow creating a new session
    cy.get('button').contains('Create a new session').click();

    // And write a post
    cy.get('input[placeholder*="What went well"]').focus().type('Slava Ukraini!{enter}');

    // Reload the page
    cy.reload();

    // The post should still be there
    cy.get('#content').should('contain', 'Slava Ukraini!');
  });
});
