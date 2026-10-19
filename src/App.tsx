import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router'
import { RequireAuth } from './auth'
import { AdminDashboardPage } from './components/AdminDashboardPage'
import { AdminLayout } from './components/AdminLayout'
import { Layout } from './components/Layout'
import { LoginPage } from './components/LoginPage'
import { AdminProfilePage } from './components/AdminProfilePage'
import { AdminProjectEditPage } from './components/AdminProjectEditPage'
import { AdminProjectsPage } from './components/AdminProjectsPage'
import { Page } from './components/Page'
import { PublicAboutPage } from './components/PublicAboutPage'
import { PublicCallPage } from './components/PublicCallPage'
import { PublicContactPage } from './components/PublicContactPage'
import { PublicSupportPage } from './components/PublicSupportPage'
import { PublicBlogPage } from './components/PublicBlogPage'
import { PublicBlogsPage } from './components/PublicBlogsPage'
import { PublicProjectPage } from './components/PublicProjectPage'
import { PublicProjectsPage } from './components/PublicProjectsPage'
import { isLanguage } from './i18n'
import { routes } from './routes'

function LanguageLayout() {
  const { lang } = useParams()
  const location = useLocation()
  const { i18n } = useTranslation()
  const language = isLanguage(lang) ? lang : null

  useEffect(() => {
    if (!language) return
    document.documentElement.lang = language
    if (i18n.language !== language) {
      void i18n.changeLanguage(language)
    }
  }, [i18n, language])

  if (!language) {
    const [first, ...rest] = location.pathname.split('/').filter(Boolean)
    const isKnownSection = routes.some(
      (route) => route.path === first || route.path.startsWith(`${first}/`),
    )
    const suffix = isKnownSection ? location.pathname : `/${rest.join('/')}`
    const target = `/en${suffix === '/' ? '' : suffix}`
    return <Navigate to={target} replace />
  }

  return <Outlet />
}

function UnknownRedirect() {
  const { lang } = useParams()
  return <Navigate to={`/${lang ?? 'en'}`} replace />
}

function routeElement(titleKey: string) {
  return <Page titleKey={titleKey} />
}

export default function App() {
  const publicRoutes = routes.filter((route) => route.area === 'public')
  const adminRoutes = routes.filter((route) => route.area === 'admin' && route.path !== 'admin/login')

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path="/:lang" element={<LanguageLayout />}>
        <Route element={<Layout />}>
          {publicRoutes.map((route) => {
            let element = routeElement(route.titleKey)
            if (route.path === 'about') {
              element = <PublicAboutPage />
            } else if (route.path === 'call') {
              element = <PublicCallPage />
            } else if (route.path === 'contact') {
              element = <PublicContactPage />
            } else if (route.path === 'support') {
              element = <PublicSupportPage />
            } else if (route.path === 'projects') {
              element = <PublicProjectsPage />
            } else if (route.path === 'projects/:slug') {
              element = <PublicProjectPage />
            } else if (route.path === 'blog') {
              element = <PublicBlogsPage />
            } else if (route.path === 'blog/:slug') {
              element = <PublicBlogPage />
            }
            return route.path === '' ? (
              <Route key="home" index element={element} />
            ) : (
              <Route key={route.path} path={route.path} element={element} />
            )
          })}
        </Route>
        <Route path="admin/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            {adminRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.path === 'admin' ? (
                    <AdminDashboardPage />
                  ) : route.path === 'admin/profile' ? (
                    <AdminProfilePage />
                  ) : route.path === 'admin/projects' ? (
                    <AdminProjectsPage kind="project" />
                  ) : route.path === 'admin/projects/new' || route.path === 'admin/projects/:id' ? (
                    <AdminProjectEditPage kind="project" />
                  ) : route.path === 'admin/blog' ? (
                    <AdminProjectsPage kind="blog" />
                  ) : route.path === 'admin/blog/new' || route.path === 'admin/blog/:id' ? (
                    <AdminProjectEditPage kind="blog" />
                  ) : (
                    routeElement(route.titleKey)
                  )
                }
              />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<UnknownRedirect />} />
      </Route>
    </Routes>
  )
}
