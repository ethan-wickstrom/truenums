# Truenums

> *Type-safe, zero-cost TypeScript enums with advanced features like runtime validation, i18n, subsets, and composition. Built for Bun.*

When you’re building modern TypeScript applications, you shouldn’t have to choose between powerful runtime validation and clean “zero-cost” compile-time enums. **Truenums** gives you both: typed enumerations that vanish to plain strings in production code, but provide advanced type safety and optional runtime checks during development. No overhead, no hidden complexities.

## Why Truenums?

**Traditional enum pitfalls**:

- Native TypeScript enums generate extra JavaScript code at runtime, can collide with existing values, and are not easily stripped out when type information is erased.  
- String unions alone give you no runtime safety and minimal introspection features.  

**Truenums** solves these problems by:

1. Creating compile-time typed “union-like” objects that vanish to **plain strings** when compiled—**zero overhead**.  
2. Providing **Zod integration** to add top-tier runtime validation when you need it.  
3. Allowing **labeling and localization** (i18n) out of the box, making enumerations friendly for user-facing contexts.  
4. Supporting **subsets** and **compositions** of enumerations, so you can easily reorganize or unify multiple sets of keys.

## Quick Start

### Installation

```bash
bun install
# or
bun add truenums
```

*(If you haven’t used [Bun](https://bun.sh) before, installing it is straightforward—check their docs!)*

### Basic Usage

```ts
import { createTruenum } from "truenums";

// 1) Declare your keys
const Fruit = createTruenum({
  name: "Fruit",
  members: ["APPLE", "BANANA", "ORANGE"] as const,
  labels: {
    APPLE: "Crisp apple",
    BANANA: "Sweet banana",
    ORANGE: "Citrus orange",
  },
  i18n: {
    APPLE: { en: "Apple", fr: "Pomme" },
    BANANA: { en: "Banana", fr: "Banane" },
    ORANGE: { en: "Orange", fr: "Orange" },
  },
});

// 2) Type usage
type FruitType = typeof Fruit.type; // "APPLE" | "BANANA" | "ORANGE"

// 3) Zero-cost in your runtime code
console.log(Fruit.keys);       // ["APPLE","BANANA","ORANGE"]
console.log(Fruit.values);     // { APPLE:"APPLE",BANANA:"BANANA",ORANGE:"ORANGE" }
console.log(Fruit.is("APPLE")) // true
console.log(Fruit.is("CARROT"))// false

Fruit.assert("BANANA");        // No error
// Fruit.assert("CARROT");     // Throws an error

// 4) Zod integration (optional)
import { z } from "zod";
const fruitSchema = Fruit.zodSchema; 
console.log(fruitSchema.parse("APPLE"));   // "APPLE"
try {
  fruitSchema.parse("CARROT");
} catch (e) {
  console.error("Invalid fruit!");
}
```

### Why It’s Zero-Cost

**Truenums** relies on string literals and compile-time TypeScript checks. When your app runs, these enumerations become **regular objects** with no fancy overhead—just straightforward property lookups like `Fruit.values.APPLE`. That’s it. The entire “type” system drops away at runtime.

### Subsets & Composition

**Subset**: If you have a large enumeration but only need a few valid keys in one area of your code, extract a smaller portion:

```ts
import { subsetTruenum } from "truenums";

const AllColors = createTruenum({
  members: ["RED","GREEN","BLUE","YELLOW"] as const,
  labels: {
    RED: "Bright Red",
    GREEN: "Forest Green",
    BLUE: "Ocean Blue",
    YELLOW: "Sunny Yellow"
  },
  i18n: {
    RED: { en: "Red", fr: "Rouge" },
    GREEN: { en: "Green", fr: "Vert" },
    BLUE: { en: "Blue", fr: "Bleu" },
    YELLOW: { en: "Yellow", fr: "Jaune" }
  }
});

// Create a subset with partial overrides
const PrimaryColors = subsetTruenum(AllColors, ["RED","BLUE"] as const, {
  labels: {
    RED: "Primary Red" // Override just one label
  },
  i18n: {
    BLUE: { fr: "Bleu Royal" } // Override just one translation
  }
});

console.log(PrimaryColors.keys);  // ["RED","BLUE"]
console.log(PrimaryColors.getLabel("RED")); // "Primary Red"
console.log(PrimaryColors.getLabel("BLUE")); // "Ocean Blue" (inherited)
console.log(PrimaryColors.getTranslation("BLUE", "fr")); // "Bleu Royal"
console.log(PrimaryColors.getTranslation("BLUE", "en")); // "Blue" (inherited)
```

**Compose**: Need to merge multiple discrete enumerations?

```ts
import { composeTruenum } from "truenums";

const Fruits = createTruenum({ 
  members: ["APPLE","BANANA"] as const,
  i18n: {
    APPLE: { en: "Apple", fr: "Pomme" },
    BANANA: { en: "Banana", fr: "Banane" }
  }
});

const Veggies = createTruenum({ 
  members: ["CARROT","PEA"] as const,
  i18n: {
    CARROT: { en: "Carrot", de: "Karotte" },
    PEA: { en: "Pea", de: "Erbse" }
  }
});

// Compose with partial overrides
const Food = composeTruenum([Fruits, Veggies], {
  labels: {
    APPLE: "Red Apple",
    BANANA: "Yellow Banana"
    // No need to specify all labels
  },
  i18n: {
    APPLE: { fr: "Pomme Rouge" }, // Override just one translation
    CARROT: { en: "Fresh Carrot" } // Keep other translations
  }
});

console.log(Food.keys); // ["APPLE","BANANA","CARROT","PEA"]
console.log(Food.getTranslation("APPLE", "fr")); // "Pomme Rouge"
console.log(Food.getTranslation("CARROT", "de")); // "Karotte" (inherited)
```

### Advanced Usage

**Localization**: Provide a single enum with i18n mappings. Then access them seamlessly with `.getTranslation(key, lang)`:

```ts
console.log(Fruit.getTranslation("APPLE","fr")); // "Pomme"
```

**Serialization**: Use `.serialize()` and `.deserialize()` if you want to ensure valid keys in database records, across network boundaries, or in logs. It’s default identity-based, but you can override the logic in your code.

**Exhaustive checks**: For code paths that must never be reached, call `assertExhaustive(x)`:

```ts
import { assertExhaustive } from "truenums";

function colorName(x: "RED"|"GREEN"|"BLUE") {
  switch (x) {
    case "RED":   return "red";
    case "GREEN": return "green";
    case "BLUE":  return "blue";
    default:      return assertExhaustive(x);
  }
}
```

If you ever add another member to the type but forget to handle it, the compiler will warn you—plus you’ll get a runtime error if you skip a branch.

### Contributing

Your ideas and contributions can make **Truenums** even better. Here’s how to get started:

1. **Clone & Install**  

   ```bash
   git clone https://github.com/ethan-wickstrom/truenums.git
   cd truenums
   bun install
   ```

2. **Build & Test**  

   ```bash
   bun run build
   bun test
   ```

   We use Bun’s built-in test runner. If you see something off, open an issue or submit a pull request with your fix.

3. **Suggest Enhancements**  
   Issues are welcome. If you have a strong argument for adding a new feature—like specialized serialization or synergy with frameworks—create a detailed proposal.

By participating, you’ll join a community that cares deeply about TypeScript correctness, zero-cost abstractions, and practical runtime checks.

## FAQ

**1. Do I need to run the Zod validation on every usage?**  
Not at all. You can skip or remove it in production. The `.zodSchema` property is purely optional for advanced runtime validation.  

**2. Does this library replace the official TypeScript `enum`?**  
Yes and no. `truenums` is a simpler alternative to `enum` or `const enum` because it eliminates runtime overhead and friction around partial usage. You get string-literal “keys” at compile time.  

**3. Is it limited to Bun?**  
While it’s optimized for Bun, the TypeScript logic itself is vanilla. You could use it with other bundlers, but we recommend Bun for maximum synergy.

**Make your enumerations clean, safe, and flexible.** With **Truenums**, you’ll never have to compromise between type-level rigor and runtime reliability.

Enjoy building with it—and if you do something neat, [send a PR](#contributing). We’d love to see how you push **Truenums** forward!
