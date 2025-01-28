import '../support/api';

describe('Vérifiez le processus d’ajout au panier et les limites', () => {
  before(() => {
    // Interception de la requête POST pour la connexion
    cy.intercept('POST', '**/login').as('loginRequest');

    // Visite de la page de connexion et connexion avec les identifiants
    cy.visit('/#/login');
    cy.get('[data-cy=login-input-username]').type('test2@test.fr');
    cy.get('[data-cy=login-input-password]').type('testtest');
    cy.get('[data-cy=login-submit]').click();

    // Attente de la réponse de la requête de connexion
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    // Vérification de la redirection après connexion
    cy.url().should('eq', 'http://localhost:8080/#/');
  });

  it('Produit ajouté au panier, stock déduit', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      // Interception de la requête pour le produit
      cy.intercept('GET', `**/products/${idProduit}`).as('getProduct');
      cy.visit(`/#/products/${idProduit}`);

      // Attente de la réponse pour les détails du produit
      cy.wait('@getProduct').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const { availableStock, name } = interception.response.body;

        // Vérification des informations du produit
        cy.getBySel('detail-product-name').should('contain', name);
        cy.getBySel('detail-product-stock').should('contain', availableStock);

        // Ajout du produit au panier
        cy.getBySel('detail-product-quantity').clear().type('1');
        cy.getBySel('detail-product-add').click();

        // Vérification de la redirection vers le panier
        cy.url().should('include', '/#/cart');
        cy.getBySel('cart-line-name').should('contain', name);

        // Retour à la page produit pour vérifier la mise à jour du stock
        cy.visit(`/#/products/${idProduit}`);
        cy.wait('@getProduct').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          const { availableStock: updatedStock } = interception.response.body;
          expect(updatedStock).to.eq(availableStock - 1);

          cy.getBySel('detail-product-stock').should('contain', updatedStock);
        });
      });
    });

    // Suppression du produit du panier
    cy.visit('/#/cart');
    cy.getBySel('cart-line-delete').click({ multiple: true });
    cy.getBySel('cart-line-name').should('not.exist');

    // Déconnexion de l'utilisateur
    cy.getBySel('nav-link-logout').click();
  });
});
