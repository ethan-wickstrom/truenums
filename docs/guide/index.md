# Getting Started

## Installation

```bash
npm install truenums
# or
yarn add truenums
# or
bun add truenums
```

## Basic Usage

```typescript
import { createTruenum } from 'truenums';

const Status = createTruenum({
  members: ['ACTIVE', 'INACTIVE'] as const,
  labels: {
    ACTIVE: 'Currently Active',
    INACTIVE: 'Not Active'
  }
});

// Type safe!
Status.is('ACTIVE'); // true
Status.is('PENDING'); // false, type error

// Runtime validation
Status.assert('ACTIVE'); // OK
Status.assert('INVALID'); // throws error

// Get human readable labels
console.log(Status.getLabel('ACTIVE')); // "Currently Active"
```

## Next Steps

- Read about [Basic Usage](/guide/basic-usage) to learn core concepts
- Check out [Examples](/examples/) for common patterns
- Browse the [API Reference](/api/) for detailed documentation