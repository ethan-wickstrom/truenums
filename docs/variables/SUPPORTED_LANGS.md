# Variable: SUPPORTED\_LANGS

> `const` **SUPPORTED\_LANGS**: readonly \[`"en"`, `"fr"`, `"de"`, `"es"`, `"it"`, `"ja"`, `"ko"`, `"zh"`\]

Defined in: [core.ts:497](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L497)

## Since

1.0.0

Lists selected locale codes recognized by default.

This constant array enumerates a small set of locale strings commonly used
in test or demonstration contexts. It can be extended or replaced by library
consumers needing broader i18n coverage, but suffices for typical usage examples
involving i18n functionality and related APIs.

## Returns

A set of locale codes, e.g. 'en','fr','de','es', etc.

## Throws

No direct errors; it's a static constant.

## Examples

```ts
console.log(SUPPORTED_LANGS); // ['en','fr','de','es','it','ja','ko','zh']
```

```ts
// Basic iteration
for (const lang of SUPPORTED_LANGS) {
  console.log(lang);
}
```

```ts
// Checking membership
const isSupported = SUPPORTED_LANGS.includes('en'); // true
```

## See

[composeTruenum](../functions/composeTruenum.md)
