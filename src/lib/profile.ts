import { supabase } from './supabase'

export type UserProfile = {
  id: string
  email: string
  first_name: string
  last_name: string
}

export async function loadOwnProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) {
    return { profile: null as UserProfile | null, error: error?.message ?? 'missing' }
  }

  return { profile: data as UserProfile, error: null }
}

export async function updateOwnName(userId: string, firstName: string, lastName: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ first_name: firstName, last_name: lastName })
    .eq('id', userId)
    .select('id, email, first_name, last_name')
    .single()

  if (error || !data) {
    return { profile: null as UserProfile | null, error: error?.message ?? 'missing' }
  }

  return { profile: data as UserProfile, error: null }
}

export async function changeOwnPassword(email: string, currentPassword: string, newPassword: string) {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })

  if (signInError) return 'current-incorrect' as const

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return 'failed' as const
  return 'ok' as const
}
