const facebook = import.meta.env.VITE_FACEBOOK_URL
const instagram = import.meta.env.VITE_INSTAGRAM_URL

export const FACEBOOK_URL =
  typeof facebook === 'string' && facebook.length > 0
    ? facebook
    : 'https://www.facebook.com/p/Kulturni-centar-Talas-61581986590313/'

export const INSTAGRAM_URL =
  typeof instagram === 'string' && instagram.length > 0
    ? instagram
    : 'https://www.instagram.com/kc_talas/'

/** Public project page linked from the About page (“Na točkovima kulture”). */
export const ABOUT_FEATURED_PROJECT_SLUG = 'na-tockovima-kulture'
