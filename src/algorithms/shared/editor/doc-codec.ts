// Спільна серіалізація документа редактора: JSON для імпорту/експорту + компактний
// base64url для шарингу через URL-хеш. Фреймворк-незалежне (без React). Конкретний
// алгоритм інжектить лише три чисті перетворення: docToWire / parseWire / wireToDoc.
// (Граф-родина будує свою createGraphDocCodec поверх цієї фабрики — див. graph-doc.ts.)

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
