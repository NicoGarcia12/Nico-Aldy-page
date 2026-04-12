/// <reference types="cypress" />

const fillWord = (controls: string[], letters: string): void => {
  controls.forEach((controlName: string, index: number) => {
    cy.get(`[formcontrolname="${controlName}"]`).type(letters[index]);
  });
};

const FORM_PATH = '/#/formulario';
const DASHBOARD_PATH = '/#/carta';

const visitWithCleanState = (path: string = FORM_PATH): void => {
  cy.clearCookies();
  cy.visit(path, {
    onBeforeLoad: (win: Cypress.AUTWindow): void => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
};

const submitLoginForm = (): void => {
  cy.get('button[type="submit"]')
    .should('contain', 'Ver pequeña sorpresa')
    .click();
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
    visitWithCleanState();
    cy.hash({ timeout: 8000 }).should('eq', '#/formulario');
    cy.get('[formcontrolname="firstKissDate"]', { timeout: 8000 }).should(
      'be.visible',
    );
  });

  it('shows info notice when submitting incomplete form', () => {
    submitLoginForm();
    cy.contains('Qué pasa? Algo no lo sabés? Mmmmm').should('be.visible');
  });

  it('shows error notice when everything is filled but one value is wrong', () => {
    completeAllFields();
    cy.get('[formcontrolname="seriesA"]').clear().type('X');
    submitLoginForm();
    cy.contains('Te estoy viendo, si sos vos mmmm flojito che').should(
      'be.visible',
    );
  });

  it('navigates to dashboard when all values are correct', () => {
    completeAllFields();
    submitLoginForm();
    cy.contains('Bieeeen, ahora mirá la sorpresa...').should('be.visible');
    cy.hash({ timeout: 8000 }).should('eq', '#/carta');
  });

  it('redirects from formulario to carta when already logged in', () => {
    completeAllFields();
    submitLoginForm();
    cy.hash({ timeout: 8000 }).should('eq', '#/carta');

    cy.visit(FORM_PATH);
    cy.hash({ timeout: 8000 }).should('eq', '#/carta');
  });

  it('redirects from carta to formulario when not logged in', () => {
    visitWithCleanState(DASHBOARD_PATH);
    cy.hash({ timeout: 8000 }).should('eq', '#/formulario');
    cy.contains('Respondé primero unas cositas...').should('be.visible');
  });
});
