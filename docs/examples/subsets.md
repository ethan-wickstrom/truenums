# Subsets & Composition

Truenums provides powerful tools for creating smaller, specialized enums from larger ones and composing multiple enums together.

## Creating Subsets

Create specialized enums from a parent enum:

```typescript
const HTTPStatus = createTruenum({
  members: [
    'OK', 'CREATED', 'ACCEPTED',
    'BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND',
    'SERVER_ERROR'
  ] as const,
  labels: {
    OK: '200 OK',
    CREATED: '201 Created',
    ACCEPTED: '202 Accepted',
    BAD_REQUEST: '400 Bad Request',
    UNAUTHORIZED: '401 Unauthorized',
    FORBIDDEN: '403 Forbidden',
    NOT_FOUND: '404 Not Found',
    SERVER_ERROR: '500 Internal Server Error'
  }
});

// Create a subset of success codes
const SuccessCodes = subsetTruenum(HTTPStatus, ['OK', 'CREATED', 'ACCEPTED'] as const);

// Create a subset of error codes with new labels
const ErrorCodes = subsetTruenum(
  HTTPStatus,
  ['BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'SERVER_ERROR'] as const,
  {
    labels: {
      BAD_REQUEST: 'Client sent an invalid request',
      UNAUTHORIZED: 'Authentication required',
      FORBIDDEN: 'Permission denied',
      NOT_FOUND: 'Resource not found',
      SERVER_ERROR: 'Server encountered an error'
    }
  }
);
```

## Composing Enums

Combine multiple enums into a single enum:

```typescript
const Fruits = createTruenum({
  members: ['APPLE', 'BANANA', 'ORANGE'] as const
});

const Vegetables = createTruenum({
  members: ['CARROT', 'BROCCOLI', 'SPINACH'] as const
});

// Combine into a single FoodType enum
const FoodType = composeTruenum([Fruits, Vegetables]);

// Fully type-safe
type Food = typeof FoodType.type; // 'APPLE' | 'BANANA' | 'ORANGE' | 'CARROT' | 'BROCCOLI' | 'SPINACH'
```

## Overriding Properties

Both `subsetTruenum` and `composeTruenum` support overriding labels and i18n data:

```typescript
const Food = composeTruenum([Fruits, Vegetables], {
  labels: {
    APPLE: 'Red Apple',
    CARROT: 'Fresh Carrot'
  },
  i18n: {
    APPLE: { fr: 'Pomme Rouge' },
    CARROT: { fr: 'Carotte Fraîche' }
  }
});
```