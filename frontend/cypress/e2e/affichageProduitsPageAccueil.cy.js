import '../support/api';

describe('Affichage des produits', () => {

  
  it('Chargement des produits sur la page accueil', () => {
    cy.visit(''); 
    cy.get('.list-products').should('be.visible'); 
  });


  it('Affichage de tous les produits et leurs informations avec redirection', () => {
    cy.obtenirListeProduits().then((produits) => {
      cy.visit(`/#/products`);

      produits.forEach((produit, index) => {
        cy.getBySel('product').eq(index).within(() => {
          cy.getBySel('product-picture').should('have.attr', 'src').and('include', produit.picture);
          cy.getBySel('product-ingredients').should('contain', produit.ingredients);
          cy.getBySel('product-link').should('be.visible').click();
        });

        cy.url().should('include', `/#/products/${produit.id}`);

        const formattedPrice = produit.price.toString().replace('.', ',');
        cy.getBySel('detail-product-price').should(($price) => {
          const text = $price.text().trim();
          expect(text).to.include(formattedPrice);
        });

        cy.visit(`/#/products`);
      });
    });
  });


  it('Affichage de chaque produit et leurs informations', () => {
    cy.obtenirListeProduits().then((produits) => {
      produits.forEach((produit) => {
        cy.visit(`/#/products/${produit.id}`); 

        cy.getBySel('detail-product-img').should('have.attr', 'src').and('include', produit.picture);
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

