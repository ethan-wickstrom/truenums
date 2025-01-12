import { z } from 'zod';

/**
 * @template Key - Constrained string type for all valid enumeration keys.
 * @since 1.0.0
 *
 * Defines core config for building a Truenum.
 *
 * This interface shapes the primary configuration passed to {@link createTruenum}. It
 * contains mandatory members for enumerated keys plus optional fields for labeling,
 * naming, and localization data. The shape of each property enforces compile-time
 * correctness and ensures zero-cost runtime usage.
 */
export interface TruenumConfig<Key extends string> {
  /**
   * The array of unique string literals used as valid keys.
   * Must not be empty and cannot contain duplicates.
   *
   * @since 1.0.0
   * @type {readonly Key[]}
   * @remarks
   * A zero-length array throws an error upon creation. Duplicates are disallowed.
   * @example
   * ```ts
   * const config = { members: ['APPLE', 'BANANA'] as const };
   * ```
   * @example
   * ```ts
   * // This will throw due to duplicates
   * const config = { members: ['APPLE', 'APPLE'] as const };
   * ```
   * @example
   * ```ts
   * // Edge case with single entry
   * const config = { members: ['SINGLE'] as const };
   * ```
   */
  readonly members: readonly Key[];

  /**
   * Optional name to identify this Truenum instance.
   *
   * @since 1.0.0
   * @type {string|undefined}
   * @remarks
   * Has no effect on runtime logic, but may help with debugging.
   * @example
   * ```ts
   * const config = {
   *   name: 'FruitEnum',
   *   members: ['APPLE', 'BANANA'] as const
   * };
   * ```
   */
  readonly name?: string | undefined;

  /**
   * Optional labels keyed by each member, providing human-readable descriptions.
   *
   * @since 1.0.0
   * @type {Readonly<Record<Key, string>>|undefined}
   * @remarks
   * If not provided, label APIs may return undefined.
   * @example
   * ```ts
   * const config = {
   *   members: ['APPLE', 'BANANA'] as const,
   *   labels: { APPLE: 'Red Apple', BANANA: 'Yellow Banana' }
   * };
   * ```
   */
  readonly labels?: Readonly<Record<Key, string>>;

  /**
   * Optional i18n object storing translations for each key in multiple locales.
   *
   * @since 1.0.0
   * @type {Readonly<Record<Key, Readonly<Record<string, string>>>>|undefined}
   * @remarks
   * Each nested record maps a locale string to its label for the key.
   * @example
   * ```ts
   * const config = {
   *   members: ['APPLE', 'BANANA'] as const,
   *   i18n: {
   *     APPLE: { en: 'Apple', fr: 'Pomme' },
   *     BANANA: { en: 'Banana', fr: 'Banane' }
   *   }
   * };
   * ```
   */
  readonly i18n?: Readonly<Record<Key, Readonly<Record<string, string>>>>;
}

/**
 * @template Key - Constrained string literal type for enumerated keys.
 * @since 1.0.0
 *
 * Represents a fully constructed Truenum object.
 *
 * A Truenum bundles compile-time string keys with optional runtime validation,
 * labeling, and i18n. It exposes methods for membership checks and conversions,
 * ensuring zero overhead for typical usage. Each property is strictly typed and
 * designed for safe, minimalistic usage.
 */
export interface Truenum<Key extends string> {
  /**
   * Placeholder property used for extracting the string-literal type.
   *
   * @since 1.0.0
   * @type {Key}
   * @remarks
   * Not meant for direct usage. Declared to anchor the union type in TS.
   */
  readonly type: Key;

  /**
   * The immutable array of all valid keys in this Truenum.
   *
   * @since 1.0.0
   * @type {readonly Key[]}
   * @remarks
   * Useful for iteration or enumerating valid possibilities.
   * @example
   * ```ts
   * console.log(Fruit.keys); // ['APPLE','BANANA']
   * ```
   */
  readonly keys: readonly Key[];

  /**
   * A value map from each key to itself, providing both runtime and compile-time references.
   *
   * @since 1.0.0
   * @type {Readonly<{[K in Key]: K}>}
   * @remarks
   * This can help link enumerated keys with object-literal usage.
   * @example
   * ```ts
   * console.log(Fruit.values.APPLE); // 'APPLE'
   * ```
   */
  readonly values: { readonly [K in Key]: K };

  /**
   * Checks if the given input is one of the valid keys.
   *
   * @since 1.0.0
   * @param input - Potential value to check against valid Truenum keys.
   * @returns {boolean} True if `input` is a valid Truenum key, false otherwise.
   * @throws No direct error thrown, always returns a boolean.
   * @example
   * ```ts
   * // Basic usage
   * console.log(Fruit.is('APPLE')); // true
   * console.log(Fruit.is('ORANGE')); // false
   * ```
   * @example
   * ```ts
   * // Checking unknown
   * function safeCheck(x: unknown) {
   *   if (Fruit.is(x)) console.log('Valid fruit!');
   *   else console.warn('Not a fruit.');
   * }
   * ```
   * @example
   * ```ts
   * // Edge case with numeric or other types
   * console.log(Fruit.is(123)); // false
   * ```
   * @see {@link createTruenum}, {@link subsetTruenum}
   */
  is(input: unknown): input is Key;

  /**
   * Asserts that the provided input is a valid Truenum key, or throws an error.
   *
   * @since 1.0.0
   * @param input - Potential value to validate as a Truenum key.
   * @param errMsg - Optional custom error prefix for thrown exceptions.
   * @returns {void} Returns nothing if validation passes.
   * @throws {Error} If the input is invalid, with a message including the keys.
   * @example
   * ```ts
   * Fruit.assert('APPLE'); // passes silently
   * Fruit.assert('ORANGE'); // throws
   * ```
   * @example
   * ```ts
   * // With a custom message
   * Fruit.assert('ORANGE', 'Unexpected item.');
   * // => throws "Unexpected item. Value "ORANGE" is not a valid key..."
   * ```
   * @example
   * ```ts
   * // Edge usage with type narrowing
   * const maybeFruit: unknown = 'BANANA';
   * Fruit.assert(maybeFruit);
   * // now maybeFruit is typed as 'BANANA'
   * ```
   * @see {@link compareTruenumKeys}, {@link buildZodSchema}
   */
  assert(input: unknown, errMsg?: string): asserts input is Key;

  /**
   * Converts a valid Truenum key to a plain string, throwing on invalid usage.
   *
   * @since 1.0.0
   * @param key - The enumerated key to serialize.
   * @returns {string} The same string value if valid.
   * @throws {Error} If `key` is not part of the Truenum.
   * @example
   * ```ts
   * Fruit.serialize('APPLE'); // 'APPLE'
   * Fruit.serialize('INVALID'); // throws
   * ```
   */
  serialize(key: Key): string;

  /**
   * Converts an arbitrary string back into a valid Truenum key, or throws.
   *
   * @since 1.0.0
   * @param input - The string to deserialize into a valid key.
   * @returns {Key} The typed key if recognized.
   * @throws {Error} If `input` is not one of the known keys.
   * @example
   * ```ts
   * Fruit.deserialize('BANANA'); // 'BANANA'
   * Fruit.deserialize('UNKNOWN'); // throws
   * ```
   */
  deserialize(input: string): Key;

  /**
   * Retrieves the label text for a given key, or undefined if none is set.
   *
   * @since 1.0.0
   * @param key - A valid key within this Truenum.
   * @returns {string|undefined} The label if present, otherwise `undefined`.
   * @throws {Error} If the provided key is invalid.
   * @example
   * ```ts
   * Fruit.getLabel('APPLE'); // e.g. "Red Apple"
   * Fruit.getLabel('UNKNOWN'); // throws
   * ```
   */
  getLabel(key: Key): string | undefined;

  /**
   * Retrieves a localized string for a given key/locale if available.
   *
   * @since 1.0.0
   * @param key - The valid Truenum key for which to get translations.
   * @param langCode - The locale code (e.g. 'en','fr') to retrieve.
   * @returns {string|undefined} Returns the translation if found, else `undefined`.
   * @throws {Error} If `key` is invalid or unsupported.
   * @example
   * ```ts
   * Fruit.getTranslation('APPLE', 'en'); // 'Apple'
   * Fruit.getTranslation('APPLE', 'jp'); // possibly undefined
   * ```
   */
  getTranslation(key: Key, langCode: string): string | undefined;

  /**
   * Provides a Zod schema enumerating all valid keys for optional runtime validation.
   *
   * @since 1.0.0
   * @type {z.ZodEnum<[Key, ...Key[]]>}
   * @remarks
   * This offers a direct approach to integrate with Zod-based validation pipelines.
   * @example
   * ```ts
   * const parseFruit = Fruit.zodSchema.parse('APPLE'); // 'APPLE'
   * Fruit.zodSchema.parse('INVALID'); // throws ZodError
   * ```
   */
  readonly zodSchema: z.ZodEnum<[Key, ...Key[]]>;
}

/**
 * @template Key - Constrained string type for enumerated keys.
 * @since 1.0.0
 *
 * Constructs a fresh Truenum from config.
 *
 * This function synthesizes a typed enumeration from the given {@link TruenumConfig},
 * performing runtime checks for duplicates or empty arrays. It provides membership
 * validation, label retrieval, i18n lookups, and a Zod schema for optional usage.
 * The resulting object is safe, minimal, and highly optimized.
 *
 * @typeParam Key - Must extend string to enforce literal-based enumerations.
 * @param config - A {@link TruenumConfig} describing members, labels, i18n, etc.
 * @returns {Truenum<Key>} Fully built Truenum with membership checks and utilities.
 * @throws {Error} If `config.members` is empty or contains duplicates.
 * @example
 * ```ts
 * const Fruit = createTruenum({
 *   members: ['APPLE','BANANA'] as const,
 *   labels: { APPLE: 'Red Apple', BANANA: 'Yellow Banana' }
 * });
 * console.log(Fruit.keys); // ['APPLE','BANANA']
 * console.log(Fruit.is('APPLE')); // true
 * ```
 * @example
 * ```ts
 * // Edge case: single-member
 * const Single = createTruenum({ members: ['ONLY'] as const });
 * console.log(Single.keys); // ['ONLY']
 * ```
 * @example
 * ```ts
 * // Error case: duplicates
 * createTruenum({ members: ['X','X'] as const });
 * // => throws "Duplicate keys found."
 * ```
 * @see {@link subsetTruenum}, {@link composeTruenum}
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

/**
 * @template ParentKey
 * @template SubsetKey
 * @since 1.0.0
 *
 * Merges parent labels with override labels.
 *
 * This helper function walks through the parent Truenum's label definitions
 * and copies them into a new object restricted by a subset of keys, optionally
 * applying user-provided overrides for selective changes. It's used by
 * {@link subsetTruenum} to preserve or override labeling data.
 *
 * @param parent - The parent Truenum from which to pull label data.
 * @param subsetMembers - The chosen subset of keys belonging to the parent.
 * @param overrideLabels - Partial overrides to apply after merging parent labels.
 * @returns {Record<SubsetKey, string>} Merged labeling object for the subset.
 * @throws No direct error if parent labels are missing, but logs partial coverage.
 * @example
 * ```ts
 * const Parent = createTruenum({
 *   members: ['APPLE','BANANA','PEACH'] as const,
 *   labels: { APPLE: 'Apple', BANANA: 'Banana', PEACH: 'Peach' }
 * });
 * const subset = mergeLabels(Parent, ['APPLE','BANANA'] as const, { APPLE: 'Red Apple' });
 * // => { APPLE: 'Red Apple', BANANA: 'Banana' }
 * ```
 * @example
 * ```ts
 * // Edge case with no overrides
 * const subsetNoOverride = mergeLabels(Parent, ['BANANA'] as const);
 * // => { BANANA: 'Banana' }
 * ```
 * @example
 * ```ts
 * // Non-labeled parent
 * const Unlabeled = createTruenum({ members: ['ONE','TWO'] as const });
 * mergeLabels(Unlabeled, ['ONE'] as const);
 * // => { ONE: undefined } effectively
 * ```
 * @see {@link createTruenum}, {@link subsetTruenum}
 */
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

/**
 * @since 1.0.0
 *
 * Lists selected locale codes recognized by default.
 *
 * This constant array enumerates a small set of locale strings commonly used
 * in test or demonstration contexts. It can be extended or replaced by library
 * consumers needing broader i18n coverage, but suffices for typical usage examples
 * involving i18n functionality and related APIs.
 *
 * @returns {readonly string[]} A set of locale codes, e.g. 'en','fr','de','es', etc.
 * @throws No direct errors; it's a static constant.
 * @example
 * ```ts
 * console.log(SUPPORTED_LANGS); // ['en','fr','de','es','it','ja','ko','zh']
 * ```
 * @example
 * ```ts
 * // Basic iteration
 * for (const lang of SUPPORTED_LANGS) {
 *   console.log(lang);
 * }
 * ```
 * @example
 * ```ts
 * // Checking membership
 * const isSupported = SUPPORTED_LANGS.includes('en'); // true
 * ```
 * @see {@link composeTruenum}
 */
export const SUPPORTED_LANGS = [
  'en',
  'fr',
  'de',
  'es',
  'it',
  'ja',
  'ko',
  'zh',
] as const;

/**
 * @since 1.0.0
 *
 * Union type of supported locale codes.
 *
 * This type alias represents the permissible locale codes enumerated in
 * {@link SUPPORTED_LANGS}. It is used internally to filter or merge language
 * data safely. It can be extended by consumers if desired.
 *
 * @returns {('en'|'fr'|'de'|'es'|'it'|'ja'|'ko'|'zh')} - 8-locale union type.
 * @throws No direct errors; it's a type-level alias.
 * @example
 * ```ts
 * function greetUser(lang: SupportedLang) {
 *   // ...
 * }
 * greetUser('en'); // valid
 * greetUser('unknown'); // type error
 * ```
 * @example
 * ```ts
 * // Edge usage
 * const valid: SupportedLang = 'ko'; // passes
 * const invalid: SupportedLang = 'xx'; // fails to compile
 * ```
 * @example
 * ```ts
 * // In object records
 * const messages: Record<SupportedLang, string> = {
 *   en: 'Hello', fr: 'Bonjour', de: 'Hallo', es: 'Hola',
 *   it: 'Ciao', ja: 'Konnichiwa', ko: 'Annyeong', zh: 'Nihao'
 * };
 * ```
 * @see {@link SUPPORTED_LANGS}
 */
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

/**
 * @template ParentKey
 * @template SubsetKey
 * @since 1.0.0
 *
 * Combines translations from a parent for a single subset key.
 *
 * This function copies all known translations for a specific key from the parent
 * Truenum into the provided target record. It iterates the fixed set of
 * {@link SUPPORTED_LANGS}, retrieving each locale's text and assigning it to `target`.
 * It's used within partial i18n merging logic.
 *
 * @param parent - The parent Truenum from which to extract i18n.
 * @param key - A valid subset key from the parent enumeration.
 * @param target - Record in which to store retrieved translations.
 * @param langs - Array of supported locales to iterate.
 * @returns {void} Returns nothing; mutates `target` in-place.
 * @throws No direct error unless `key` is invalid for the parent.
 * @example
 * ```ts
 * const Parent = createTruenum({
 *   members: ['APPLE'] as const,
 *   i18n: { APPLE: { en: 'Apple', fr: 'Pomme' } }
 * });
 * const target: Record<string,string> = {};
 * mergeTranslations(Parent, 'APPLE', target, ['en','fr']);
 * console.log(target); // { en: 'Apple', fr: 'Pomme' }
 * ```
 * @example
 * ```ts
 * // Edge: missing parent translation yields no assignment
 * const target2: Record<string,string> = {};
 * mergeTranslations(Parent, 'APPLE', target2, ['de']);
 * console.log(target2); // {}
 * ```
 * @example
 * ```ts
 * // Non-existent key would throw
 * mergeTranslations(Parent, 'UNKNOWN' as 'APPLE', {}, ['en']);
 * // => error
 * ```
 * @see {@link SUPPORTED_LANGS}, {@link parent.getTranslation}
 */
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

/**
 * @template ParentKey
 * @since 1.0.0
 *
 * Applies i18n overrides to a merged i18n record.
 *
 * This function merges user-provided translations (keyed by `ParentKey`) into
 * an existing i18n map, overwriting or extending locales for each matched key.
 * It is used in composition or subset-building logic to selectively override
 * default translations from a base enumeration.
 *
 * @param finalI18n - The current record of i18n strings to mutate.
 * @param overrideI18n - Partial overrides of i18n data keyed by `ParentKey`.
 * @returns {void} No direct return; modifies `finalI18n` in place.
 * @throws No direct error, but may lead to missing locales if keys are invalid.
 * @example
 * ```ts
 * const finalI18n: Record<string, Record<string,string>> = {
 *   APPLE: { en: 'Apple' }
 * };
 * const overrides = { APPLE: { fr: 'Pomme' } };
 * applyI18nOverrides(finalI18n, overrides);
 * console.log(finalI18n.APPLE); // { en:'Apple', fr:'Pomme' }
 * ```
 * @example
 * ```ts
 * // Edge case with undefined override
 * applyI18nOverrides(finalI18n, undefined);
 * // => No changes
 * ```
 * @example
 * ```ts
 * // Overriding an existing locale
 * applyI18nOverrides(finalI18n, { APPLE: { en:'New Apple' } });
 * console.log(finalI18n.APPLE); // { en:'New Apple', fr:'Pomme' }
 * ```
 * @see {@link mergeTranslations}, {@link composeTruenum}
 */
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

/**
 * @template Key
 * @since 1.0.0
 *
 * Builds an i18n record map for a given set of keys.
 *
 * Given a readonly array of keys, this function returns an object mapping each key to
 * an empty record. It is typically used as a baseline for i18n composition, ensuring
 * all subset or union keys have a default dictionary that can be overridden later.
 *
 * @param subsetMembers - The keys for which to initialize i18n maps.
 * @returns {Record<Key, Record<string, string>>} A record keyed by each entry in `subsetMembers`.
 * @throws No direct error, but an empty array yields an empty record.
 * @example
 * ```ts
 * const map = initializeI18nMap(['APPLE','BANANA'] as const);
 * console.log(map); // { APPLE: {}, BANANA: {} }
 * ```
 * @example
 * ```ts
 * // Single key usage
 * const singleMap = initializeI18nMap(['ONLY'] as const);
 * // => { ONLY:{} }
 * ```
 * @example
 * ```ts
 * // Extending afterwards
 * singleMap.ONLY.en = 'Unique Label';
 * ```
 * @see {@link mergeI18n}, {@link subsetTruenum}
 */
function initializeI18nMap<Key extends string>(
  subsetMembers: readonly Key[],
): Record<Key, Record<string, string>> {
  return Object.fromEntries(subsetMembers.map((k) => [k, {}])) as Record<
    Key,
    Record<string, string>
  >;
}

/**
 * @template ParentKey
 * @template SubsetKey
 * @since 1.0.0
 *
 * Consolidates parent's i18n for a subset, applying overrides.
 *
 * This function creates an i18n map for the specified subset keys, populating each
 * key's translations by pulling them from the parent. It then applies partial
 * overrides to refine or replace specific locale entries. It's used by
 * {@link subsetTruenum} and internally during composition logic.
 *
 * @param parent - The parent Truenum from which to gather translations.
 * @param subsetMembers - The chosen subset of valid keys.
 * @param overrideI18n - Optional partial i18n overrides to apply after merging.
 * @returns {Record<SubsetKey, Record<string, string>>} Fully merged i18n for each subset key.
 * @throws No direct error, but missing parent translations remain undefined.
 * @example
 * ```ts
 * const Parent = createTruenum({
 *   members: ['RED','BLUE'] as const,
 *   i18n: {
 *     RED:{ en:'Red', fr:'Rouge' },
 *     BLUE:{ en:'Blue', fr:'Bleu' }
 *   }
 * });
 * const partial = { RED:{ fr:'Rouge Overridden' } };
 * const subsetI18n = mergeI18n(Parent, ['RED'] as const, partial);
 * // => { RED:{ en:'Red', fr:'Rouge Overridden' } }
 * ```
 * @example
 * ```ts
 * // No overrides yields parent's data
 * mergeI18n(Parent, ['BLUE'] as const);
 * // => { BLUE:{ en:'Blue', fr:'Bleu' } }
 * ```
 * @example
 * ```ts
 * // Edge: parent with no i18n
 * const Minimal = createTruenum({ members:['X'] as const });
 * mergeI18n(Minimal, ['X'] as const);
 * // => { X:{} }
 * ```
 * @see {@link subsetTruenum}, {@link createTruenum}
 */
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
 * @template ParentKey
 * @template SubsetKey
 * @since 1.0.0
 *
 * Builds a restricted Truenum subset from a parent.
 *
 * This function validates that each member in `subsetMembers` belongs to `parent`.
 * It then merges label and i18n data from the parent, applying optional overrides
 * if provided. This yields a smaller, fully typed Truenum for specialized usage.
 *
 * @param parent - The parent Truenum from which to derive a subset.
 * @param subsetMembers - An array of keys strictly belonging to the parent.
 * @param opts - Optional name, label overrides, and i18n overrides.
 * @returns {Truenum<SubsetKey>} A smaller Truenum restricted to `subsetMembers`.
 * @throws {Error} If a subset key is not found in the parent.
 * @example
 * ```ts
 * const FullColor = createTruenum({
 *   members: ['RED','GREEN','BLUE','YELLOW'] as const
 * });
 * const Primary = subsetTruenum(FullColor, ['RED','BLUE'] as const);
 * console.log(Primary.keys); // ['RED','BLUE']
 * ```
 * @example
 * ```ts
 * // Edge: Overriding labels
 * subsetTruenum(FullColor, ['RED'] as const, {
 *   labels: { RED:'Overridden Red' }
 * });
 * ```
 * @example
 * ```ts
 * // Error if unknown key
 * subsetTruenum(FullColor, ['MAGENTA'] as const);
 * // => throws
 * ```
 * @see {@link createTruenum}, {@link composeTruenum}
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

/**
 * @since 1.0.0
 *
 * Gathers all keys from an array of Truenums.
 *
 * This function iterates through the given array of Truenums, flattening each
 * Truenum's `keys` property into a single list of strings. It's a foundational
 * step in {@link composeTruenum} to unify multiple enumerations before validating
 * uniqueness.
 *
 * @template TList - An array of Truenums with string-based keys.
 * @param tList - The input array of Truenums to process.
 * @returns {string[]} Flattened list of all keys from each Truenum in `tList`.
 * @throws No direct errors, but empty input yields an empty array.
 * @example
 * ```ts
 * const Fruit = createTruenum({ members: ['APPLE','BANANA'] as const });
 * const Veg = createTruenum({ members: ['CARROT'] as const });
 * gatherAllKeys([Fruit, Veg]); // ['APPLE','BANANA','CARROT']
 * ```
 * @example
 * ```ts
 * // Single input
 * gatherAllKeys([Fruit]); // ['APPLE','BANANA']
 * ```
 * @example
 * ```ts
 * // Empty usage
 * gatherAllKeys([]); // []
 * ```
 * @see {@link composeTruenum}, {@link subsetTruenum}
 */
function gatherAllKeys(tList: readonly Truenum<string>[]): string[] {
  return tList.flatMap((t) => [...t.keys]);
}

/**
 * @template UnionKey
 * @since 1.0.0
 *
 * Accumulates label data from multiple Truenums, applying overrides.
 *
 * This function generates a unified label map by reading each Truenum's labels
 * for all known keys, then layering on user-provided overrides. It's typically
 * invoked in {@link composeTruenum} to aggregate label data from multiple source
 * enumerations into one final set.
 *
 * @param truenums - The array of Truenums whose label data must be merged.
 * @param overrides - Optional label overrides keyed by union of all keys.
 * @returns {Record<UnionKey, string>} Fully merged label map.
 * @throws No direct error, but missing labels remain undefined unless overridden.
 * @example
 * ```ts
 * const Fruits = createTruenum({ members:['APPLE','BANANA'] as const, labels:{ APPLE:'Apple' } });
 * const Veg = createTruenum({ members:['CARROT'] as const, labels:{ CARROT:'Carrot' } });
 * mergeAllLabels([Fruits, Veg]);
 * // => { APPLE:'Apple', BANANA:undefined, CARROT:'Carrot' }
 * ```
 * @example
 * ```ts
 * // With overrides
 * mergeAllLabels([Fruits, Veg], { BANANA:'Banana Overridden' });
 * // => { APPLE:'Apple', BANANA:'Banana Overridden', CARROT:'Carrot' }
 * ```
 * @example
 * ```ts
 * // Edge: no labels in one Truenum
 * const Plain = createTruenum({ members:['X'] as const });
 * mergeAllLabels([Plain]);
 * // => { X:undefined }
 * ```
 * @see {@link composeTruenum}, {@link subsetTruenum}
 */
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

/**
 * @template UnionKey
 * @since 1.0.0
 *
 * Collates i18n data from multiple Truenums, with optional overrides.
 *
 * This function initializes a blank i18n map for a set of unique keys, iterates
 * through each Truenum to gather translations, and merges them. Finally, it applies
 * optional user-supplied overrides for further customization. Used by
 * {@link composeTruenum} to build aggregated i18n data across disjoint enumerations.
 *
 * @param truenums - Array of Truenums from which to gather translations.
 * @param allUniqueKeys - List of unique keys spanning all truenums.
 * @param overrides - Partial i18n overrides for final customization.
 * @returns {Record<UnionKey, Record<string, string>>} The merged i18n record.
 * @throws No direct error, but missing translations remain undefined.
 * @example
 * ```ts
 * const Apple = createTruenum({
 *   members:['APPLE'] as const,
 *   i18n:{ APPLE:{ en:'Apple' } }
 * });
 * const Banana = createTruenum({
 *   members:['BANANA'] as const,
 *   i18n:{ BANANA:{ fr:'Banane' } }
 * });
 * mergeAllI18n([Apple, Banana], ['APPLE','BANANA']);
 * // => { APPLE:{en:'Apple'}, BANANA:{fr:'Banane'} }
 * ```
 * @example
 * ```ts
 * // With overrides
 * mergeAllI18n([Apple], ['APPLE'], {
 *   APPLE:{ fr:'Pomme' }
 * });
 * // => { APPLE:{ en:'Apple', fr:'Pomme' } }
 * ```
 * @example
 * ```ts
 * // Overriding existing locale
 * mergeAllI18n([Apple], ['APPLE'], { APPLE:{ en:'Override Apple' } });
 * // => { APPLE:{ en:'Override Apple' } }
 * ```
 * @see {@link initializeI18nMap}, {@link mergeTranslations}
 */
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
 * @template Tuple
 * @template UnionKey
 * @since 1.0.0
 *
 * Merges multiple Truenums into one unified enumeration.
 *
 * This function consolidates keys, labels, and i18n data from multiple disjoint Truenums
 * into a single larger Truenum. It ensures no duplicates exist, merges label data,
 * applies optional overrides, and returns a cohesive enumerated type with minimal overhead.
 *
 * @param truenums - A tuple of Truenums to combine into one union.
 * @param opts - Optional name, label overrides, and i18n overrides for final composition.
 * @returns {Truenum<UnionKey>} A new Truenum whose keys are the union of all input Truenums.
 * @throws {Error} If duplicate keys are discovered across the inputs, or if array is empty.
 * @example
 * ```ts
 * const Fruit = createTruenum({ members: ['APPLE','BANANA'] as const });
 * const Veg = createTruenum({ members: ['CARROT'] as const });
 * const Food = composeTruenum([Fruit, Veg]);
 * console.log(Food.keys); // ['APPLE','BANANA','CARROT']
 * ```
 * @example
 * ```ts
 * // Overriding labels
 * composeTruenum([Fruit, Veg], { labels:{ APPLE:'Red Apple' } });
 * ```
 * @example
 * ```ts
 * // Error with duplicates
 * const Duplicate = createTruenum({ members:['APPLE','ORANGE'] as const });
 * composeTruenum([Fruit, Duplicate]);
 * // => throws
 * ```
 * @see {@link createTruenum}, {@link subsetTruenum}
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
 * @template T
 * @since 1.0.0
 *
 * Alphabetically compares two Truenum keys.
 *
 * A simple utility for sorting or ordering operations on enumerated strings.
 * Returns -1 if `a` is lexicographically less than `b`, 1 if greater, and 0
 * if they match. Helps maintain a consistent ordering in user interfaces or
 * sorted data lists.
 *
 * @param a - First key to compare.
 * @param b - Second key to compare.
 * @returns {-1|0|1} The comparison result: negative, zero, or positive.
 * @throws No direct error, relies on string comparison.
 * @example
 * ```ts
 * compareTruenumKeys('APPLE','BANANA'); // -1
 * compareTruenumKeys('CARROT','CARROT'); // 0
 * compareTruenumKeys('PEACH','ORANGE'); // 1 if 'PEACH' > 'ORANGE'
 * ```
 * @example
 * ```ts
 * // Sorting usage
 * ['BANANA','APPLE','CARROT'].sort(compareTruenumKeys);
 * // => ['APPLE','BANANA','CARROT']
 * ```
 * @example
 * ```ts
 * // Edge: identical strings
 * compareTruenumKeys('X','X'); // 0
 * ```
 * @see {@link subsetTruenum}, {@link createTruenum}
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
 * @template X
 * @since 1.0.0
 *
 * Asserts exhaustive switch coverage at runtime.
 *
 * This function forcibly throws an error if called, signaling that a supposedly
 * unreachable code path was reached. It doubles as a compile-time check ensuring
 * all cases in a switch are handled. If you add a new variant and forget to cover
 * it, TypeScript will flag `assertExhaustive`.
 *
 * @param x - The value that is presumed to be `never`.
 * @param msg - Optional custom message to throw if an unreachable path occurs.
 * @returns {never} Always throws an error, returning no usable value.
 * @throws {Error} If invoked, meaning the switch/case was not exhaustive.
 * @example
 * ```ts
 * type Fruit = 'APPLE'|'BANANA';
 * function color(f: Fruit): string {
 *   switch(f) {
 *     case 'APPLE': return 'red';
 *     case 'BANANA': return 'yellow';
 *     default: return assertExhaustive(f);
 *   }
 * }
 * ```
 * @example
 * ```ts
 * // With a custom message
 * default: return assertExhaustive(someValue, 'Unreachable block');
 * ```
 * @example
 * ```ts
 * // Edge usage in if-checks
 * declare function neverReach(n: never):never;
 * neverReach(assertExhaustive('IMPOSSIBLE' as never));
 * // => throws
 * ```
 * @see {@link createTruenum}, {@link compareTruenumKeys}
 */
export function assertExhaustive(x: never, msg?: string): never {
  throw new Error(msg || `Non-exhaustive switch reached: ${String(x)}`);
}

/**
 * @template Key
 * @since 1.0.0
 *
 * Builds a Zod schema from a given Truenum.
 *
 * This function extracts the Zod schema within the specified Truenum and returns
 * it as a standalone schema instance. It is identical to accessing `truenum.zodSchema`
 * directly, but can be used for clarity or additional chaining. Offers no overhead
 * beyond referencing the existing schema.
 *
 * @param truenum - A valid Truenum instance from which to retrieve the schema.
 * @returns {z.ZodEnum<[Key, ...Key[]]>} A ZodEnum referencing the same keys as the Truenum.
 * @throws No direct error; the schema is guaranteed to exist for valid Truenums.
 * @example
 * ```ts
 * const Fruit = createTruenum({ members:['APPLE','BANANA'] as const });
 * const schema = buildZodSchema(Fruit);
 * schema.parse('APPLE'); // 'APPLE'
 * schema.parse('UNKNOWN'); // throws
 * ```
 * @example
 * ```ts
 * // Edge usage with single-member
 * const Single = createTruenum({ members:['ONLY'] as const });
 * const singleSchema = buildZodSchema(Single);
 * singleSchema.parse('ONLY'); // 'ONLY'
 * ```
 * @example
 * ```ts
 * // Validation usage
 * const userInput = 'BANANA';
 * const validated = buildZodSchema(Fruit).safeParse(userInput);
 * console.log(validated.success); // true if userInput is 'APPLE' or 'BANANA'
 * ```
 * @see {@link Truenum.zodSchema}, {@link createTruenum}
 */
export function buildZodSchema<Key extends string>(
  truenum: Truenum<Key>,
): z.ZodEnum<[Key, ...Key[]]> {
  return truenum.zodSchema;
}
