import '../support/api';

describe('Tests d’API', () => {

  it('Requête sur les données confidentielles d’un utilisateur avant connexion', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/orders`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it('Requête de la liste des produits du panier', () => {
    cy.connexion('test2@test.fr', 'testtest').then((token) => {
      cy.obtenirPanier(token).then((panier) => {
        // Vérifiez que la réponse contient les propriétés attendues
        expect(panier).to.have.property('id');
        expect(panier).to.have.property('firstname');
        // Ajoutez d'autres propriétés attendues ici
      });
    });
  });

  it('Requête d’une fiche produit spécifique', () => {
    cy.obtenirIdProduitAleatoire().then((idProduit) => {
      cy.obtenirFicheProduit(idProduit).then((produit) => {
        expect(produit).to.have.property('id', idProduit);
        // Ajoutez d'autres propriétés attendues ici
      });
    });
  });
});
