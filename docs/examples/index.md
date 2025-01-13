# Truenums Examples

Practical examples demonstrating key Truenums features.

## Simple Enums

Basic enum creation and usage:

```typescript
const CardSuit = createTruenum({
  members: ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'] as const,
  labels: {
    HEARTS: '♥️',
    DIAMONDS: '♦️',
    CLUBS: '♣️',
    SPADES: '♠️'
  }
});
```

## Type-Safe API Requests

Using Truenums with HTTP APIs:

```typescript
const RequestStatus = createTruenum({
  members: ['PENDING', 'SUCCESS', 'ERROR'] as const
});

type ApiResponse<T> = {
  status: typeof RequestStatus.type;
  data?: T;
  error?: string;
};

// Runtime validation
function processResponse(response: unknown): ApiResponse<unknown> {
  // Throws if status is invalid
  RequestStatus.assert(response.status);
  return response as ApiResponse<unknown>;
}
```

## Next Steps

- [Subsets and Composition](./subsets) - Building complex enums
- [I18n Support](./i18n) - Internationalization features
- [Pattern Matching](./pattern-matching) - Exhaustive switch cases