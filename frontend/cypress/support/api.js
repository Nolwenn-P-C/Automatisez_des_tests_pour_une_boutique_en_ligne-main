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
    cy.visit(``);
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
// **************************************************** Produits *************************************************** //
// ***************************************************************************************************************** //

/**
 * Commande pour obtenir la liste de tous les produits
 * @returns {Promise<Array>} La liste des produits
 */
Cypress.Commands.add('obtenirListeProduits', () => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/products`,
    }).then((response) => {
        expect(response.status).to.eq(200);
        const products = response.body;
        expect(products).to.have.length.greaterThan(0);
        return products;
    });
});

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


// ***************************************************************************************************************** //
// *************************************************** Commandes *************************************************** //
// ***************************************************************************************************************** //

/**
 * Commande pour ajouter un produit au panier
 * @param {string} token - Le token d'authentification
 * @param {number} idProduit - L'ID du produit
 * @param {number} quantite - La quantité du produit à ajouter
 * @returns {Promise<Object>} La réponse de l'API
 */
Cypress.Commands.add('ajouterProduitAuPanier', (token, idProduit, quantite) => {
    return cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl')}/orders/add`,
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: {
            product: idProduit,
            quantity: quantite
        }
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
    });
});


// ***************************************************************************************************************** //
// ****************************************************** Avis ***************************************************** //
// ***************************************************************************************************************** //

/**
 * Commande pour ajouter un avis
 * @param {string} token - Le token d'authentification
 * @param {string} title - Le titre de l'avis
 * @param {string} comment - Le commentaire de l'avis
 * @param {number} rating - La note de l'avis
 * @param {Object} options - Options supplémentaires pour la requête
 * @returns {Promise<Object>} La réponse de l'API
 */
Cypress.Commands.add('ajouterAvis', (token, title, comment, rating, options = {}) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/reviews`,
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: {
            title: title,
            comment: comment,
            rating: rating
        },
        ...options
    }).then((response) => {
        return response;
    });
});
