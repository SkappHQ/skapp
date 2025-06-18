# Contributing to Skapp

Thank you for investing your time in contributing to Skapp! We’re excited to have your contribution! Here are some resources and guidance to help you get started:

[1. Getting Started](#getting-started)\
[2. Issues](#issues)\
[3. Pull Requests](#pull-requests)\
[4. Branching Convention](#branching-convention)\
[5. Commit Convention](#commit-convention)\
[6. Coding Style Guidelines](#coding-style-guidelines)

## Getting Started

To ensure a positive and inclusive environment, please read our [code of conduct](https://github.com/SkappHQ/skapp?tab=coc-ov-file) before contributing. For help setting up the code in this repo, please follow our [Documentation](https://docs.skapp.com/).

## Issues

#### Create a new issue

If you find a bug, please create an Issue and we’ll triage it.

- Please search [existing Issues](https://github.com/SkappHQ/skapp/issues) before creating a new one.
- Please clearly describe the problem and steps to reproduce it. Exact steps with screenshots and URLs will help make things clear.

#### Solve an issue

If you find an issue that interests you to work on, you are welcome to open a Pull Request with a fix.

## Pull Requests

We actively welcome your Pull Requests! A couple of things to keep in mind before you submit:

- If you’re fixing an issue, make sure someone else hasn’t already created a PR fixing the same issue. Likewise, make sure to link your PR to the related Issue(s).
- We will always try to accept the first viable PR that resolves the Issue.
- If you're new, we encourage you to take a look at issues tagged with [good first issue](https://github.com/SkappHQ/skapp/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).
- If you’re submitting a new feature, make sure you have opened a [Discussion](https://github.com/orgs/SkappHQ/discussions) to discuss the new feature before opening a PR. We’d love to accept your hard work, but unfortunately, if a feature hasn’t gone through a proper design process, your PR will be closed.
- Please use the PR message template and provide detailed context for quicker review. PRs without clear problem statements will be closed.
- We use labels to keep track of the state of the opened PRs. If your PR is ready to be reviewed please add the "Ready for review" label.
- We may ask for changes to be made before a PR can be merged, if so please apply the requested changes and update your PR.

## Branching Convention

#### Main Branches

- Describe main branches here!

#### Gitflow

- Describe git-flow here!

#### Branch Naming Conventions

Ex: `feat/123-signup-page`

1. Add the suitable branch prefix (Ex: `feat/`)
2. Add the GitHub issue number (Ex: `123`)
3. Add a short description using lowercase letters and dash as the separator. Avoid long descriptive names. (Ex: `signup-page`)

| Prefix      | Usage                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| feat/       | Feature branches are used for specific feature work or improvements.                                                                                                                                                   |
| fix/        | Fix branches are typically used to fix reported issues.                                                                                                                                                                |
| hotfix/     | Hotfix branches are used to quickly fix the release branch without interrupting changes in the development branch.                                                                                                     |
| chore/      | Chore branches are typically used for tasks that do not modify the actual application code. (tasks related to the build system, package updates, refactoring the codebase, updating the readme or other documentation) |
| experiment/ | Experiment branches are used to experiment with new ideas or concepts, without any intention of ever merging them into the develop or release branches                                                                 |

## Commit Convention

Ex: `feat(sigin): add login screens`

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- The commit message format is described below:
  |Structure|Format|Example|
  |--|---|---|
  |Title|`<type>[scope]!: <description>`| feat(api)!: change the users list endpoint url|
  |Body|`[body]`| - The users list endpoint URL has been changed from '/api/v1/users' to '/api/v2/users'. <br> - This is a breaking change, and all clients must update the endpoint URL.|
  |Footer|`[footer(s)]`|BREAKING CHANGE: The '/api/v1/users' endpoint is no longer supported.|

  - `<type>` : the type of commit (mandatory)
  - `[scope]`: the scope of the commit affected (optional)
  - `!`: if it is a breaking change, then to draw the attention (optional)
  - `<description`: brief description of the commit (mandatory)
  - `[body]`: if the commit description is lengthy, can be broken to few lines (optional)
  - `[footer(s)]`: if there are breaking changes that can be appended to footer

### Type

Must be one of the following:

| Commit Type           | Application                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `feat:`               | A new feature                                                                                                                     |
| `fix:`                | A bug fix                                                                                                                         |
| `chore:`              | Routine tasks or maintenance tasks that do not modify the source code (updating the build system, package manager configurations) |
| `docs:`               | Documentation only changes                                                                                                        |
| `style:`              | Changes that do not affect the meaning of the code (white space, formatting, etc)                                                 |
| `refactor:`           | A code change that neither fixes a bug nor adds a feature                                                                         |
| `test:`               | Adding or modifying tests                                                                                                         |
| `perf:`               | A code change that improves performance                                                                                           |
| `build:`              | Changes that affect the build system or external dependencies                                                                     |
| `ci:`                 | Changes related to the continuous integration and deployment system                                                               |
| `revert:`             | Commit reverts previous changes                                                                                                   |
| `config:` or `setup:` | Changes made to configuration files or setup procedures                                                                           |
| `security:`           | Enhancements to the security of the application                                                                                   |
| `localize:`           | Changes related to localization/internationalization                                                                              |
| `wip:`                | 'Work In Progress' - Commit is part of incomplete work                                                                            |

- Reference: [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0)

## Coding Style Guidelines

- Please use proper types and generics throughout your code.
- Follow the [Atomic design](https://atomicdesign.bradfrost.com/)
- Avoid using hardcoded English strings to display text on the screen, rather, update the JSON files in the [`english`](frontend/src/community/common/assets/languages/english) directory and read the value using the `useTranslator` hook.
- **Linting & Formatting:**
  - **TypeScript/JavaScript/React:**
    - We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/).
    - Run `npm run check-lint` and `npm run format` before submitting your PR.
  - **Java:**
    - Run `mvn spring-javaformat:apply` before submitting your PR.
  - PRs failing lint/format checks will not be merged.
- **Testing:**
  - Run all tests locally before pushing.
  - Add or update tests as necessary to cover your changes.
