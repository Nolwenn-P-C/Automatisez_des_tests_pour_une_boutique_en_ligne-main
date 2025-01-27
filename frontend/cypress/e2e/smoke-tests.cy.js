import '../support/api';

describe('Présence des champs et boutons de connexion', () => {
  it('Présence du formulaire de connexion', () => {
    cy.visit(``);

    cy.getBySel('nav-link-login').click();
    cy.getBySel('login-input-username').should('be.visible');
    cy.getBySel('login-input-password').should('be.visible');
    cy.getBySel('login-submit').should('be.visible');
  });
});



describe('Présence des boutons d’ajout au panier quand utilisateur est déconnecté', () => {
  it('Présence des boutons d’ajout au panier pour un produit aléatoire mais absence du bouton panier', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.visit(`/#/products/${idProduit}`);

      cy.getBySel('detail-product-add').should('be.visible'); 
      cy.getBySel('nav-link-cart').should('not.exist');
    });
  });
});




describe('Présence des boutons d’ajout au panier quand utilisateur est connecté', () => {
  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      cy.definirTokenEtRecharger(token);
    });
  });

  it('Doit afficher les boutons d’ajout au panier pour un produit aléatoire', () => {
   

    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.visit(`/#/products/${idProduit}`); 
      cy.getBySel('detail-product-add').should('be.visible'); 
      cy.getBySel('nav-link-cart').should('exist').and('be.visible'); 
    });
  });
});



describe('Vérifiez la présence du champ de disponibilité du produit', () => {
  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      cy.definirTokenEtRecharger(token); 
    });
  });

  it('Doit afficher la disponibilité pour un produit aléatoire', () => {

    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.visit(`/#/products/${idProduit}`); 
      cy.getBySel('detail-product-stock').should('be.visible'); 
    });
  });
});

