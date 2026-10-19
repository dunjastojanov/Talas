import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { FACEBOOK_URL, INSTAGRAM_URL } from '../siteLinks'
import { routeHref, routes, type AppRoute } from '../routes'

const footerNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'font-bold text-white' : 'text-white/90 hover:text-white'

const wideLogoPad = 'pr-8'
const wideNavPad = 'px-8'
const wideNavGap = 'gap-10'
const wideSocialPad = 'pl-8'

/** True when the horizontal footer row fits inside the padded container. */
function useWideFooter(deps: unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [wide, setWide] = useState(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    const update = () => {
      const style = getComputedStyle(container)
      const available =
        container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      setWide(measure.scrollWidth <= available)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(measure)
    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) update()
    })

    return () => {
      cancelled = true
      observer.disconnect()
    }
    // Re-measure when nav labels change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps supplied by caller
  }, deps)

  return { containerRef, measureRef, wide }
}

function FooterLinkColumn({
  items,
  language,
  t,
}: {
  items: AppRoute[]
  language: Language
  t: (key: string) => string
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      {items.map((route) => (
        <NavLink
          key={route.path || 'home'}
          to={routeHref(language, route.path)}
          end={route.path === ''}
          className={({ isActive }) =>
            `block whitespace-nowrap py-2 text-base leading-none ${footerNavLinkClass({ isActive })}`
          }
        >
          {t(route.titleKey)}
        </NavLink>
      ))}
    </div>
  )
}

function VerticalDivider() {
  return <div className="w-px shrink-0 self-stretch bg-white/35" aria-hidden />
}

function FooterLogo({ language, large }: { language: Language; large: boolean }) {
  return (
    <NavLink
      to={routeHref(language, '')}
      end
      className={`flex shrink-0 items-center ${large ? wideLogoPad : ''}`}
    >
      <img
        src="/logo.svg"
        alt="Talas"
        className={`w-auto object-contain object-left brightness-0 invert ${
          large ? 'h-20 max-w-[18rem]' : 'h-16 max-w-[14rem]'
        }`}
      />
    </NavLink>
  )
}

function FooterNav({
  columns,
  language,
  t,
  wide,
}: {
  columns: [AppRoute[], AppRoute[]]
  language: Language
  t: (key: string) => string
  wide: boolean
}) {
  return (
    <div className={wide ? `flex flex-1 justify-center ${wideNavPad}` : 'flex w-full justify-center'}>
      <nav
        className={
          wide
            ? `flex items-start ${wideNavGap}`
            : 'flex max-w-full flex-wrap justify-center gap-x-8 gap-y-1'
        }
      >
        {columns.map((items, index) => (
          <FooterLinkColumn key={index} items={items} language={language} t={t} />
        ))}
      </nav>
    </div>
  )
}

function FooterSocial({ t, wide }: { t: (key: string) => string; wide: boolean }) {
  const iconClass = `brightness-0 invert ${wide ? 'size-9' : 'size-8'}`

  return (
    <div className={`flex shrink-0 items-center gap-5 ${wide ? `self-center ${wideSocialPad}` : ''}`}>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md p-1 text-white hover:bg-white/10"
        aria-label={t('facebook')}
      >
        <img src="/icons/facebook.svg" alt="" className={iconClass} />
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md p-1 text-white hover:bg-white/10"
        aria-label={t('instagram')}
      >
        <img src="/icons/instagram.svg" alt="" className={iconClass} />
      </a>
    </div>
  )
}

export function SiteFooter() {
  const { t, i18n } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const publicNav = routes.filter((route) => route.nav && route.area === 'public')
  const splitAt = Math.ceil(publicNav.length / 2)
  const columns: [AppRoute[], AppRoute[]] = [publicNav.slice(0, splitAt), publicNav.slice(splitAt)]
  const navMeasureKey = publicNav.map((route) => t(route.titleKey)).join('\0')
  const { containerRef, measureRef, wide } = useWideFooter([navMeasureKey, i18n.language])

  return (
    <footer className="mt-auto bg-gradient-to-r from-green-800 to-green-500 text-white">
      <div
        ref={containerRef}
        className={`public-page-x relative ${wide ? 'py-10' : 'py-8'}`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-hidden opacity-0"
          inert
          aria-hidden
        >
          <div ref={measureRef} className="flex w-max items-stretch">
            <FooterLogo language={language} large />
            <VerticalDivider />
            <div className={`flex justify-center ${wideNavPad}`}>
              <nav className={`flex items-start ${wideNavGap}`}>
                {columns.map((items, index) => (
                  <FooterLinkColumn key={index} items={items} language={language} t={t} />
                ))}
              </nav>
            </div>
            <VerticalDivider />
            <FooterSocial t={t} wide />
          </div>
        </div>

        <div className={wide ? 'flex items-stretch' : 'flex flex-col items-center gap-8'}>
          <FooterLogo language={language} large={wide} />
          {wide ? <VerticalDivider /> : null}
          <FooterNav columns={columns} language={language} t={t} wide={wide} />
          {wide ? <VerticalDivider /> : null}
          <FooterSocial t={t} wide={wide} />
        </div>
      </div>
    </footer>
  )
}
