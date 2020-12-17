# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.1](https://github.com/tenseijs/tensei/compare/v0.5.0...v0.5.1) (2020-12-17)

**Note:** Version bump only for package @tensei/graphql





# [0.5.0](https://github.com/tenseijs/tensei/compare/v0.4.4...v0.5.0) (2020-12-17)


### Bug Fixes

* **core:** fix all package licesnes ([92ddc6a](https://github.com/tenseijs/tensei/commit/92ddc6a7ef0fa2e1397336147ec674974d89c1a8))
* **graphql:** fix graphQL API ([962827b](https://github.com/tenseijs/tensei/commit/962827b3f447294e7fb4f1e7fe18a9058f644771))
* **graphql:** fix middleware system in graphql plugin ([c858847](https://github.com/tenseijs/tensei/commit/c8588472614ed616751f3a7f4f2936feab428331))
* **graphql:** silent typescript error about csrfToken() method ([f885ef6](https://github.com/tenseijs/tensei/commit/f885ef66233b33745e1f8b7181468d2c5765935d))
* **rest:** fix rest API endpoints ([408f6aa](https://github.com/tenseijs/tensei/commit/408f6aa64bb766c927e03758d309ab9f28f2f922))


### Features

* **auth:** cleanup auth for docs ([9d5c5bd](https://github.com/tenseijs/tensei/commit/9d5c5bde2b2412c7ee23dddce728f7fd89e4c52e))
* **mail:** add Ses and Smtp support for mail driver ([6fd7e51](https://github.com/tenseijs/tensei/commit/6fd7e51eae5364af1e4c4f194d71cee2ec72ce1b))





## [0.4.4](https://github.com/tenseijs/tensei/compare/v0.4.3...v0.4.4) (2020-12-07)


### Bug Fixes

* **auth:** fix auth package graphql authorizations ([bda423a](https://github.com/tenseijs/tensei/commit/bda423a30fecdf01c1dc9f086eee9fcbdbe3cc1c))
* **auth:** populate roles and permissions for auth responses ([5266e8d](https://github.com/tenseijs/tensei/commit/5266e8d3b5165abeddb53ceea3cd1fc8e6b41c05))


### Features

* **core:** add basic support for mongodb ([b56ad38](https://github.com/tenseijs/tensei/commit/b56ad3806e3ac3b8e30c4285fa3c7640525a625a))
* **mongo:** begin implementing MongoDB support ([90df47f](https://github.com/tenseijs/tensei/commit/90df47fb3382f1b718c5bc632c33932ee8dfa615))





## [0.4.3](https://github.com/tenseijs/tensei/compare/v0.4.2...v0.4.3) (2020-12-04)


### Features

* **auth:** add access tokens / refresh tokens and session based authentication to auth package ([109ad62](https://github.com/tenseijs/tensei/commit/109ad627692af6045d9e780c879377c2d2977b91))
* **media:** add file upload checks ([2fb9896](https://github.com/tenseijs/tensei/commit/2fb9896d846e95b1e427260ff94b9e1e0ef092f8))
* **media:** associate file fields to other resources ([492f5ce](https://github.com/tenseijs/tensei/commit/492f5ceeaae62a3e889dcb86cf182d68fabe1ede))
* **media:** create the official media plugin ([e373a87](https://github.com/tenseijs/tensei/commit/e373a87f1765d527059589914fba944a37f9d48c))


### BREAKING CHANGES

* **auth:** Delete tokenSecret() method for the new configureTokens() method
- Delete tokenExpires() in favour of the new configureTokens() method
- Remove ___refresh_tokens method and send refresh token in response body





## [0.4.1](https://github.com/tenseijs/tensei/compare/v0.4.0...v0.4.1) (2020-11-29)


### Bug Fixes

* **main:** fix main package publish script ([4d54060](https://github.com/tenseijs/tensei/commit/4d54060157bf72e9e228323a0ddb54c979cac5c0))





# [0.4.0](https://github.com/tenseijs/tensei/compare/v0.3.1...v0.4.0) (2020-11-29)

**Note:** Version bump only for package @tensei/graphql





# [0.3.0](https://github.com/tenseijs/tensei/compare/v0.2.4...v0.3.0) (2020-11-28)


### Features

* **auth:** add refresh token rotation security ([edf90e4](https://github.com/tenseijs/tensei/commit/edf90e4e67aed296da7c4a9172f4efb4cb5b4211))
* **docs:** setup extension of documentation on route instance ([130b971](https://github.com/tenseijs/tensei/commit/130b9715de41d2b775f949516118494ef7b12acd))
* **graphql:** add data validation to insert and update queries ([cc4d7db](https://github.com/tenseijs/tensei/commit/cc4d7dbcee359744d3752ba198c459d32f7c3f36))
* **graphql:** add pubsub parameter to .subscriptions() method to receive custom pubsub instances ([75913b7](https://github.com/tenseijs/tensei/commit/75913b77dea49ae22bf0d31b3b105f244e2d2609))
* **graphql:** setup graphql subscriptions to the graphql plugin ([3ca5a82](https://github.com/tenseijs/tensei/commit/3ca5a823f1b41f0be484872d75f66118dcda4e75))


### BREAKING CHANGES

* **graphql:** - GraphqlQuery handler can now return non promise values
* **docs:** Name is no longer automatically added to User resource on auth package





## [0.2.4](https://github.com/bahdcoder/tensei/compare/v0.2.3...v0.2.4) (2020-11-21)


### Bug Fixes

* **rest:** fix permissions being registered on user custom routes ([034f575](https://github.com/bahdcoder/tensei/commit/034f575090c0bd1e653e9fcf1b8eb28fa7fc759a))





## [0.2.3](https://github.com/bahdcoder/tensei/compare/v0.2.2...v0.2.3) (2020-11-19)

**Note:** Version bump only for package @tensei/graphql





## [0.2.2](https://github.com/bahdcoder/tensei/compare/v0.2.1...v0.2.2) (2020-11-19)

**Note:** Version bump only for package @tensei/graphql





## [0.2.1](https://github.com/bahdcoder/tensei/compare/v0.2.0...v0.2.1) (2020-11-18)

**Note:** Version bump only for package @tensei/graphql





# 0.2.0 (2020-11-18)

**Note:** Version bump only for package @tensei/graphql





# 0.1.0 (2020-11-18)

**Note:** Version bump only for package @tensei/graphql





## 0.0.1 (2020-11-18)

**Note:** Version bump only for package @tensei/graphql
