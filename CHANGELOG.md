# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.2"></a>
## [1.0.2](https://github.com/nuxt-community/nuxtent-module/compare/v1.0.1...v1.0.2) (2017-09-29)


### Bug Fixes

* **module:** replace wrong `rootDir` path by `srcDir` when looking for components ([89a9081](https://github.com/nuxt-community/nuxtent-module/commit/89a9081))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/nuxt-community/nuxtent-module/compare/v1.0.0...v1.0.1) (2017-09-29)


### Bug Fixes

* **example:** fix `multiple-content-types` example config and pages ([061bf2a](https://github.com/nuxt-community/nuxtent-module/commit/061bf2a))
* **examples:** replace `nuxtent generate` by `nuxt generate` command ([e91676a](https://github.com/nuxt-community/nuxtent-module/commit/e91676a))
* **module:** properly detect static mode (`nuxt generate`) ([cd148a2](https://github.com/nuxt-community/nuxtent-module/commit/cd148a2)), closes [#83](https://github.com/nuxt-community/nuxtent-module/issues/83) [#88](https://github.com/nuxt-community/nuxtent-module/issues/88) [#89](https://github.com/nuxt-community/nuxtent-module/issues/89)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/nuxt-community/nuxtent-module/compare/0.2.80...1.0.0) (2017-09-25)


### Bug Fixes

* **module:** fix "dependency not found ~\content" ([#78](https://github.com/nuxt-community/nuxtent-module/issues/78)) ([9866b7d](https://github.com/nuxt-community/nuxtent-module/commit/9866b7d))
* **module:** remove automatic content permalink prefixing ([8ff853d](https://github.com/nuxt-community/nuxtent-module/commit/8ff853d))


### Chores

* **package:** remove `nuxtent` binary ([845aa8d](https://github.com/nuxt-community/nuxtent-module/commit/845aa8d))


### BREAKING CHANGES

* **module:** verify your content permalinks, possibly add the missing content type prefix
* **package:** replace `nuxtent generate` by `nuxt generate` in your project's package.json scripts
