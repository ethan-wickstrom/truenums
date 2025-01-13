# Basic Usage Guide

## Core Features

Truenums combines the type safety of literal unions with powerful runtime validation and composition features.

## Creating a Truenum

Create a basic enum with `createTruenum`:

```typescript
import { createTruenum } from 'truenums';

const Status = createTruenum({
  members: ['ACTIVE', 'INACTIVE', 'DELETED'] as const,
  labels: {
    ACTIVE: 'Currently Active',
    INACTIVE: 'Temporarily Inactive',
    DELETED: 'Permanently Deleted'
  }
});

// Type checking
let status: typeof Status.type = 'ACTIVE'; // ✅ Valid
status = 'PENDING'; // ❌ Type error
```

## Runtime Validation

Safely validate untrusted input:

```typescript
function processStatus(input: unknown) {
  // Type guard
  if (Status.is(input)) {
    // input is now typed as 'ACTIVE' | 'INACTIVE' | 'DELETED'
    return input;
  }
  
  // Will throw if invalid
  Status.assert(input);
  
  // Safe parsing with Zod
  const parsed = Status.zodSchema.safeParse(input);
}
```

## Using Labels

Add human-readable labels for display:

```typescript
console.log(Status.getLabel('ACTIVE')); // "Currently Active"
```

## Serialization

Safely serialize and deserialize:

```typescript
const str = Status.serialize('ACTIVE'); // "ACTIVE"
const value = Status.deserialize(str); // Typed as Status.type
```

## Next Steps

- Learn about [composing and subsetting enums](./advanced-features)
- View the [i18n](../examples/i18n) example
- Check the full [API reference](../api/)