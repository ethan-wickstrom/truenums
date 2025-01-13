[**@truenums/core v1.0.0**](../index.md)

***

# Function: composeTruenum()

> **composeTruenum**\<`Tuple`, `UnionKey`\>(`truenums`, `opts`?): [`Truenum`](../interfaces/Truenum.md)\<`UnionKey`\>

Defined in: [core.ts:1041](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L1041)

## Type Parameters

• **Tuple** *extends* readonly [`Truenum`](../interfaces/Truenum.md)\<`string`\>[]

• **UnionKey** *extends* `string`

## Parameters

### truenums

`Tuple`

A tuple of Truenums to combine into one union.

### opts?

Optional name, label overrides, and i18n overrides for final composition.

#### name

`string`

#### labels

`Readonly`\<`Partial`\<`Record`\<`UnionKey`, `string`\>\>\>

#### i18n

`Readonly`\<`Partial`\<`Record`\<`UnionKey`, `Readonly`\<`Record`\<`string`, `string`\>\>\>\>\>

## Returns

[`Truenum`](../interfaces/Truenum.md)\<`UnionKey`\>

A new Truenum whose keys are the union of all input Truenums.

## Since

1.0.0

Merges multiple Truenums into one unified enumeration.

This function consolidates keys, labels, and i18n data from multiple disjoint Truenums
into a single larger Truenum. It ensures no duplicates exist, merges label data,
applies optional overrides, and returns a cohesive enumerated type with minimal overhead.

## Throws

If duplicate keys are discovered across the inputs, or if array is empty.

## Examples

```ts
const Fruit = createTruenum({ members: ['APPLE','BANANA'] as const });
const Veg = createTruenum({ members: ['CARROT'] as const });
const Food = composeTruenum([Fruit, Veg]);
console.log(Food.keys); // ['APPLE','BANANA','CARROT']
```

```ts
// Overriding labels
composeTruenum([Fruit, Veg], { labels:{ APPLE:'Red Apple' } });
```

```ts
// Error with duplicates
const Duplicate = createTruenum({ members:['APPLE','ORANGE'] as const });
composeTruenum([Fruit, Duplicate]);
// => throws
```

## See

[createTruenum](createTruenum.md), [subsetTruenum](subsetTruenum.md)
