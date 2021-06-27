# Contribute to Tensei

Tensei is an open-source project administered by the core Tensei team. We appreciate your interest and efforts to contribute to Tensei.

All efforts to contribute are highly appreciated, we recommend you talk to a maintainer prior to spending a lot of time making a pull request that may not align with the project roadmap. You may do this by opening a discussion on [our discussions forum](https://github.com/tenseijs/tensei/discussions).

## Open Development & Community Driven

Tensei is an open-source project. See the [LICENSE](https://github.com/tenseijs/tensei/blob/master/LICENSE) file for licensing information. All the work done is available on GitHub.

The core team and the contributors send pull requests which go through the same validation process.

## Feature Requests

Feature Requests by the community are highly encouraged. Please feel free to submit a [feature request](https://github.com/tenseijs/tensei/discussions) by opening a discussion in the discussions forum.

## Documentation

Pull requests relating to fixing documentation for the latest release should be directed towards the [documentation repo](https://github.com/tenseijs/tenseijs.com).

## Bugs

We are using [GitHub Issues](https://github.com/tenseijs/tensei/issues) to manage our public bugs. We keep a close eye on this so before filing a new issue, try to make sure the problem does not already exist.

---

## Before Submitting a Pull Request

The core team will review your pull request and will either merge it, request changes to it, or close it.

**Before submitting your pull request** make sure the following requirements are fulfilled:

- Fork the repository and create your branch from `master`.
- Run `yarn setup` in the repository root.
- If you’ve fixed a bug or added code that should be tested, add the tests and then link the corresponding issue in either your commit or your PR!
- Ensure the test suites are passing:
  - `yarn test`
- Make sure your code is formatted correctly (`yarn prettier`).

## Contribution Prerequisites

- You have [Node](https://nodejs.org/en/) at >= v12 and [Yarn](https://yarnpkg.com/en/) at v1.2.0+.
- You are familiar with Git.

## Development Workflow

Please follow the instructions below:

#### 1. Fork the [repository](https://github.com/tenseijs/tensei)

[Go to the repository](https://github.com/tenseijs/tensei) and fork it to your own GitHub account.

#### 2. Clone from your repository

```bash
git clone git@github.com:YOUR_USERNAME/tensei.git
```

#### 3. Install the dependencies

Go to the root of the repository.

```bash
cd tensei && yarn setup
```

#### 4. Start the example application

To start a test example application to test your changes quickly and also for the next step.

```bash
cd examples/blog && yarn example:dev
```

#### 5. Running certain packages in development mode

For the task or feature or bug you are working on, you may need to access only a specific package. We recommend running the `dev` command only in the packages you're working on. For example, if you're working on the CMS, you would need to:

```bash
cd packages/cms

yarn dev:server # run cms dev server
yarn dev:client # run cms dev client
```

If you need to make changes to the `@tensei/graphql` package, you would need to:

```bash
cd packages/graphql

yarn dev # run typescript dev changes watcher
```

## Miscellaneous

### Repository Organization

We chose to use a monorepo design that exploits [Yarn Workspaces](https://yarnpkg.com/en/docs/workspaces) in the way [React](https://github.com/facebook/react/tree/master/packages) or [Babel](https://github.com/babel/babel/tree/master/packages) does. This allows the community to easily maintain the whole ecosystem, keep it up-to-date and consistent.

We do our best to keep the master branch as clean as possible, with tests passing at all times. However, it may happen that the master branch moves faster than the release cycle. Therefore check the [releases on npm](https://www.npmjs.com/package/@tensei/core) so that you're always up-to-date with the latest stable version.
