import { token } from 'morgan'
import { seedAndLoginUser } from '../../support/api/auth'
import { addItemToBasket, removeItemFromBasket, updateBasketItemQuantity } from 'cypress/support/api/basketInteractions'
import { response } from 'express'

let addedBasketItems: any[] = []


describe('API checkout flow', () => {
  it('1. Seed and Login new user', () => {
    seedAndLoginUser().then((user) => {
    expect(user.token).to.be.a('string')
    expect(user.basketId).to.be.a('number')
    
    for(let i = 1; i <= 5; i++) {
      addItemToBasket(i, user.token, 1, user.basketId).then((response) => {
      cy.log(JSON.stringify(response.body))

      expect(response.status).to.be.oneOf([200, 201])
      expect(response.body.data.ProductId).to.eq(i)
      expect(response.body.data.BasketId).to.eq(user.basketId)
      expect(response.body.data.quantity).to.eq(1)
      addedBasketItems.push(response.body.data)
      })
    }
      /* I would have liked to use something like this, but Juice Shop is not a stable environment, and its APIs are not stable
      There is no API to GET basket by basketID and list basket contents, which I would have liked to
      use as a way to check the remove function worked properly.
      getBasketItems(user.token, user.basketId).then((response) => {
      cy.log(JSON.stringify(response.body))
      expect(response.status).to.be.oneOf([200, 201])
      expect(response.body.data).to.have.length(5); 

      const basketItems = response.body.data
      const itemToRemove = basketItems[1] */

      cy.then(() => {
        expect(addedBasketItems).to.have.length(5)
        const itemToRemove = addedBasketItems[1]
        return removeItemFromBasket(itemToRemove.id, user.token).then((deleteResponse) => {
          cy.log(JSON.stringify(deleteResponse.body))
          expect(deleteResponse.status).to.be.oneOf([200, 204])

            addedBasketItems = addedBasketItems.filter(
              (item) => item.id !== itemToRemove.id
            )
        })
      })
      cy.then(() =>{
        const itemToUpdate = addedBasketItems[0]
        return updateBasketItemQuantity(itemToUpdate.id, user.token, 2).then((updateResponse) => {
          cy.log(JSON.stringify(updateResponse.body))
          expect(updateResponse.status).to.be.oneOf([200, 204])
          expect(updateResponse.body.data.quantity).to.eq(2);
        })
      })
    })
  })
})
/*

  it('5. Validate the total price of order', () => {

  })

  it('6. Checkout cart', () => {

  })

  it('7. Add a valid RO address', () => {

  })

  it('8. Select a delivery method', () => {

  })

  it('9. Add a valid RO payment option', () => {

  })

  it('10. Review summary', () => {

  })

  it('11. Place Order', () => {

  })

  it('12. Validate order success', () => {

  })
})*/
