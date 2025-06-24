import '../../../../../cypress/support/commands';

describe('Profile Management', () => {
  const timestamp = Date.now();
  const username = `debuguser_${timestamp}`;
  const email = `debuguser_${timestamp}@example.com`;
  const password = 'TestPassword123!';

  before(() => {
    cy.createUserByApi({
      username,
      email,
      password,
      firstName: 'TestFirst',
      lastName: 'TestLast',
      activated: true,
    });
  });

  it('should access profile page after login', () => {
    cy.request('POST', '/api/authenticate', {
      username,
      password,
      rememberMe: true
    }).then((resp) => {
      const token = resp.body.id_token;
      cy.log('Token received, length:', token.length);
      
      // First visit root with token set in localStorage
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('authenticationToken', token);
        }
      }).then(() => {
        // Now navigate to dashboard after app is loaded with token
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
        cy.wait(2000);
        
        // Try to find any dashboard-related elements
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

        // Now try to access profile (only if we're on dashboard)
        cy.get('body').then($body => {
          if ($body.find('.dashboard-header').length > 0) {
            // We're on dashboard, proceed with profile
            cy.log('Dashboard found, proceeding to profile...');
            
            // Ensure sidebar is open (if not, open it)
            cy.get('aside.sidebar').then($sidebar => {
              if ($sidebar.hasClass('closed')) {
                cy.get('.sidebar-toggle-btn').click();
              }
            });

            // Now click the Profile link
            cy.get('a').contains('Profile').click();
            
            // Verify we're on the profile page
            cy.get('input[formControlName="email"]').should('have.value', email);
            cy.get('input[formControlName="firstName"]').should('have.value', 'TestFirst');
            cy.get('input[formControlName="lastName"]').should('have.value', 'TestLast');
          } else {
            cy.log('Dashboard not found, test will fail');
            // Force the test to fail with a clear message
            cy.get('.dashboard-header').should('exist');
          }
        });
      });
    });
  });
}); 