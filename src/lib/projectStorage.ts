import { supabase } from './supabase'

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function uploadContentImage(projectId: string, file: File) {
  const path = `${projectId}/${crypto.randomUUID()}-${safeFileName(file.name)}`
  const { error } = await supabase.storage.from('content-images').upload(path, file, {
    upsert: false,
  })
  if (error) throw error
  return path
}
