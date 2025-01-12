import { z } from 'zod';

/**
 * A strict type describing the config for building a Truenum.
 * @template Key The union of string literal keys used by this Truenum.
 */
export interface TruenumConfig<Key extends string> {
  readonly members: readonly Key[];
  readonly name?: string | undefined;
  readonly labels?: Readonly<Record<Key, string>>;
  readonly i18n?: Readonly<Record<Key, Readonly<Record<string, string>>>>;
}

/**
 * The return type from `createTruenum(...)`.
 */
export interface Truenum<Key extends string> {
  readonly type: Key;
  readonly keys: readonly Key[];
  readonly values: { readonly [K in Key]: K };
  is(input: unknown): input is Key;
  assert(input: unknown, errMsg?: string): asserts input is Key;
  serialize(key: Key): string;
  deserialize(input: string): Key;
  getLabel(key: Key): string | undefined;
  getTranslation(key: Key, langCode: string): string | undefined;
  readonly zodSchema: z.ZodEnum<[Key, ...Key[]]>;
}

/**
 * Create a strongly typed Truenum for zero-cost enumerations.
 */
export function createTruenum<const Key extends string>(
  config: TruenumConfig<Key>,
): Truenum<Key> {
  // Validate uniqueness
  const uniqueSet = new Set(config.members);
  if (uniqueSet.size !== config.members.length) {
    throw new Error(
      'createTruenum: Duplicate keys found. All enum keys must be unique.',
    );
  }

  // Validate non-empty
  if (config.members.length === 0) {
    throw new Error('createTruenum: members[] cannot be empty');
  }

  // Build keys, values
  const keys = Object.freeze([...config.members]) as readonly Key[];
  const values = Object.freeze(
    keys.reduce(
      (acc, k) => {
        acc[k] = k;
        return acc;
      },
      {} as Record<Key, Key>,
    ),
  ) as { [K in Key]: K };

  // Build the Zod schema
  const zodSchema = z.enum(keys as [Key, ...Key[]]);

  // Type guard
  function isEnumKey(input: unknown): input is Key {
    return typeof input === 'string' && Object.hasOwn(values, input);
  }

  return {
    type: undefined as unknown as Key,
    keys,
    values,

    is(input: unknown): input is Key {
      return isEnumKey(input);
    },

    assert(input: unknown, errMsg?: string): asserts input is Key {
      if (!isEnumKey(input)) {
        const base = `Value "${String(input)}" is not a valid key of [${keys.join(', ')}]`;
        throw new Error(errMsg ? `${errMsg} ${base}` : base);
      }
    },

    serialize(key: Key): string {
      if (!isEnumKey(key)) {
        throw new Error(`serialize() error: invalid key "${String(key)}"`);
      }
      return key;
    },

    deserialize(input: string): Key {
      if (isEnumKey(input)) {
        return input;
      }
      throw new Error(
        `deserialize() error: "${String(input)}" is invalid. Valid keys: [${keys.join(', ')}]`,
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
          `getTranslation() error: invalid key "${String(key)}" for lang "${lang}"`,
        );
      }
      return config.i18n?.[key]?.[lang];
    },

    zodSchema,
  };
}

/* --------------------------------------------------------------------------------
   Helper functions to break down subsetTruenum() complexity
-------------------------------------------------------------------------------- */

function mergeLabels<ParentKey extends string, SubsetKey extends ParentKey>(
  parent: Truenum<ParentKey>,
  subsetMembers: readonly SubsetKey[],
  overrideLabels?: Readonly<Partial<Record<SubsetKey, string>>>,
): Record<SubsetKey, string> {
  const finalLabels = {} as Record<SubsetKey, string>;
  for (const k of subsetMembers) {
    const label = parent.getLabel(k as ParentKey);
    if (label !== undefined) {
      finalLabels[k] = label;
    }
  }
  if (overrideLabels) {
    Object.assign(finalLabels, overrideLabels);
  }
  return finalLabels;
}

const SUPPORTED_LANGS = [
  'en',
  'fr',
  'de',
  'es',
  'it',
  'ja',
  'ko',
  'zh',
] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function mergeTranslations<
  ParentKey extends string,
  SubsetKey extends ParentKey,
>(
  parent: Truenum<ParentKey>,
  key: SubsetKey,
  target: Record<string, string>,
  langs: readonly SupportedLang[],
): void {
  for (const lang of langs) {
    const translation = parent.getTranslation(key as ParentKey, lang);
    if (translation !== undefined) {
      target[lang] = translation;
    }
  }
}

function applyI18nOverrides<ParentKey extends string>(
  finalI18n: Record<ParentKey, Record<string, string>>,
  overrideI18n?: Readonly<
    Partial<Record<ParentKey, Readonly<Record<string, string>>>>
  >,
): void {
  if (!overrideI18n) {
    return;
  }

  type Entry = [ParentKey, Record<string, string>];
  const entries: Entry[] = Object.entries(overrideI18n) as Entry[];
  for (const [k, translations] of entries) {
    const target = finalI18n[k];
    Object.assign(target, translations);
  }
}

function initializeI18nMap<Key extends string>(
  subsetMembers: readonly Key[],
): Record<Key, Record<string, string>> {
  return Object.fromEntries(subsetMembers.map((k) => [k, {}])) as Record<
    Key,
    Record<string, string>
  >;
}

function mergeI18n<ParentKey extends string, SubsetKey extends ParentKey>(
  parent: Truenum<ParentKey>,
  subsetMembers: readonly SubsetKey[],
  overrideI18n?: Readonly<
    Partial<Record<SubsetKey, Readonly<Record<string, string>>>>
  >,
): Record<SubsetKey, Record<string, string>> {
  const finalI18n = initializeI18nMap(subsetMembers);

  for (const k of subsetMembers) {
    mergeTranslations(parent, k, finalI18n[k], SUPPORTED_LANGS);
  }

  if (overrideI18n) {
    for (const [k, translations] of Object.entries(overrideI18n) as [
      SubsetKey,
      Record<string, string>,
    ][]) {
      Object.assign(finalI18n[k], translations);
    }
  }
  return finalI18n as Record<SubsetKey, Record<string, string>>;
}

/**
 * Build a smaller Truenum containing a subset of another Truenum's keys.
 */
export function subsetTruenum<
  ParentKey extends string,
  SubsetKey extends ParentKey,
>(
  parent: Truenum<ParentKey>,
  subsetMembers: readonly SubsetKey[],
  opts?: {
    readonly name?: string;
    readonly labels?: Readonly<Partial<Record<SubsetKey, string>>>;
    readonly i18n?: Readonly<
      Partial<Record<SubsetKey, Readonly<Record<string, string>>>>
    >;
  },
): Truenum<SubsetKey> {
  // Validate subset
  for (const k of subsetMembers) {
    if (!parent.is(k)) {
      throw new Error(
        `subsetTruenum: key "${String(k)}" is not a member of parent.`,
      );
    }
  }

  // Merge data
  const mergedLabels = mergeLabels(parent, subsetMembers, opts?.labels);
  const mergedI18n = mergeI18n(parent, subsetMembers, opts?.i18n);

  // Create new subset
  return createTruenum<SubsetKey>({
    name: opts?.name,
    members: subsetMembers,
    labels: mergedLabels,
    i18n: mergedI18n,
  });
}

/* --------------------------------------------------------------------------------
   Helper functions to break down composeTruenum() complexity
-------------------------------------------------------------------------------- */

function gatherAllKeys(tList: readonly Truenum<string>[]): string[] {
  return tList.flatMap((t) => [...t.keys]);
}

function mergeAllLabels<UnionKey extends string>(
  truenums: readonly Truenum<UnionKey>[],
  overrides?: Readonly<Partial<Record<UnionKey, string>>>,
): Record<UnionKey, string> {
  const mergedLabels: Record<UnionKey, string> = {} as Record<UnionKey, string>;
  // First from the source
  for (const t of truenums) {
    for (const k of t.keys) {
      const label = t.getLabel(k);
      if (label !== undefined) {
        mergedLabels[k as UnionKey] = label;
      }
    }
  }
  // Then apply overrides
  if (overrides) {
    Object.assign(mergedLabels, overrides);
  }
  return mergedLabels;
}

function mergeAllI18n<UnionKey extends string>(
  truenums: readonly Truenum<UnionKey>[],
  allUniqueKeys: readonly UnionKey[],
  overrides?: Readonly<
    Partial<Record<UnionKey, Readonly<Record<string, string>>>>
  >,
): Record<UnionKey, Record<string, string>> {
  const mergedI18n = initializeI18nMap(allUniqueKeys);

  // From source truenums
  for (const t of truenums) {
    for (const k of t.keys) {
      const target = mergedI18n[k as UnionKey];
      mergeTranslations(t, k as UnionKey, target, SUPPORTED_LANGS);
    }
  }

  applyI18nOverrides(mergedI18n, overrides);
  return mergedI18n;
}

/**
 * Compose multiple Truenums into a single union, requiring disjoint keys.
 * - `Tuple` is the array type of input truenums
 * - `UnionKey` is the union of all their keys
 */
export function composeTruenum<
  Tuple extends readonly Truenum<string>[],
  UnionKey extends Tuple[number]['type'],
>(
  truenums: Tuple,
  opts?: {
    readonly name?: string;
    readonly labels?: Readonly<Partial<Record<UnionKey, string>>>;
    readonly i18n?: Readonly<
      Partial<Record<UnionKey, Readonly<Record<string, string>>>>
    >;
  },
): Truenum<UnionKey> {
  if (truenums.length === 0) {
    throw new Error('composeTruenum: cannot compose empty array of truenums');
  }

  // Gather + deduplicate
  const allKeys = gatherAllKeys(truenums);
  const deduplicate = new Set(allKeys);
  if (deduplicate.size !== allKeys.length) {
    throw new Error('composeTruenum: Duplicate keys found among the truenums');
  }
  const allUniqueKeys = [...deduplicate] as UnionKey[];

  // Since we've validated the keys, we can safely cast through unknown
  const validatedTruenums = truenums as unknown as readonly Truenum<UnionKey>[];
  const mergedLabels = mergeAllLabels(validatedTruenums, opts?.labels);
  const mergedI18n = mergeAllI18n(validatedTruenums, allUniqueKeys, opts?.i18n);

  return createTruenum<UnionKey>({
    members: allUniqueKeys,
    name: opts?.name,
    labels: mergedLabels,
    i18n: mergedI18n,
  });
}

/**
 * Compare two keys from the same Truenum alphabetically, refactored to avoid nested ternary.
 */
export function compareTruenumKeys<T extends string>(a: T, b: T): -1 | 0 | 1 {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

/**
 * Ensure exhaustive switch/case checks at both compile-time & runtime.
 */
export function assertExhaustive(x: never, msg?: string): never {
  throw new Error(msg || `Non-exhaustive switch reached: ${String(x)}`);
}

/**
 * Build a Zod schema referencing a given Truenum’s enum for further composition.
 * Return type added to satisfy `useExplicitType`.
 */
export function buildZodSchema<Key extends string>(
  truenum: Truenum<Key>,
): z.ZodEnum<[Key, ...Key[]]> {
  return truenum.zodSchema;
}
