import type { RegisteredUser, TestUserFixture } from "../types/types";

export const createUniqueEmail = (prefix: string): string => {
  return `${prefix}.${Date.now()}@example.com`;
};

export const registerUserViaApi = (
  email: string,
  password: string,
  securityAnswer: string,
) => {
  return cy.request({
    method: "POST",
    url: "/api/Users/",
    body: {
      email,
      password,
      passwordRepeat: password,
      securityQuestion: {
        id: 1,
        question: "Your eldest siblings middle name?",
      },
      securityAnswer,
    },
    failOnStatusCode: false,
  });
};

export const loginViaApi = (email: string, password: string) => {
  return cy.request({
    method: "POST",
    url: "/rest/user/login",
    body: {
      email,
      password,
    },
  });
};

export const seedAndLoginUser = (): Cypress.Chainable<RegisteredUser> => {
  return cy.fixture("user").then((userFixture: TestUserFixture) => {
    const email = createUniqueEmail(userFixture.emailPrefix);

    return registerUserViaApi(
      email,
      userFixture.password,
      userFixture.securityAnswer,
    ).then((registerResponse) => {
      expect(registerResponse.status).to.be.oneOf([200, 201]);

      return loginViaApi(email, userFixture.password).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200);

        const user: RegisteredUser = {
          email,
          password: userFixture.password,
          token: loginResponse.body.authentication.token,
          basketId: loginResponse.body.authentication.bid,
        };

        return user;
      });
    });
  }) as unknown as Cypress.Chainable<RegisteredUser>;
};
