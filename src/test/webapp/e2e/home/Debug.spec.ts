import '../../../../../cypress/support/commands';

describe('Debug Dashboard Access', () => {
  const timestamp = Date.now();
  const username = `debuguser_${timestamp}`;
  const email = `debuguser_${timestamp}@example.com`;
  const password = 'TestPassword123!';

  before(() => {
    cy.createUserByApi({
      username,
      email,
      password,
      firstName: 'Debug',
      lastName: 'User',
      activated: true,
    });
  });

  it('should access dashboard after login', () => {
    // Login
    cy.loginByApi(username, password);
    
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Log current URL
    cy.url().then(url => {
      cy.log('Current URL:', url);
    });
    
    // Log page title
    cy.title().then(title => {
      cy.log('Page title:', title);
    });
    
    // Log body content
    cy.get('body').invoke('text').then(text => {
      cy.log('Body text (first 1000 chars):', text.substring(0, 1000));
    });
    
    // Check if we're on dashboard
    cy.url().should('include', '/dashboard');
    
    // Wait a bit and check for dashboard elements
    cy.get('body').then($body => {
      const hasDashboardHeader = $body.find('.dashboard-header').length > 0;
      const hasSidebar = $body.find('.sidebar').length > 0;
      const hasLoginForm = $body.find('form[formControlName="username"]').length > 0;
      
      cy.log('Has dashboard header:', hasDashboardHeader);
      cy.log('Has sidebar:', hasSidebar);
      cy.log('Has login form:', hasLoginForm);
      
      if (hasLoginForm) {
        cy.log('Appears to be on login page');
      } else if (hasDashboardHeader) {
        cy.log('Appears to be on dashboard page');
      } else {
        cy.log('Unknown page state');
      }
    });
  });
}); 