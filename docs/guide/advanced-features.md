# Advanced Features

## Exhaustive Switch Cases

Truenums helps enforce exhaustive switch cases using `assertExhaustive`:

```typescript
const PaymentStatus = createTruenum({
  members: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const
});

function processPayment(status: typeof PaymentStatus.type): string {
  switch (status) {
    case 'PENDING':
      return 'Payment pending';
    case 'PROCESSING':
      return 'Payment processing';
    case 'COMPLETED':
      return 'Payment completed';
    case 'FAILED':
      return 'Payment failed';
    default:
      return assertExhaustive(status); // Compile-time check for exhaustiveness
  }
}
```

## Integration with Zod

Every Truenum comes with a built-in Zod schema:

```typescript
const Status = createTruenum({
  members: ['ACTIVE', 'INACTIVE'] as const
});

// Get the schema directly
const schema = Status.zodSchema;

// Or use the helper
const schema2 = buildZodSchema(Status);

const parsed = schema.safeParse(untrustedInput);
```

## Custom Key Ordering

Sort enum keys with `compareTruenumKeys`:

```typescript
const sortedKeys = Status.keys.sort(compareTruenumKeys);
```

## Type-Safe API Validation

Validate API responses:

```typescript
const ResponseType = createTruenum({
  members: ['SUCCESS', 'ERROR'] as const
});

type ApiResponse<T> = {
  type: typeof ResponseType.type;
  data?: T;
  error?: string;
};

function validateResponse(response: unknown): ApiResponse<unknown> {
  // Runtime validation of the response type
  if (typeof response === 'object' && response !== null) {
    ResponseType.assert(response.type);
    return response as ApiResponse<unknown>;
  }
  throw new Error('Invalid response format');
}
```

## Next Steps

- See the [API Reference](../api/) for detailed documentation
- Check out more [examples](../examples/)