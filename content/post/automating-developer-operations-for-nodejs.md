---
title: Automating developer operations for Node.js
date: 2020-04-10
draft: false
summary: >
  I've been working on my GitOps for a while now and wanted to document 
  it all in one place.
---

Dev agility is all about getting your code into production as fast as possible
and turning the time you invested into product value.
The faster you can securely and reliably get your code into the hands of your users, the better.

One part of this is packaging up code into containers, ready to be deployed on servers.
Containers are great at defining the exact environment to run code in
and automating the creation of them means you can get code live faster.

Automating this process means less time manually running tests and building containers.
To do this you can hook into the git flow you're already using.

The workflow is as follows:

1. structure commits to describe changes to the application
2. semantically version the app based on those commits
3. [not covered] automatically build container images based on those versions

There are a couple of npm packages to help with this.

- [yorkie](https://www.npmjs.com/package/yorkie) lets you define scripts that run on when you interact with git
- [@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli) is a utility for linting commit messages
- [standard-version](https://www.npmjs.com/package/standard-version) analyses commits to automatically version your app and generate changelogs

## Semantic versioning

This workflow uses semantic versioning to denote the changes to the application.
From this you can see the relation between different versions
and work out what changes are safe to be deployed.

There are three parts to a semantic version `major.minor.patch`.
If the application is a **major** change, e.g. 1.2.3 to 2.0.0,
you know there is some extra work needed to migrate a deployment.
If there is a **minor** or **patch** change, e.g. going from 2.0.0 to 2.0.1 or 2.1.0
you know it's safe to deploy the new version
as it (should) only contain backwards compatable changes.

> [More about Semantic versioning →](https://semver.org/)

## Conventional commits

Conventional commits are a standard format for commit messages that describe the type of changes made.
It also forces commits towards atomic single-concern commits,
i.e. only working on one bug/change/feature at a time.

For example:

- `fix: stop user from dropping users table` is a backwards-compatible fix and generates a semver **patch**
- `feat: add new fancy buttons` is a backwards-compatible enhancement and triggers a semver **minor** version
- `BREAKING CHANGE: redesign login form` is a breaking change and triggers a **major** semver change

You can also supply a commit body and/or footer to add more info to your commit.
Here's a full example:

```
BREAKING CHANGE: redesign login form

We reviewed user feedback and moved all the buttons around
to make the login flow as easy as possible

resolves #3
```

I find the footer works nicely with
[github's fix/resolves syntax](https://help.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords)

> [More info on conventional commits →](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)

## Standard version

The final piece of the puzzle is standard version,
it is a command that parses git commits to work out whats changed since the last version.
Because the commits are "conventional" it can work out what the next semantic version of the app should be
and it can accurately generate a changelog from commit messages.

For example, if you'd commited three `fix:`-es and a one `feat:`
it would increase the semver's **minor** part.
It'll then go away and generate a changelog with those commit messages
and run the [npm version](https://docs.npmjs.com/cli/version)
command to increament that **minor** version.
It creates a commit for those changes and tags it with the new version.

When you push up a tag you then have a pipeline of your choice to build a container image.

## The process

```bash
# Commit your atomic change
git add somefile.txt
git commit -m "feat: add that really cool thing you wanted"

# Generate a new version
npm run release
```

<details>
<summary>Or a more complex example:</summary>

```bash
git checkout -b feature-branch

# work on a feature ...

git commit -m "fix: add check for divide by zero"

# some sort of code review ...

git checkout master
git merge feature-branch
npm run release
git push --follow-tags origin master

# ci magic to build image ...
```

> Most of these can be done inside your favourite IDE

</details>

## Project setup

Start by adding these dependencies

```bash
npm install --save-dev \
  yorkie \
  @commitlint/cli \
  @commitlint/config-conventional \
  standard-version
```

Then add this to your **package.json**:

```json
"commitlint": {
  "extends": ["@commitlint/config-conventional"]
},
"gitHooks": {
  "commit-msg": "commitlint -e $HUSKY_GIT_PARAMS"
}
```

First it sets up commit lint to ensure your commits meet the conventional commits standard.
This means you can't commit unless you

Second it sets up a git hook to run commitlint on `commit-msg`,
which means your commit will fail if it doens't meet the standard.

Next add this script to your **package.json**.

```json
"release": "standard-version"
```

Now you can perform a release with [npm run](https://docs.npmjs.com/cli/run-script).
Like this:

```bash
npm run release
```

Thats it.

- Write commit messages that are [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
- Use `npm run release` to version releases and generate changelogs
- Next setup a CI/CD to generate a docker image based on git tags
