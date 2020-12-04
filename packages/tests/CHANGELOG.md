# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

**Note:** Version bump only for package @tensei/tests





## [0.4.1](https://github.com/tenseijs/tensei/compare/v0.4.0...v0.4.1) (2020-11-29)

**Note:** Version bump only for package @tensei/tests





# [0.4.0](https://github.com/tenseijs/tensei/compare/v0.3.1...v0.4.0) (2020-11-29)


### Features

* **create-tensei-app:** create the create-tensei-app package ([1188a0f](https://github.com/tenseijs/tensei/commit/1188a0fe34b40a124fbb70c03150cfe945300b7c))





## [0.3.1](https://github.com/tenseijs/tensei/compare/v0.3.0...v0.3.1) (2020-11-28)


### Bug Fixes

* **auth:** fix bug where user can login even though blocked ([4a78925](https://github.com/tenseijs/tensei/commit/4a78925d123206c255565c33af4c395e272976c6))





# [0.3.0](https://github.com/tenseijs/tensei/compare/v0.2.4...v0.3.0) (2020-11-28)


### Features

* **docs:** add API responses support to rest api docs ([d048993](https://github.com/tenseijs/tensei/commit/d048993f23dfdcd94e09f9be0c7f3022202e2e72))
* **docs:** create docs package for generating swagger 2.0 documentation for rest API ([620c0bb](https://github.com/tenseijs/tensei/commit/620c0bb91942094339d8244692553270a603b903))
* **docs:** setup extension of documentation on route instance ([130b971](https://github.com/tenseijs/tensei/commit/130b9715de41d2b775f949516118494ef7b12acd))
* **graphql:** add data validation to insert and update queries ([cc4d7db](https://github.com/tenseijs/tensei/commit/cc4d7dbcee359744d3752ba198c459d32f7c3f36))


### Tests

* **auth:** update refresh token tests for auth package ([1b9f892](https://github.com/tenseijs/tensei/commit/1b9f892052878b7021feb3f7cc6ac7f45c26a627))


### BREAKING CHANGES

* **auth:** Token in body response is now access_token, and a new refresh_token is included in
response
* **docs:** Name is no longer automatically added to User resource on auth package





## [0.2.4](https://github.com/bahdcoder/tensei/compare/v0.2.3...v0.2.4) (2020-11-21)


### Bug Fixes

* **rest:** fix permissions being registered on user custom routes ([034f575](https://github.com/bahdcoder/tensei/commit/034f575090c0bd1e653e9fcf1b8eb28fa7fc759a))





## [0.2.3](https://github.com/bahdcoder/tensei/compare/v0.2.2...v0.2.3) (2020-11-19)

**Note:** Version bump only for package @tensei/tests





## [0.2.2](https://github.com/bahdcoder/tensei/compare/v0.2.1...v0.2.2) (2020-11-19)

**Note:** Version bump only for package @tensei/tests





## [0.2.1](https://github.com/bahdcoder/tensei/compare/v0.2.0...v0.2.1) (2020-11-18)

**Note:** Version bump only for package @tensei/tests





# 0.2.0 (2020-11-18)

**Note:** Version bump only for package @tensei/tests





# 0.1.0 (2020-11-18)

**Note:** Version bump only for package @tensei/tests





## 0.0.1 (2020-11-18)

**Note:** Version bump only for package @tensei/tests
