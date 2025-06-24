describe('Authentication', () => {
  const existingUsername = 'existinguser';
  const existingEmail = 'existinguser@example.com';
  const existingPassword = 'Test123!';

  before(() => {
    // Ensure the existing user exists and is activated
    cy.request({
      method: 'POST',
      url: '/api/test/create-user',
      body: {
        username: existingUsername,
        email: existingEmail,
        password: existingPassword,
        activated: true,
      },
      failOnStatusCode: false,
    });
  });

  it('should register a new user successfully', () => {
    const username = `testuser_${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'Test123!';
    
    // Intercept the registration request
    cy.intercept('POST', '/api/register').as('registerRequest');
    
    cy.visit('/register');
    cy.get('input[formControlName="username"]').type(username);
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password);
    cy.get('input[formControlName="confirmPassword"]').type(password);
    
    // Check for alert before clicking
    cy.on('window:alert', (text) => {
      console.log('Alert detected:', text);
    });
    
    cy.get('button[type="button"]').click();

    // Wait for the registration request to complete
    cy.wait('@registerRequest').then((interception) => {
      console.log('Registration request:', interception.request.body);
      console.log('Registration response:', interception.response?.body);
      console.log('Registration status:', interception.response?.statusCode);
    });

    // Wait for the alert to appear (this confirms the success handler was called)
    cy.on('window:alert', (text) => {
      expect(text).to.include('Registration successful');
    });

    // Immediately check for the success message without waiting for page reload
    cy.get('.success-message').should('contain', 'Registration successful');
  });

  it('should show error for duplicate username', () => {
    cy.visit('/register');
    cy.get('input[formControlName="username"]').type(existingUsername);
    cy.get('input[formControlName="email"]').type(`unique_${Date.now()}@example.com`);
    cy.get('input[formControlName="password"]').type(existingPassword);
    cy.get('input[formControlName="confirmPassword"]').type(existingPassword);
    cy.get('button[type="button"]').click();
    cy.contains('Username is already taken.').should('exist');
  });

  it('should show error for duplicate email', () => {
    cy.visit('/register');
    cy.get('input[formControlName="username"]').type(`unique_${Date.now()}`);
    cy.get('input[formControlName="email"]').type(existingEmail);
    cy.get('input[formControlName="password"]').type(existingPassword);
    cy.get('input[formControlName="confirmPassword"]').type(existingPassword);
    cy.get('button[type="button"]').click();
    cy.contains('Email is already registered.').should('exist');
  });

  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[formControlName="username"]').type(existingUsername);
    cy.get('input[formControlName="password"]').type(existingPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show error for invalid login', () => {
    cy.visit('/login');
    cy.get('input[formControlName="username"]').type('wronguser');
    cy.get('input[formControlName="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid username or password').should('exist');
  });
});
