# Truenums

**Type-safe, zero-cost TypeScript enums with advanced features like runtime validation, i18n, subsets, and composition. Built for Bun.**

Truenums provides a way to define and manipulate TypeScript "enums" that are internally just string-literal unions—meaning your production code remains tiny and your compile-time checks remain strong.

## Why Truenums?

Let's first discuss the story of TypeScript, its philosophy, and how it's evolved over the years, particularly in the context of enums.

TypeScript began as Microsoft's ambitious attempt to bring order to JavaScript's wild west. Its mission was clear: add static typing to JavaScript without breaking its fundamental nature. Early design decisions reflected this balance—including the introduction of enums, a feature beloved in languages like Java and C#.

These enums seemed perfect at first. They offered familiar territory for developers coming from statically-typed languages, complete with numeric auto-incrementing and reverse mappings. But as TypeScript projects grew larger and the community gained experience, cracks began to show.

Developers discovered that TypeScript enums, while convenient, carried hidden costs. Each enum generated additional JavaScript code—reverse mappings and value objects that bloated bundles. Teams working on performance-critical applications started questioning whether this runtime overhead was worth the convenience.

Then came the rise of string literal unions. Simple, elegant, and true to TypeScript's nature as a type layer over JavaScript. No runtime overhead. No reverse mappings. No confusion. Just pure static typing that disappeared during compilation:

```ts
// The old way: TypeScript enum
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE"
}
// Compiles to complex JS objects with bidirectional mappings

// The new way: String literal union
type Status = "ACTIVE" | "INACTIVE";
// Compiles to nothing—pure type information
```

But string literal unions, while elegant, left gaps. How do you add human-readable labels? How do you handle internationalization? How do you compose and subset these types without losing type safety? The community needed something that combined the best of both worlds.

This is where Truenums enters the story. We designed it to embrace TypeScript's evolution toward zero-cost abstractions while solving real-world challenges:

```ts
// The Truenums way: Power meets simplicity
const Status = createTruenum({
  members: ["ACTIVE", "INACTIVE"] as const,
  labels: {
    ACTIVE: "Currently Active",
    INACTIVE: "Not Active"
  }
});
// Type-safe, minimal runtime code, rich features
```

Truenums represents a new chapter in TypeScript's enum story. It provides:

- The type safety of literal unions
- The feature richness of traditional enums
- The runtime efficiency modern applications demand
- The developer experience teams deserve

We built Truenums on three core principles:

1. **Zero-cost by default**: Pay only for features you use
2. **Type-safe always**: Leverage TypeScript's type system to its fullest
3. **Practical power**: Solve real problems without complexity

Whether you're building a small project or scaling a large application, Truenums offers a modern solution to enumeration that aligns with TypeScript's evolution toward simpler, safer, and more efficient code.

## Installation

```bash
# Using Bun:
bun add truenums

# Or using npm:
npm install truenums

# Or yarn:
yarn add truenums
```

Truenums requires TypeScript **5.0+** and works best under `"strict": true` in your `tsconfig.json`. Although we develop on Bun, the final output is standard JavaScript, so it should work seamlessly in Node, Deno, or other JavaScript runtimes.

## Usage Example

Below is a simplified snippet. See TSDoc comments in the code or the library’s generated docs for a thorough API reference here:
<https://ethan-wickstrom.github.io/truenums>.

```ts
import { createTruenum, subsetTruenum, composeTruenum } from 'truenums';

// Step 1: Create a base enumeration
const Fruit = createTruenum({
  members: ['APPLE', 'BANANA'] as const,
  labels: {
    APPLE: 'Red Apple',
    BANANA: 'Yellow Banana',
  },
});

// Step 2: Check membership
console.log(Fruit.is('APPLE')); // true
console.log(Fruit.is('ORANGE')); // false

// Step 3: Get or assert enumerated keys
Fruit.assert('BANANA'); // passes
// Fruit.assert('UNKNOWN'); // would throw an Error

// Step 4: Subset usage
const Citrus = subsetTruenum(Fruit, ['APPLE'] as const, {
  labels: { APPLE: 'Mostly an Apple' },
});
console.log(Citrus.getLabel('APPLE')); // "Mostly an Apple"

// Step 5: Composing multiple enumerations
const Veg = createTruenum({
  members: ['CARROT'] as const,
});
const Food = composeTruenum([Fruit, Veg]);
console.log(Food.keys); // ["APPLE","BANANA","CARROT"]
```

## Core Concepts

1. **Literal-based “enums”:** They are plain strings at runtime, but at compile time, you get strong checks.  
2. **Optional runtime checks:** With the integrated Zod schema, invalid data can be gracefully caught.  
3. **Subsets:** Build smaller enumerations from a parent’s keys, inheriting or overriding labels and translations.  
4. **Compositions:** Merge multiple enumerations (like combining “Fruits” and “Veggies” into “Food”).  

## Comparing to TypeScript Enums

Unlike native enums, Truenums do not generate additional runtime objects or reverse mappings. The library leverages string-literal unions—ensuring minimal overhead and clearer usage patterns. Also, we provide helper methods for:

- Serializing and deserializing  
- Validating membership  
- Overriding i18n or label properties  
- Checking for exhaustive coverage in switch statements  

All without polluting your final JavaScript with complicated enum artifacts.

## Advanced Usage

If you need to:

- Label your keys with user-friendly strings  
- Localize strings across multiple locales  
- Validate uncertain user input  
- Extend or compose enumerations dynamically  

Truenums covers those scenarios without sacrificing performance or clarity.

## Contributing

We welcome bug reports, feature requests, and pull requests. Before contributing:

1. Clone the repo:  

   ```bash
   git clone https://github.com/ethan-wickstrom/truenums.git
   cd truenums
   bun install
   ```

2. Build and test:  

   ```bash
   bun run lint
   bun run build
   bun test
   ```

3. Follow the commit message guidelines in [HOW_TO_WRITE_COMMIT_MESSAGES.md](./HOW_TO_WRITE_COMMIT_MESSAGES.md).

For major changes, open an issue to discuss your ideas first!

## License

This project is distributed under the [MIT License](./LICENSE). Feel free to use, modify, and distribute.

Check out the [test suite](./test/truenums.test.ts) for more real-world usage examples. For deeper details, consult the inline TSDoc in our source code or run your own doc generation to see everything Truenums can do.

Happy enumerating with Truenums!
