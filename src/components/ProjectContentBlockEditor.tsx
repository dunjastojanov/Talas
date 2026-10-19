import { useTranslation } from 'react-i18next'
import type { Language } from '../i18n'
import type { EditorBlock, EditorImageBlock, EditorTextBlock } from '../lib/projects'
import { Button } from './Button'
import { ButtonIcon, buttonIcons } from './ButtonIcon'
import { ImageBlockField } from './ImageBlockField'
import { RichTextEditor } from './RichTextEditor'

type ProjectContentBlockEditorProps = {
  block: EditorBlock
  contentLocale: Language
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onChange: (block: EditorBlock) => void
  onRemove: () => void
}

export function ProjectContentBlockEditor({
  block,
  contentLocale,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onChange,
  onRemove,
}: ProjectContentBlockEditorProps) {
  const { t } = useTranslation()

  const blockToolbar = (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-1">
        <button
          type="button"
          className="rounded-md p-1.5 text-blue-800 hover:bg-blue-800/10 disabled:opacity-40"
          disabled={!canMoveUp}
          aria-label={t('moveBlockUp')}
          onClick={onMoveUp}
        >
          <ButtonIcon src={buttonIcons.chevronUp} className="size-5" />
        </button>
        <button
          type="button"
          className="rounded-md p-1.5 text-blue-800 hover:bg-blue-800/10 disabled:opacity-40"
          disabled={!canMoveDown}
          aria-label={t('moveBlockDown')}
          onClick={onMoveDown}
        >
          <ButtonIcon src={buttonIcons.chevronDown} className="size-5" />
        </button>
      </div>
      <Button type="button" variant="outline" className="text-sm" onClick={onRemove}>
        <ButtonIcon src={buttonIcons.trash} />
        {t('removeBlock')}
      </Button>
    </div>
  )

  if (block.blockType === 'text') {
    const textBlock = block as EditorTextBlock
    const content = contentLocale === 'en' ? textBlock.body_en : textBlock.body_sr
    return (
      <div className="rounded-lg border border-blue-800/20 p-4">
        {blockToolbar}
        <RichTextEditor
          key={`${textBlock.clientId}-${contentLocale}`}
          content={content}
          onChange={(doc) => {
            if (contentLocale === 'en') {
              onChange({ ...textBlock, body_en: doc })
            } else {
              onChange({ ...textBlock, body_sr: doc })
            }
          }}
        />
      </div>
    )
  }

  const imageBlock = block as EditorImageBlock

  return (
    <div className="rounded-lg border border-blue-800/20 p-4">
      {blockToolbar}
      <ImageBlockField
        imagePath={imageBlock.image_path}
        pendingFile={imageBlock.pendingFile}
        onFileChange={(file) => onChange({ ...imageBlock, pendingFile: file })}
      />
    </div>
  )
}
