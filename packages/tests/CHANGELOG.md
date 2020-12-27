# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.7](https://github.com/tenseijs/tensei/compare/v0.5.6...v0.5.7) (2020-12-27)

**Note:** Version bump only for package @tensei/tests





## [0.5.5](https://github.com/tenseijs/tensei/compare/v0.5.4...v0.5.5) (2020-12-27)

**Note:** Version bump only for package @tensei/tests





## [0.5.3](https://github.com/tenseijs/tensei/compare/v0.5.2...v0.5.3) (2020-12-26)


### Bug Fixes

* **cms:** fix color issues in cms components ([e14cd5b](https://github.com/tenseijs/tensei/commit/e14cd5bc3487fdceca06da70a5506d52f5711ed1))





## [0.5.2](https://github.com/tenseijs/tensei/compare/v0.5.1...v0.5.2) (2020-12-18)


### Bug Fixes

* **core:** fix failing events tests for sql databases ([0af2922](https://github.com/tenseijs/tensei/commit/0af2922f65c52e4f2fe8103ecfa5b17d8cb98926))


### Features

* **core:** add full support for events using emittery ([8db1d43](https://github.com/tenseijs/tensei/commit/8db1d4371e20fe9bd10ff22941d6bdba7becf470))





## [0.5.1](https://github.com/tenseijs/tensei/compare/v0.5.0...v0.5.1) (2020-12-17)


### Bug Fixes

* **media:** fix packages required only by graphql package ([6a5737c](https://github.com/tenseijs/tensei/commit/6a5737cfc836ce362db0cf193067130a3eb8d7d7)), closes [#57](https://github.com/tenseijs/tensei/issues/57)





# [0.5.0](https://github.com/tenseijs/tensei/compare/v0.4.4...v0.5.0) (2020-12-17)


### Bug Fixes

* **auth:** fix authorization for rest api routes ([a1f2132](https://github.com/tenseijs/tensei/commit/a1f2132b62e6630eb68898da7cc4b51776a87c4a))
* **docs:** fix docs package ([7421935](https://github.com/tenseijs/tensei/commit/7421935d9e25f2a117ed0463bb7fc153f9a83acc))
* **graphql:** fix graphQL API ([962827b](https://github.com/tenseijs/tensei/commit/962827b3f447294e7fb4f1e7fe18a9058f644771))
* **graphql:** fix middleware system in graphql plugin ([c858847](https://github.com/tenseijs/tensei/commit/c8588472614ed616751f3a7f4f2936feab428331))
* **media:** skip failing test (file truncated) ([3c3e751](https://github.com/tenseijs/tensei/commit/3c3e75121643e65d5f27d361d8cf54d32333eb8b))
* **rest:** cleanup rest package ([2aff0a0](https://github.com/tenseijs/tensei/commit/2aff0a016cb70cd8c4f1e6acb56f1898317473a2))
* **rest:** fix broken API paths ([50f0839](https://github.com/tenseijs/tensei/commit/50f0839db472082f952e73e9f5b55166322659a7))
* **rest:** fix rest API endpoints ([408f6aa](https://github.com/tenseijs/tensei/commit/408f6aa64bb766c927e03758d309ab9f28f2f922))


### Features

* **auth:** cleanup auth for docs ([9d5c5bd](https://github.com/tenseijs/tensei/commit/9d5c5bde2b2412c7ee23dddce728f7fd89e4c52e))
* **mail:** add Ses and Smtp support for mail driver ([6fd7e51](https://github.com/tenseijs/tensei/commit/6fd7e51eae5364af1e4c4f194d71cee2ec72ce1b))
* **media:** add REST API upload support to the media package ([a496f3b](https://github.com/tenseijs/tensei/commit/a496f3b9de90c56acc7c4dee5967a9f095045826))
* add validations ([0908618](https://github.com/tenseijs/tensei/commit/090861894ed0157ca55a966da06f310f09386a8e))


### Reverts

* **mail:** fix mail package folder casing ([5308805](https://github.com/tenseijs/tensei/commit/5308805b447d10ecd96e2834d95e93221daa268c))





## [0.4.4](https://github.com/tenseijs/tensei/compare/v0.4.3...v0.4.4) (2020-12-07)


### Bug Fixes

* **common:** fix datetime column error on postgres databases ([8420da4](https://github.com/tenseijs/tensei/commit/8420da4fe74b5196750847999506cc4c7751e8b4))


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
