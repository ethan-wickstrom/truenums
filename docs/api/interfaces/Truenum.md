[**@truenums/core v1.0.0**](../index.md)

***

# Interface: Truenum\<Key\>

Defined in: [core.ts:106](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L106)

## Since

1.0.0

Represents a fully constructed Truenum object.

A Truenum bundles compile-time string keys with optional runtime validation,
labeling, and i18n. It exposes methods for membership checks and conversions,
ensuring zero overhead for typical usage. Each property is strictly typed and
designed for safe, minimalistic usage.

## Type Parameters

• **Key** *extends* `string`

Constrained string literal type for enumerated keys.

## Properties

### type

> `readonly` **type**: `Key`

Defined in: [core.ts:115](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L115)

Placeholder property used for extracting the string-literal type.

#### Since

1.0.0

#### Remarks

Not meant for direct usage. Declared to anchor the union type in TS.

***

### keys

> `readonly` **keys**: readonly `Key`[]

Defined in: [core.ts:129](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L129)

The immutable array of all valid keys in this Truenum.

#### Since

1.0.0

#### Remarks

Useful for iteration or enumerating valid possibilities.

#### Example

```ts
console.log(Fruit.keys); // ['APPLE','BANANA']
```

***

### values

> `readonly` **values**: `{ readonly [K in string]: K }`

Defined in: [core.ts:143](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L143)

A value map from each key to itself, providing both runtime and compile-time references.

#### Since

1.0.0

#### Remarks

This can help link enumerated keys with object-literal usage.

#### Example

```ts
console.log(Fruit.values.APPLE); // 'APPLE'
```

***

### zodSchema

> `readonly` **zodSchema**: `ZodEnum`\<\[`Key`, `...Key[]`\]\>

Defined in: [core.ts:279](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L279)

Provides a Zod schema enumerating all valid keys for optional runtime validation.

#### Since

1.0.0

#### Remarks

This offers a direct approach to integrate with Zod-based validation pipelines.

#### Example

```ts
const parseFruit = Fruit.zodSchema.parse('APPLE'); // 'APPLE'
Fruit.zodSchema.parse('INVALID'); // throws ZodError
```

## Methods

### is()

> **is**(`input`): `input is Key`

Defined in: [core.ts:173](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L173)

Checks if the given input is one of the valid keys.

#### Parameters

##### input

`unknown`

Potential value to check against valid Truenum keys.

#### Returns

`input is Key`

True if `input` is a valid Truenum key, false otherwise.

#### Since

1.0.0

#### Throws

No direct error thrown, always returns a boolean.

#### Examples

```ts
// Basic usage
console.log(Fruit.is('APPLE')); // true
console.log(Fruit.is('ORANGE')); // false
```

```ts
// Checking unknown
function safeCheck(x: unknown) {
  if (Fruit.is(x)) console.log('Valid fruit!');
  else console.warn('Not a fruit.');
}
```

```ts
// Edge case with numeric or other types
console.log(Fruit.is(123)); // false
```

#### See

[createTruenum](../functions/createTruenum.md), [subsetTruenum](../functions/subsetTruenum.md)

***

### assert()

> **assert**(`input`, `errMsg`?): `asserts input is Key`

Defined in: [core.ts:203](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L203)

Asserts that the provided input is a valid Truenum key, or throws an error.

#### Parameters

##### input

`unknown`

Potential value to validate as a Truenum key.

##### errMsg?

`string`

Optional custom error prefix for thrown exceptions.

#### Returns

`asserts input is Key`

Returns nothing if validation passes.

#### Since

1.0.0

#### Throws

If the input is invalid, with a message including the keys.

#### Examples

```ts
Fruit.assert('APPLE'); // passes silently
Fruit.assert('ORANGE'); // throws
```

```ts
// With a custom message
Fruit.assert('ORANGE', 'Unexpected item.');
// => throws "Unexpected item. Value "ORANGE" is not a valid key..."
```

```ts
// Edge usage with type narrowing
const maybeFruit: unknown = 'BANANA';
Fruit.assert(maybeFruit);
// now maybeFruit is typed as 'BANANA'
```

#### See

[compareTruenumKeys](../functions/compareTruenumKeys.md), [buildZodSchema](../functions/buildZodSchema.md)

***

### serialize()

> **serialize**(`key`): `string`

Defined in: [core.ts:218](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L218)

Converts a valid Truenum key to a plain string, throwing on invalid usage.

#### Parameters

##### key

`Key`

The enumerated key to serialize.

#### Returns

`string`

The same string value if valid.

#### Since

1.0.0

#### Throws

If `key` is not part of the Truenum.

#### Example

```ts
Fruit.serialize('APPLE'); // 'APPLE'
Fruit.serialize('INVALID'); // throws
```

***

### deserialize()

> **deserialize**(`input`): `Key`

Defined in: [core.ts:233](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L233)

Converts an arbitrary string back into a valid Truenum key, or throws.

#### Parameters

##### input

`string`

The string to deserialize into a valid key.

#### Returns

`Key`

The typed key if recognized.

#### Since

1.0.0

#### Throws

If `input` is not one of the known keys.

#### Example

```ts
Fruit.deserialize('BANANA'); // 'BANANA'
Fruit.deserialize('UNKNOWN'); // throws
```

***

### getLabel()

> **getLabel**(`key`): `undefined` \| `string`

Defined in: [core.ts:248](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L248)

Retrieves the label text for a given key, or undefined if none is set.

#### Parameters

##### key

`Key`

A valid key within this Truenum.

#### Returns

`undefined` \| `string`

The label if present, otherwise `undefined`.

#### Since

1.0.0

#### Throws

If the provided key is invalid.

#### Example

```ts
Fruit.getLabel('APPLE'); // e.g. "Red Apple"
Fruit.getLabel('UNKNOWN'); // throws
```

***

### getTranslation()

> **getTranslation**(`key`, `langCode`): `undefined` \| `string`

Defined in: [core.ts:264](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L264)

Retrieves a localized string for a given key/locale if available.

#### Parameters

##### key

`Key`

The valid Truenum key for which to get translations.

##### langCode

`string`

The locale code (e.g. 'en','fr') to retrieve.

#### Returns

`undefined` \| `string`

Returns the translation if found, else `undefined`.

#### Since

1.0.0

#### Throws

If `key` is invalid or unsupported.

#### Example

```ts
Fruit.getTranslation('APPLE', 'en'); // 'Apple'
Fruit.getTranslation('APPLE', 'jp'); // possibly undefined
```
