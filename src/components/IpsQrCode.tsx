import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildIpsQrString, type IpsQrParams } from '../lib/ipsQr'

type IpsQrCodeProps = {
  params: IpsQrParams
  hintKey: string
  altKey: string
  captionKey?: string
}

export function IpsQrCode({ params, captionKey, hintKey, altKey }: IpsQrCodeProps) {
  const { t } = useTranslation()
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const payload = buildIpsQrString(params)

  useEffect(() => {
    let cancelled = false

    void QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: { dark: '#000000', light: '#ffffff' },
    }).then((url) => {
      if (!cancelled) setDataUrl(url)
    })

    return () => {
      cancelled = true
    }
  }, [payload])

  return (
    <figure className="mx-auto w-full max-w-[280px]">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={t(altKey)}
          className="w-full max-w-[280px] rounded-lg border border-black/10 bg-white p-2"
          width={280}
          height={280}
        />
      ) : (
        <div
          className="aspect-square w-full max-w-[280px] animate-pulse rounded-lg bg-black/5"
          aria-hidden
        />
      )}
      <figcaption className="mt-2 text-center text-sm text-black/70">
        {captionKey ? (
          <span className="block font-medium text-black">{t(captionKey)}</span>
        ) : null}
        <span className={captionKey ? 'mt-1 block' : 'block'}>{t(hintKey)}</span>
      </figcaption>
    </figure>
  )
}
