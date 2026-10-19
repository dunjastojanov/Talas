import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import type { TipTapDoc } from '../lib/tiptapDoc'

type RichTextContentProps = {
  content: TipTapDoc
  className?: string
}

const baseContentClass =
  'text-base text-black [&_.ProseMirror]:outline-none [&_a]:text-blue-800 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_p+p]:mt-3'

export function RichTextContent({ content, className = '' }: RichTextContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        strike: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({ openOnClick: true }),
    ],
    content: content as JSONContent,
    editable: false,
  })

  useEffect(() => {
    if (!editor) return
    const next = JSON.stringify(content)
    const current = JSON.stringify(editor.getJSON())
    if (next !== current) {
      editor.commands.setContent(content as JSONContent, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) return null

  return <EditorContent editor={editor} className={`${baseContentClass} ${className}`.trim()} />
}
