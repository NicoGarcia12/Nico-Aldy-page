export default {
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
  },
  video: false,
  screenshotOnRunFailure: true,
};
