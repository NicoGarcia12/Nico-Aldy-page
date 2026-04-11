const fillWord = (controls: string[], letters: string): void => {
  controls.forEach((controlName, index) => {
    cy.get(`[formcontrolname="${controlName}"]`).type(letters[index]);
  });
};

const completeAllFields = (): void => {
  cy.get('[formcontrolname="firstKissDate"]').type('2025-02-16');
  fillWord(
    [
      'llaverosL',
      'llaverosA',
      'llaverosV',
      'llaverosE',
      'llaverosR',
      'llaverosO',
      'llaverosS',
    ],
    'LAVEROS',
  );
  fillWord(
    [
      'alfajoresL',
      'alfajoresF',
      'alfajoresA',
      'alfajoresJ',
      'alfajoresO',
      'alfajoresR',
      'alfajoresE',
      'alfajoresS',
    ],
    'LFAJORES',
  );
  fillWord(
    ['seriesE', 'seriesR', 'seriesL', 'seriesI', 'seriesN', 'seriesA'],
    'ERLINA',
  );
  cy.get('[formcontrolname="anniversaryDate"]').type('2025-04-17');
};

describe('Login flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/#/formulario');
  });

  it('shows info notice when submitting incomplete form', () => {
    cy.contains('button', 'Ver pequeña sorpresa').click();
    cy.contains('Qué pasa? Algo no lo sabés? Mmmmm').should('be.visible');
  });

  it('shows error notice when everything is filled but one value is wrong', () => {
    completeAllFields();
    cy.get('[formcontrolname="seriesA"]').clear().type('X');
    cy.contains('button', 'Ver pequeña sorpresa').click();
    cy.contains('Te estoy viendo, si sos vos mmmm flojito che').should(
      'be.visible',
    );
  });

  it('navigates to dashboard when all values are correct', () => {
    completeAllFields();
    cy.contains('button', 'Ver pequeña sorpresa').click();
    cy.contains('Bieeeen, ahora mirá la sorpresa...').should('be.visible');
    cy.url({ timeout: 8000 }).should('include', '/carta');
  });

  it('redirects from formulario to carta when already logged in', () => {
    completeAllFields();
    cy.contains('button', 'Ver pequeña sorpresa').click();
    cy.url({ timeout: 8000 }).should('include', '/carta');

    cy.visit('/#/formulario');
    cy.url({ timeout: 8000 }).should('include', '/carta');
    cy.contains('Ya habías respondido bien!').should('be.visible');
  });

  it('redirects from carta to formulario when not logged in', () => {
    cy.clearLocalStorage();
    cy.visit('/#/carta');
    cy.url().should('include', '/formulario');
    cy.contains('Respondé primero unas cositas...').should('be.visible');
  });
});
