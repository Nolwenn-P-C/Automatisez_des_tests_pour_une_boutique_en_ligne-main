import '../support/api';

describe('Vérifiez le processus d ajout au panier et les limites', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/login').as('loginRequest');

    cy.visit('/#/login');
    cy.getBySel('login-input-username').type('test2@test.fr');
    cy.getBySel('login-input-password').type('testtest');
    cy.getBySel('login-submit').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      const authToken = interception.response.body.token;
      expect(authToken).to.not.be.undefined;

      Cypress.env('authToken', authToken);
    });
  });

  it('Produit ajouté au panier, stock déduit', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.intercept('GET', `**/products/${idProduit}`).as('getProduct');
      cy.visit(`/#/products/${idProduit}`);

      cy.wait('@getProduct').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const { availableStock, name } = interception.response.body;

        cy.getBySel('detail-product-name').should('contain', name);
        cy.getBySel('detail-product-stock').should('contain', availableStock);

        cy.getBySel('detail-product-quantity').clear().type('1');
        cy.getBySel('detail-product-add').click();

        cy.url().should('include', '/#/cart');
        cy.getBySel('cart-line-name').should('contain', name);

        cy.visit(`/#/products/${idProduit}`);
        cy.wait('@getProduct').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          const { availableStock: updatedStock } = interception.response.body;
          expect(updatedStock).to.eq(availableStock - 1);

          cy.getBySel('detail-product-stock').should('contain', updatedStock);
        });
      });
    });

    cy.visit('/#/cart');
    cy.getBySel('cart-line-delete').click({ multiple: true });
    cy.getBySel('cart-line-name').should('not.exist');

    cy.getBySel('nav-link-logout').click();
  });

  it('Tester les limites d entrée', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.intercept('GET', `**/products/${idProduit}`).as('getProduct');
      cy.visit(`/#/products/${idProduit}`);

      cy.wait('@getProduct').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const { availableStock, name } = interception.response.body;

        cy.getBySel('detail-product-name').should('contain', name);
        cy.getBySel('detail-product-stock').should('contain', availableStock);

        cy.getBySel('detail-product-quantity').clear().type('-1');
        cy.get('button[ng-reflect-ng-if="false"]').should('not.exist');

        cy.getBySel('detail-product-quantity').clear().type('21');
        cy.getBySel('detail-product-add').click();

        cy.url().should('include', '/#/cart');
        cy.getBySel('cart-line-name').should('contain', name);

        cy.visit(`/#/products/${idProduit}`);
        cy.wait('@getProduct').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          const { availableStock: updatedStock } = interception.response.body;
          expect(updatedStock).to.eq(availableStock - 21);

          cy.getBySel('detail-product-stock').should('contain', updatedStock);
        });
      });
    });

    cy.visit('/#/cart');
    cy.getBySel('cart-line-delete').click({ multiple: true });
    cy.getBySel('cart-line-name').should('not.exist');

    cy.getBySel('nav-link-logout').click();
  });

  it('Ajouter un produit au panier et vérifier le contenu du panier via l API', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.intercept('GET', `**/products/${idProduit}`).as('getProduct');
      cy.visit(`/#/products/${idProduit}`);

      cy.wait('@getProduct').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const { availableStock, name } = interception.response.body;

        cy.getBySel('detail-product-name').should('contain', name);
        cy.getBySel('detail-product-stock').should('contain', availableStock);

        cy.getBySel('detail-product-quantity').clear().type('1');
        cy.getBySel('detail-product-add').click();

        cy.url().should('include', '/#/cart');
        cy.getBySel('cart-line-name').should('contain', name);

        const authToken = Cypress.env('authToken');
        cy.obtenirPanier(authToken).then((cart) => {
          expect(cart.orderLines).to.have.lengthOf(1);
          expect(cart.orderLines[0].product.name).to.eq(name);
        });
      });
    });

    cy.getBySel('nav-link-logout').click();
  });

  it('Supprimer tous les éléments du panier', () => {
    const authToken = Cypress.env('authToken');

    cy.obtenirPanier(authToken).then((panier) => {
      const orderLines = panier.orderLines;

      if (orderLines && orderLines.length > 0) {
        orderLines.forEach((orderLine) => {
          cy.supprimerElementDuPanier(authToken, orderLine.id);
        });
      } else {
        cy.log('Aucun élément dans le panier à supprimer');
      }
    });

    cy.visit('/#/cart');
    cy.getBySel('cart-line-name').should('not.exist');

    cy.getBySel('nav-link-logout').click();
  });
});
