import '../support/api';


describe('Vérifiez le processus d ajout au panier et les limites', () => {
  before(() => {
    cy.intercept('POST', '**/login').as('loginRequest');

    cy.visit('/#/login');
    cy.getBySel('login-input-username').type('test2@test.fr');
    cy.getBySel('login-input-password').type('testtest');
    cy.getBySel('login-submit').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
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
});


describe('Vérifiez les limites d ajout au panier', () => {
  before(() => {
    cy.intercept('POST', '**/login').as('loginRequest');

    cy.visit(`/#/login`);
    cy.getBySel('login-input-username').type('test2@test.fr');
    cy.getBySel('login-input-password').type('testtest');
    cy.getBySel('login-submit').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
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
        })
      });
    });
    cy.visit('/#/cart');
    cy.getBySel('cart-line-delete').click({ multiple: true });
    cy.getBySel('cart-line-name').should('not.exist');

    cy.getBySel('nav-link-logout').click();
  });
});


describe('Ajout élément au panier (clic bouton ajouter au panier, vérification du contenu du panier via l API)', () => {
  before(() => {
    cy.intercept('POST', '**/login').as('loginRequest');

    cy.visit(`/#/login`);
    cy.getBySel('login-input-username').type('test2@test.fr');
    cy.getBySel('login-input-password').type('testtest');
    cy.getBySel('login-submit').click();
  });

  it('Ajouter un produit au panier et vérifier le contenu du panier via l API', () => {
    cy.wait('@loginRequest').its('response.body.token').then((token) => {
      expect(token).to.not.be.undefined;

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

          cy.obtenirPanier(token).then((cart) => {
            expect(cart.orderLines).to.have.lengthOf(1);
            expect(cart.orderLines[0].product.name).to.eq(name);
          });
        });
      });

      cy.visit(`/#/cart`);
      cy.getBySel('cart-line-delete').click();
      cy.getBySel('cart-line-name').should('not.exist');

      cy.getBySel('nav-link-logout').click();
    });
  });
});

