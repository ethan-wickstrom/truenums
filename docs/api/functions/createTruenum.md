[**@truenums/core v1.0.0**](../index.md)

***

# Function: createTruenum()

> **createTruenum**\<`Key`\>(`config`): [`Truenum`](../interfaces/Truenum.md)\<`Key`\>

Defined in: [core.ts:320](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L320)

## Type Parameters

• **Key** *extends* `string`

Constrained string type for enumerated keys.

## Parameters

### config

[`TruenumConfig`](../interfaces/TruenumConfig.md)\<`Key`\>

A [TruenumConfig](../interfaces/TruenumConfig.md) describing members, labels, i18n, etc.

## Returns

[`Truenum`](../interfaces/Truenum.md)\<`Key`\>

Fully built Truenum with membership checks and utilities.

## Since

1.0.0

Constructs a fresh Truenum from config.

This function synthesizes a typed enumeration from the given [TruenumConfig](../interfaces/TruenumConfig.md),
performing runtime checks for duplicates or empty arrays. It provides membership
validation, label retrieval, i18n lookups, and a Zod schema for optional usage.
The resulting object is safe, minimal, and highly optimized.

## Throws

If `config.members` is empty or contains duplicates.

## Examples

```ts
const Fruit = createTruenum({
  members: ['APPLE','BANANA'] as const,
  labels: { APPLE: 'Red Apple', BANANA: 'Yellow Banana' }
});
console.log(Fruit.keys); // ['APPLE','BANANA']
console.log(Fruit.is('APPLE')); // true
```

```ts
// Edge case: single-member
const Single = createTruenum({ members: ['ONLY'] as const });
console.log(Single.keys); // ['ONLY']
```

```ts
// Error case: duplicates
createTruenum({ members: ['X','X'] as const });
// => throws "Duplicate keys found."
```

## See

[subsetTruenum](subsetTruenum.md), [composeTruenum](composeTruenum.md)
