import '../support/api';


describe('Présence des champs et boutons dans le formulaire de connexion', () => {
  it('Présence du formulaire de connexion', () => {
    cy.visit(``);

    cy.getBySel('nav-link-login').click();
    cy.getBySel('login-input-username').should('be.visible');
    cy.getBySel('login-input-password').should('be.visible');
    cy.getBySel('login-submit').should('be.visible');
  });
});


describe('Absence du bouton panier quand utilisateur est déconnecté', () => {
  it('Présence des boutons d ajout au panier pour un produit aléatoire mais absence du bouton panier', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.visit(`/#/products/${idProduit}`);

      cy.getBySel('detail-product-add').should('be.visible'); 
      cy.getBySel('nav-link-cart').should('not.exist');
    });
  });
});


describe('Présence du bouton panier quand utilisateur est connecté', () => {
  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      cy.definirTokenEtRecharger(token);
    });
  });

  it('Doit afficher les boutons d ajout au panier et ainsi que le bouton panier pour un produit aléatoire', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.visit(`/#/products/${idProduit}`); 
      cy.getBySel('detail-product-add').should('be.visible'); 
      cy.getBySel('nav-link-cart').should('exist').and('be.visible'); 
    });
  });
});


describe('Vérifie la présence du champ de disponibilité du produit', () => {

  it('Doit afficher la disponibilité pour un produit aléatoire hors connexion', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.visit(`/#/products/${idProduit}`); 
      cy.getBySel('detail-product-stock').should('be.visible'); 
    });
  });

  it('Doit afficher la disponibilité pour un produit aléatoire lorsque l utilisateur est connecter', () => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      cy.definirTokenEtRecharger(token); 
    });
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.visit(`/#/products/${idProduit}`); 
      cy.getBySel('detail-product-stock').should('be.visible'); 
    });
  });
});

