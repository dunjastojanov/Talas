import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

type PageProps = {
  titleKey: string
}

export function Page({ titleKey }: PageProps) {
  const { t } = useTranslation()
  const { id } = useParams()

  return (
    <main className="public-page-x py-8 sm:py-10">
      <h1 className="font-display text-2xl text-blue-800 sm:text-3xl lg:text-4xl">{t(titleKey, { id })}</h1>
    </main>
  )
}
