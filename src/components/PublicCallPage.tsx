import { Trans, useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { routeHref } from '../routes'

const bodyClass = 'text-base leading-relaxed text-black sm:text-lg'
const sectionTitleClass = 'pt-2 font-display text-xl text-blue-800 sm:text-2xl'
const linkClass =
  'text-blue-800 underline decoration-blue-800/40 underline-offset-2 hover:text-blue-500 hover:decoration-blue-500'

export function PublicCallPage() {
  const { t } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const projectsHref = routeHref(language, 'projects')
  const contactHref = routeHref(language, 'contact')

  return (
    <main className="public-page-x py-8 sm:py-10">
      <h1 className="font-display text-2xl text-blue-800 sm:text-3xl lg:text-4xl">
        {t('callPageTitle')}
      </h1>

      <div className="mt-8 w-full space-y-6">
        <p className={bodyClass}>{t('callLead')}</p>
        <p className={bodyClass}>{t('callOffer')}</p>
        <p className={bodyClass}>{t('callVan')}</p>

        <h2 className={sectionTitleClass}>{t('callWhyTitle')}</h2>
        <p className={bodyClass}>{t('callWhyOrg')}</p>
        <p className={bodyClass}>{t('callWhyInvite')}</p>
        <p className={bodyClass}>{t('callWhyAccess')}</p>

        <h2 className={sectionTitleClass}>{t('callHowTitle')}</h2>
        <p className={bodyClass}>
          <Trans
            i18nKey="callHowSteps"
            components={{
              offer: <Link to={projectsHref} className={linkClass} />,
              inquiry: <Link to={contactHref} className={linkClass} />,
            }}
          />
        </p>
        <p className={bodyClass}>
          <Trans
            i18nKey="callHowUnsure"
            components={{
              write: <Link to={contactHref} className={linkClass} />,
            }}
          />
        </p>
        <p className={`${bodyClass} font-bold`}>{t('callClosing')}</p>
      </div>

      <img
        src="/kombi.jpeg"
        alt={t('callImageAlt')}
        className="mt-10 w-full rounded-lg object-cover sm:mt-12"
        loading="lazy"
        decoding="async"
      />
    </main>
  )
}
