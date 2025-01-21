import '../support/api';

describe('Présence des boutons d’ajout au panier quand utilisateur est déconnecté', () => {
  let idProduit;

  before(() => {
    cy.obtenirIdProduitAleatoire().then((id) => {
      idProduit = id;
    });
  });

  it('Présence des boutons d’ajout au panier pour un produit aléatoire mais absence du bouton panier', () => {
    cy.visit(`/#/products/${idProduit}`);

    cy.getBySel('detail-product-add').should('be.visible');
    cy.getBySel('nav-link-cart').should('not.exist');
  });
});

describe('Présence des boutons d’ajout au panier quand utilisateur est connecté', () => {
  let token;
  let idProduit;

  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((reponseToken) => {
      token = reponseToken;
      return cy.obtenirIdProduitAleatoire();
    }).then((id) => {
      idProduit = id;
    });
  });

  it('Doit afficher les boutons d’ajout au panier pour un produit aléatoire', () => {
    cy.definirTokenEtRecharger(token);

    cy.visit(`/#/products/${idProduit}`);
    cy.getBySel('detail-product-add').should('be.visible');
    cy.getBySel('nav-link-cart').should('exist').and('be.visible');
  });
});

describe('vérifiez la présence du champ de disponibilité du produit', () => {
  let token;
  let idProduit;

  before(() => {
    cy.connexion('test2@test.fr', 'testtest').then((reponseToken) => {
      token = reponseToken;
      return cy.obtenirIdProduitAleatoire();
    }).then((id) => {
      idProduit = id;
    });
  });

  it('Doit afficher la disponibilité pour un produit aléatoire', () => {
    cy.definirTokenEtRecharger(token);

    cy.visit(`/#/products/${idProduit}`);
    cy.getBySel('detail-product-stock').should('be.visible');
  });
});
