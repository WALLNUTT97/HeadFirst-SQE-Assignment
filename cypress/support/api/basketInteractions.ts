 export const addItemToBasket = (productId: number, authToken: string, quantity: number, basketId: number): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
      method: 'POST',
      url: '/api/BasketItems/',
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: {
        ProductId: productId,
        BasketId: basketId,
        quantity: quantity
      },
      failOnStatusCode: false
    })
 }

  export const removeItemFromBasket = (basketItemId: number, authToken: string): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
      method: 'DELETE',
      url: `/api/BasketItems/${basketItemId}`,
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      failOnStatusCode: false
    })
 }

 /*export const getBasketItems = (authToken: string, basketId: number): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
        method: 'GET',
        url: `/api/BasketItems?filter={"where":{"BasketId":${basketId}}`,
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    })
 } */

 export const updateBasketItemQuantity = (basketItemId: number, authToken: string, quantity: number): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
        method: 'PUT',
        url: `/api/BasketItems/${basketItemId}`,
        headers: {
            Authorization: `Bearer ${authToken}`    
        },
        body:{
            quantity: quantity
        }
    })
 }

 export const getProducts = (): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request({
    method: 'GET',
    url: '/rest/products/search?q=',
    failOnStatusCode: false
  })
}

export const reviewBasket = (basketId: number, authToken: string,): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request({
    method: "GET",
    url: `/rest/basket/${basketId}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    failOnStatusCode: false,
  });
};