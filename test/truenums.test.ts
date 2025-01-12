import { describe, expect, it } from 'bun:test';
import {
  assertExhaustive,
  buildZodSchema,
  compareTruenumKeys,
  composeTruenum,
  createTruenum,
  subsetTruenum,
} from '@truenums/core';

// Top-level RegExp definitions to satisfy `useTopLevelRegex`:
const RE_MEMBERS_EMPTY = /members\[\] cannot be empty/;
const RE_DUPLICATE_KEYS_FOUND = /Duplicate keys found/;
const RE_SERIALIZE_INVALID = /serialize\(\) error: invalid key "INVALID"/;
const RE_DESERIALIZE_INVALID = /is invalid/;
const RE_GETLABEL_INVALID = /getLabel\(\) error: invalid key "FIVE"/;
const RE_GETTRANSLATION_INVALID = /getTranslation\(\) error: invalid key "DE"/;
const RE_NOT_MEMBER_OF_PARENT = /is not a member of parent/;
const RE_EMPTY_ARRAY_OF_TRUENUMS = /cannot compose empty array of truenums/;
const RE_NON_EXHAUSTIVE_SWITCH = /Non-exhaustive switch reached/;

describe('createTruenum()', () => {
  it('throws if members array is empty', () => {
    expect(() => {
      createTruenum({ members: [] as const });
    }).toThrowError(RE_MEMBERS_EMPTY);
  });

  it('throws if there are duplicate members', () => {
    expect(() => {
      createTruenum({
        members: ['apple', 'apple'] as const,
      });
    }).toThrowError(RE_DUPLICATE_KEYS_FOUND);
  });

  it('builds a valid Truenum with minimal config', () => {
    const Minimal = createTruenum({
      members: ['x', 'y'] as const,
    });
    expect(Minimal.keys).toEqual(['x', 'y']);
    expect(Minimal.values.x).toBe('x');
    expect(Minimal.is('z')).toBe(false);
  });

  it('serialize() throws if key is invalid', () => {
    const MyEnum = createTruenum({
      members: ['a', 'b'] as const,
    });
    // We cast to never to avoid `any` usage
    const invalidKey = 'INVALID' as never;
    expect(() => MyEnum.serialize(invalidKey)).toThrowError(
      RE_SERIALIZE_INVALID,
    );
  });

  it('deserialize() throws if input is invalid', () => {
    const MyEnum = createTruenum({
      members: ['fred', 'george'] as const,
    });
    expect(() => MyEnum.deserialize('random')).toThrowError(
      RE_DESERIALIZE_INVALID,
    );
  });

  it('getLabel() throws if key is invalid', () => {
    const MyEnum = createTruenum({
      members: ['one', 'two'] as const,
      labels: {
        one: 'label1',
        two: 'label2',
      },
    });
    const invalidKey = 'FIVE' as never;
    expect(() => MyEnum.getLabel(invalidKey)).toThrowError(RE_GETLABEL_INVALID);
  });

  it('getTranslation() throws if key is invalid', () => {
    const MyEnum = createTruenum({
      members: ['en', 'fr'] as const,
      i18n: {
        en: { en: 'English', fr: 'Anglais' },
        fr: { en: 'French', fr: 'Français' },
      },
    });
    const invalidKey = 'DE' as never;
    expect(() => MyEnum.getTranslation(invalidKey, 'en')).toThrowError(
      RE_GETTRANSLATION_INVALID,
    );
  });

  describe('existing tests: basic usage block', () => {
    const Colors = createTruenum({
      name: 'Colors',
      members: ['red', 'green', 'blue'] as const,
      labels: {
        red: 'Red Label',
        green: 'Green Label',
        blue: 'Blue Label',
      },
      i18n: {
        red: { en: 'Red', fr: 'Rouge' },
        green: { en: 'Green', fr: 'Vert' },
        blue: { en: 'Blue', fr: 'Bleu' },
      },
    });

    it('creates a Truenum object properly', () => {
      expect(Colors.keys).toEqual(['red', 'green', 'blue']);
      expect(Colors.values.red).toBe('red');
    });

    it('is() and assert() work', () => {
      expect(Colors.is('red')).toBe(true);
      expect(Colors.is('purple')).toBe(false);
      expect(() => Colors.assert('green')).not.toThrow();
      expect(() => Colors.assert('purple' as never)).toThrow();
    });

    it('serialize and deserialize', () => {
      const ser = Colors.serialize('blue');
      expect(ser).toBe('blue');
      expect(() => Colors.serialize('purple' as never)).toThrow();

      const de = Colors.deserialize('green');
      expect(de).toBe('green');
      expect(() => Colors.deserialize('magenta')).toThrow();
    });

    it('labels and i18n usage', () => {
      expect(Colors.getLabel('red')).toBe('Red Label');
      expect(Colors.getTranslation('green', 'fr')).toBe('Vert');
      expect(() => Colors.getTranslation('notColor' as never, 'fr')).toThrow();
    });

    it('zodSchema usage', () => {
      const schema = Colors.zodSchema;
      expect(schema.parse('red')).toBe('red');
      expect(() => schema.parse('magenta')).toThrow();
    });
  });
});

describe('subsetTruenum()', () => {
  it("throws if subset has key not in parent's keys", () => {
    const Parent = createTruenum({
      members: ['a', 'b'] as const,
    });
    expect(() => subsetTruenum(Parent, ['a', 'b'] as const)).not.toThrow();
    // Testing invalid key - using type assertion to test error case
    expect(() =>
      subsetTruenum(Parent, ['a', 'invalid' as 'a'] as const),
    ).toThrowError(RE_NOT_MEMBER_OF_PARENT);
  });

  it("merges parent's labels / i18n but respects overrides", () => {
    const Parent = createTruenum({
      members: ['red', 'blue', 'green'] as const,
      labels: {
        red: 'Parent Red',
        blue: 'Parent Blue',
        green: 'Parent Green',
      },
      i18n: {
        red: { en: 'Red-EN' },
        blue: { en: 'Blue-EN', fr: 'Blue-FR' },
        green: { en: 'Green-EN' },
      },
    });

    const SubColors = subsetTruenum(Parent, ['red', 'blue'] as const, {
      labels: {
        red: 'Sub Red',
        blue: 'Sub Blue',
      },
      i18n: {
        red: { en: 'Red Overridden' },
        blue: { fr: 'Blue Overridden FR' },
      },
    });

    expect(SubColors.getLabel('red')).toBe('Sub Red');
    expect(SubColors.getLabel('blue')).toBe('Sub Blue');

    expect(SubColors.getTranslation('red', 'en')).toBe('Red Overridden');
    expect(SubColors.getTranslation('blue', 'en')).toBe('Blue-EN');
    expect(SubColors.getTranslation('blue', 'fr')).toBe('Blue Overridden FR');
  });

  it("merges parent's i18n from each sub-truenum (partial coverage)", () => {
    const Fruit = createTruenum({
      members: ['apple', 'banana'] as const,
      i18n: {
        apple: { en: 'AppleEN', fr: 'PommeFR' },
        banana: { en: 'BananaEN', fr: 'BananeFR' },
      },
    });
    const Veg = createTruenum({
      members: ['carrot'] as const,
      i18n: {
        carrot: { en: 'CarrotEN', de: 'KarotteDE' },
      },
    });

    type FruitKey = typeof Fruit.type;
    type VegKey = typeof Veg.type;
    type FoodKey = FruitKey | VegKey;

    const Food = composeTruenum<[typeof Fruit, typeof Veg], FoodKey>(
      [Fruit, Veg],
      {
        i18n: {
          apple: { fr: 'PommeFR-Override' },
          carrot: { en: 'Carrot Overridden EN' },
        },
      },
    );

    expect(Food.getTranslation('apple', 'en')).toBe('AppleEN');
    expect(Food.getTranslation('apple', 'fr')).toBe('PommeFR-Override');
    expect(Food.getTranslation('banana', 'fr')).toBe('BananeFR');
    expect(Food.getTranslation('carrot', 'en')).toBe('Carrot Overridden EN');
    expect(Food.getTranslation('carrot', 'de')).toBe('KarotteDE');
  });

  describe('existing tests: subsetTruenum block', () => {
    it('creates a subset of a bigger enum', () => {
      const FullColor = createTruenum({
        members: ['red', 'green', 'blue', 'yellow'] as const,
      });

      const PrimaryColor = subsetTruenum(FullColor, ['red', 'blue'] as const, {
        labels: {
          red: 'A Red',
          blue: 'A Blue',
        },
      });

      expect(PrimaryColor.keys).toEqual(['red', 'blue']);
      expect(() => PrimaryColor.assert('green' as never)).toThrow();
      expect(PrimaryColor.getLabel('blue')).toBe('A Blue');
    });
  });
});

describe('composeTruenum()', () => {
  it('throws if empty array of truenums is given', () => {
    expect(() => composeTruenum([], {})).toThrowError(
      RE_EMPTY_ARRAY_OF_TRUENUMS,
    );
  });

  it("merges parent's i18n from each sub-truenum (partial coverage)", () => {
    const Fruit = createTruenum({
      members: ['apple', 'banana'] as const,
      i18n: {
        apple: { en: 'AppleEN', fr: 'PommeFR' },
        banana: { en: 'BananaEN', fr: 'BananeFR' },
      },
    });
    const Veg = createTruenum({
      members: ['carrot'] as const,
      i18n: {
        carrot: { en: 'CarrotEN', de: 'KarotteDE' },
      },
    });

    type FruitKey = typeof Fruit.type;
    type VegKey = typeof Veg.type;
    type FoodKey = FruitKey | VegKey;

    const Food = composeTruenum<[typeof Fruit, typeof Veg], FoodKey>(
      [Fruit, Veg],
      {
        i18n: {
          apple: { fr: 'PommeFR-Override' },
          carrot: { en: 'Carrot Overridden EN' },
        },
      },
    );

    expect(Food.getTranslation('apple', 'en')).toBe('AppleEN');
    expect(Food.getTranslation('apple', 'fr')).toBe('PommeFR-Override');
    expect(Food.getTranslation('banana', 'fr')).toBe('BananeFR');
    expect(Food.getTranslation('carrot', 'en')).toBe('Carrot Overridden EN');
    expect(Food.getTranslation('carrot', 'de')).toBe('KarotteDE');
  });

  describe('existing tests: composeTruenum block', () => {
    it('merges multiple enums, disjoint keys', () => {
      const Fruits = createTruenum({ members: ['apple', 'banana'] as const });
      const Veggies = createTruenum({ members: ['carrot', 'pea'] as const });

      type FruitKey = typeof Fruits.type;
      type VegKey = typeof Veggies.type;
      type FoodKey = FruitKey | VegKey;

      const Food = composeTruenum<[typeof Fruits, typeof Veggies], FoodKey>(
        [Fruits, Veggies],
        {
          labels: {
            apple: 'Red Apple',
            banana: 'Yellow Banana',
            carrot: 'Carrot Label',
            pea: 'Pea Label',
          },
        },
      );

      expect(Food.keys).toEqual(['apple', 'banana', 'carrot', 'pea']);
      expect(Food.getLabel('pea')).toBe('Pea Label');
      expect(() => Food.assert('meat' as never)).toThrow();
    });

    it('throws if duplicates exist', () => {
      const Fruits = createTruenum({ members: ['apple', 'banana'] as const });
      const MoreFruits = createTruenum({
        members: ['apple', 'orange'] as const,
      });
      expect(() => composeTruenum([Fruits, MoreFruits])).toThrowError(
        RE_DUPLICATE_KEYS_FOUND,
      );
    });
  });
});

// biome-ignore lint/nursery/noSecrets: This is a test
describe('compareTruenumKeys()', () => {
  it('correctly compares two strings', () => {
    expect(compareTruenumKeys('apple', 'banana')).toBe(-1);
    expect(compareTruenumKeys('banana', 'apple')).toBe(1);
    expect(compareTruenumKeys('carrot', 'carrot')).toBe(0);
  });
});

// biome-ignore lint/nursery/noSecrets: This is a test
describe('assertExhaustive()', () => {
  it('enforces exhaustive checks in switch statements', () => {
    type Fruit = 'apple' | 'banana';
    function color(fruit: Fruit): string {
      switch (fruit) {
        case 'apple':
          return 'red';
        case 'banana':
          return 'yellow';
        default:
          return assertExhaustive(fruit);
      }
    }
    expect(color('apple')).toBe('red');
  });

  it('throws an error with default message if no custom msg is provided', () => {
    try {
      assertExhaustive('thisIsNever' as never);
      expect(true).toBe(false);
    } catch (err) {
      expect((err as Error).message).toMatch(RE_NON_EXHAUSTIVE_SWITCH);
    }
  });

  it('throws an error with a custom message if provided', () => {
    try {
      assertExhaustive('neverValue' as never, 'Custom Exhaustive Error');
    } catch (err) {
      expect((err as Error).message).toBe('Custom Exhaustive Error');
    }
  });
});

// biome-ignore lint/nursery/noSecrets: This is a test
describe('buildZodSchema()', () => {
  it('returns the built zod schema', () => {
    const Status = createTruenum({
      members: ['active', 'inactive'] as const,
    });
    const statusSchema = buildZodSchema(Status).default('active');
    expect(statusSchema.parse('inactive')).toBe('inactive');
    expect(statusSchema.parse(undefined)).toBe('active');
    expect(() => statusSchema.parse('badValue')).toThrow();
  });

  it('works on an enum with a single key (edge case)', () => {
    const Single = createTruenum({
      members: ['only'] as const,
    });
    const singleSchema = buildZodSchema(Single);
    expect(singleSchema.parse('only')).toBe('only');
    expect(() => singleSchema.parse('notOnly')).toThrow();
  });
});
