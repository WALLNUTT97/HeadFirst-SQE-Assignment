import type { CheckoutAddress, PaymentOption } from '../types/types'

export const addAddress = (address: CheckoutAddress, authToken: string): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request({
    method: 'POST',
    url: '/api/Addresss/',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: address,
    failOnStatusCode: false,
  })
}

export const selectDelivery = (deliveryOption: number, authToken: string): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
        method: 'GET',
        url: `/api/Deliverys/${deliveryOption}`,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        failOnStatusCode: false,
    })
}

export const addPaymentMethod = (paymentDetails: PaymentOption, authToken: string): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
        method: "POST",
        url: "/api/Cards/",
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
        body: paymentDetails,
        failOnStatusCode: false,
    });  
}

export const placeOrder = (addressId: number, deliveryMethodId: number, paymentId: number, basketId: number, authToken: string): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
        method: 'POST',
        url: `/rest/basket/${basketId}/checkout`,
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
        body: {
            paymentId: paymentId,
            addressId: addressId,
            deliveryMethodId: deliveryMethodId,
        }
    })
}