import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { routeHref } from '../routes'

const outlineButtonClass =
  'inline-flex h-12 items-center justify-center rounded-[10px] border-[3px] border-blue-800 px-6 text-lg text-blue-800 hover:bg-blue-800/5'
const filledButtonClass =
  'inline-flex h-12 items-center justify-center rounded-[10px] bg-blue-800 px-6 text-lg text-white hover:bg-blue-800/90'

export function HomeHero() {
  const { t } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'

  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden pt-16 pb-0 lg:block lg:h-[854px] lg:pt-0">
      <div className="public-page-x relative z-10 w-full text-center lg:absolute lg:inset-x-0 lg:top-[20%] lg:text-left">
        <h1 className="font-display text-5xl leading-none text-blue-800 sm:text-6xl lg:text-7xl">
          {t('homeTitle')}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-snug text-black sm:text-xl lg:mx-0 lg:mt-8">
          {t('homeTaglineLine1')}
          <br />
          {t('homeTaglineLine2')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 lg:mt-12 lg:justify-start">
          <Link to={routeHref(language, 'about')} className={outlineButtonClass}>
            {t('learnMore')}
          </Link>
          <Link to={routeHref(language, 'contact')} className={filledButtonClass}>
            {t('contact')}
          </Link>
        </div>
      </div>
      <img
        src="/home/hero_top_left.png"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute top-0 left-0 z-0 w-[28vw] opacity-60 select-none sm:w-[26vw] sm:opacity-80 md:w-[30vw] lg:w-[15vw] lg:opacity-100"
      />
      <img
        src="/home/hero_bottom_left.png"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute bottom-0 left-[-6px] z-0 w-[28vw] opacity-60 select-none sm:w-[28vw] sm:opacity-80 md:w-[32vw] lg:w-[20vw] lg:opacity-100"
      />
      <img
        src="/home/hero_right.png"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none relative z-10 mt-10 w-[90%] max-w-md self-end select-none sm:mt-12 sm:w-[75%] sm:max-w-xl md:max-w-2xl lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:max-w-none lg:w-[45vw]"
      />
    </section>
  )
}
