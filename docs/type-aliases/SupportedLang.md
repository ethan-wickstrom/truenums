# Type Alias: SupportedLang

> **SupportedLang**: *typeof* [`SUPPORTED_LANGS`](../variables/SUPPORTED_LANGS.md)\[`number`\]

Defined in: [core.ts:543](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L543)

## Since

1.0.0

Union type of supported locale codes.

This type alias represents the permissible locale codes enumerated in
[SUPPORTED\_LANGS](../variables/SUPPORTED_LANGS.md). It is used internally to filter or merge language
data safely. It can be extended by consumers if desired.

## Returns

- 8-locale union type.

## Throws

No direct errors; it's a type-level alias.

## Examples

```ts
function greetUser(lang: SupportedLang) {
  // ...
}
greetUser('en'); // valid
greetUser('unknown'); // type error
```

```ts
// Edge usage
const valid: SupportedLang = 'ko'; // passes
const invalid: SupportedLang = 'xx'; // fails to compile
```

```ts
// In object records
const messages: Record<SupportedLang, string> = {
  en: 'Hello', fr: 'Bonjour', de: 'Hallo', es: 'Hola',
  it: 'Ciao', ja: 'Konnichiwa', ko: 'Annyeong', zh: 'Nihao'
};
```

## See

[SUPPORTED\_LANGS](../variables/SUPPORTED_LANGS.md)
