# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.3](https://github.com/tenseijs/tensei/compare/v0.5.2...v0.5.3) (2020-12-26)


### Bug Fixes

* **core:** add root method to define project root ([29d4893](https://github.com/tenseijs/tensei/commit/29d4893d547945eda8a1abfa7a6b69f6ff4dd131))





## [0.5.2](https://github.com/tenseijs/tensei/compare/v0.5.1...v0.5.2) (2020-12-18)


### Bug Fixes

* **core:** fix failing events tests for sql databases ([0af2922](https://github.com/tenseijs/tensei/commit/0af2922f65c52e4f2fe8103ecfa5b17d8cb98926))


### Features

* **core:** add full support for events using emittery ([8db1d43](https://github.com/tenseijs/tensei/commit/8db1d4371e20fe9bd10ff22941d6bdba7becf470))





## [0.5.1](https://github.com/tenseijs/tensei/compare/v0.5.0...v0.5.1) (2020-12-17)

**Note:** Version bump only for package @tensei/common





# [0.5.0](https://github.com/tenseijs/tensei/compare/v0.4.4...v0.5.0) (2020-12-17)


### Bug Fixes

* **auth:** fix authorization for rest api routes ([a1f2132](https://github.com/tenseijs/tensei/commit/a1f2132b62e6630eb68898da7cc4b51776a87c4a))
* **cms:** fix border radius on cms components ([9fe4aaa](https://github.com/tenseijs/tensei/commit/9fe4aaa7c684b98923d158cea314b5000ebd5c0c))
* **core:** fix all package licesnes ([92ddc6a](https://github.com/tenseijs/tensei/commit/92ddc6a7ef0fa2e1397336147ec674974d89c1a8))
* **graphql:** fix graphQL API ([962827b](https://github.com/tenseijs/tensei/commit/962827b3f447294e7fb4f1e7fe18a9058f644771))
* **graphql:** fix middleware system in graphql plugin ([c858847](https://github.com/tenseijs/tensei/commit/c8588472614ed616751f3a7f4f2936feab428331))
* **rest:** fix rest API endpoints ([408f6aa](https://github.com/tenseijs/tensei/commit/408f6aa64bb766c927e03758d309ab9f28f2f922))


### Features

* **auth:** cleanup auth for docs ([9d5c5bd](https://github.com/tenseijs/tensei/commit/9d5c5bde2b2412c7ee23dddce728f7fd89e4c52e))
* **mail:** add Ses and Smtp support for mail driver ([6fd7e51](https://github.com/tenseijs/tensei/commit/6fd7e51eae5364af1e4c4f194d71cee2ec72ce1b))
* **mail:** pull in latest version of @adonis/mail into @tensei/mail package ([7b2d3c2](https://github.com/tenseijs/tensei/commit/7b2d3c2ee3da360e0cc613b1a684cb2a1ddbf84d))
* **media:** add REST API upload support to the media package ([a496f3b](https://github.com/tenseijs/tensei/commit/a496f3b9de90c56acc7c4dee5967a9f095045826))
* add validations ([0908618](https://github.com/tenseijs/tensei/commit/090861894ed0157ca55a966da06f310f09386a8e))





## [0.4.4](https://github.com/tenseijs/tensei/compare/v0.4.3...v0.4.4) (2020-12-07)


### Bug Fixes

* **auth:** populate roles and permissions for auth responses ([5266e8d](https://github.com/tenseijs/tensei/commit/5266e8d3b5165abeddb53ceea3cd1fc8e6b41c05))
* **common:** fix build with common fields and resources ([bf71625](https://github.com/tenseijs/tensei/commit/bf71625de6ae25cb65fb114e939be562e450bad4))
* **common:** fix datetime column error on postgres databases ([8420da4](https://github.com/tenseijs/tensei/commit/8420da4fe74b5196750847999506cc4c7751e8b4))


### Features

* **cms:** add cms dashboard ([8584bc1](https://github.com/tenseijs/tensei/commit/8584bc137f0cd6e69e807baf59689d37c371ab10))





## [0.4.3](https://github.com/tenseijs/tensei/compare/v0.4.2...v0.4.3) (2020-12-04)


### Features

* **media:** associate file fields to other resources ([492f5ce](https://github.com/tenseijs/tensei/commit/492f5ceeaae62a3e889dcb86cf182d68fabe1ede))
* **media:** create the official media plugin ([e373a87](https://github.com/tenseijs/tensei/commit/e373a87f1765d527059589914fba944a37f9d48c))





## [0.4.1](https://github.com/tenseijs/tensei/compare/v0.4.0...v0.4.1) (2020-11-29)


### Bug Fixes

* **main:** fix main package publish script ([4d54060](https://github.com/tenseijs/tensei/commit/4d54060157bf72e9e228323a0ddb54c979cac5c0))





# [0.4.0](https://github.com/tenseijs/tensei/compare/v0.3.1...v0.4.0) (2020-11-29)

**Note:** Version bump only for package @tensei/common





# [0.3.0](https://github.com/tenseijs/tensei/compare/v0.2.4...v0.3.0) (2020-11-28)


### Bug Fixes

* **auth:** fix permissions checks for auth package ([58ea6ab](https://github.com/tenseijs/tensei/commit/58ea6abc4332933280dc362131f1cc981db9acec))
* **common:** remove hideFromApi from resource data ([1219f30](https://github.com/tenseijs/tensei/commit/1219f309f1f4014c27af618837faf2f891d79b68))


### Features

* **auth:** add refresh token rotation security ([edf90e4](https://github.com/tenseijs/tensei/commit/edf90e4e67aed296da7c4a9172f4efb4cb5b4211))
* **docs:** add API responses support to rest api docs ([d048993](https://github.com/tenseijs/tensei/commit/d048993f23dfdcd94e09f9be0c7f3022202e2e72))
* **docs:** create docs package for generating swagger 2.0 documentation for rest API ([620c0bb](https://github.com/tenseijs/tensei/commit/620c0bb91942094339d8244692553270a603b903))
* **docs:** setup extension of documentation on route instance ([130b971](https://github.com/tenseijs/tensei/commit/130b9715de41d2b775f949516118494ef7b12acd))
* **graphql:** add data validation to insert and update queries ([cc4d7db](https://github.com/tenseijs/tensei/commit/cc4d7dbcee359744d3752ba198c459d32f7c3f36))
* **graphql:** setup graphql subscriptions to the graphql plugin ([3ca5a82](https://github.com/tenseijs/tensei/commit/3ca5a823f1b41f0be484872d75f66118dcda4e75))


### BREAKING CHANGES

* **graphql:** - GraphqlQuery handler can now return non promise values
* **docs:** Name is no longer automatically added to User resource on auth package





## [0.2.4](https://github.com/bahdcoder/tensei/compare/v0.2.3...v0.2.4) (2020-11-21)


### Bug Fixes

* **auth:** add JWT refresh tokens to rest api ([0e553e5](https://github.com/bahdcoder/tensei/commit/0e553e524651926af3fde9a4b7ecbb9f424f16f8))
* **rest:** fix permissions being registered on user custom routes ([034f575](https://github.com/bahdcoder/tensei/commit/034f575090c0bd1e653e9fcf1b8eb28fa7fc759a))





## [0.2.3](https://github.com/bahdcoder/tensei/compare/v0.2.2...v0.2.3) (2020-11-19)

**Note:** Version bump only for package @tensei/common





## [0.2.2](https://github.com/bahdcoder/tensei/compare/v0.2.1...v0.2.2) (2020-11-19)

**Note:** Version bump only for package @tensei/common





## [0.2.1](https://github.com/bahdcoder/tensei/compare/v0.2.0...v0.2.1) (2020-11-18)

**Note:** Version bump only for package @tensei/common





# 0.2.0 (2020-11-18)

**Note:** Version bump only for package @tensei/common





# 0.1.0 (2020-11-18)

**Note:** Version bump only for package @tensei/common





## 0.0.1 (2020-11-18)

**Note:** Version bump only for package @tensei/common
