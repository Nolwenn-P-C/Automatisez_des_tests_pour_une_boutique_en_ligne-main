import '../support/api';
import { faker } from '@faker-js/faker';


// ***************************************************************************************************************** //
// **************************************************** Test GET *************************************************** //
// ***************************************************************************************************************** //

describe('Tests API GET', () => {
  it('Requête sur les données confidentielles d un utilisateur avant connexion', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/orders`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it('Requête de la liste des produits du panier', () => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      cy.obtenirPanier(token).then((panier) => {
        expect(panier).to.have.property('id');
        expect(panier).to.have.property('firstname');
      });
    });
  });

  it('Requête d une fiche produit spécifique', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.obtenirFicheProduit(idProduit).then((produit) => {
        expect(produit).to.have.property('id', idProduit);
      });
    });
  });
});


// ***************************************************************************************************************** //
// ********************************************* Tests POST Connexion ********************************************** //
// ***************************************************************************************************************** //

describe('Tests API POST - Mauvaise identification', () => {
  it('Doit retourner une erreur 401', () => {
    const fakeEmail = faker.internet.email();
    const fakePassword = faker.internet.password({ length: 20 });

    cy.visit('http://localhost:8080/#/login');

    cy.getBySel('login-input-username').type(fakeEmail);
    cy.getBySel('login-input-password').type(fakePassword);
    cy.getBySel('login-submit').click();

    cy.intercept('POST', '**/login').as('loginRequest');
    cy.wait('@loginRequest').then((interception) => {
      const { response } = interception;
      expect(response.statusCode).to.eq(401);
    });

    cy.get('label[for="username"].error').should('be.visible').and('have.class', 'error');
    cy.get('label[for="password"].error').should('be.visible').and('have.class', 'error');
  });
});



describe('Test API POST - Connexion reussie', () => {
  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      Cypress.env('authToken', token);
    });
  });

  it('Doit retourner 200', () => {
    cy.intercept('POST', '**/login').as('loginRequest');

    cy.visit('http://localhost:8080/#/login');
    cy.get('[data-cy=login-input-username]').type('test2@test.fr');
    cy.get('[data-cy=login-input-password]').type('testtest');
    cy.get('[data-cy=login-submit]').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.url().should('eq', 'http://localhost:8080/#/');
  });
});


// ***************************************************************************************************************** //
// ************************************************ Tests POST Panier ********************************************** //
// ***************************************************************************************************************** //




// ***************************************************************************************************************** //
// ************************************************* Tests POST Avis *********************************************** //
// ***************************************************************************************************************** //

describe('Tests API POST - Ajout un avis', () => {

  beforeEach(() => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      Cypress.env('authToken', token);
    });
  });

  it('Doit échouer avec une requête invalide', () => {
    const token = Cypress.env('authToken');

    cy.ajouterAvis(token, '', '', '', { failOnStatusCode: false }).then(response => {
      expect(response.status).to.eq(400);

      // Vérifiez la structure du corps de la réponse
      if (response.body && response.body.error) {
        expect(response.body.error).to.be.an('array').that.is.empty;
      } else {
        throw new Error('Clé "error" absente.');
      }
    });
  });

  it('Doit réussir avec une requête valide', () => {
    const token = Cypress.env('authToken');

    cy.ajouterAvis(token, 'Super produit', 'Le produit est excellent et je le recommande.', 5).then(response => {
      expect([200, 201]).to.include(response.status);

      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('title', 'Super produit');
      expect(response.body).to.have.property('comment', 'Le produit est excellent et je le recommande.');
      expect(response.body).to.have.property('rating', 5);
    });
  });
});
