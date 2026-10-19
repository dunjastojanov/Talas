export type ContentKind = 'project' | 'blog'

export type ContentKindCopyKeys = {
  adminListTitle: string
  newItem: string
  loadError: string
  empty: string
  noFilterResults: string
  itemLoadError: string
  saveFailed: string
  publishFailed: string
  deleteItem: string
  deleteFailed: string
  publishConfirmTitle: string
  publishConfirmBody: string
  publishConfirmBodyWithSave: string
  deleteConfirmTitle: string
  deleteConfirmBody: string
  deleteConfirmBodyNamed: string
}

type ContentKindConfig = {
  table: 'projects' | 'blogs'
  parentIdColumn: 'project_id' | 'blog_id'
  adminBasePath: 'admin/projects' | 'admin/blog'
  copy: ContentKindCopyKeys
}

export const contentKindConfig: Record<ContentKind, ContentKindConfig> = {
  project: {
    table: 'projects',
    parentIdColumn: 'project_id',
    adminBasePath: 'admin/projects',
    copy: {
      adminListTitle: 'adminProjects',
      newItem: 'newProject',
      loadError: 'projectsLoadError',
      empty: 'projectsEmpty',
      noFilterResults: 'projectsNoFilterResults',
      itemLoadError: 'projectLoadError',
      saveFailed: 'saveFailed',
      publishFailed: 'publishFailed',
      deleteItem: 'deleteProject',
      deleteFailed: 'deleteProjectFailed',
      publishConfirmTitle: 'publishConfirmTitle',
      publishConfirmBody: 'publishConfirmBody',
      publishConfirmBodyWithSave: 'publishConfirmBodyWithSave',
      deleteConfirmTitle: 'deleteProjectConfirmTitle',
      deleteConfirmBody: 'deleteProjectConfirmBody',
      deleteConfirmBodyNamed: 'deleteProjectConfirmBodyNamed',
    },
  },
  blog: {
    table: 'blogs',
    parentIdColumn: 'blog_id',
    adminBasePath: 'admin/blog',
    copy: {
      adminListTitle: 'adminBlog',
      newItem: 'newPost',
      loadError: 'blogsLoadError',
      empty: 'blogsEmpty',
      noFilterResults: 'blogsNoFilterResults',
      itemLoadError: 'postLoadError',
      saveFailed: 'savePostFailed',
      publishFailed: 'publishPostFailed',
      deleteItem: 'deletePost',
      deleteFailed: 'deletePostFailed',
      publishConfirmTitle: 'publishPostConfirmTitle',
      publishConfirmBody: 'publishPostConfirmBody',
      publishConfirmBodyWithSave: 'publishPostConfirmBodyWithSave',
      deleteConfirmTitle: 'deletePostConfirmTitle',
      deleteConfirmBody: 'deletePostConfirmBody',
      deleteConfirmBodyNamed: 'deletePostConfirmBodyNamed',
    },
  },
}

export function adminEditPath(kind: ContentKind, slug: string) {
  return `${contentKindConfig[kind].adminBasePath}/${slug}`
}

export function adminNewPath(kind: ContentKind) {
  return `${contentKindConfig[kind].adminBasePath}/new`
}
