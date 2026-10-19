import { useTranslation } from 'react-i18next'
import type { ContentKindCopyKeys } from '../lib/contentKind'
import { Button } from './Button'
import { Dialog } from './Dialog'

type PublishConfirmDialogProps = {
  open: boolean
  willSaveChanges: boolean
  publishing: boolean
  copyKeys: Pick<
    ContentKindCopyKeys,
    'publishConfirmTitle' | 'publishConfirmBody' | 'publishConfirmBodyWithSave'
  >
  onClose: () => void
  onConfirm: () => void
}

export function PublishConfirmDialog({
  open,
  willSaveChanges,
  publishing,
  copyKeys,
  onClose,
  onConfirm,
}: PublishConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} title={t(copyKeys.publishConfirmTitle)} className="max-w-xl">
      <p className="text-green-800">
        {willSaveChanges ? t(copyKeys.publishConfirmBodyWithSave) : t(copyKeys.publishConfirmBody)}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={publishing}>
          {t('cancel')}
        </Button>
        <Button type="button" disabled={publishing} onClick={onConfirm}>
          {publishing ? t('publishing') : t('publish')}
        </Button>
      </div>
    </Dialog>
  )
}
