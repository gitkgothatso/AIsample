const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    specPattern: 'src/test/webapp/e2e/**/*.(spec|cy).ts',
    fixturesFolder: false,
    supportFile: 'cypress/support/e2e.ts',
    video: false,
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
}); 