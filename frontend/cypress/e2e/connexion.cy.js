import { faker } from '@faker-js/faker';

const fakeEmail = faker.internet.email();
const fakePassword = faker.internet.password({ length: 20 });

describe('Présence des champs connexion', () => {
  it('Redirection vers la page d’accueil après connexion', () => {
    cy.visit('http://localhost:8080/#/login');
    
    cy.getBySel('login-input-username').type(fakeEmail);
    cy.getBySel('login-input-password').type(fakePassword);
    cy.getBySel('login-submit').click();
    
    cy.get('label[for="username"].error').should('be.visible').should('have.class', 'error')
    cy.get('label[for="password"].error').should('be.visible').should('have.class', 'error')
    cy.getBySel('login-errors').should('be.visible');
  });
});

describe('Présence des champs connexion', () => {
  it('Redirection vers la page d’accueil après connexion', () => {
    cy.visit('http://localhost:8080/#/login');
    
    cy.getBySel('login-input-username').type('test2@test.fr');
    cy.getBySel('login-input-password').type('testtest');
    cy.getBySel('login-submit').click();
    
    cy.url().should('eq', 'http://localhost:8080/#/');
  });
});



