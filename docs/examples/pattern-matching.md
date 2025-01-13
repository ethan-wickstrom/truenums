# Pattern Matching with Truenums

Truenums works seamlessly with TypeScript's control flow analysis and exhaustive pattern matching.

## Switch Exhaustiveness

The `assertExhaustive` helper ensures all cases are handled at compile-time:

```typescript
import { assertExhaustive, createTruenum } from 'truenums';

const AlertType = createTruenum({
  members: ['INFO', 'WARNING', 'ERROR'] as const,
  labels: {
    INFO: 'Information',
    WARNING: 'Warning',
    ERROR: 'Error'
  }
});

function getAlertIcon(type: typeof AlertType.type): string {
  switch(type) {
    case 'INFO':
      return 'ℹ️';
    case 'WARNING':
      return '⚠️';
    case 'ERROR':
      return '🚫';
    default:
      // Compile error if not all cases handled
      return assertExhaustive(type);
  }
}
```

## Object Literal Pattern Matching

Use object literals for cleaner matching:

```typescript
const CardinalDirection = createTruenum({
  members: ['NORTH', 'SOUTH', 'EAST', 'WEST'] as const
});

const directionVectors = {
  NORTH: { x: 0, y: 1 },
  SOUTH: { x: 0, y: -1 },
  EAST:  { x: 1, y: 0 },
  WEST:  { x: -1, y: 0 }
} as const;

// Type-safe lookup
function getVector(dir: typeof CardinalDirection.type) {
  return directionVectors[dir];
}
```

## Discriminated Unions

Combine with discriminated unions for rich pattern matching:

```typescript
const ActionType = createTruenum({
  members: ['INCREMENT', 'DECREMENT', 'RESET'] as const
});

type Action =
  | { type: 'INCREMENT', amount: number }
  | { type: 'DECREMENT', amount: number }
  | { type: 'RESET' };

function reducer(state: number, action: Action): number {
  switch(action.type) {
    case 'INCREMENT':
      return state + action.amount;
    case 'DECREMENT':
      return state - action.amount;
    case 'RESET':
      return 0;
    default:
      // Type error if any case is missing
      return assertExhaustive(action.type);
  }
}
```

## Visitor Pattern

Implement the visitor pattern:

```typescript
const Shape = createTruenum({
  members: ['CIRCLE', 'RECTANGLE', 'TRIANGLE'] as const
});

type ShapeVisitor<T> = {
  [K in typeof Shape.type]: (shape: ShapeData & { kind: K }) => T;
}

interface ShapeData {
  kind: typeof Shape.type;
  color: string;
}

const areaVisitor: ShapeVisitor<number> = {
  CIRCLE: (shape) => Math.PI * shape.radius ** 2,
  RECTANGLE: (shape) => shape.width * shape.height,
  TRIANGLE: (shape) => (shape.base * shape.height) / 2,
};

function calculateArea(shape: ShapeData): number {
  // Type-safe visitor dispatch
  return areaVisitor[shape.kind](shape as any);
}
```

## Custom Error Messages

Provide descriptive messages with `assertExhaustive`:

```typescript
function processEvent(event: typeof EventType.type) {
  switch (event) {
    case 'CONNECT':
      return handleConnect();
    case 'DISCONNECT':
      return handleDisconnect();
    // If you add a new event type, TypeScript will error here
    default:
      return assertExhaustive(
        event,
        `Unhandled event type: ${event}`
      );
  }
}
```