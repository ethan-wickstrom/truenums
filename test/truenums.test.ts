import { describe, it, expect } from "bun:test";
import {
  createTruenum,
  subsetTruenum,
  composeTruenum,
  compareTruenumKeys,
  assertExhaustive,
  buildZodSchema,
} from "../src/index";

describe("createTruenum()", () => {

  it("throws if members array is empty", () => {
    // core.ts line ~99-101
    expect(() => {
      createTruenum({ members: [] as const });
    }).toThrowError(/members\[\] cannot be empty/);
  });

  it("throws if there are duplicate members", () => {
    // covers the check that sees if duplicates exist
    // same as lines ~uniqueSet usage
    expect(() => {
      createTruenum({
        members: ["APPLE", "APPLE"] as const,
      });
    }).toThrowError(/Duplicate keys found/);
  });

  it("builds a valid Truenum with minimal config", () => {
    // Basic check that everything still works if we omit name, labels, i18n
    const Minimal = createTruenum({
      members: ["X", "Y"] as const,
    });
    expect(Minimal.keys).toEqual(["X", "Y"]);
    expect(Minimal.values.X).toBe("X");
    expect(Minimal.is("Z")).toBe(false);
  });

  it("serialize() throws if key is invalid", () => {
    // coverage for lines ~116-117
    const MyEnum = createTruenum({
      members: ["A", "B"] as const,
    });
    expect(() => MyEnum.serialize("INVALID" as any)).toThrowError(
      /serialize\(\) error: invalid key "INVALID"/
    );
  });

  it("deserialize() throws if input is invalid", () => {
    // coverage for lines ~126-133
    const MyEnum = createTruenum({
      members: ["FRED", "GEORGE"] as const,
    });
    expect(() => MyEnum.deserialize("RANDOM")).toThrowError(/is invalid/);
  });

  it("getLabel() throws if key is invalid", () => {
    // coverage for lines ~139-142
    const MyEnum = createTruenum({
      members: ["ONE", "TWO"] as const,
      labels: {
        ONE: "label1",
        TWO: "label2",
      },
    });
    expect(() => MyEnum.getLabel("FIVE" as any)).toThrowError(
      /getLabel\(\) error: invalid key "FIVE"/
    );
  });

  it("getTranslation() throws if key is invalid", () => {
    // coverage for lines ~158-161
    const MyEnum = createTruenum({
      members: ["EN", "FR"] as const,
      i18n: {
        EN: { en: "English", fr: "Anglais" },
        FR: { en: "French", fr: "Français" },
      },
    });
    expect(() => MyEnum.getTranslation("DE" as any, "en")).toThrowError(
      /getTranslation\(\) error: invalid key "DE"/
    );
  });

  describe("existing tests: basic usage block", () => {
    const Colors = createTruenum({
      name: "Colors",
      members: ["RED", "GREEN", "BLUE"] as const,
      labels: {
        RED: "Red Label",
        GREEN: "Green Label",
        BLUE: "Blue Label",
      },
      i18n: {
        RED: { en: "Red", fr: "Rouge" },
        GREEN: { en: "Green", fr: "Vert" },
        BLUE: { en: "Blue", fr: "Bleu" },
      },
    });

    it("creates a Truenum object properly", () => {
      expect(Colors.keys).toEqual(["RED", "GREEN", "BLUE"]);
      expect(Colors.values.RED).toBe("RED");
    });

    it("is() and assert() work", () => {
      expect(Colors.is("RED")).toBe(true);
      expect(Colors.is("PURPLE")).toBe(false);
      expect(() => Colors.assert("GREEN")).not.toThrow();
      expect(() => Colors.assert("PURPLE")).toThrow();
    });

    it("serialize and deserialize", () => {
      const ser = Colors.serialize("BLUE");
      expect(ser).toBe("BLUE");
      expect(() => Colors.serialize("PURPLE" as any)).toThrow();

      const de = Colors.deserialize("GREEN");
      expect(de).toBe("GREEN");
      expect(() => Colors.deserialize("MAGENTA")).toThrow();
    });

    it("labels and i18n usage", () => {
      expect(Colors.getLabel("RED")).toBe("Red Label");
      expect(Colors.getTranslation("GREEN", "fr")).toBe("Vert");
      expect(() => Colors.getTranslation("NOT_COLOR" as any, "fr")).toThrow();
    });

    it("zodSchema usage", () => {
      const schema = Colors.zodSchema;
      expect(schema.parse("RED")).toBe("RED");
      expect(() => schema.parse("MAGENTA")).toThrow();
    });
  });
});

describe("subsetTruenum()", () => {

  it("throws if subset has key not in parent's keys", () => {
    const Parent = createTruenum({
      members: ["A", "B"] as const,
    });
    expect(() => subsetTruenum(Parent, ["A", "B"] as const)).not.toThrow();
    // @ts-expect-error - Testing invalid key
    expect(() => subsetTruenum(Parent, ["A", "X"] as const)).toThrowError(
      /is not a member of parent/
    );
  });

  it("merges parent's labels / i18n but respects overrides", () => {
    const Parent = createTruenum({
      members: ["RED","BLUE","GREEN"] as const,
      labels: {
        RED: "Parent Red",
        BLUE: "Parent Blue",
        GREEN: "Parent Green"
      },
      i18n: {
        RED: { en: "Red-EN" },
        BLUE: { en: "Blue-EN", fr: "Blue-FR" },
        GREEN: { en: "Green-EN" }
      }
    });

    const SubColors = subsetTruenum(Parent, ["RED","BLUE"] as const, {
      labels: {
        RED: "Sub Red",
        BLUE: "Sub Blue"
      },
      i18n: {
        RED: { en: "Red Overridden" },
        BLUE: { fr: "Blue Overridden FR" }
      }
    });

    expect(SubColors.getLabel("RED")).toBe("Sub Red");
    expect(SubColors.getLabel("BLUE")).toBe("Sub Blue");

    expect(SubColors.getTranslation("RED","en")).toBe("Red Overridden");
    expect(SubColors.getTranslation("BLUE","en")).toBe("Blue-EN");
    expect(SubColors.getTranslation("BLUE","fr")).toBe("Blue Overridden FR");
  });

  it("merges parent's i18n from each sub-truenum (partial coverage)", () => {
    const Fruit = createTruenum({
      members: ["APPLE", "BANANA"] as const,
      i18n: {
        APPLE: { en: "AppleEN", fr: "PommeFR" },
        BANANA: { en: "BananaEN", fr: "BananeFR" }
      }
    });
    const Veg = createTruenum({
      members: ["CARROT"] as const,
      i18n: {
        CARROT: { en: "CarrotEN", de: "KarotteDE" }
      }
    });

    type FoodKey = typeof Fruit.type | typeof Veg.type;
    const Food = composeTruenum<[typeof Fruit, typeof Veg], FoodKey>([Fruit, Veg], {
      i18n: {
        APPLE: { fr: "PommeFR-Override" },
        CARROT: { en: "Carrot Overridden EN" }
      }
    });

    expect(Food.getTranslation("APPLE","en")).toBe("AppleEN");
    expect(Food.getTranslation("APPLE","fr")).toBe("PommeFR-Override"); // override
    expect(Food.getTranslation("BANANA","fr")).toBe("BananeFR");
    expect(Food.getTranslation("CARROT","en")).toBe("Carrot Overridden EN");
    expect(Food.getTranslation("CARROT","de")).toBe("KarotteDE");
  });

  describe("existing tests: subsetTruenum block", () => {
    it("creates a subset of a bigger enum", () => {
      const FullColor = createTruenum({
        members: ["RED", "GREEN", "BLUE", "YELLOW"] as const,
      });

      const PrimaryColor = subsetTruenum(FullColor, ["RED", "BLUE"] as const, {
        labels: {
          RED: "A Red",
          BLUE: "A Blue",
        },
      });

      expect(PrimaryColor.keys).toEqual(["RED", "BLUE"]);
      expect(() => PrimaryColor.assert("GREEN" as any)).toThrow();
      expect(PrimaryColor.getLabel("BLUE")).toBe("A Blue");
    });
  });
});

describe("composeTruenum()", () => {

  it("throws if empty array of truenums is given", () => {
    expect(() => composeTruenum([] as any)).toThrowError(
      /cannot compose empty array of truenums/
    );
  });

  it("merges parent's i18n from each sub-truenum (partial coverage)", () => {
    const Fruit = createTruenum({
      members: ["APPLE", "BANANA"] as const,
      i18n: {
        APPLE: { en: "AppleEN", fr: "PommeFR" },
        BANANA: { en: "BananaEN", fr: "BananeFR" }
      }
    });
    const Veg = createTruenum({
      members: ["CARROT"] as const,
      i18n: {
        CARROT: { en: "CarrotEN", de: "KarotteDE" }
      }
    });

    type FoodKey = typeof Fruit.type | typeof Veg.type;
    const Food = composeTruenum<[typeof Fruit, typeof Veg], FoodKey>([Fruit, Veg], {
      i18n: {
        APPLE: { fr: "PommeFR-Override" },
        CARROT: { en: "Carrot Overridden EN" }
      }
    });

    expect(Food.getTranslation("APPLE","en")).toBe("AppleEN");
    expect(Food.getTranslation("APPLE","fr")).toBe("PommeFR-Override"); // override
    expect(Food.getTranslation("BANANA","fr")).toBe("BananeFR");
    expect(Food.getTranslation("CARROT","en")).toBe("Carrot Overridden EN");
    expect(Food.getTranslation("CARROT","de")).toBe("KarotteDE");
  });

  describe("existing tests: composeTruenum block", () => {
    it("merges multiple enums, disjoint keys", () => {
      const Fruits = createTruenum({ members: ["APPLE", "BANANA"] as const });
      const Veggies = createTruenum({ members: ["CARROT", "PEA"] as const });

      const Food = composeTruenum([Fruits, Veggies], {
        labels: {
          APPLE: "Red Apple",
          BANANA: "Yellow Banana",
          CARROT: "Carrot Label",
          PEA: "Pea Label",
        },
      });

      expect(Food.keys).toEqual(["APPLE", "BANANA", "CARROT", "PEA"]);
      expect(Food.getLabel("PEA")).toBe("Pea Label");
      expect(() => Food.assert("MEAT" as any)).toThrow();
    });

    it("throws if duplicates exist", () => {
      const Fruits = createTruenum({ members: ["APPLE", "BANANA"] as const });
      const MoreFruits = createTruenum({ members: ["APPLE", "ORANGE"] as const });
      expect(() => composeTruenum([Fruits, MoreFruits])).toThrowError(
        /Duplicate keys found/
      );
    });
  });
});

describe("compareTruenumKeys()", () => {
  it("correctly compares two strings", () => {
    // existing test
    expect(compareTruenumKeys("APPLE", "BANANA")).toBe(-1);
    expect(compareTruenumKeys("BANANA", "APPLE")).toBe(1);
    expect(compareTruenumKeys("CARROT", "CARROT")).toBe(0);
  });
});

describe("assertExhaustive()", () => {
  it("enforces exhaustive checks in switch statements", () => {
    // existing test
    type Fruit = "APPLE" | "BANANA";
    function color(fruit: Fruit): string {
      switch (fruit) {
        case "APPLE":
          return "RED";
        case "BANANA":
          return "YELLOW";
        default:
          return assertExhaustive(fruit);
      }
    }
    expect(color("APPLE")).toBe("RED");
  });

  it("throws an error with default message if no custom msg is provided", () => {
    // coverage for lines where we call throw new Error(msg || ...)
    try {
      // Force the call
      assertExhaustive("THIS_IS_NEVER" as never);
      // Should never get here
      expect(true).toBe(false);
    } catch (err) {
      expect((err as Error).message).toMatch(/Non-exhaustive switch reached/);
    }
  });

  it("throws an error with a custom message if provided", () => {
    try {
      assertExhaustive("NEVER_VALUE" as never, "Custom Exhaustive Error");
    } catch (err) {
      expect((err as Error).message).toBe("Custom Exhaustive Error");
    }
  });
});

describe("buildZodSchema()", () => {
  it("returns the built zod schema", () => {
    // existing test
    const Status = createTruenum({
      members: ["ACTIVE", "INACTIVE"] as const,
    });
    const statusSchema = buildZodSchema(Status).default("ACTIVE");
    expect(statusSchema.parse("INACTIVE")).toBe("INACTIVE");
    expect(statusSchema.parse(undefined)).toBe("ACTIVE");
    expect(() => statusSchema.parse("BAD_VALUE")).toThrow();
  });

  it("works on an enum with a single key (edge case)", () => {
    // Possibly covers lines ~317, 320-325 if the array or union is minimal
    const Single = createTruenum({
      members: ["ONLY"] as const,
    });
    const singleSchema = buildZodSchema(Single);
    expect(singleSchema.parse("ONLY")).toBe("ONLY");
    expect(() => singleSchema.parse("NOT_ONLY")).toThrow();
  });
});

