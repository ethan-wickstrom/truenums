[**@truenums/core v1.0.0**](../index.md)

***

# Interface: TruenumConfig\<Key\>

Defined in: [core.ts:14](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L14)

## Since

1.0.0

Defines core config for building a Truenum.

This interface shapes the primary configuration passed to [createTruenum](../functions/createTruenum.md). It
contains mandatory members for enumerated keys plus optional fields for labeling,
naming, and localization data. The shape of each property enforces compile-time
correctness and ensures zero-cost runtime usage.

## Type Parameters

• **Key** *extends* `string`

Constrained string type for all valid enumeration keys.

## Properties

### members

> `readonly` **members**: readonly `Key`[]

Defined in: [core.ts:38](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L38)

The array of unique string literals used as valid keys.
Must not be empty and cannot contain duplicates.

#### Since

1.0.0

#### Remarks

A zero-length array throws an error upon creation. Duplicates are disallowed.

#### Examples

```ts
const config = { members: ['APPLE', 'BANANA'] as const };
```

```ts
// This will throw due to duplicates
const config = { members: ['APPLE', 'APPLE'] as const };
```

```ts
// Edge case with single entry
const config = { members: ['SINGLE'] as const };
```

***

### name?

> `readonly` `optional` **name**: `string`

Defined in: [core.ts:55](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L55)

Optional name to identify this Truenum instance.

#### Since

1.0.0

#### Remarks

Has no effect on runtime logic, but may help with debugging.

#### Example

```ts
const config = {
  name: 'FruitEnum',
  members: ['APPLE', 'BANANA'] as const
};
```

***

### labels?

> `readonly` `optional` **labels**: `Readonly`\<`Record`\<`Key`, `string`\>\>

Defined in: [core.ts:72](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L72)

Optional labels keyed by each member, providing human-readable descriptions.

#### Since

1.0.0

#### Remarks

If not provided, label APIs may return undefined.

#### Example

```ts
const config = {
  members: ['APPLE', 'BANANA'] as const,
  labels: { APPLE: 'Red Apple', BANANA: 'Yellow Banana' }
};
```

***

### i18n?

> `readonly` `optional` **i18n**: `Readonly`\<`Record`\<`Key`, `Readonly`\<`Record`\<`string`, `string`\>\>\>\>

Defined in: [core.ts:92](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L92)

Optional i18n object storing translations for each key in multiple locales.

#### Since

1.0.0

#### Remarks

Each nested record maps a locale string to its label for the key.

#### Example

```ts
const config = {
  members: ['APPLE', 'BANANA'] as const,
  i18n: {
    APPLE: { en: 'Apple', fr: 'Pomme' },
    BANANA: { en: 'Banana', fr: 'Banane' }
  }
};
```
