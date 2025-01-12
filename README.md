# Truenums &nbsp; <br/><sub><sup>*Type-safe, zero-cost TypeScript enums with runtime checks, subsets, i18n, and more.*</sup></sub>

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/ethan-wickstrom/truenums/actions)
[![bun](https://img.shields.io/badge/Bun-%3E%3D1.0-blue.svg?style=flat-square)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## The Problem

Many developers struggle with TypeScript’s built-in enums, citing extra runtime overhead, confusion between numeric vs. string enums, difficulty with partial usage, and limited extensibility. While literal union types avoid some pitfalls, they still leave gaps when it comes to labeling, i18n, or straightforward runtime validation.

## The Solution

**Truenums** gives you compile-time *string-literal* unions that vanish into plain strings at runtime—**zero overhead**. It also offers optional runtime validation (via [Zod](https://github.com/colinhacks/zod)), i18n, subset extraction, and compositional merges. Perfect for scenarios where you crave enumerations that are:

1. **Safer** than plain string unions (optionally validated at runtime).  
2. **More flexible** than native TypeScript enums (complete with labeling & translations).  
3. **Lightweight** in production builds (no extra runtime objects or overhead).  
4. **Extensible** with subsets, merges, and partial overrides of labels or i18n.

## Table of Contents

1. [Installation](#installation)
2. [Quick Example](#quick-example)
3. [Core API](#core-api)
   - [createTruenum](#createtruenum)
   - [subsetTruenum](#subsettruenum)
   - [composeTruenum](#composetruenum)
   - [Helper Utilities](#helper-utilities)
4. [Advanced Usage](#advanced-usage)
   - [Labels & i18n](#labels--i18n)
   - [Runtime Validation](#runtime-validation)
   - [Subsets](#subsets)
   - [Compositions](#compositions)
   - [Exhaustive Checking](#exhaustive-checking)
5. [Contributing](#contributing)
6. [FAQ](#faq)
7. [License](#license)

## Installation

You can install **Truenums** via [Bun](https://bun.sh) or NPM/Yarn. Although optimized for Bun, it works seamlessly in other TypeScript workflows:

```bash
# With Bun:
bun add truenums

# Alternatively:
npm install truenums
# or
yarn add truenums
```

Truenums targets **TypeScript 5.0+** for robust type inference. Make sure your config (`tsconfig.json`) has `"strict": true` for best results.

## Quick Example

Below is a basic demonstration of **Truenums** in action:

```ts
import { createTruenum } from 'truenums';

// 1) Define an enumeration
const Colors = createTruenum({
  members: ['RED', 'GREEN', 'BLUE'] as const,
  labels: {
    RED: 'Red color',
    GREEN: 'Green color',
    BLUE: 'Blue color',
  },
});

// 2) Use it at compile time
type ColorType = typeof Colors.type;   // "RED" | "GREEN" | "BLUE"

// 3) Check membership at runtime
console.log(Colors.is('RED'));        // true
console.log(Colors.is('PURPLE'));     // false

// 4) Validate or throw if invalid
Colors.assert('GREEN');               // passes
// Colors.assert('MAGENTA');          // throws an Error

// 5) Get label / do translations
console.log(Colors.getLabel('RED'));  // "Red color"
```

**Truenums** produce:

- **No overhead** in compiled JS—just string checks and minimal object lookups.
- **Full type safety** for union keys (`"RED" | "GREEN" | "BLUE"`).
- **Optional features**: Zod schema generation, i18n, subsets, composable merges.

## Core API

### createTruenum

```ts
function createTruenum<Key extends string>(
  config: {
    members: readonly Key[];
    name?: string;
    labels?: Readonly<Record<Key, string>>;
    i18n?: Readonly<Record<Key, Readonly<Record<string, string>>>>;
  }
): Truenum<Key>;
```

**Purpose**: Constructs a typed enumeration from an array of string literal members.

**Key points**:

- `members`: required array of unique string literals.  
- `labels`: optional labels dictionary for user-friendly text.  
- `i18n`: optional dictionary of dictionaries for multi-locale translations.  
- Returns an object with:
  - `keys`: readonly array of `Key`.
  - `is(input)`: type guard for membership.
  - `assert(input)`: throws an error if invalid.
  - `serialize(key)`: returns a string key (throws if invalid).
  - `deserialize(input)`: returns a typed key (throws if input not in members).
  - `getLabel(key)`: returns label if available.
  - `getTranslation(key, lang)`: returns i18n if available.
  - `zodSchema`: a Zod schema for optional runtime validation.

### subsetTruenum

```ts
function subsetTruenum<ParentKey extends string, SubsetKey extends ParentKey>(
  parent: Truenum<ParentKey>,
  subsetMembers: readonly SubsetKey[],
  opts?: {
    name?: string;
    labels?: Partial<Record<SubsetKey, string>>;
    i18n?: Partial<Record<SubsetKey, Readonly<Record<string, string>>>>;
  }
): Truenum<SubsetKey>;
```

**Purpose**: Creates a smaller “child” enumeration from a parent’s keys, preserving type safety and optionally overriding labels/i18n.

**Key points**:

- Validates that all `subsetMembers` exist in the parent.
- Inherits or merges label/i18n fields from the parent, with optional overrides.
- Perfect for restricting an enum to just the keys you need in certain contexts.

### composeTruenum

```ts
function composeTruenum<
  Tuple extends readonly Truenum<string>[],
  UnionKey extends Tuple[number]['type'],
>(
  truenums: Tuple,
  opts?: {
    name?: string;
    labels?: Partial<Record<UnionKey, string>>;
    i18n?: Partial<Record<UnionKey, Readonly<Record<string, string>>>>;
  }
): Truenum<UnionKey>;
```

**Purpose**: Combines multiple distinct truenums into one larger enumeration. Merges their labels/i18n seamlessly. Ensures keys are disjoint—throws if duplicates.

**Key points**:

- Great for “merging” enumerations like `Fruit` + `Vegetable` => `Food`.
- Each sub-enum must have unique keys or an error is thrown.
- Optionally override or fill in missing label/i18n properties in `opts`.

### Helper Utilities

- **`assertExhaustive(value, msg?)`**  
  Asserts that `value` is `never`. Useful to ensure *exhaustive* switch/case logic. If reached, it throws a runtime error.

- **`compareTruenumKeys(a, b)`**  
  Simple alphabetical comparison (`-1 | 0 | 1`). Handy in sorted arrays or if your code requires stable ordering.

- **`buildZodSchema(truenum)`**  
  Returns a `z.ZodEnum` built from the Truenum’s keys. Equivalent to `truenum.zodSchema` but can be used if you want a separate reference.

## Advanced Usage

### Labels & i18n

You can localize or label each key with `labels` or the nested `i18n` structure:

```ts
const Sizes = createTruenum({
  members: ['SM', 'MD', 'LG'] as const,
  labels: {
    SM: 'Small', 
    MD: 'Medium',
    LG: 'Large',
  },
  i18n: {
    SM: { en: 'Small', fr: 'Petit' },
    MD: { en: 'Medium', fr: 'Moyen' },
    LG: { en: 'Large', fr: 'Grand' },
  }
});

console.log(Sizes.getLabel('SM'));          // "Small"
console.log(Sizes.getTranslation('LG','fr'))// "Grand"
```

### Runtime Validation

Each Truenum offers a `.zodSchema` property for runtime validation:

```ts
import { z } from 'zod';
const Days = createTruenum({
  members: ['MON','TUE','WED'] as const,
});
const daySchema = Days.zodSchema.default('MON');
console.log(daySchema.parse(undefined)); // "MON"
console.log(daySchema.parse('WED'));    // "WED"
daySchema.parse('FRI');                // throws ZodError
```

This is optional. If you prefer a different validation library, you can do something similar by reading `Days.keys`.

### Subsets

Use `subsetTruenum()` if you only need a partial set of keys:

```ts
const AllColors = createTruenum({
  members: ['RED','GREEN','BLUE','YELLOW'] as const
});

const Primary = subsetTruenum(AllColors, ['RED','BLUE'] as const, {
  labels: {
    RED: 'Primary Red' 
  }
});

console.log(Primary.keys); // ["RED","BLUE"]
Primary.assert('GREEN');   // throws
```

### Compositions

Use `composeTruenum()` to combine enumerations:

```ts
const Fruits = createTruenum({ members: ['APPLE','BANANA'] as const });
const Veggies = createTruenum({ members: ['CARROT','PEA'] as const });

const Food = composeTruenum([Fruits, Veggies], {
  labels: { APPLE: 'Red Apple' },
});
console.log(Food.keys); // ["APPLE","BANANA","CARROT","PEA"]
```

### Exhaustive Checking

`assertExhaustive(x: never)` helps with compile-time verification:

```ts
function colorToHex(color: 'RED'|'GREEN'|'BLUE') {
  switch(color) {
    case 'RED':   return '#FF0000';
    case 'GREEN': return '#00FF00';
    case 'BLUE':  return '#0000FF';
    default:      return assertExhaustive(color);
  }
}
```

If you add `"YELLOW"` to your type but forget to handle it, TypeScript will complain. If you manage to slip it through, the runtime throws an error.

## Contributing

Contributions are welcome, from bug reports to new feature proposals. To get started:

1. **Clone & install**:

   ```bash
   git clone https://github.com/ethan-wickstrom/truenums.git
   cd truenums
   bun install
   ```

2. **Build & test**:

   ```bash
   bun run build
   bun test
   ```

   This project uses [Bun’s test runner](https://bun.sh/docs/cli/test). Make sure all tests pass before creating a pull request.

3. **Open a PR**:
   - Follow the [commit message guidelines](./HOW_TO_WRITE_COMMIT_MESSAGES.md).
   - Target the **main** branch.
   - Include relevant tests for your change.

For significant changes, please open an issue first to discuss your proposal. We love hearing your ideas for making Truenums even better!

## FAQ

**1. Does Truenums rely on a custom TS transformer?**  
No. It’s standard TypeScript. The code is shaped such that in compiled JS, you only have simple `string` checks.  

**2. Can I skip Zod?**  
Absolutely. That’s optional for folks who want robust runtime checks. You can ignore `.zodSchema` entirely.  

**3. Does it only work in Bun?**  
Not strictly. Bun is recommended for its fast TS/JS environment, but the compiled output is just JavaScript. It should work in Node or other bundlers too, as long as the TS version is high enough (5.0+).  

**4. Why “zero-cost”**?  
All type logic is erased at compile time. The runtime object is minimal—just an array of keys and simple lookup methods.  

**5. Is there a performance overhead to i18n or labels?**  
If you define them, it’s just an extra property. If not, they’re undefined. Access is just a direct object lookup. Very minimal overhead.  

**6. Are subsets & compositions able to handle partial overrides?**  
Yes! That’s precisely the design. Subsets can override selected labels or translations. Compositions unify multiple truenums, and you can override shared properties in the final step.  

## License

This project is [MIT licensed](./LICENSE.txt). You’re free to use, modify, and distribute it under the MIT terms. Enjoy crafting safer enumerations in your TypeScript projects!

## Tests

**Truenums**: *Truly typed enumerations without the baggage.*  
Check out [the tests](./test/truenums.test.ts) for real usage examples and see how zero-cost enumerations can power up your codebase!
