---
title: Automating deployment operations for Node.js
date: 2020-03-03
draft: true
summary: >
  I've been working on my GitOps for a while now and wanted to document 
  it all in one place.
---

Dev agility is all about getting your code into production as fast as possible
and making turning the time you invested into product value.
The faster you can reliably and securely get your code into the hands of your users the better.

One part of this is packaging up code into containers ready for to be deployed on servers.
Containers are great at defining the exact environment to run code in
and automating the creation of them means you can get code live faster.

Automating this process means less time manually running tests and building containers.
To do this you can hook into the git flow you're already using.

The workflow is as follows:

- structure commits to describe changes to the application
- semantically version the app generate changelogs based on those commits
- automatically build container images based on those versions

There are a couple of npm packages to help with this.

- [yorkie](https://www.npmjs.com/package/yorkie) lets you write scripts the run on git hooks
- [@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli) is a utility for linting commit messages
- [@commitlint/config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional) is a utility for linting commit messages
- [standard-version](https://www.npmjs.com/package/standard-version) analyses commits to generate changelogs and version your package

## What is semantic versioning?

This workflow uses semantic versioning to denote the changes to the application.
From this you can see the relation between different versions
and work out what changes are safe to be made.

If the application is a `major` change, e.g. 1.2.3 to 2.0.0,
you know there is some extra work needed to migrate a deployment.
If there is a `minor` or `patch` change, e.g. 2.0.0 to 2.0.1 or to 2.1.0
you know it is safe to deploy the new version
as they are backwards compatable changes.

> [More about Semantic versioning](https://semver.org/)

## Whats a conventional commit?

Conventional commits are a standard for commit messages that describe the type of changes made.
It also forces commits towards atomic single-concern commits,
i.e. only working on one bug/feature at a time.

For example:

- `fix: stop user from dropping users table` is a backwards-compatible fix and generates a semver `patch`
- `feat: add new fancy buttons` is a backwards-compatible enhancement and triggers a semver `minor` version
- `BREAKING CHANGE: redesign login form` is a breaking change and triggers a semver `major` version

You can also supply a commit body and/or footer to add more info to your commit.

```txt
BREAKING CHANGE: redesign login form

We reviewed user feedback and moved all the buttons around
to make the login flow as easy as possible

resolves #3
```

I find the footer works nicely with
[github's fix/resolves syntaxt](https://help.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords)

> [More info on conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)

## So what's standard-version?

The final piece of the puzzle is standard version,
it is a library that parses git commits to work out whats changed since the last version.
Because the commits are "conventional" it can work out what the next version of the package should be
and it can accurately generate a changelog.

e.g. if you'd commited three `fix:`-es and a one `feat:` it would increase the semver's `minor` part.
It'll then go away and generate a changelog with commit messages grouped by their type
and run the [npm version](https://docs.npmjs.com/cli/version) command to increament that `minor` version.
Finally it will create and `git tag` a commit for that version which you can push up.

When you push up a tag you can setup the pipeline of your choice to build a container image.

## How does the process look

- `git checkout -b feature-branch`
- [work on a feature]
- `git commit -m "fix: add check for divide by zero"`
- `git checkout master`
- `git merge feature-branch`
- `npm run release`
- `git push --follow-tags origin master`
- [ci magic to build image]

## What's the setup?
