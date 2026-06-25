// Спільна серіалізація документа редактора: JSON для імпорту/експорту + компактний
// base64url для шарингу через URL-хеш. Фреймворк-незалежне (без React). Конкретний
// алгоритм інжектить лише три чисті перетворення: docToWire / parseWire / wireToDoc.
// (Граф-родина будує свою createGraphDocCodec поверх цієї фабрики — див. graph-doc.ts.)
//
// Поверх createDocCodec тут стоять ТИПОВІ фабрики для трьох родин документів-масивів —
// createValuesCodec (сортування: { values }), createSearchCodec (пошук: { values, target }
// (+ опційний step)) і createTextPatternCodec (рядкові: { text, pattern }) — щоб кожен
// з 15 *-doc.ts задавав лише ключі помилок, а не переписував валідацію wire наново.

import { tr } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"

/** Кодек документа редактора: JSON ↔ Doc і URL-хеш ↔ Doc. */
export interface DocCodec<Doc> {
  toJSON: (doc: Doc) => string
  fromJSON: (json: string) => Doc
  encodeHash: (doc: Doc) => string
  decodeHash: (s: string) => Doc | null
}

/** Як кодек перетворює Doc у дротовий формат і назад (із валідацією сирих даних). */
export interface DocWireModel<Doc, Wire> {
  /** Doc → серіалізовний wire-обʼєкт. */
  docToWire: (doc: Doc) => Wire
  /** Перевіряє сирий розпарсений JSON і повертає типізований Wire (кидає на невалідному). */
  parseWire: (raw: unknown) => Wire
  /** Wire → Doc (із санітизацією значень). */
  wireToDoc: (wire: Wire) => Doc
}

/** Кодує рядок у base64url (компактний, безпечний для URL-хеша). */
export function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/** Декодує base64url назад у рядок. */
export function fromBase64Url(s: string): string {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Будує кодек документа (JSON + URL-хеш) із трьох чистих перетворень. */
export function createDocCodec<Doc, Wire>(
  model: DocWireModel<Doc, Wire>,
): DocCodec<Doc> {
  const { docToWire, parseWire, wireToDoc } = model
  return {
    toJSON: (doc) => JSON.stringify(docToWire(doc), null, 2),
    fromJSON: (json) => wireToDoc(parseWire(JSON.parse(json))),
    encodeHash: (doc) => toBase64Url(JSON.stringify(docToWire(doc))),
    decodeHash: (s) => {
      try {
        return wireToDoc(parseWire(JSON.parse(fromBase64Url(s))))
      } catch {
        return null
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Типові фабрики wire version 1 для родин документів-масивів. Спільна перевірка
// «обʼєкт із version === 1» + санітизація чисел; алгоритм задає лише ключі помилок.
// ---------------------------------------------------------------------------

/** Перевіряє, що сире значення — обʼєкт wire-формату version 1. */
function requireWireV1(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  return o
}

function requireNumberArray(v: unknown, badKey: MessageKey): readonly number[] {
  if (!Array.isArray(v) || !v.every((x) => typeof x === "number")) {
    throw new Error(tr(badKey))
  }
  return v as readonly number[]
}

function requireNumber(v: unknown, badKey: MessageKey): number {
  if (typeof v !== "number") throw new Error(tr(badKey))
  return v
}

function requireString(v: unknown, badKey: MessageKey): string {
  if (typeof v !== "string") throw new Error(tr(badKey))
  return v
}

/**
 * Кодек документа-масиву `{ values }` (сортування). Значення серіалізуються як цілі
 * (`Math.round`) і санітизуються при завантаженні до цілих ≥0 (`Math.max(0, trunc)`).
 */
export function createValuesCodec<Doc extends { readonly values: readonly number[] }>(opts: {
  badValuesKey: MessageKey
}): DocCodec<Doc> {
  interface Wire {
    readonly version: 1
    readonly values: readonly number[]
  }
  return createDocCodec<Doc, Wire>({
    docToWire: (doc) => ({ version: 1, values: doc.values.map((v) => Math.round(v)) }),
    parseWire: (raw) => ({
      version: 1,
      values: requireNumberArray(requireWireV1(raw).values, opts.badValuesKey),
    }),
    wireToDoc: (wire) =>
      ({ values: wire.values.map((v) => Math.max(0, Math.trunc(v))) }) as unknown as Doc,
  })
}

/**
 * Кодек документа пошуку `{ values, target }` (значення — будь-які цілі, бо пошук
 * не вимагає невідʼємності). Якщо передано `step`, документ несе ще й крок індексу
 * (ціле ≥1) — індексно-послідовний пошук.
 */
export function createSearchCodec<
  Doc extends { readonly values: readonly number[]; readonly target: number },
>(opts: {
  badValuesKey: MessageKey
  badTargetKey: MessageKey
  step?: { readonly badStepKey: MessageKey }
}): DocCodec<Doc> {
  const { step } = opts
  interface Wire {
    readonly version: 1
    readonly values: readonly number[]
    readonly target: number
    readonly step?: number
  }
  return createDocCodec<Doc, Wire>({
    docToWire: (doc) => {
      const wire: Wire = {
        version: 1,
        values: doc.values.map((v) => Math.round(v)),
        target: Math.round(doc.target),
      }
      if (!step) return wire
      const docStep = (doc as unknown as { readonly step: number }).step
      return { ...wire, step: Math.max(1, Math.round(docStep)) }
    },
    parseWire: (raw) => {
      const o = requireWireV1(raw)
      const wire: Wire = {
        version: 1,
        values: requireNumberArray(o.values, opts.badValuesKey),
        target: requireNumber(o.target, opts.badTargetKey),
      }
      if (!step) return wire
      return { ...wire, step: requireNumber(o.step, step.badStepKey) }
    },
    wireToDoc: (wire) => {
      const doc = {
        values: wire.values.map((v) => Math.trunc(v)),
        target: Math.trunc(wire.target),
      }
      if (!step) return doc as unknown as Doc
      return { ...doc, step: Math.max(1, Math.trunc(wire.step ?? 1)) } as unknown as Doc
    },
  })
}

/** Кодек документа-рядка `{ text, pattern }` (рядкові алгоритми). Без санітизації. */
export function createTextPatternCodec<
  Doc extends { readonly text: string; readonly pattern: string },
>(opts: {
  badTextKey: MessageKey
  badPatternKey: MessageKey
}): DocCodec<Doc> {
  interface Wire {
    readonly version: 1
    readonly text: string
    readonly pattern: string
  }
  return createDocCodec<Doc, Wire>({
    docToWire: (doc) => ({ version: 1, text: doc.text, pattern: doc.pattern }),
    parseWire: (raw) => {
      const o = requireWireV1(raw)
      return {
        version: 1,
        text: requireString(o.text, opts.badTextKey),
        pattern: requireString(o.pattern, opts.badPatternKey),
      }
    },
    wireToDoc: (wire) => ({ text: wire.text, pattern: wire.pattern }) as unknown as Doc,
  })
}
