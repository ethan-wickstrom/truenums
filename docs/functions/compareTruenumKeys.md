# Function: compareTruenumKeys()

> **compareTruenumKeys**\<`T`\>(`a`, `b`): `-1` \| `0` \| `1`

Defined in: [core.ts:1113](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L1113)

## Type Parameters

• **T** *extends* `string`

## Parameters

### a

`T`

First key to compare.

### b

`T`

Second key to compare.

## Returns

`-1` \| `0` \| `1`

The comparison result: negative, zero, or positive.

## Since

1.0.0

Alphabetically compares two Truenum keys.

A simple utility for sorting or ordering operations on enumerated strings.
Returns -1 if `a` is lexicographically less than `b`, 1 if greater, and 0
if they match. Helps maintain a consistent ordering in user interfaces or
sorted data lists.

## Throws

No direct error, relies on string comparison.

## Examples

```ts
compareTruenumKeys('APPLE','BANANA'); // -1
compareTruenumKeys('CARROT','CARROT'); // 0
compareTruenumKeys('PEACH','ORANGE'); // 1 if 'PEACH' > 'ORANGE'
```

```ts
// Sorting usage
['BANANA','APPLE','CARROT'].sort(compareTruenumKeys);
// => ['APPLE','BANANA','CARROT']
```

```ts
// Edge: identical strings
compareTruenumKeys('X','X'); // 0
```

## See

[subsetTruenum](subsetTruenum.md), [createTruenum](createTruenum.md)
