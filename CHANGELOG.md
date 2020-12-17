# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.1](https://github.com/tenseijs/tensei/compare/v0.5.0...v0.5.1) (2020-12-17)


### Bug Fixes

* **media:** fix packages required only by graphql package ([6a5737c](https://github.com/tenseijs/tensei/commit/6a5737cfc836ce362db0cf193067130a3eb8d7d7)), closes [#57](https://github.com/tenseijs/tensei/issues/57)
* **workflows:** add mongodb database_type env ([0d8d3a4](https://github.com/tenseijs/tensei/commit/0d8d3a44a768b98c438cd488c94289e1b4731a7d))





# [0.5.0](https://github.com/tenseijs/tensei/compare/v0.4.4...v0.5.0) (2020-12-17)


### Bug Fixes

* **auth:** fix authorization for rest api routes ([a1f2132](https://github.com/tenseijs/tensei/commit/a1f2132b62e6630eb68898da7cc4b51776a87c4a))
* **cms:** fix border radius on cms components ([9fe4aaa](https://github.com/tenseijs/tensei/commit/9fe4aaa7c684b98923d158cea314b5000ebd5c0c))
* **core:** fix all package licesnes ([92ddc6a](https://github.com/tenseijs/tensei/commit/92ddc6a7ef0fa2e1397336147ec674974d89c1a8))
* **docs:** fix docs package ([7421935](https://github.com/tenseijs/tensei/commit/7421935d9e25f2a117ed0463bb7fc153f9a83acc))
* **graphql:** fix graphQL API ([962827b](https://github.com/tenseijs/tensei/commit/962827b3f447294e7fb4f1e7fe18a9058f644771))
* **graphql:** fix middleware system in graphql plugin ([c858847](https://github.com/tenseijs/tensei/commit/c8588472614ed616751f3a7f4f2936feab428331))
* **graphql:** silent typescript error about csrfToken() method ([f885ef6](https://github.com/tenseijs/tensei/commit/f885ef66233b33745e1f8b7181468d2c5765935d))
* **mail:** casing ([edc9858](https://github.com/tenseijs/tensei/commit/edc98588be83e69b5785252f0067e8d7d5928fe9))
* **mail:** change SparkPost casing to correct file name ([941190e](https://github.com/tenseijs/tensei/commit/941190e8665a0102fab65f8eae4977431c17f030))
* **mail:** fix failing tests in mail package ([bf1065f](https://github.com/tenseijs/tensei/commit/bf1065f547e8ae1381628c958db165e73bfd5bad))
* **mail:** fix file & folder casing ([b1a3a34](https://github.com/tenseijs/tensei/commit/b1a3a34d823e68742b7c38ec0cac1e263de5eff0))
* **mail:** fix file name consistency rule ([c0cbb2a](https://github.com/tenseijs/tensei/commit/c0cbb2a73257f3c6e2e86abcaaf30cebda2bfe1c))
* **mail:** fix imports in tests ([cf28b6f](https://github.com/tenseijs/tensei/commit/cf28b6fb1b0e17e4357bd48340741d7b3c2c1974))
* **mail:** fix mail casing ([d8525c3](https://github.com/tenseijs/tensei/commit/d8525c3b746b81f200eee56b19a70092fe52b9ba))
* **mail:** fix mail folder casing ([48aa446](https://github.com/tenseijs/tensei/commit/48aa446cb41a8e58a3e82e791e40b136593c1d92))
* **mail:** fix mail folders ([aaff564](https://github.com/tenseijs/tensei/commit/aaff56490c39985c024e888babd7ae0c74ab7054))
* **media:** skip failing test (file truncated) ([3c3e751](https://github.com/tenseijs/tensei/commit/3c3e75121643e65d5f27d361d8cf54d32333eb8b))
* **rest:** cleanup rest package ([2aff0a0](https://github.com/tenseijs/tensei/commit/2aff0a016cb70cd8c4f1e6acb56f1898317473a2))
* **rest:** fix broken API paths ([50f0839](https://github.com/tenseijs/tensei/commit/50f0839db472082f952e73e9f5b55166322659a7))
* **rest:** fix rest API endpoints ([408f6aa](https://github.com/tenseijs/tensei/commit/408f6aa64bb766c927e03758d309ab9f28f2f922))
* **update-rest-package:** ensure that deep populate can populate for multiple on the same level ([fc8da73](https://github.com/tenseijs/tensei/commit/fc8da736ecdca6ed8c5ad9352a60a5cbe26f8548))


### Features

* add new components for cms ([db26903](https://github.com/tenseijs/tensei/commit/db26903d950acb69658e71f6dbd0c5d2f7264854))
* **auth:** cleanup auth for docs ([9d5c5bd](https://github.com/tenseijs/tensei/commit/9d5c5bde2b2412c7ee23dddce728f7fd89e4c52e))
* **mail:** add Ses and Smtp support for mail driver ([6fd7e51](https://github.com/tenseijs/tensei/commit/6fd7e51eae5364af1e4c4f194d71cee2ec72ce1b))
* **mail:** pull in latest version of @adonis/mail into @tensei/mail package ([7b2d3c2](https://github.com/tenseijs/tensei/commit/7b2d3c2ee3da360e0cc613b1a684cb2a1ddbf84d))
* **media:** add REST API upload support to the media package ([a496f3b](https://github.com/tenseijs/tensei/commit/a496f3b9de90c56acc7c4dee5967a9f095045826))
* **revert-deep-populate-feature-2:** take out deep populate feature from the rest package ([1e71775](https://github.com/tenseijs/tensei/commit/1e7177524787541482e94d5da524bcd4ccd3032e))
* add validations ([0908618](https://github.com/tenseijs/tensei/commit/090861894ed0157ca55a966da06f310f09386a8e))


### Reverts

* **mail:** fix mail package folder casing ([5308805](https://github.com/tenseijs/tensei/commit/5308805b447d10ecd96e2834d95e93221daa268c))
* **mail:** fix mail package folder casing ([9e27067](https://github.com/tenseijs/tensei/commit/9e270677700ac68ac693b83809e65cbbff3605bd))





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
