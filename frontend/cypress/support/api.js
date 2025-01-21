
// ***************************************************************************************************************** //
// *************************************************** Connexion *************************************************** //
// ***************************************************************************************************************** //

/**
 * Commande pour se connecter et obtenir un token
 * @param {string} nomUtilisateur - Le nom d'utilisateur
 * @param {string} motDePasse - Le mot de passe
 * @returns {Promise<string>} Le token d'authentification
 */
Cypress.Commands.add('connexion', (nomUtilisateur, motDePasse) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/login`,
        body: {
            username: nomUtilisateur,
            password: motDePasse
        }
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body.token;
    });
});

/**
 * Commande pour définir le token dans le localStorage et recharger la page
 * @param {string} token - Le token d'authentification
 */
Cypress.Commands.add('definirTokenEtRecharger', (token) => {
    cy.visit(Cypress.config('baseUrl'));
    cy.window().then((objetFenetre) => {
        objetFenetre.localStorage.setItem('user', JSON.stringify({ token }));
    });
    cy.reload();
});

/**
 * Commande pour obtenir le panier de l'utilisateur
 * @param {string} token - Le token d'authentification
 * @returns {Promise<Object>} Le contenu du panier
 */
Cypress.Commands.add('obtenirPanier', (token) => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/orders`,
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
    });
});


// ***************************************************************************************************************** //
// *************************************************** Commandes *************************************************** //
// ***************************************************************************************************************** //

/**
 * Commande pour obtenir un ID de produit aléatoire
 * @returns {Promise<number>} L'ID d'un produit aléatoire
 */
Cypress.Commands.add('obtenirIdProduitAleatoire', () => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/products`,
    }).then((response) => {
        expect(response.status).to.eq(200);
        const products = response.body;
        expect(products).to.have.length.greaterThan(0);
        return products[Math.floor(Math.random() * products.length)].id;
    });
});

/**
 * Commande pour obtenir la fiche d'un produit spécifique
 * @param {number} idProduit - L'ID du produit
 * @returns {Promise<Object>} Les détails du produit
 */
Cypress.Commands.add('obtenirFicheProduit', (idProduit) => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/products/${idProduit}`,
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
    });
});
