# Function: assertExhaustive()

> **assertExhaustive**(`x`, `msg`?): `never`

Defined in: [core.ts:1163](https://github.com/ethan-wickstrom/truenums/blob/b5a11edef0163b51f94dc242f445389d81c0496c/src/core.ts#L1163)

## Parameters

### x

`never`

The value that is presumed to be `never`.

### msg?

`string`

Optional custom message to throw if an unreachable path occurs.

## Returns

`never`

Always throws an error, returning no usable value.

## Since

1.0.0

Asserts exhaustive switch coverage at runtime.

This function forcibly throws an error if called, signaling that a supposedly
unreachable code path was reached. It doubles as a compile-time check ensuring
all cases in a switch are handled. If you add a new variant and forget to cover
it, TypeScript will flag `assertExhaustive`.

## Throws

If invoked, meaning the switch/case was not exhaustive.

## Examples

```ts
type Fruit = 'APPLE'|'BANANA';
function color(f: Fruit): string {
  switch(f) {
    case 'APPLE': return 'red';
    case 'BANANA': return 'yellow';
    default: return assertExhaustive(f);
  }
}
```

```ts
// With a custom message
default: return assertExhaustive(someValue, 'Unreachable block');
```

```ts
// Edge usage in if-checks
declare function neverReach(n: never):never;
neverReach(assertExhaustive('IMPOSSIBLE' as never));
// => throws
```

## See

[createTruenum](createTruenum.md), [compareTruenumKeys](compareTruenumKeys.md)
