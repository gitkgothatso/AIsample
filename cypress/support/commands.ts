console.log('Loaded custom Cypress commands');

// Custom Cypress command for JWT login
Cypress.Commands.add('loginByApi', (username: string, password: string) => {
  cy.request('POST', '/api/authenticate', {
    username,
    password,
    rememberMe: true
  }).then((resp) => {
    window.localStorage.setItem('authenticationToken', resp.body.id_token);
  });
});

Cypress.Commands.add('createUserByApi', (user: { username: string; email: string; password: string; firstName: string; lastName: string; activated?: boolean }) => {
  cy.request('POST', '/api/test/create-user', {
    username: user.username,
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    activated: user.activated ?? true
  });
});

export {};

// Add TypeScript declaration for the custom command
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Cypress {
    interface Chainable {
      loginByApi(username: string, password: string): Cypress.Chainable<void>;
      createUserByApi(user: { username: string; email: string; password: string; firstName: string; lastName: string; activated?: boolean }): Cypress.Chainable<void>;
    }
  }
} 