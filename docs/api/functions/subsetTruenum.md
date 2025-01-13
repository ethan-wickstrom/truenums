[**@truenums/core v1.0.0**](../index.md)

***

# Function: subsetTruenum()

> **subsetTruenum**\<`ParentKey`, `SubsetKey`\>(`parent`, `subsetMembers`, `opts`?): [`Truenum`](../interfaces/Truenum.md)\<`SubsetKey`\>

Defined in: [core.ts:809](https://github.com/ethan-wickstrom/truenums/blob/555f5131e8b27e1a76143a8cb6719b9ff10450ea/src/core.ts#L809)

## Type Parameters

• **ParentKey** *extends* `string`

• **SubsetKey** *extends* `string`

## Parameters

### parent

[`Truenum`](../interfaces/Truenum.md)\<`ParentKey`\>

The parent Truenum from which to derive a subset.

### subsetMembers

readonly `SubsetKey`[]

An array of keys strictly belonging to the parent.

### opts?

Optional name, label overrides, and i18n overrides.

#### name

`string`

#### labels

`Readonly`\<`Partial`\<`Record`\<`SubsetKey`, `string`\>\>\>

#### i18n

`Readonly`\<`Partial`\<`Record`\<`SubsetKey`, `Readonly`\<`Record`\<`string`, `string`\>\>\>\>\>

## Returns

[`Truenum`](../interfaces/Truenum.md)\<`SubsetKey`\>

A smaller Truenum restricted to `subsetMembers`.

## Since

1.0.0

Builds a restricted Truenum subset from a parent.

This function validates that each member in `subsetMembers` belongs to `parent`.
It then merges label and i18n data from the parent, applying optional overrides
if provided. This yields a smaller, fully typed Truenum for specialized usage.

## Throws

If a subset key is not found in the parent.

## Examples

```ts
const FullColor = createTruenum({
  members: ['RED','GREEN','BLUE','YELLOW'] as const
});
const Primary = subsetTruenum(FullColor, ['RED','BLUE'] as const);
console.log(Primary.keys); // ['RED','BLUE']
```

```ts
// Edge: Overriding labels
subsetTruenum(FullColor, ['RED'] as const, {
  labels: { RED:'Overridden Red' }
});
```

```ts
// Error if unknown key
subsetTruenum(FullColor, ['MAGENTA'] as const);
// => throws
```

## See

[createTruenum](createTruenum.md), [composeTruenum](composeTruenum.md)
