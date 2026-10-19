export type AppRoute = {
  path: string
  titleKey: string
  nav?: boolean
  area: 'public' | 'admin'
}

export const routes: AppRoute[] = [
  { path: '', titleKey: 'home', nav: true, area: 'public' },
  { path: 'about', titleKey: 'about', nav: true, area: 'public' },
  { path: 'projects', titleKey: 'projects', nav: true, area: 'public' },
  { path: 'call', titleKey: 'call', nav: true, area: 'public' },
  { path: 'support', titleKey: 'support', nav: true, area: 'public' },
  { path: 'blog', titleKey: 'blog', nav: true, area: 'public' },
  { path: 'contact', titleKey: 'contact', nav: true, area: 'public' },
  { path: 'projects/:slug', titleKey: 'project', area: 'public' },
  { path: 'blog/:slug', titleKey: 'post', area: 'public' },
  { path: 'admin', titleKey: 'admin', nav: true, area: 'admin' },
  { path: 'admin/login', titleKey: 'login', area: 'admin' },
  { path: 'admin/projects', titleKey: 'adminProjects', nav: true, area: 'admin' },
  { path: 'admin/projects/new', titleKey: 'adminProject', area: 'admin' },
  { path: 'admin/projects/:id', titleKey: 'adminProject', area: 'admin' },
  { path: 'admin/blog', titleKey: 'adminBlog', nav: true, area: 'admin' },
  { path: 'admin/blog/new', titleKey: 'adminPost', area: 'admin' },
  { path: 'admin/blog/:id', titleKey: 'adminPost', area: 'admin' },
  { path: 'admin/profile', titleKey: 'profile', nav: true, area: 'admin' },
]

export function routeHref(lang: string, path: string) {
  return path ? `/${lang}/${path}` : `/${lang}`
}
