import '../support/api';

describe('Vérifiez le processus d ajout au panier et les limites', () => {
  let authToken; 

beforeEach(() => {
  cy.connexion('test2@test.fr', 'testtest').then((token) => {
    authToken = token;
    cy.definirTokenEtRecharger(authToken);
  });
});

afterEach('Supprimer tous les éléments du panier', () => {
  if (!authToken) {
    cy.log('Aucun token disponible, impossible de supprimer le panier');
    return;
  }

  cy.obtenirPanier(authToken).then((panier) => {
    if (panier.orderLines?.length) { 
      panier.orderLines.forEach((orderLine) => {
        cy.supprimerElementDuPanier(authToken, orderLine.id);
      });
    } else {
      cy.log('Aucun élément dans le panier à supprimer');
    }
  });

  cy.getBySel('nav-link-logout').click();
});


  
  it('Produit ajouté au panier, stock déduit', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.intercept('GET', `**/products/${idProduit}`).as('obtenirProduit');
      cy.visit(`/#/products/${idProduit}`);

      cy.wait('@obtenirProduit').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const { availableStock, name } = interception.response.body;

        cy.getBySel('detail-product-name').should('contain', name);
        cy.getBySel('detail-product-stock').should('contain', availableStock);

        cy.getBySel('detail-product-quantity').clear().type('1');
        cy.getBySel('detail-product-add').click();

        cy.url().should('include', '/#/cart');
        cy.getBySel('cart-line-name').should('contain', name);

        cy.visit(`/#/products/${idProduit}`);
        cy.wait('@obtenirProduit').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          const { availableStock: updatedStock } = interception.response.body;
          expect(updatedStock).to.eq(availableStock - 1);

          cy.getBySel('detail-product-stock').should('contain', updatedStock);
        });
      });
    });
  });


  it('Tester les limites d entrée négative', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.intercept('GET', `**/products/${idProduit}`).as('obtenirProduit');
      cy.visit(`/#/products/${idProduit}`);

      cy.wait('@obtenirProduit').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);

        cy.getBySel('detail-product-quantity').clear().type('-1');
        cy.getBySel('detail-product-quantity').should('have.value','1')
      });
    });
  });

  it('Tester les limites d entrée trop importante', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.intercept('GET', `**/products/${idProduit}`).as('obtenirProduit');
      cy.visit(`/#/products/${idProduit}`);

      cy.wait('@obtenirProduit').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);

        cy.getBySel('detail-product-quantity').clear().type('21');
        cy.getBySel('detail-product-quantity').should('have.value','20')
      });
    });
  });


  it('Ajouter un produit au panier et vérifier le contenu du panier via l API', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.intercept('GET', `**/products/${idProduit}`).as('obtenirProduit');
      cy.visit(`/#/products/${idProduit}`);

      cy.wait('@obtenirProduit').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const { availableStock, name } = interception.response.body;

        cy.getBySel('detail-product-name').should('contain', name);
        cy.getBySel('detail-product-stock').should('contain', availableStock);

        cy.getBySel('detail-product-quantity').clear().type('1');
        cy.getBySel('detail-product-add').click();

        cy.url().should('include', '/#/cart');
        cy.getBySel('cart-line-name').should('contain', name);

        cy.obtenirPanier(authToken).then((panier) => {
          expect(panier.orderLines).to.have.lengthOf(1);
          expect(panier.orderLines[0].product.name).to.eq(name);
          
        })
      });
    });
  });

});
