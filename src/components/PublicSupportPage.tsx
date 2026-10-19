import { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TALAS_IPS_DONATION_RSD, type IpsQrParams } from '../lib/ipsQr'
import { Dialog } from './Dialog'
import { IpsQrCode } from './IpsQrCode'
import { Toast } from './Toast'

const bodyClass = 'text-base leading-relaxed text-black sm:text-lg'
const DONATION_EMAIL = 'talas.kulturnicentar@gmail.com'

const RSD_ACCOUNT = '265-2050310002884-33'
const FX_ACCOUNT = '265-1000001121861-77'

const accountCardClass =
  'flex min-w-[min(100%,20rem)] flex-1 flex-col gap-6 rounded-lg border border-blue-800/25 bg-white p-6 shadow-sm'

const iconButtonClass = 'shrink-0 rounded-md p-1.5 text-blue-800 hover:bg-blue-800/10'

function BankDonationCard({
  headingId,
  titleKey,
  account,
  onCopied,
  ips,
}: {
  headingId: string
  titleKey: string
  account: string
  onCopied: () => void
  ips?: {
    params: IpsQrParams
    hintKey: string
    altKey: string
  }
}) {
  const { t } = useTranslation()
  const [ipsOpen, setIpsOpen] = useState(false)

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(account)
      onCopied()
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section className={accountCardClass} aria-labelledby={headingId}>
      <h2 id={headingId} className="font-display text-xl text-blue-800 sm:text-2xl">
        {t(titleKey)}
      </h2>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 break-all font-sans text-base font-semibold text-black sm:text-lg">
          {account}
        </code>
        <button
          type="button"
          onClick={() => void copyAccount()}
          className={iconButtonClass}
          aria-label={t('supportCopyAccount')}
        >
          <img src="/icons/copy.svg" alt="" className="size-5" aria-hidden />
        </button>
        {ips ? (
          <button
            type="button"
            onClick={() => setIpsOpen(true)}
            className={iconButtonClass}
            aria-label={t('supportShowIpsQr')}
          >
            <img src="/icons/qr.svg" alt="" className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>

      {ips ? (
        <Dialog
          open={ipsOpen}
          onClose={() => setIpsOpen(false)}
          title={t('supportIpsQrLabel')}
          className="max-w-sm"
          centered
        >
          <div className="flex flex-col items-center">
            <IpsQrCode params={ips.params} hintKey={ips.hintKey} altKey={ips.altKey} />
          </div>
        </Dialog>
      ) : null}
    </section>
  )
}

export function PublicSupportPage() {
  const { t } = useTranslation()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current)
      }
    },
    [],
  )

  function showCopiedToast() {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
    }
    setToastMessage(t('supportCopied'))
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null)
      toastTimerRef.current = null
    }, 2500)
  }

  return (
    <main className="public-page-x py-8 sm:py-10">
      <Toast message={toastMessage} />
      <h1 className="font-display text-2xl text-blue-800 sm:text-3xl lg:text-4xl">
        {t('supportPageTitle')}
      </h1>

      <div className="mt-8 w-full space-y-6">
        <p className={`${bodyClass} text-xl font-bold sm:text-2xl`}>{t('supportHeadline')}</p>

        <p className={bodyClass}>{t('supportIntro')}</p>

        <p className={bodyClass}>{t('supportPaypalIntro')}</p>

        <ul className={`${bodyClass} list-disc space-y-2 pl-6`}>
          <li>{t('supportTransferStep1')}</li>
          <li>{t('supportPaymentPurpose')}</li>
          <li>{t('supportTransferStep2')}</li>
        </ul>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8">
          <BankDonationCard
            headingId="support-rsd-card"
            titleKey="supportIpsQrRsdCaption"
            account={RSD_ACCOUNT}
            onCopied={showCopiedToast}
            ips={{
              params: TALAS_IPS_DONATION_RSD,
              hintKey: 'supportIpsQrRsdHint',
              altKey: 'supportIpsQrRsdAlt',
            }}
          />
          <BankDonationCard
            headingId="support-fx-card"
            titleKey="supportIpsQrFxCaption"
            account={FX_ACCOUNT}
            onCopied={showCopiedToast}
          />
        </div>

        <p className={bodyClass}>{t('supportGifts')}</p>

        <p className={bodyClass}>
          <Trans
            i18nKey="supportReceipt"
            components={{
              email: (
                <a
                  href={`mailto:${DONATION_EMAIL}?subject=${encodeURIComponent(t('supportDonationEmailSubject'))}`}
                  className="text-blue-800 underline decoration-blue-800/40 underline-offset-2 hover:text-blue-500"
                />
              ),
            }}
          />
        </p>

        <p className={`${bodyClass} font-bold`}>{t('supportThanks')}</p>
      </div>

      <img
        src="/suport-us.png"
        alt={t('supportImageAlt')}
        className="mx-auto mt-10 block w-full max-w-sm sm:mt-12 sm:max-w-md"
        loading="lazy"
        decoding="async"
      />
    </main>
  )
}
