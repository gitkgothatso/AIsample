import '../../../../../cypress/support/commands';

describe('Profile Management', () => {
  const timestamp = Date.now();
  const username = `testuser_${timestamp}`;
  const email = `testuser_${timestamp}@example.com`;
  const password = 'TestPass123!';
  const newEmail = `testuser_new_${timestamp}@example.com`;
  const newFirstName = 'NewFirst';
  const newLastName = 'NewLast';
  const newPassword = 'NewPassword456!';

  before(() => {
    // Create and activate the test user
    cy.request('POST', '/api/test/create-user', {
      username,
      email,
      password,
      firstName: 'Test',
      lastName: 'User',
      activated: true,
    });
  });

  beforeEach(() => {
    // Authenticate and set JWT in localStorage before app loads
    cy.request('POST', '/api/authenticate', {
      username,
      password,
      rememberMe: true
    }).then((resp) => {
      const token = resp.body.id_token;
      cy.visit('/dashboard', {
        onBeforeLoad(win) {
          win.localStorage.setItem('authenticationToken', token);
        }
      });
    });
    cy.url().should('include', '/dashboard');
  });

  // Utility: Always ensure sidebar is open and click Profile link
  function goToProfileSection() {
    cy.get('body').then($body => {
      // Open sidebar if closed
      if ($body.find('.sidebar.closed').length > 0) {
        cy.get('.sidebar-toggle-btn').click();
      }
    });
    // Click the Profile link (exact match)
    cy.get('a').contains(/^Profile$/).click({ force: true });
  }

  it('should display current profile info', () => {
    goToProfileSection();
    cy.get('input[formControlName="email"]').should('have.value', email);
    cy.get('input[formControlName="firstName"]').should('have.value', 'Test');
    cy.get('input[formControlName="lastName"]').should('have.value', 'User');
  });

  it('should update profile info', () => {
    goToProfileSection();
    cy.get('input[formControlName="firstName"]').clear().type(newFirstName);
    cy.get('input[formControlName="lastName"]').clear().type(newLastName);
    cy.get('input[formControlName="email"]').clear().type(newEmail);
    cy.get('button[type="submit"]').contains('Save Profile').click();
    cy.contains('Profile updated successfully').should('exist');
    cy.reload();
    goToProfileSection();
    cy.get('input[formControlName="firstName"]').should('have.value', newFirstName);
    cy.get('input[formControlName="lastName"]').should('have.value', newLastName);
    cy.get('input[formControlName="email"]').should('have.value', newEmail);
  });

  it('should change password', () => {
    goToProfileSection();
    cy.get('input[formControlName="currentPassword"]').type(password);
    cy.get('input[formControlName="newPassword"]').type(newPassword);
    cy.get('button[type="submit"]').contains('Change Password').click();
    cy.contains('Password changed successfully').should('exist');
    
    // Verify we're still on the profile page
    cy.url().should('include', '/dashboard');
    
    // Clear authentication token and test login with new password
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('input[formControlName="username"]').type(username);
    cy.get('input[formControlName="password"]').type(newPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Verify we can access profile with new password
    goToProfileSection();
    cy.get('input[formControlName="email"]').should('have.value', newEmail);
  });
});

// Separate test for wrong password scenario
describe('Profile Management - Wrong Password Test', () => {
  it('should show error for wrong current password', () => {
    // Create a fresh user for this test to avoid password conflicts
    const errorTestTimestamp = Date.now();
    const errorTestUsername = `erroruser_${errorTestTimestamp}`;
    const errorTestEmail = `erroruser_${errorTestTimestamp}@example.com`;
    const errorTestPassword = 'TestPass123!';

    // Create and activate the test user
    cy.request('POST', '/api/test/create-user', {
      username: errorTestUsername,
      email: errorTestEmail,
      password: errorTestPassword,
      firstName: 'Error',
      lastName: 'User',
      activated: true,
    }).then((createResp) => {
      expect(createResp.status).to.eq(200);
      
      // Wait a moment for user creation to complete
      cy.wait(1000);
      
      // Authenticate with the fresh user
      cy.request('POST', '/api/authenticate', {
        username: errorTestUsername,
        password: errorTestPassword,
        rememberMe: true
      }).then((authResp) => {
        expect(authResp.status).to.eq(200);
        expect(authResp.body.id_token).to.exist;
        
        const token = authResp.body.id_token;
        cy.visit('/dashboard', {
          onBeforeLoad(win) {
            win.localStorage.setItem('authenticationToken', token);
          }
        });
      });
    });
    
    cy.url().should('include', '/dashboard');

    // Utility: Always ensure sidebar is open and click Profile link
    function goToProfileSection() {
      cy.get('body').then($body => {
        // Open sidebar if closed
        if ($body.find('.sidebar.closed').length > 0) {
          cy.get('.sidebar-toggle-btn').click();
        }
      });
      // Click the Profile link (exact match)
      cy.get('a').contains(/^Profile$/).click({ force: true });
    }

    goToProfileSection();
    cy.get('input[formControlName="currentPassword"]').type('wrongpass');
    cy.get('input[formControlName="newPassword"]').type('AnotherPass123!');
    cy.get('button[type="submit"]').contains('Change Password').click();
    cy.contains('Current password is incorrect').should('exist');
  });
}); 