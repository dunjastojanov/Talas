import { Trans, useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { ABOUT_FEATURED_PROJECT_SLUG } from '../siteLinks'
import { routeHref } from '../routes'
import { PageBanner } from './PageBanner'

const bodyClass = 'text-base leading-relaxed text-black sm:text-lg'

export function PublicAboutPage() {
  const { t } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const projectHref = routeHref(language, `projects/${ABOUT_FEATURED_PROJECT_SLUG}`)

  return (
    <>
      <PageBanner title={t('about')} />
      <main className="public-page-x py-8 sm:py-10">
      <div className="w-full space-y-6">
        <p className={bodyClass}>
          <Trans
            i18nKey="aboutIntro"
            components={{ org: <strong className="font-bold" /> }}
          />
        </p>

        <p className={bodyClass}>{t('aboutGoal')}</p>

        <p className={`${bodyClass} text-center font-bold`}>{t('aboutArtEcology')}</p>

        <p className={bodyClass}>
          <Trans
            i18nKey="aboutLatestProject"
            components={{
              projectLink: (
                <Link
                  to={projectHref}
                  className="italic text-blue-800 underline decoration-blue-800/40 underline-offset-2 hover:text-blue-500 hover:decoration-blue-500"
                />
              ),
            }}
          />
        </p>
      </div>

      <div className="mt-10 flex w-full flex-col gap-6 sm:mt-12 sm:gap-8">
        <img
          src="/about-us-1.webp"
          alt={t('aboutPhoto1Alt')}
          className="w-full rounded-lg object-cover"
          loading="lazy"
          decoding="async"
        />
        <img
          src="/about-us-2.webp"
          alt={t('aboutPhoto2Alt')}
          className="w-full rounded-lg object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    </main>
    </>
  )
}
