import '../support/api';

describe('Vérifiez le processus d’ajout au panier et les limites', () => {
  
  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      Cypress.env('token', token); 
      cy.definirTokenEtRecharger(token);
    });
  });

  it('Vérifiez le processus d’ajout au panier et les limites', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.intercept('GET', `**/products/${idProduit}`).as('getProduct');
      cy.visit(`/#/products/${idProduit}`);
      cy.wait('@getProduct').its('response.body').then((detailsProduit) => {
        const { availableStock, name } = detailsProduit;

        cy.getBySel('detail-product-name').should('be.visible').and('contain', name);
        cy.getBySel('detail-product-stock').should('contain', availableStock);

        cy.getBySel('detail-product-quantity').clear().type('1');
        cy.getBySel('detail-product-add').click();

        cy.url().should('eq', 'http://localhost:8080/#/cart');

        cy.getBySel('cart-product-name').should('contain', name).and('be.visible');
      });

      
    });
  });
});
