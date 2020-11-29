# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.4.1](https://github.com/tenseijs/tensei/compare/v0.4.0...v0.4.1) (2020-11-29)


### Bug Fixes

* **main:** fix main package publish script ([4d54060](https://github.com/tenseijs/tensei/commit/4d54060157bf72e9e228323a0ddb54c979cac5c0))





# [0.4.0](https://github.com/tenseijs/tensei/compare/v0.3.1...v0.4.0) (2020-11-29)

**Note:** Version bump only for package @tensei/auth





## [0.3.1](https://github.com/tenseijs/tensei/compare/v0.3.0...v0.3.1) (2020-11-28)


### Bug Fixes

* **auth:** fix bug where user can login even though blocked ([4a78925](https://github.com/tenseijs/tensei/commit/4a78925d123206c255565c33af4c395e272976c6))





# [0.3.0](https://github.com/tenseijs/tensei/compare/v0.2.4...v0.3.0) (2020-11-28)


### Bug Fixes

* **auth:** fix permissions checks for auth package ([58ea6ab](https://github.com/tenseijs/tensei/commit/58ea6abc4332933280dc362131f1cc981db9acec))
* **auth:** set token belongs to relationship to nullable() ([0a56b33](https://github.com/tenseijs/tensei/commit/0a56b33ebe4defe16cca0314108fda01b0d41c4b))


### Features

* **auth:** add refresh token rotation security ([edf90e4](https://github.com/tenseijs/tensei/commit/edf90e4e67aed296da7c4a9172f4efb4cb5b4211))
* **docs:** add API responses support to rest api docs ([d048993](https://github.com/tenseijs/tensei/commit/d048993f23dfdcd94e09f9be0c7f3022202e2e72))
* **docs:** create docs package for generating swagger 2.0 documentation for rest API ([620c0bb](https://github.com/tenseijs/tensei/commit/620c0bb91942094339d8244692553270a603b903))
* **docs:** setup extension of documentation on route instance ([130b971](https://github.com/tenseijs/tensei/commit/130b9715de41d2b775f949516118494ef7b12acd))
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
* **rest:** fix permissions being registered on user custom routes ([034f575](https://github.com/bahdcoder/tensei/commit/034f575090c0bd1e653e9fcf1b8eb28fa7fc759a))





## [0.2.3](https://github.com/bahdcoder/tensei/compare/v0.2.2...v0.2.3) (2020-11-19)

**Note:** Version bump only for package @tensei/auth





## [0.2.2](https://github.com/bahdcoder/tensei/compare/v0.2.1...v0.2.2) (2020-11-19)

**Note:** Version bump only for package @tensei/auth





## [0.2.1](https://github.com/bahdcoder/tensei/compare/v0.2.0...v0.2.1) (2020-11-18)

**Note:** Version bump only for package @tensei/auth





# 0.2.0 (2020-11-18)

**Note:** Version bump only for package @tensei/auth





# 0.1.0 (2020-11-18)

**Note:** Version bump only for package @tensei/auth





## 0.0.1 (2020-11-18)

**Note:** Version bump only for package @tensei/auth
