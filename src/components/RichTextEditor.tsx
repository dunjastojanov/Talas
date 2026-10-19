import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import type { TipTapDoc } from '../lib/tiptapDoc'
import { LinkInsertDialog } from './LinkInsertDialog'

type RichTextEditorProps = {
  content: TipTapDoc
  onChange: (doc: TipTapDoc) => void
}

const toolbarBtn =
  'rounded px-3 py-1.5 text-lg text-blue-800 hover:bg-blue-800/10 disabled:opacity-50'

function applyLink(editor: Editor, text: string, url: string) {
  if (!url) {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  const { from, to } = editor.state.selection
  const selectedText = editor.state.doc.textBetween(from, to, '')
  const label = text || selectedText || url

  if (from === to) {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: label,
        marks: [{ type: 'link', attrs: { href: url } }],
      })
      .run()
    return
  }

  editor
    .chain()
    .focus()
    .deleteSelection()
    .insertContent({
      type: 'text',
      text: label,
      marks: [{ type: 'link', attrs: { href: url } }],
    })
    .run()
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkInitialText, setLinkInitialText] = useState('')
  const [linkInitialUrl, setLinkInitialUrl] = useState('https://')

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
      Link.configure({ openOnClick: false }),
    ],
    content: content as JSONContent,
    onUpdate: ({ editor: ed, transaction }) => {
      if (transaction.getMeta('preventUpdate')) return
      onChange(ed.getJSON() as TipTapDoc)
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = JSON.stringify(editor.getJSON())
    const next = JSON.stringify(content)
    if (current !== next) {
      editor.commands.setContent(content as JSONContent, { emitUpdate: false })
    }
  }, [content, editor])

  const [, setToolbarTick] = useState(0)
  useEffect(() => {
    if (!editor) return
    const refreshToolbar = () => setToolbarTick((n) => n + 1)
    editor.on('selectionUpdate', refreshToolbar)
    editor.on('transaction', refreshToolbar)
    return () => {
      editor.off('selectionUpdate', refreshToolbar)
      editor.off('transaction', refreshToolbar)
    }
  }, [editor])

  if (!editor) return null

  function openLinkDialog() {
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, '')
    const previousUrl = editor.getAttributes('link').href as string | undefined
    setLinkInitialText(selectedText)
    setLinkInitialUrl(previousUrl ?? 'https://')
    setLinkOpen(true)
  }

  return (
    <>
      <div className="rounded-md border border-blue-800/20">
        <div className="flex flex-wrap gap-1 border-b border-blue-800/10 p-2">
          <button
            type="button"
            className={`${toolbarBtn} font-bold`}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </button>
          <button
            type="button"
            className={`${toolbarBtn} italic`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            I
          </button>
          <button
            type="button"
            className={`${toolbarBtn} underline`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            U
          </button>
          <button type="button" className={toolbarBtn} onClick={openLinkDialog}>
            Link
          </button>
          <button
            type="button"
            className={`${toolbarBtn} ${editor.isActive('bulletList') ? 'bg-blue-800/10' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            •
          </button>
          <button
            type="button"
            className={`${toolbarBtn} ${editor.isActive('orderedList') ? 'bg-blue-800/10' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1.
          </button>
        </div>
        <EditorContent
          editor={editor}
          className="p-3 text-green-800 [&_.ProseMirror]:min-h-[8rem] [&_.ProseMirror]:outline-none [&_a]:text-blue-800 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
        />
      </div>
      <LinkInsertDialog
        open={linkOpen}
        initialText={linkInitialText}
        initialUrl={linkInitialUrl}
        onClose={() => setLinkOpen(false)}
        onConfirm={(text, url) => applyLink(editor, text, url)}
      />
    </>
  )
}
