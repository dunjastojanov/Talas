import { useTranslation } from 'react-i18next'
import type { ContentKindCopyKeys } from '../lib/contentKind'
import { Button } from './Button'
import { ButtonIcon, buttonIcons } from './ButtonIcon'
import { Dialog } from './Dialog'

type DeleteProjectConfirmDialogProps = {
  open: boolean
  itemTitle?: string
  deleting: boolean
  copyKeys: Pick<
    ContentKindCopyKeys,
    'deleteConfirmTitle' | 'deleteConfirmBody' | 'deleteConfirmBodyNamed' | 'deleteItem'
  >
  onClose: () => void
  onConfirm: () => void
}

const deleteConfirmBtn =
  'border-red-800 text-red-800 hover:bg-red-800/5 disabled:opacity-60'

export function DeleteProjectConfirmDialog({
  open,
  itemTitle,
  deleting,
  copyKeys,
  onClose,
  onConfirm,
}: DeleteProjectConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} title={t(copyKeys.deleteConfirmTitle)} className="max-w-xl">
      <p className="text-green-800">
        {itemTitle
          ? t(copyKeys.deleteConfirmBodyNamed, { title: itemTitle })
          : t(copyKeys.deleteConfirmBody)}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={deleting}>
          {t('cancel')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={deleteConfirmBtn}
          disabled={deleting}
          onClick={onConfirm}
        >
          {!deleting ? <ButtonIcon src={buttonIcons.trash} /> : null}
          {deleting ? t('deleting') : t(copyKeys.deleteItem)}
        </Button>
      </div>
    </Dialog>
  )
}
