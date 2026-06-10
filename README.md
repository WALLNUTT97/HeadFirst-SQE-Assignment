# HeadFirst Senior Quality Engineer Assignment

This repository contains my solution for the HeadFirst Senior Quality Engineer technical assessment.

The original OWASP Juice Shop repository was used as the application under test. The existing Cypress examples were removed and replaced with an API-driven Cypress test suite focused on the requested checkout scenario.

## Contents

```txt
cypress/
  e2e/
    api/
      checkout-flow.cy.ts
  fixtures/
  support/
    api/
    types/

skills/
  test-analyzer/

TestPlanStriive4XXX.md
README.md
```

## Part 1: Cypress API-Driven Checkout Flow

The Cypress test suite covers the requested API-driven checkout journey:

* Register and log in a user via API
* Add 3–5 products to the basket
* Remove one basket item
* Update the quantity of another basket item
* Validate the basket total
* Add a valid Romanian address
* Select a delivery method
* Add a valid payment option
* Review the basket summary
* Place the order
* Validate order success / tracking response

The main test is located at:

```txt
cypress/e2e/api/checkout-flow.cy.ts
```

The implementation is split into reusable API helper modules under:

```txt
cypress/support/api/
```

Test data is stored in fixtures under:

```txt
cypress/fixtures/
```

Shared TypeScript interfaces are stored under:

```txt
cypress/support/types/
```

## Test Design Notes

The checkout flow is implemented as one end-to-end scenario because the requested steps form a single user journey. The test itself is kept readable, while request logic is separated into reusable helper functions.

The suite uses API calls for the main flow rather than relying on UI interactions. This keeps the test faster, more stable, and aligned with the assignment requirement for an API-driven scenario.

Where useful, fixture data and TypeScript interfaces are used to make the test data easier to maintain.

## Prerequisites

* Node.js 24.x
* npm
* Google Chrome or another Cypress-supported browser

## Installation

From the repository root:

```bash
npm install
```

The project has a postinstall step that installs frontend dependencies and builds the frontend.

## Running the Application

The application must be running before Cypress tests are executed.

From the repository root:

```bash
npm start
```

The application should be available at:

```txt
http://localhost:3000
```

Note: `npm start` runs the built application from `build/app`. If frontend source files are changed, rebuild the frontend before restarting the app:

```bash
npm run build:frontend
npm start
```

## Running Cypress

Open Cypress interactively:

```bash
npm run cypress:open
```

From there select E2E testing, your browser of choice, and run the checkout flow

Run Cypress headlessly:

```bash
npm run cypress:run
```

Or use:

```bash
npm run test:e2e
```

## Cypress Configuration

Cypress is configured to run against the local Juice Shop instance:

```txt
http://localhost:3000
```

The config file is:

```txt
cypress.config.ts
```

## Part 2: Test Analyzer Skill

The repository includes a lightweight test-analysis skill under:

```txt
skills/test-analyzer/
```

The goal of this skill is to help understand:

* what tests exist in the repository
* how many tests there are
* what areas they cover
* how the suite could be improved

This skill is intentionally lightweight. It does not attempt to replace a QE review or build a full AI agent. Instead, it generates a deterministic summary of the Cypress suite first, including test counts, test names, support files, fixtures, and inferred coverage areas.

This summary can then be used by a reviewer or supplied to an AI assistant as focused context. This reduces token usage, improves performance, and avoids relying on AI to guess values that can be calculated directly from the repository.

## Running the skill

```bash
npm run analyze:tests
```

## Part 3: Striive Test Plan

The test plan for `Striive-4xxx – Add Cover letter to profile page` is included as:

```txt
TestPlanStriive4XXX.md
```

It covers:

* functional testing
* positive scenarios
* negative scenarios
* non-functional testing
* security considerations
* accessibility considerations
* collaboration during the sprint

## CI/CD Readiness

The suite can be run in headless mode using:

```bash
npm run test:e2e
```

The Cypress configuration uses a local `baseUrl`, and the test structure separates test data, helper logic, and test execution. This makes it suitable for future CI/CD integration.

Suggested next steps for CI/CD:

* start the application as part of the pipeline
* wait for `http://localhost:3000` to become available
* run `npm run test:e2e`
* publish Cypress screenshots/videos only on failure
* publish test results as CI artifacts

## AI Usage Disclosure

AI assistance was used as a productivity aid during the assessment for:

* understanding the assignment scope
* structuring the Cypress test suite
* generating and reviewing helper patterns
* drafting documentation outlines
* identifying additional test scenarios and improvement areas

All generated code and documentation was reviewed, adjusted, and validated manually before submission.

## Future Improvements

Given more time, I would improve the suite by adding:

* negative checkout scenarios
* invalid address and invalid payment tests
* API schema validation for key responses
* stronger cleanup of generated test data
* additional UI smoke coverage using stable `data-testid` selectors, a `data-testid` was implemented, but as the assignment stated an API approach, I decided to not use it
* test tagging such as `@smoke`, `@api`, and `@checkout`
* CI reporting with screenshots, videos, and JUnit/XML output
* broader coverage around coupons, delivery options, and payment validation

## Submission Notes

The main deliverables are:

```txt
cypress/e2e/api/checkout-flow.cy.ts
skills/test-analyzer/
TestPlanStriive4XXX.md
README.md
```
