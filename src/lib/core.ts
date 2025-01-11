import { z } from "zod";

/**
 * A strict type describing the config for building a Truenum.
 * @template Key The union of string literal keys used by this Truenum.
 */
export interface TruenumConfig<Key extends string> {
  /**
   * Unique string keys that form the enum's members.
   */
  readonly members: readonly Key[];

  /**
   * Optional name used for caching or debugging.
   */
  readonly name?: string | undefined;

  /**
   * Optional map from key -> user-friendly label.
   */
  readonly labels?: Readonly<Record<Key, string>>;

  /**
   * Optional map from key -> language code -> localized string.
   */
  readonly i18n?: Readonly<Record<Key, Readonly<Record<string, string>>>>;
}

/**
 * The return type from `createTruenum(...)`.
 * Provides advanced runtime & static capabilities with minimal overhead.
 *
 * @template Key The union of string literal keys used by this Truenum.
 */
export interface Truenum<Key extends string> {
  /**
   * A phantom property to represent the union type at compile time only.
   */
  readonly type: Key;

  /**
   * An array of all valid keys in the enum.
   */
  readonly keys: readonly Key[];

  /**
   * A record mapping each key to itself, for direct usage:
   * e.g. `MyEnum.VAL === 'VAL'`
   */
  readonly values: { readonly [K in Key]: K };

  /**
   * Returns true if `input` is a valid key.
   */
  is(input: unknown): input is Key;

  /**
   * Throws if `input` is not a valid key.
   */
  assert(input: unknown, errMsg?: string): asserts input is Key;

  /**
   * Serializes a valid enum key into a string (commonly identity).
   * For string-based Truenums, this is typically no-op.
   */
  serialize(key: Key): string;

  /**
   * Deserializes a string back to a valid Key or throws if invalid.
   */
  deserialize(input: string): Key;

  /**
   * Returns the user-friendly label for a given key, if defined in config.labels.
   */
  getLabel(key: Key): string | undefined;

  /**
   * Returns the localized string for a given language code, if defined in config.i18n.
   */
  getTranslation(key: Key, langCode: string): string | undefined;

  /**
   * Optional Zod schema for advanced integration in runtime validation or composition with other schemas.
   */
  readonly zodSchema: z.ZodEnum<[Key, ...Key[]]>;
}

/**
 * Create a strongly typed Truenum for zero-cost enumerations.
 * No extraneous runtime overhead beyond an object of string keys + optional Zod schema.
 */
export function createTruenum<const Key extends string>(
  config: TruenumConfig<Key>
): Truenum<Key> {
  // Validate uniqueness
  const uniqueSet: Set<Key> = new Set(config.members);
  if (uniqueSet.size !== config.members.length) {
    throw new Error(
      `createTruenum: Duplicate keys found. All enum keys must be unique.`
    );
  }

  // Convert to an immutable array
  const keys = Object.freeze([...config.members]) as readonly Key[];

  // Build the values object (key->key)
  const values = Object.freeze(
    keys.reduce<Record<Key, Key>>((acc, k) => {
      acc[k] = k;
      return acc;
    }, {} as Record<Key, Key>)
  ) as { [K in Key]: K };

  // Build the Zod schema
  if (keys.length === 0) {
    throw new Error(`createTruenum: members[] cannot be empty`);
  }
  const zodSchema = z.enum(keys as [Key, ...Key[]]);

  // Helper type guard
  function isEnumKey(input: unknown): input is Key {
    return typeof input === "string" && values.hasOwnProperty(input);
  }

  // The main object
  const truenumObj: Truenum<Key> = {
    type: undefined as unknown as Key, // purely for TS phantom
    keys,
    values,
    is: (input: unknown): input is Key => isEnumKey(input),
    assert: (input: unknown, errMsg?: string): asserts input is Key => {
      if (!isEnumKey(input)) {
        const base = `Value "${String(input)}" is not a valid key of [${keys.join(
          ", "
        )}]`;
        throw new Error(errMsg ? `${errMsg} ${base}` : base);
      }
    },
    serialize(key: Key): string {
      if (!isEnumKey(key)) {
        throw new Error(`serialize() error: invalid key "${String(key)}"`);
      }
      // string-based identity
      return key;
    },
    deserialize(input: string): Key {
      if (isEnumKey(input)) {
        return input;
      }
      throw new Error(
        `deserialize() error: "${String(input)}" is invalid. Valid keys: [${keys.join(
          ", "
        )}]`
      );
    },
    getLabel(key: Key): string | undefined {
      if (!isEnumKey(key)) {
        throw new Error(`getLabel() error: invalid key "${String(key)}"`);
      }
      return config.labels?.[key];
    },
    getTranslation(key: Key, lang: string): string | undefined {
      if (!isEnumKey(key)) {
        throw new Error(
          `getTranslation() error: invalid key "${String(key)}" for lang "${lang}"`
        );
      }
      return config.i18n?.[key]?.[lang];
    },
    zodSchema,
  };

  return truenumObj;
}

/**
 * Build a smaller Truenum containing a subset of another Truenum's keys.
 */
export function subsetTruenum<
  ParentKey extends string,
  SubsetKey extends ParentKey
>(
  parent: Truenum<ParentKey>,
  subsetMembers: readonly SubsetKey[],
  opts?: {
    readonly name?: string | undefined;
    readonly labels?: Readonly<Partial<Record<SubsetKey, string>>>;
    readonly i18n?: Readonly<Partial<Record<SubsetKey, Readonly<Record<string, string>>>>>;
  }
): Truenum<SubsetKey> {
  // Validate subset is truly contained in parent's keys
  for (const k of subsetMembers) {
    if (!parent.is(k)) {
      throw new Error(
        `subsetTruenum: key "${String(k)}" is not a member of parent.`
      );
    }
  }

  // Build merged labels/i18n from parent or fallback
  const finalLabels: Record<SubsetKey, string> = {} as Record<SubsetKey, string>;
  if (parent.keys && parent.keys.length > 0 && parent.keys.every(k => !!k)) {
    for (const k of subsetMembers) {
      const label = parent.getLabel(k);
      if (label !== undefined) {
        finalLabels[k] = label;
      }
    }
  }
  if (opts?.labels) {
    for (const [k, v] of Object.entries(opts.labels) as [SubsetKey, string][]) {
      finalLabels[k] = v;
    }
  }

  // Initialize with proper type and empty records for each key
  const finalI18n: { [K in SubsetKey]: { [lang: string]: string } } = 
    Object.fromEntries(
      subsetMembers.map(k => [k, {}])
    ) as { [K in SubsetKey]: { [lang: string]: string } };

  // First copy all translations from parent
  for (const k of subsetMembers) {
    // For each key in parent, get all available languages
    const langs = ["en", "fr", "de", "es", "it", "ja", "ko", "zh"]; // Common languages
    for (const lang of langs) {
      const translation = parent.getTranslation(k, lang);
      if (translation !== undefined) {
        (finalI18n[k] as { [lang: string]: string })[lang] = translation;
      }
    }
  }

  // Then apply overrides from opts.i18n
  if (opts?.i18n) {
    for (const [k, translations] of Object.entries(opts.i18n) as [
      SubsetKey,
      Record<string, string>
    ][]) {
      const target = finalI18n[k] as { [lang: string]: string };
      for (const [lang, txt] of Object.entries(translations)) {
        target[lang] = txt;
      }
    }
  }

  return createTruenum<SubsetKey>({
    name: opts?.name,
    members: subsetMembers,
    labels: finalLabels,
    i18n: finalI18n,
  });
}

/**
 * Compose multiple Truenums into a single union, requiring disjoint keys.
 */
export function composeTruenum<
  Tuple extends readonly Truenum<any>[],
  UnionKey extends Tuple[number]["type"]
>(
  truenums: Tuple,
  opts?: {
    readonly name?: string | undefined;
    readonly labels?: Readonly<Partial<Record<UnionKey, string>>>;
    readonly i18n?: Readonly<Partial<Record<UnionKey, Readonly<Record<string, string>>>>>;
  }
): Truenum<UnionKey> {
  // Check for empty array
  if (truenums.length === 0) {
    throw new Error("composeTruenum: cannot compose empty array of truenums");
  }

  // Gather all keys
  const allKeys: string[] = [];
  for (const t of truenums) {
    allKeys.push(...t.keys);
  }
  const deduplicate = new Set(allKeys);
  if (deduplicate.size !== allKeys.length) {
    throw new Error(`composeTruenum: Duplicate keys found among the truenums`);
  }

  // Build merged labels / i18n
  const mergedLabels: Record<UnionKey, string> = {} as Record<UnionKey, string>;
  
  // Initialize labels from source truenums first
  for (const t of truenums) {
    for (const k of t.keys) {
      const label = t.getLabel(k);
      if (label !== undefined) {
        mergedLabels[k as UnionKey] = label;
      }
    }
  }

  // Then apply overrides from opts.labels
  if (opts?.labels) {
    for (const [k, v] of Object.entries(opts.labels) as [UnionKey, string][]) {
      mergedLabels[k] = v;
    }
  }

  // Initialize with proper type and empty records
  const mergedI18n: { [K in UnionKey]: { [lang: string]: string } } = 
    Object.fromEntries(
      [...deduplicate].map(k => [k, {}])
    ) as { [K in UnionKey]: { [lang: string]: string } };

  // First merge i18n from all source truenums
  const langs = ["en", "fr", "de", "es", "it", "ja", "ko", "zh"]; // Common languages
  for (const t of truenums) {
    for (const k of t.keys) {
      const target = mergedI18n[k as UnionKey] as { [lang: string]: string };
      // Get all languages for this key from source truenum
      for (const lang of langs) {
        const translation = t.getTranslation(k, lang);
        if (translation !== undefined) {
          target[lang] = translation;
        }
      }
    }
  }

  // Then apply overrides from opts.i18n
  if (opts?.i18n) {
    for (const [k, translations] of Object.entries(opts.i18n) as [
      UnionKey,
      Record<string, string>
    ][]) {
      const target = mergedI18n[k as UnionKey] as { [lang: string]: string };
      for (const [lang, txt] of Object.entries(translations)) {
        target[lang] = txt;
      }
    }
  }

  return createTruenum<UnionKey>({
    members: [...deduplicate] as UnionKey[],
    name: opts?.name,
    labels: mergedLabels,
    i18n: mergedI18n,
  });
}

/**
 * Compare two keys from the same Truenum alphabetically.
 */
export function compareTruenumKeys<T extends string>(a: T, b: T): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Ensure exhaustive switch/case checks at both compile-time & runtime.
 */
export function assertExhaustive(x: never, msg?: string): never {
  throw new Error(msg || `Non-exhaustive switch reached: ${String(x)}`);
}

/**
 * Build a Zod schema referencing a given Truenum’s enum for further composition.
 */
export function buildZodSchema<Key extends string>(truenum: Truenum<Key>) {
  return truenum.zodSchema;
}
