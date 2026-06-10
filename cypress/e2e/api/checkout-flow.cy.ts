import { seedAndLoginUser } from "../../support/api/auth";
import {
  addItemToBasket,
  removeItemFromBasket,
  updateBasketItemQuantity,
  getProducts,
  reviewBasket,
} from "cypress/support/api/basketInteractions";
import {
  addAddress,
  addPaymentMethod,
  selectDelivery,
  placeOrder,
} from "cypress/support/api/checkoutInteractions";
import { trackOrder } from "cypress/support/api/orderInteractions";
import { CheckoutAddress, PaymentOption } from "cypress/support/types/types";

let addedBasketItems: any[] = [];
const deliveryOption = [1, 2, 3]; //1, One day delivery, 2 fast delivery, 3 standard delivery
let addressId: number;
let deliveryMethodId: number;
let paymentId: number;
let trackingNumber: string;

describe("API checkout flow", () => {
  it("1. Seed and Login new user", () => {
    seedAndLoginUser().then((user) => {
      expect(user.token).to.be.a("string");
      expect(user.basketId).to.be.a("number");

      getProducts().then((productResponse) => {
        expect(productResponse.status).to.eq(200);
        const products = productResponse.body.data;

        const productsById = new Map<number, any>(
          products.map((product: any) => [product.id, product]),
        );

        for (let i = 1; i <= 5; i++) {
          addItemToBasket(i, user.token, 1, user.basketId).then((response) => {
            cy.log(JSON.stringify(response.body));

            expect(response.status).to.be.oneOf([200, 201]);
            expect(response.body.data.ProductId).to.eq(i);
            expect(response.body.data.BasketId).to.eq(user.basketId);
            expect(response.body.data.quantity).to.eq(1);
            addedBasketItems.push(response.body.data);
          });
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
          expect(addedBasketItems).to.have.length(5);
          const itemToRemove = addedBasketItems[1];
          return removeItemFromBasket(itemToRemove.id, user.token).then(
            (deleteResponse) => {
              cy.log(JSON.stringify(deleteResponse.body));
              expect(deleteResponse.status).to.be.oneOf([200, 204]);

              addedBasketItems = addedBasketItems.filter(
                (item) => item.id !== itemToRemove.id,
              );
            },
          );
        });
        cy.then(() => {
          const itemToUpdate = addedBasketItems[0];

          return updateBasketItemQuantity(itemToUpdate.id, user.token, 2).then(
            (updateResponse) => {
              cy.log(JSON.stringify(updateResponse.body));

              expect(updateResponse.status).to.eq(200);
              expect(updateResponse.body.data.quantity).to.eq(2);

              addedBasketItems = addedBasketItems.map((item) =>
                item.id === itemToUpdate.id ? { ...item, quantity: 2 } : item,
              );
            },
          );
        });
        cy.then(() => {
          const expectedTotal = addedBasketItems.reduce((total, basketItem) => {
            const product = productsById.get(basketItem.ProductId);

            expect(product, `product ${basketItem.ProductId}`).to.exist;

            return total + product.price * basketItem.quantity;
          }, 0);

          cy.log(`Expected total: ${expectedTotal}`);

          expect(expectedTotal).to.be.greaterThan(0);
        });
        cy.fixture<CheckoutAddress>("address").then((address) => {
          addAddress(address, user.token).then((addressResponse) => {
            cy.log(JSON.stringify(addressResponse.body));

            expect(addressResponse.status).to.be.oneOf([200, 201]);
            expect(addressResponse.body.data.country).to.eq(address.country);
            expect(addressResponse.body.data.zipCode).to.eq(address.zipCode);
            addressId = addressResponse.body.data.id;
          });
        });

        selectDelivery(deliveryOption[0], user.token).then(
          (deliveryResponse) => {
            cy.log(JSON.stringify(deliveryResponse.body));

            expect(deliveryResponse.status).to.be.oneOf([200, 201]);
            expect(deliveryResponse.body.data.name).to.eq("One Day Delivery");
            deliveryMethodId = deliveryResponse.body.data.id;
          },
        );

        cy.fixture<PaymentOption>("paymentCard").then((paymentCard) => {
          addPaymentMethod(paymentCard, user.token).then(
            (paymentOptionResponse) => {
              cy.log(JSON.stringify(paymentOptionResponse.body));

              expect(paymentOptionResponse.status).to.be.oneOf([200, 201]);
              expect(paymentOptionResponse.body.data.fullName).to.eq(
                "Testing Romanian",
              );
              paymentId = paymentOptionResponse.body.data.id;
            },
          );
        });

        reviewBasket(user.basketId, user.token).then((basketResponse) => {
          cy.log(JSON.stringify(basketResponse.body));
          expect(basketResponse.status).to.eq(200);

          const reviewedProducts = basketResponse.body.data.Products;

          const reviewedProductIds = reviewedProducts.map(
            (product: any) => product.id,
          );

          const expectedProductIds = addedBasketItems.map(
            (basketItem) => basketItem.ProductId,
          );

          expect(reviewedProductIds.sort()).to.deep.eq(
            expectedProductIds.sort(),
          );
        });
        cy.then(() => {
          return placeOrder(
            addressId,
            deliveryMethodId,
            paymentId,
            user.basketId,
            user.token,
          ).then((orderResponse) => {
            cy.log(JSON.stringify(orderResponse.body));
            expect(orderResponse.status).to.be.oneOf([200, 201]);
            expect(orderResponse.body.orderConfirmation).to.exist;
            trackingNumber = orderResponse.body.orderConfirmation;
          });
        });
        cy.then(() => {
          return trackOrder(trackingNumber, user.token).then((trackingResponse) => {
            cy.log(JSON.stringify(trackingResponse.body));
            expect(trackingResponse.status).to.be.oneOf([200, 201]);
            expect(trackingResponse.body.data).to.exist;
          })
        })
      });
    });
  });
});
/*

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
