# Releasing Truenums

## Publishing on distribution channels

This recipe will walk you through a simple example that uses distribution channels to make releases available only to a subset of users, in order to collect feedback before distributing the release to all users.

This example uses the **semantic-release** default configuration:

- [branches](../../usage/configuration.md#branches): `['+([0-9])?(.{+([0-9]),x}).x', 'master', 'main', 'next', 'next-major', {name: 'beta', prerelease: true}, {name: 'alpha', prerelease: true}]`
- [plugins](../../usage/configuration.md#plugins): `['@semantic-release/commit-analyzer', '@semantic-release/release-notes-generator', '@semantic-release/npm', '@semantic-release/github']`

### Initial release

We'll start by making the first commit of the project, with the code for the initial release and the message `feat: initial commit` to `master` or `main`. When pushing that commit, **semantic-release** will release the version `1.0.0` and make it available on the default distribution channel which is the dist-tag `@latest` for npm.

The Git history of the repository is:

```
* feat: initial commit # => v1.0.0 on @latest
```

### Releasing a bug fix

We can now continue to commit changes and release updates to our users. For example we can commit a bug fix with the message `fix: a fix` to `master` or `main`. When pushing that commit, **semantic-release** will release the version `1.0.1` on the dist-tag `@latest`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
* fix: a fix # => v1.0.1 on @latest
```

### Releasing a feature on next

We now want to develop an important feature, which is a breaking change. Considering the scope of this feature we want to make it available, at first, only to our most dedicated users in order to get feedback. Once we get that feedback we can make improvements and ultimately make the new feature available to all users.

To implement that workflow we can create the branch `next` and commit our feature to this branch. When pushing that commit, **semantic-release** will release the version `2.0.0` on the dist-tag `@next`. That means only the users installing our module with `npm install example-module@next` will receive the version `2.0.0`. Other users installing with `npm install example-module` will still receive the version `1.0.1`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
* fix: a fix # => v1.0.1 on @latest
| \
|  * feat: a big feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0 on @next
```

### Releasing a bug fix on next

One of our users starts to use the new `2.0.0` release and reports a bug. We develop a bug fix and commit it to the `next` branch with the message `fix: fix something on the big feature`. When pushing that commit, **semantic-release** will release the version `2.0.1` on the dist-tag `@next`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
* fix: a fix # => v1.0.1 on @latest
| \
|  * feat: a big feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0 on @next
|  * fix: fix something on the big feature # => v2.0.1 on @next
```

### Releasing a feature on latest

We now want to develop a smaller, non-breaking feature. Its scope is small enough that we don't need to have a phase of feedback and we can release it to all users right away.

If we were to commit that feature on `next` only a subset of users would get it, and we would need to wait for the end of our feedback period in order to make both the big and the small feature available to all users.

Instead, we develop that small feature commit it to `master` or `main` with the message `feat: a small feature`. When pushing that commit, **semantic-release** will release the version `1.1.0` on the dist-tag `@latest` so all users can benefit from it right away.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
* fix: a fix # => v1.0.1 on @latest
| \
|  * feat: a big feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0 on @next
|  * fix: fix something on the big feature # => v2.0.1 on @next
*  | feat: a small feature # => v1.1.0 on @latest
```

### Porting a feature to next

Most of our users now have access to the small feature, but we still need to make it available to our users using the `@next` dist-tag. To do so we need to merge our changes made on `master` or `main` (the commit `feat: a small feature`) into `next`. As `master`/`main` and `next` branches have diverged, this merge might require to resolve conflicts.

Once the conflicts are resolved and the merge commit is pushed to `next`, **semantic-release** will release the version `2.1.0` on the dist-tag `@next` which contains both our small and big feature.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
* fix: a fix # => v1.0.1 on @latest
| \
|  * feat: a big feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0 on @next
|  * fix: fix something on the big feature # => v2.0.1 on @next
*  | feat: a small feature # => v1.1.0 on @latest
|  * Merge branch master/main into next # => v2.1.0 on @next
```

### Adding a version to latest

After a period of feedback from our users using the `@next` dist-tag we feel confident to make our big feature available to all users. To do so we merge the `next` branch into `master`/`main`. There should be no conflict as `next` is strictly ahead of `master`/`main`.

Once the merge commit is pushed to `master`/`main`, **semantic-release** will add the version `2.1.0` to the dist-tag `@latest` so all users will receive it when installing out module with `npm install example-module`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
* fix: a fix # => v1.0.1 on @latest
| \
|  * feat: a big feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0 on @next
|  * fix: fix something on the big feature # => v2.0.1 on @next
*  | feat: a small feature # => v1.1.0 on @latest
|  * Merge branch master/main into next # => v2.1.0 on @next
| /|
*  | Merge branch next into master/main # => v2.1.0 on @latest
```

We can now continue to push new fixes and features on `master`/`main`, or a new breaking change on `next` as we did before.

### Publishing maintenance releases

This recipe will walk you through a simple example that uses Git branches and distribution channels to publish fixes and features for old versions of a package.

This example uses the **semantic-release** default configuration:

- [branches](../../usage/configuration.md#branches): `['+([0-9])?(.{+([0-9]),x}).x', 'master', 'main', 'next', 'next-major', {name: 'beta', prerelease: true}, {name: 'alpha', prerelease: true}]`
- [plugins](../../usage/configuration.md#plugins): `['@semantic-release/commit-analyzer', '@semantic-release/release-notes-generator', '@semantic-release/npm', '@semantic-release/github']`

### Initial release

We'll start by making the first commit of the project, with the code for the initial release and the message `feat: initial commit`. When pushing that commit, on `master`/`main` **semantic-release** will release the version `1.0.0` and make it available on the default distribution channel which is the dist-tag `@latest` for npm.

The Git history of the repository is:

```
* feat: initial commit # => v1.0.0 on @latest
```

### Releasing a breaking change

We now decide to drop Node.js 6 support for our package, and require Node.js 8 or higher, which is a breaking change.

We commit that change with the message `feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required` to `master`/`main`. When pushing that commit, **semantic-release** will release the version `2.0.0` on the dist-tag `@latest`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
* feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required # => v2.0.0 on @latest
```

### Releasing a feature for version 1.x users

One of our users request a new feature, however they cannot migrate to Node.js 8 or higher due to corporate policies.

If we were to push that feature on `master`/`main` and release it, the new version would require Node.js 8 or higher as the release would also contain the commit `feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required`.

Instead, we create the branch `1.x` from the tag `v1.0.0` with the command `git checkout -b 1.x v1.0.0` and we commit that feature with the message `feat: a feature` to the branch `1.x`. When pushing that commit, **semantic-release** will release the version `1.1.0` on the dist-tag `@release-1.x` so users who can't migrate to Node.js 8 or higher can benefit from it.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
*  | feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required # => v2.0.0 on @latest
|  * feat: a feature # => v1.1.0 on @1.x
```

### Releasing a bug fix for version 1.0.x users

Another user currently using version `1.0.0` reports a bug. They cannot migrate to Node.js 8 or higher and they also cannot migrate to `1.1.0` as they do not use the feature developed in `feat: a feature` and their corporate policies require to go through a costly quality assurance process for each `minor` upgrades.

In order to deliver the bug fix in a `patch` release, we create the branch `1.0.x` from the tag `v1.0.0` with the command `git checkout -b 1.0.x v1.0.0` and we commit that fix with the message `fix: a fix` to the branch `1.0.x`. When pushing that commit, **semantic-release** will release the version `1.0.1` on the dist-tag `@release-1.0.x` so users who can't migrate to `1.1.x` or `2.x` can benefit from it.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
*  | feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required # => v2.0.0 on @latest
|  | \
|  *  | feat: a feature # => v1.1.0 on @1.x
|  |  * fix: a fix # => v1.0.1 on @1.0.x
```

### Porting a bug fix from 1.0.x to 1.x

Now that we have released a fix in version `1.0.1` we want to make it available to `1.1.x` users as well.

To do so we need to merge the changes made on `1.0.x` (the commit `fix: a fix`) into the `1.x` branch. As `1.0.x` and `1.x` branches have diverged, this merge might require to resolve conflicts.

Once the conflicts are resolved and the merge commit is pushed to the branch `1.x`, **semantic-release** will release the version `1.1.1` on the dist-tag `@release-1.x` which contains both our feature and bug fix.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
*  | feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required # => v2.0.0 on @latest
|  | \
|  *  | feat: a feature # => v1.1.0 on @1.x
|  |  * fix: a fix # => v1.0.1 on @1.0.x
|  | /|
|  *  | Merge branch 1.0.x into 1.x # => v1.1.1 on @1.x
```

### Porting bug fixes and features to master/main

Finally we want to make both our feature and bug fix available to users using the `@latest` dist-tag.

To do so we need to merge the changes made on `1.x` (the commits `feat: a feature` and `fix: a fix`) into `master`/`main`. As `1.x` and `master`/`main` branches have diverged, this merge might require to resolve conflicts.

Once the conflicts are resolved and the merge commit is pushed to `master` or `main`, **semantic-release** will release the version `2.1.0` on the dist-tag `@latest` which now contains the breaking change feature, the feature and the bug fix.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
*  | feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required # => v2.0.0 on @latest
|  | \
|  *  | feat: a feature # => v1.1.0 on @1.x
|  |  * fix: a fix # => v1.0.1 on @1.0.x
|  | /|
|  *  | Merge branch 1.0.x into 1.x # => v1.1.1 on @1.x
| /|  |
*  |  | Merge branch 1.x into master/main # => v2.1.0 on @latest
```

### Releasing a bug fix for version 2.1.0 users

One of our users using the version `2.1.0` version reports a bug.

We can simply commit the bug fix with the message `fix: another fix` to `master`/`main`. When pushing that commit, **semantic-release** will release the version `2.1.1` on the dist-tag `@latest`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
*  | feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required # => v2.0.0 on @latest
|  | \
|  *  | feat: a feature # => v1.1.0 on @1.x
|  |  * fix: a fix # => v1.0.1 on @1.0.x
|  | /|
|  *  | Merge branch 1.0.x into 1.x # => v1.1.1 on @1.x
| /|  |
*  |  | Merge branch 1.x into master/main # => v2.1.0 on @latest
*  |  | fix: another fix # => v2.1.1 on @latest
```

### Porting a bug fix from master/main to 1.x

The bug fix `fix: another fix` also affects version `1.1.1` users, so we want to port it to the `1.x` branch.

To do so we need to cherry pick our fix commit made on `master`/`main` (`fix: another fix`) into `1.x` with `git checkout 1.x && git cherry-pick <sha of fix: another fix>`. As `master`/`main` and `1.x` branches have diverged, the cherry picking might require to resolve conflicts.

Once the conflicts are resolved and the commit is pushed to `1.x`, **semantic-release** will release the version `1.1.2` on the dist-tag `@release-1.x` which contains `feat: a feature`, `fix: a fix` and `fix: another fix` but not `feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
*  | feat: drop Node.js 6 support \n\n BREAKING CHANGE: Node.js >= 8 required # => v2.0.0 on @latest
|  | \
|  *  | feat: a feature # => v1.1.0 on @1.x
|  |  * fix: a fix # => v1.0.1 on @1.0.x
|  | /|
|  *  | Merge branch 1.0.x into 1.x # => v1.1.1 on @1.x
| /|  |
*  |  | Merge branch 1.x into master/main # => v2.1.0 on @latest
*  |  | fix: another fix # => v2.1.1 on @latest
|  |  |
|  *  | fix: another fix # => v1.1.2 on @1.x
```

### Publishing pre-releases

This recipe will walk you through a simple example that uses pre-releases to publish beta versions while working on a future major release and then make only one release on the default distribution.

This example uses the **semantic-release** default configuration:

- [branches](../../usage/configuration.md#branches): `['+([0-9])?(.{+([0-9]),x}).x', 'master', 'main', 'next', 'next-major', {name: 'beta', prerelease: true}, {name: 'alpha', prerelease: true}]`
- [plugins](../../usage/configuration.md#plugins): `['@semantic-release/commit-analyzer', '@semantic-release/release-notes-generator', '@semantic-release/npm', '@semantic-release/github']`

### Initial release

We'll start by making the first commit of the project, with the code for the initial release and the message `feat: initial commit`. When pushing that commit, on `master`/`main` **semantic-release** will release the version `1.0.0` and make it available on the default distribution channel which is the dist-tag `@latest` for npm.

The Git history of the repository is:

```
* feat: initial commit # => v1.0.0 on @latest
```

### Working on a future release

We now decide to work on a future major release, which will be composed of multiple features, some of them being breaking changes. We want to publish our package for each new feature developed for test purpose, however we do not want to increment our package version or make it available to our users until all the features are developed and tested.

To implement that workflow we can create the branch `beta` and commit our first feature there. When pushing that commit, **semantic-release** will publish the pre-release version `2.0.0-beta.1` on the dist-tag `@beta`. That allow us to run integration tests by installing our module with `npm install example-module@beta`. Other users installing with `npm install example-module` will still receive the version `1.0.0`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
```

We can continue to work on our future release by committing and pushing other features or bug fixes on the `beta` branch. With each push, **semantic-release** will publish a new pre-release on the dist-tag `@beta`, which allow us to run our integration tests.

With another feature, the Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
|  * feat: second feature # => v2.0.0-beta.2 on @beta
```

### Releasing a bug fix on the default distribution channel

In the meantime we can also continue to commit changes and release updates to our users.

For example, we can commit a bug fix with the message `fix: a fix` to `master`/`main`. When pushing that commit, **semantic-release** will release the version `1.0.1` on the dist-tag `@latest`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
|  * feat: second feature # => v2.0.0-beta.2 on @beta
*  | fix: a fix # => v1.0.1 on @latest
```

### Working on another future release

We now decide to work on another future major release, in parallel of the beta one, which will also be composed of multiple features, some of them being breaking changes.

To implement that workflow we can create the branch `alpha` from the branch `beta` and commit our first feature there. When pushing that commit, **semantic-release** will publish the pre-release version `3.0.0-alpha.1` on the dist-tag `@alpha`. That allow us to run integration tests by installing our module with `npm install example-module@alpha`. Other users installing with `npm install example-module` will still receive the version `1.0.1`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
|  * feat: second feature # => v2.0.0-beta.2 on @beta
*  | fix: a fix # => v1.0.1 on @latest
|  | \
|  |  * feat: first feature of other release \n\n BREAKING CHANGE: it breaks something # => v3.0.0-alpha.1 on @alpha
```

We can continue to work on our future release by committing and pushing other features or bug fixes on the `alpha` branch. With each push, **semantic-release** will publish a new pre-release on the dist-tag `@alpha`, which allow us to run our integration tests.

With another feature, the Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
|  * feat: second feature # => v2.0.0-beta.2 on @beta
*  | fix: a fix # => v1.0.1 on @latest
|  | \
|  |  * feat: first feature of other release \n\n BREAKING CHANGE: it breaks something # => v3.0.0-alpha.1 on @alpha
|  |  * feat: second feature of other release # => v3.0.0-alpha.2 on @alpha
```

### Publishing the 2.0.0 beta release to the default distribution channel

Once we've developed and pushed all the feature we want to include in the future version `2.0.0` in the `beta` branch and all our tests are successful we can release it to our users.

To do so we need to merge our changes made on `beta` into `master`/`main`. As `beta` and `master`/`main` branches have diverged, this merge might require to resolve conflicts.

Once the conflicts are resolved and the merge commit is pushed to `master`/`main`, **semantic-release** will release the version `2.0.0` on the dist-tag `@latest`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
|  * feat: second feature # => v2.0.0-beta.2 on @beta
*  | fix: a fix # => v1.0.1 on @latest
|  | \
|  |  * feat: first feature of other release \n\n BREAKING CHANGE: it breaks something # => v3.0.0-alpha.1 on @alpha
|  |  * feat: second feature of other release # => v3.0.0-alpha.2 on @alpha
| /|  |
*  |  | Merge branch beta into master/main # => v2.0.0 on @latest
```

### Publishing the 3.0.0 alpha release to the beta distribution channel

Now that we published our the version `2.0.0` that was previously in beta, we decide to promote the version `3.0.0` in alpha to beta.

To do so we need to merge our changes made on `alpha` into `beta`. There should be no conflict as `alpha` is strictly ahead of `master`/`main`.

Once the merge commit is pushed to `beta`, **semantic-release** will publish the pre-release version `3.0.0-beta.1` on the dist-tag `@beta`, which allow us to run our integration tests.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
|  * feat: second feature # => v2.0.0-beta.2 on @beta
*  | fix: a fix # => v1.0.1 on @latest
|  | \
|  |  * feat: first feature of other release \n\n BREAKING CHANGE: it breaks something # => v3.0.0-alpha.1 on @alpha
|  |  * feat: second feature of other release # => v3.0.0-alpha.2 on @alpha
| /|  |
*  |  | Merge branch beta into master/main # => v2.0.0 on @latest
|  | /|
|  *  | Merge branch alpha into beta # => v3.0.0-beta.1 on @beta
```

### Publishing the 3.0.0 beta release to the default distribution channel

Once we've developed and pushed all the feature we want to include in the future version `3.0.0` in the `beta` branch and all our tests are successful we can release it to our users.

To do so we need to merge our changes made on `beta` into `master`/`main`. As `beta` and `master` branches have diverged, this merge might require to resolve conflicts.

Once the conflicts are resolved and the merge commit is pushed to `master` or `main`, **semantic-release** will release the version `3.0.0` on the dist-tag `@latest`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
|  * feat: second feature # => v2.0.0-beta.2 on @beta
*  | fix: a fix # => v1.0.1 on @latest
|  | \
|  |  * feat: first feature of other release \n\n BREAKING CHANGE: it breaks something # => v3.0.0-alpha.1 on @alpha
|  |  * feat: second feature of other release # => v3.0.0-alpha.2 on @alpha
| /|  |
*  |  | Merge branch beta into master/main # => v2.0.0 on @latest
|  | /|
|  *  | Merge branch alpha into beta # => v3.0.0-beta.1 on @beta
| /|  |
*  |  | Merge branch beta into master/main # => v3.0.0 on @latest
```

### Working on a third future release

We can now start to work on a new future major release, version `4.0.0`, on the `@beta` distribution channel.

To do so we first need to update the `beta` branch with all the changes from `master` or `main` (the commits `fix: a fix`). As `beta` and `master`/`main` branches have diverged, this merge might require to resolve conflicts.

We can now commit our new feature on `beta`. When pushing that commit, **semantic-release** will publish the pre-release version `3.1.0-beta.1` on the dist-tag `@beta`. That allow us to run integration tests by installing our module with `npm install example-module@beta`. Other users installing with `npm install example-module` will still receive the version `3.0.0`.

The Git history of the repository is now:

```
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-beta.1 on @beta
|  * feat: second feature # => v2.0.0-beta.2 on @beta
*  | fix: a fix # => v1.0.1 on @latest
|  | \
|  |  * feat: first feature of other release \n\n BREAKING CHANGE: it breaks something # => v3.0.0-alpha.1 on @alpha
|  |  * feat: second feature of other release # => v3.0.0-alpha.2 on @alpha
| /|  |
*  |  | Merge branch beta into master/main # => v2.0.0 on @latest
|  | /|
|  *  | Merge branch alpha into beta # => v3.0.0-beta.1 on @beta
| /|  |
*  |  | Merge branch beta into master/main # => v3.0.0 on @latest
| \|  |
|  *  | Merge branch master/main into beta
|  *  | feat: new feature # => v3.1.0-beta.1 on @beta
```