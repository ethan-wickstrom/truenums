# Function: buildZodSchema()

> **buildZodSchema**\<`Key`\>(`truenum`): `z.ZodEnum`\<\[`Key`, `...Key[]`\]\>

Defined in: [core.ts:1204](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L1204)

## Type Parameters

• **Key** *extends* `string`

## Parameters

### truenum

[`Truenum`](../interfaces/Truenum.md)\<`Key`\>

A valid Truenum instance from which to retrieve the schema.

## Returns

`z.ZodEnum`\<\[`Key`, `...Key[]`\]\>

A ZodEnum referencing the same keys as the Truenum.

## Since

1.0.0

Builds a Zod schema from a given Truenum.

This function extracts the Zod schema within the specified Truenum and returns
it as a standalone schema instance. It is identical to accessing `truenum.zodSchema`
directly, but can be used for clarity or additional chaining. Offers no overhead
beyond referencing the existing schema.

## Throws

No direct error; the schema is guaranteed to exist for valid Truenums.

## Examples

```ts
const Fruit = createTruenum({ members:['APPLE','BANANA'] as const });
const schema = buildZodSchema(Fruit);
schema.parse('APPLE'); // 'APPLE'
schema.parse('UNKNOWN'); // throws
```

```ts
// Edge usage with single-member
const Single = createTruenum({ members:['ONLY'] as const });
const singleSchema = buildZodSchema(Single);
singleSchema.parse('ONLY'); // 'ONLY'
```

```ts
// Validation usage
const userInput = 'BANANA';
const validated = buildZodSchema(Fruit).safeParse(userInput);
console.log(validated.success); // true if userInput is 'APPLE' or 'BANANA'
```

## See

[Truenum.zodSchema](../interfaces/Truenum.md#zodschema), [createTruenum](createTruenum.md)
