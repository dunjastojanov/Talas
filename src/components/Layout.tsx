import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { useCompactHeader } from '../lib/useCompactHeader'
import { routeHref, routes } from '../routes'
import { HamburgerIcon } from './HamburgerIcon'
import { SiteFooter } from './SiteFooter'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'font-bold text-blue-800' : 'text-blue-800 hover:text-blue-500'

export function Layout() {
  const { t, i18n } = useTranslation()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const isHome = location.pathname === `/${language}` || location.pathname === `/${language}/`
  const nextLanguage: Language = language === 'en' ? 'sr' : 'en'
  const [menuOpen, setMenuOpen] = useState(false)

  const publicNav = routes.filter((route) => route.nav && route.area === 'public')
  const navMeasureKey = publicNav.map((route) => t(route.titleKey)).join('\0')

  const { containerRef, measureRef, compact } = useCompactHeader([navMeasureKey, i18n.language])

  useEffect(() => {
    if (!compact) setMenuOpen(false)
  }, [compact])

  useEffect(() => {
    if (compact) setMenuOpen(false)
  }, [location.pathname, compact])

  useEffect(() => {
    if (!compact || !menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen, compact])

  function switchLanguage(next: Language) {
    const rest = location.pathname.replace(/^\/[^/]+/, '')
    void navigate(`/${next}${rest}${location.search}${location.hash}`)
  }

  function closeMenu() {
    if (compact) setMenuOpen(false)
  }

  const logoClassName = `h-10 w-auto object-contain object-left ${
    compact ? 'max-w-[min(12rem,52vw)]' : 'max-w-none'
  }`
  const logoImg = <img src="/logo.svg" alt="Talas" className={logoClassName} />
  const logoForMeasure = (
    <img src="/logo.svg" alt="" className="h-10 w-auto max-w-none object-contain object-left" />
  )

  const navLinks = (options?: { tabIndex?: number; onClick?: () => void }) =>
    publicNav.map((route) => (
      <NavLink
        key={route.path || 'home'}
        to={routeHref(language, route.path)}
        end={route.path === ''}
        className={navLinkClass}
        tabIndex={options?.tabIndex}
        onClick={options?.onClick}
      >
        {t(route.titleKey)}
      </NavLink>
    ))

  const languageButton = (className: string) => (
    <button
      type="button"
      onClick={() => switchLanguage(nextLanguage)}
      className={className}
      aria-label={t('language')}
    >
      {nextLanguage.toUpperCase()}
    </button>
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="relative z-50 bg-white">
        <div
          ref={containerRef}
          className="public-page-x relative flex items-center justify-between gap-4 py-4 text-base leading-none"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-hidden" aria-hidden>
            <div ref={measureRef} className="flex w-max items-center gap-4">
              {logoForMeasure}
              <div className="flex shrink-0 items-center gap-x-8 whitespace-nowrap">
                <nav className="flex items-center gap-x-8">{navLinks()}</nav>
                {languageButton('shrink-0 text-base leading-none')}
              </div>
            </div>
          </div>

          {compact ? (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="relative z-10 rounded-md px-1 py-0.5 text-blue-800 hover:bg-blue-800/5"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            >
              <HamburgerIcon className="h-4 w-auto" />
            </button>
          ) : null}

          <NavLink
            to={routeHref(language, '')}
            end
            className={`shrink-0 ${
              compact ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''
            }`}
          >
            {logoImg}
          </NavLink>

          {!compact ? (
            <div className="ml-auto flex shrink-0 items-center gap-x-8">
              <nav className="flex items-center gap-x-8 whitespace-nowrap">{navLinks()}</nav>
              {languageButton('shrink-0 text-base leading-none text-blue-800')}
            </div>
          ) : (
            languageButton('relative z-10 shrink-0 text-base leading-none text-blue-800')
          )}
        </div>
      </header>

      {compact ? (
        <>
          <button
            type="button"
            className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ease-out ${
              menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-label={t('closeMenu')}
            aria-hidden={!menuOpen}
            tabIndex={menuOpen ? 0 : -1}
            onClick={closeMenu}
          />
          <nav
            className={`fixed inset-y-0 left-0 z-[70] flex h-svh w-[70%] flex-col gap-4 overflow-y-auto bg-white px-6 py-8 shadow-xl transition-transform duration-300 ease-out ${
              menuOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
            }`}
            aria-hidden={!menuOpen}
          >
            {navLinks({ tabIndex: menuOpen ? 0 : -1, onClick: closeMenu })}
          </nav>
        </>
      ) : null}

      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <SiteFooter solid={isHome} />
    </div>
  )
}
