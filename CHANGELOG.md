# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.4.4](https://github.com/tenseijs/tensei/compare/v0.4.3...v0.4.4) (2020-12-07)


### Bug Fixes

* **auth:** fix auth package graphql authorizations ([bda423a](https://github.com/tenseijs/tensei/commit/bda423a30fecdf01c1dc9f086eee9fcbdbe3cc1c))
* **auth:** populate roles and permissions for auth responses ([5266e8d](https://github.com/tenseijs/tensei/commit/5266e8d3b5165abeddb53ceea3cd1fc8e6b41c05))
* **common:** fix build with common fields and resources ([bf71625](https://github.com/tenseijs/tensei/commit/bf71625de6ae25cb65fb114e939be562e450bad4))
* **common:** fix datetime column error on postgres databases ([8420da4](https://github.com/tenseijs/tensei/commit/8420da4fe74b5196750847999506cc4c7751e8b4))
* **express-session-mikro-orm:** fix express mikro orm touch update ([db3f14d](https://github.com/tenseijs/tensei/commit/db3f14de74e43831813f55d0148ad27c16d22309))
* **express-session-mikro-orm:** fix express session package touch() test ([cf37f7f](https://github.com/tenseijs/tensei/commit/cf37f7ff97a9b6e4e9682908fc490e6496201215))
* **express-session-mikro-orm:** fix manager access ([5866b4a](https://github.com/tenseijs/tensei/commit/5866b4a696eec09869c2fca95e5248d024edeb53))


### Features

* **cms:** add cms dashboard ([8584bc1](https://github.com/tenseijs/tensei/commit/8584bc137f0cd6e69e807baf59689d37c371ab10))
* **core:** add basic support for mongodb ([b56ad38](https://github.com/tenseijs/tensei/commit/b56ad3806e3ac3b8e30c4285fa3c7640525a625a))
* **mongo:** begin implementing MongoDB support ([90df47f](https://github.com/tenseijs/tensei/commit/90df47fb3382f1b718c5bc632c33932ee8dfa615))





## [0.4.3](https://github.com/tenseijs/tensei/compare/v0.4.2...v0.4.3) (2020-12-04)


### Bug Fixes

* **auth:** remove unused packages (csrf, csurf) ([c9a58da](https://github.com/tenseijs/tensei/commit/c9a58da595dd21c13d9b86c35df3b43fbdc8a0f5))


### Features

* **auth:** add access tokens / refresh tokens and session based authentication to auth package ([109ad62](https://github.com/tenseijs/tensei/commit/109ad627692af6045d9e780c879377c2d2977b91))
* **media:** add file upload checks ([2fb9896](https://github.com/tenseijs/tensei/commit/2fb9896d846e95b1e427260ff94b9e1e0ef092f8))
* **media:** associate file fields to other resources ([492f5ce](https://github.com/tenseijs/tensei/commit/492f5ceeaae62a3e889dcb86cf182d68fabe1ede))
* **media:** create the official media plugin ([e373a87](https://github.com/tenseijs/tensei/commit/e373a87f1765d527059589914fba944a37f9d48c))
* **next:** create basic package for using next.js framework ([a0c3e02](https://github.com/tenseijs/tensei/commit/a0c3e020d0bcd082b5029065df9105bb51e61d0e))


### BREAKING CHANGES

* **auth:** Delete tokenSecret() method for the new configureTokens() method
- Delete tokenExpires() in favour of the new configureTokens() method
- Remove ___refresh_tokens method and send refresh token in response body





## [0.4.2](https://github.com/tenseijs/tensei/compare/v0.4.1...v0.4.2) (2020-11-29)


### Bug Fixes

* **core:** remove dotenv/config package from core ([0961e42](https://github.com/tenseijs/tensei/commit/0961e42875ed6ca7669d12e247de1a92b17df788))





## [0.4.1](https://github.com/tenseijs/tensei/compare/v0.4.0...v0.4.1) (2020-11-29)


### Bug Fixes

* **create-tensei-app:** publish templates/ folder for package ([5fce265](https://github.com/tenseijs/tensei/commit/5fce26562a1cd50979a6dc9cc4135abd96267ea0))
* **main:** fix main package publish script ([4d54060](https://github.com/tenseijs/tensei/commit/4d54060157bf72e9e228323a0ddb54c979cac5c0))





# [0.4.0](https://github.com/tenseijs/tensei/compare/v0.3.1...v0.4.0) (2020-11-29)


### Features

* **create-tensei-app:** create the create-tensei-app package ([1188a0f](https://github.com/tenseijs/tensei/commit/1188a0fe34b40a124fbb70c03150cfe945300b7c))





## [0.3.1](https://github.com/tenseijs/tensei/compare/v0.3.0...v0.3.1) (2020-11-28)


### Bug Fixes

* **auth:** fix bug where user can login even though blocked ([4a78925](https://github.com/tenseijs/tensei/commit/4a78925d123206c255565c33af4c395e272976c6))





# [0.3.0](https://github.com/tenseijs/tensei/compare/v0.2.4...v0.3.0) (2020-11-28)


### Bug Fixes

* **auth:** fix permissions checks for auth package ([58ea6ab](https://github.com/tenseijs/tensei/commit/58ea6abc4332933280dc362131f1cc981db9acec))
* **auth:** set token belongs to relationship to nullable() ([0a56b33](https://github.com/tenseijs/tensei/commit/0a56b33ebe4defe16cca0314108fda01b0d41c4b))
* **common:** remove hideFromApi from resource data ([1219f30](https://github.com/tenseijs/tensei/commit/1219f309f1f4014c27af618837faf2f891d79b68))
* **core:** temporal fix: add registerCoreRoutes() method to Tensei core ([5c55964](https://github.com/tenseijs/tensei/commit/5c55964ec81f08dc32cd2f8c00256fc390b8d72a))


### Features

* **auth:** add refresh token rotation security ([edf90e4](https://github.com/tenseijs/tensei/commit/edf90e4e67aed296da7c4a9172f4efb4cb5b4211))
* **docs:** add API responses support to rest api docs ([d048993](https://github.com/tenseijs/tensei/commit/d048993f23dfdcd94e09f9be0c7f3022202e2e72))
* **docs:** create docs package for generating swagger 2.0 documentation for rest API ([620c0bb](https://github.com/tenseijs/tensei/commit/620c0bb91942094339d8244692553270a603b903))
* **docs:** setup extension of documentation on route instance ([130b971](https://github.com/tenseijs/tensei/commit/130b9715de41d2b775f949516118494ef7b12acd))
* **graphql:** add data validation to insert and update queries ([cc4d7db](https://github.com/tenseijs/tensei/commit/cc4d7dbcee359744d3752ba198c459d32f7c3f36))
* **graphql:** add pubsub parameter to .subscriptions() method to receive custom pubsub instances ([75913b7](https://github.com/tenseijs/tensei/commit/75913b77dea49ae22bf0d31b3b105f244e2d2609))
* **graphql:** setup graphql subscriptions to the graphql plugin ([3ca5a82](https://github.com/tenseijs/tensei/commit/3ca5a823f1b41f0be484872d75f66118dcda4e75))


### Tests

* **auth:** update refresh token tests for auth package ([1b9f892](https://github.com/tenseijs/tensei/commit/1b9f892052878b7021feb3f7cc6ac7f45c26a627))


### BREAKING CHANGES

* **graphql:** - GraphqlQuery handler can now return non promise values
* **auth:** Token in body response is now access_token, and a new refresh_token is included in
response
* **docs:** Name is no longer automatically added to User resource on auth package





## [0.2.4](https://github.com/bahdcoder/tensei/compare/v0.2.3...v0.2.4) (2020-11-21)


### Bug Fixes

* **auth:** add JWT refresh tokens to rest api ([0e553e5](https://github.com/bahdcoder/tensei/commit/0e553e524651926af3fde9a4b7ecbb9f424f16f8))
* **auth:** fix social authentication ([4e6fc9b](https://github.com/bahdcoder/tensei/commit/4e6fc9b3a24dfa7c107bd25dffeaa9e95d25f3a6))
* **commands:** add commit command to package.json file ([029e724](https://github.com/bahdcoder/tensei/commit/029e724a53ac156553ed2c8a7ce32f1d2edd5045))
* **rest:** fix permissions being registered on user custom routes ([034f575](https://github.com/bahdcoder/tensei/commit/034f575090c0bd1e653e9fcf1b8eb28fa7fc759a))





## [0.2.3](https://github.com/bahdcoder/tensei/compare/v0.2.2...v0.2.3) (2020-11-19)

**Note:** Version bump only for package @tensei/main





## [0.2.2](https://github.com/bahdcoder/tensei/compare/v0.2.1...v0.2.2) (2020-11-19)

**Note:** Version bump only for package @tensei/main





## [0.2.1](https://github.com/bahdcoder/tensei/compare/v0.2.0...v0.2.1) (2020-11-18)

**Note:** Version bump only for package @tensei/main





# 0.2.0 (2020-11-18)

**Note:** Version bump only for package @tensei/main





# 0.1.0 (2020-11-18)

**Note:** Version bump only for package @tensei/main





## 0.0.1 (2020-11-18)

**Note:** Version bump only for package @tensei/main
