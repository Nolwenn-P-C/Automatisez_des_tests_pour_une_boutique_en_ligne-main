import '../support/api';

describe('Affichage des produits', () => {

  
  it('Chargement des produits sur la page accueil', () => {
    cy.visit(''); 
    cy.get('.list-products').should('be.visible'); 
  });


  it('Affichage de tous les produits et leurs informations', () => {
    cy.obtenirListeProduits().then((produits) => {
      cy.visit(`/#/products`); 

      produits.forEach((produit, index) => {
        cy.getBySel('product').eq(index).within(() => {
          cy.getBySel('product-picture').should('be.visible');
          cy.getBySel('product-ingredients').should('contain', produit.ingredients);
          cy.getBySel('product-link').should('be.visible');
        });
      });
    });
  });


  it('Affichage de chaque produit et leurs informations', () => {
    cy.obtenirListeProduits().then((produits) => {
      produits.forEach((produit) => {
        cy.visit(`/#/products/${produit.id}`); 

        cy.getBySel('detail-product-img').should('be.visible');
        cy.getBySel('detail-product-description').should('contain', produit.description);
        cy.getBySel('detail-product-stock').should('contain', produit.availableStock + ' en stock');

        const formattedPrice = produit.price.toString().replace('.', ',');
        cy.getBySel('detail-product-price').should(($price) => {
          const text = $price.text().trim();
          expect(text).to.include(formattedPrice); 
        });
      });
    });
  });

});

