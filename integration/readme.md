# Integration Tests

## What are they?

They are tests, meants to be run on a production-like environement (using Docker), to ensure that it tests something as close as possible to production.

It uses Cypress.

## CI

Integrations tests will run automatically on CI (GitHub Actions) when pushing to `develop`, `master` or the alpha branch.

## Local

You can manually run the tests by doing `make local`, which will open Cypress and show you the tests running.
This will build local images for both the backend and the frontend and test them using Cypress.

## Master

You can also run the tests on the Master branch by doing `make master`.