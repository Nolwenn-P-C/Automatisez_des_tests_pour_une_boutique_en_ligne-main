import '../support/api';

describe('Vérifiez le processus d’ajout au panier et les limites', () => {
  let token;
  let idProduit;

  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((reponseToken) => {
      cy.log('Token reçu :', reponseToken);
      token = reponseToken;

      return cy.obtenirIdProduitAleatoire();
    }).then((id) => {
      cy.log('ID produit reçu :', id);
      idProduit = id;
    });
  });

  it('Vérifiez le processus d’ajout au panier et les limites', () => {
    cy.definirTokenEtRecharger(token);

    cy.window().then((window) => {
      const userData = JSON.parse(window.localStorage.getItem('user'));
      expect(userData).to.have.property('token', token);
    });

    cy.intercept('GET', '**/products/*').as('getProduct');
    cy.visit(`/#/products/${idProduit}`);
    cy.wait('@getProduct').its('response.statusCode').should('eq', 200);

    cy.intercept('PUT', '**/orders/add', (req) => {
      req.headers['Authorization'] = `Bearer ${token}`;
    }).as('addOrder');

    cy.getBySel('detail-product-name').should('be.visible').invoke('text').as('productName');

    cy.getBySel('detail-product-stock').should('be.visible').invoke('text').then((text) => {
      const initialStock = parseInt(text.match(/\d+/)[0], 10);
      cy.wrap(initialStock).as('initialStock');
    });

    cy.getBySel('detail-product-quantity').clear().type('1');
    cy.getBySel('detail-product-add').click();
    cy.url().should('eq', 'http://localhost:8080/#/cart');

    cy.get('@productName').then((name) => {
      cy.getBySel('cart-product-name').should('contain', name).and('be.visible');
      cy.log('Nom du produit ajouté au panier :', name);
    });

    cy.window().then((window) => {
      window.localStorage.setItem('user', JSON.stringify({ token }));
    });
  });
});

