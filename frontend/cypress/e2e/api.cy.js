import '../support/api';
import { faker } from '@faker-js/faker';



// ***************************************************************************************************************** //
// **************************************************** Test GET *************************************************** //
// ***************************************************************************************************************** //


describe('Tests API GET', () => {
  it('Requête sur les données confidentielles d un utilisateur avant connexion', () => {
    cy.verifierDonneesConfidentielles();
  });

  it('Requête de la liste des produits', () => {
    cy.obtenirListeProduits().then((produits) => {
      produits.forEach((produit) => {
        expect(produit).to.have.property('id');
        expect(produit).to.have.property('name');
        expect(produit).to.have.property('availableStock');
        expect(produit).to.have.property('skin');
        expect(produit).to.have.property('aromas');
        expect(produit).to.have.property('ingredients');
        expect(produit).to.have.property('description');
        expect(produit).to.have.property('price');
        expect(produit).to.have.property('picture');
        expect(produit).to.have.property('varieties');
      });
    });
  });

  it('Requête d une fiche produit spécifique', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
        cy.obtenirFicheProduit(idProduit).then((produit) => {
            expect(produit).to.have.property('id', idProduit);
            expect(produit).to.have.property('name');
            expect(produit).to.have.property('availableStock');
            expect(produit).to.have.property('skin');
            expect(produit).to.have.property('aromas');
            expect(produit).to.have.property('ingredients');
            expect(produit).to.have.property('description');
            expect(produit).to.have.property('price');
            expect(produit).to.have.property('picture');
            expect(produit).to.have.property('varieties');
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

    cy.visit(`/#/login`);

    cy.intercept('POST', '**/login').as('loginRequest');

    cy.getBySel('login-input-username').type(fakeEmail);
    cy.getBySel('login-input-password').type(fakePassword);
    cy.getBySel('login-submit').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(401);
    });

    cy.get('label[for="username"].error').should('be.visible').and('have.class', 'error');
    cy.get('label[for="password"].error').should('be.visible').and('have.class', 'error');
  });
});


describe('Test API POST - Connexion réussie', () => {
  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      cy.definirTokenEtRecharger(token);
    });
  });

  it('Doit retourner 200', () => {
    cy.visit('/#/');
    cy.url().should('eq', 'http://localhost:8080/#/');

    cy.window().then((objetFenetre) => {
      const user = JSON.parse(objetFenetre.localStorage.getItem('user'));
      expect(user).to.have.property('token');
      cy.log(`Token dans localStorage : ${user.token}`);
    });
  });
});



// ***************************************************************************************************************** //
// ************************************************ Tests POST Panier ********************************************** //
// ***************************************************************************************************************** //


describe("Ajout d'un produit au panier", () => {
  beforeEach(() => {
    cy.intercept('POST', '**/login').as('loginRequest');
    cy.visit('/#/login');
    cy.getBySel('login-input-username').type('test2@test.fr');
    cy.getBySel('login-input-password').type('testtest');
    cy.getBySel('login-submit').click();
  });

  it("Ajoute un produit en stock au panier", () => {
    cy.wait('@loginRequest').its('response.body.token').then((token) => {
      expect(token).to.not.be.undefined;

      cy.obtenirListeProduits().then((produits) => {
        const produitEnStock = produits.find(p => p.availableStock > 0);
        expect(produitEnStock).to.not.be.undefined;

        cy.ajouterProduitAuPanier(token, produitEnStock.id, 1).then((response) => {
          cy.log('Response Status:', response.status);
          cy.log('Response Body:', JSON.stringify(response.body));

          expect(response.status).to.eq(200);
        });
      });
    });
  });

  it('Ajoute un produit en rupture de stock au panier', () => {
    cy.wait('@loginRequest').its('response.body.token').then((token) => {
      expect(token).to.not.be.undefined;

      cy.obtenirListeProduits().then((produits) => {
        const produitEnRupture = produits.find(p => p.availableStock <= 0);

        cy.wrap(produitEnRupture).should('not.be.undefined').then((produit) => {
          cy.ajouterProduitAuPanier(token, produit.id, 1).then((response) => {
            cy.log('Response Status:', response.status);
            cy.log('Response Body:', JSON.stringify(response.body));
            expect(response.status).to.not.eq(200);
          });
        });
      });
    });
  });

});




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
