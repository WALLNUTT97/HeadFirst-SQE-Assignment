export const trackOrder = (trackingNumber: string, authToken: string): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
        method: 'GET',
        url: `/rest/track-order/${trackingNumber}`,
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
        failOnStatusCode: false,
    })
}