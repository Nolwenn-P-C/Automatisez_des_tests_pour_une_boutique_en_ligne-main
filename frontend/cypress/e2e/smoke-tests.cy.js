describe('Template spec', () => {
  const productIds = [1, 2, 3, 4, 5]; 
  let token;

  before(() => {
    // Récupération du token avant les tests
      cy.request({
        method: "POST",
        url: Cypress.env('apiUrl') + "/login",
        body: {
          username: 'test2@test.fr',
          password: 'testtest',
        },
    })
    .then((response) => {
      expect(response.status).to.eq(200);

      expect(response.body).to.have.property("token");

      token = response.body.token;
    });
  })

  productIds.forEach((productId) => {
    console.log(productId)
    it(`Présence des boutons d’ajout au panier pour le produit ID ${productId}`, () => {
      
      cy.request({
        method: "GET",
        url: Cypress.env('apiUrl')+`/products/random`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((response) => {
        
        expect(response.status).to.eq(200);

        cy.visit(`http://localhost:8080/#/products/${productId}`);

        cy.getBySel('detail-product-add').should('be.visible');
      });
    });
  });
});
