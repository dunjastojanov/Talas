import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { useAuth } from '../auth-context'
import { isLanguage, type Language } from '../i18n'
import { routeHref, routes } from '../routes'
import { useMediaQuery } from '../lib/useMediaQuery'
import { Button } from './Button'
import { HamburgerIcon } from './HamburgerIcon'

const adminNavIcons: Record<string, string> = {
  admin: '/icons/dashboard.svg',
  'admin/projects': '/icons/project.svg',
  'admin/blog': '/icons/blog.svg',
  'admin/profile': '/icons/user.svg',
}

export function AdminLayout() {
  const { t } = useTranslation()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const isTabletUp = useMediaQuery('(min-width: 768px)')
  const isDesktopUp = useMediaQuery('(min-width: 1024px)')
  const language: Language = isLanguage(lang) ? lang : 'en'
  const nextLanguage: Language = language === 'en' ? 'sr' : 'en'

  const [sidebarOpen, setSidebarOpen] = useState(isTabletUp)

  useEffect(() => {
    if (isDesktopUp || isTabletUp) setSidebarOpen(true)
    else setSidebarOpen(false)
  }, [isDesktopUp, isTabletUp])

  useEffect(() => {
    if (!isTabletUp) setSidebarOpen(false)
  }, [location.pathname, isTabletUp])

  function switchLanguage(next: Language) {
    const rest = location.pathname.replace(/^\/[^/]+/, '')
    void navigate(`/${next}${rest}${location.search}${location.hash}`)
  }

  async function handleSignOut() {
    await signOut()
    void navigate(`/${language}/admin/login`)
  }

  function toggleSidebar() {
    if (isDesktopUp) return
    setSidebarOpen((open) => !open)
  }

  function closeMobileSidebar() {
    if (!isTabletUp) setSidebarOpen(false)
  }

  const adminNav = routes.filter((route) => route.area === 'admin' && route.nav)
  const sidebarVisible = isDesktopUp || sidebarOpen
  const showMenuButton = !isDesktopUp && !sidebarOpen
  const showTabletCollapse = isTabletUp && !isDesktopUp && sidebarOpen

  return (
    <div className="flex min-h-svh">
      {!isTabletUp && sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label={t('closeMenu')}
          onClick={closeMobileSidebar}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 flex-col bg-blue-800 px-10 pb-8 pt-16 text-white transition-transform duration-200 md:static md:shrink-0 md:translate-x-0 md:transition-[width,padding] md:duration-200 lg:w-80 lg:overflow-visible lg:px-10 ${
          sidebarVisible
            ? 'translate-x-0 md:w-80'
            : '-translate-x-full md:w-0 md:overflow-hidden md:px-0'
        }`}
      >
        <div className="mb-10 flex justify-center">
          <img
            src="/logo.svg"
            alt="Talas"
            className="h-16 w-auto max-w-full object-contain brightness-0 invert"
          />
        </div>
        {showTabletCollapse ? (
          <button
            type="button"
            className="mb-6 hidden text-left text-sm text-white/80 hover:text-white md:block lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ← {t('closeMenu')}
          </button>
        ) : null}
        <nav className="flex min-w-[14rem] flex-col gap-3 text-xl">
          {adminNav.map((route) => (
            <NavLink
              key={route.path}
              to={routeHref(language, route.path)}
              end={route.path === 'admin'}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-lg px-4 py-2.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white/15 font-bold text-white hover:bg-white/25'
                    : 'text-white hover:bg-white/15'
                }`
              }
              onClick={closeMobileSidebar}
            >
              <img
                src={adminNavIcons[route.path]}
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 brightness-0 invert"
              />
              {t(route.titleKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
          <div
            className={`flex items-center gap-4 px-4 py-4 ${showMenuButton ? 'justify-between' : 'justify-end'}`}
          >
            {showMenuButton ? (
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-md px-2 py-1 text-blue-800 hover:bg-blue-800/5 lg:hidden"
                aria-expanded={sidebarOpen}
                aria-label={t('openMenu')}
              >
                <HamburgerIcon />
              </button>
            ) : null}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => switchLanguage(nextLanguage)}
                className="text-blue-800"
                aria-label={t('language')}
              >
                {nextLanguage.toUpperCase()}
              </button>
              <Button variant="outline" onClick={() => void handleSignOut()}>
                {t('signOut')}
              </Button>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
