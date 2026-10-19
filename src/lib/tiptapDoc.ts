import type { JSONContent } from '@tiptap/core'

export type TipTapDoc = JSONContent & { type: 'doc' }

export function emptyTipTapDoc(): TipTapDoc {
  return { type: 'doc', content: [{ type: 'paragraph' }] }
}

export function normalizeTipTapDoc(value: unknown): TipTapDoc {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    (value as TipTapDoc).type === 'doc'
  ) {
    return value as TipTapDoc
  }
  return emptyTipTapDoc()
}
