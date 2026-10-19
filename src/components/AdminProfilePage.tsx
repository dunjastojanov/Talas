import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth-context'
import { changeOwnPassword, loadOwnProfile, updateOwnName } from '../lib/profile'
import { Button } from './Button'
import { ButtonIcon, buttonIcons } from './ButtonIcon'
import { Dialog } from './Dialog'
import { Skeleton } from './Skeleton'

const fieldClass = 'mt-1 w-full rounded-md border border-blue-800/30 bg-white px-3 py-2 text-green-800'

export function AdminProfilePage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user.id

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameSaved, setNameSaved] = useState(false)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)

  useEffect(() => {
    if (!userId) return
    const id = userId
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(false)
      const { profile, error } = await loadOwnProfile(id)
      if (cancelled) return
      if (error || !profile) {
        setLoadError(true)
        setLoading(false)
        return
      }
      setEmail(profile.email)
      setFirstName(profile.first_name)
      setLastName(profile.last_name)
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  async function onSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!userId) return
    const nextFirst = firstName.trim()
    const nextLast = lastName.trim()
    setNameSaved(false)
    if (!nextFirst || !nextLast) {
      setNameError(t('namesRequired'))
      return
    }
    setSavingName(true)
    setNameError(null)
    const { profile, error } = await updateOwnName(userId, nextFirst, nextLast)
    setSavingName(false)
    if (error || !profile) {
      setNameError(t('profileSaveFailed'))
      return
    }
    setFirstName(profile.first_name)
    setLastName(profile.last_name)
    setNameSaved(true)
  }

  function resetPasswordForm() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError(null)
  }

  function openPasswordDialog() {
    resetPasswordForm()
    setPasswordSaved(false)
    setPasswordOpen(true)
  }

  function closePasswordDialog() {
    if (savingPassword) return
    resetPasswordForm()
    setPasswordOpen(false)
  }

  async function onChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordMismatch'))
      return
    }
    setSavingPassword(true)
    setPasswordError(null)
    const result = await changeOwnPassword(email, currentPassword, newPassword)
    setSavingPassword(false)
    if (result === 'current-incorrect') {
      setPasswordError(t('currentPasswordIncorrect'))
      return
    }
    if (result === 'failed') {
      setPasswordError(t('passwordUpdateFailed'))
      return
    }
    resetPasswordForm()
    setPasswordOpen(false)
    setPasswordSaved(true)
  }

  if (loading) {
    return (
      <main className="px-4 py-6 lg:px-12 lg:py-10" aria-busy="true" aria-label={t('loading')}>
        <Skeleton className="h-10 w-40" />
        <div className="mt-8 max-w-xl space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-6 lg:px-12 lg:py-10">
      <h1 className="font-display text-3xl text-blue-800 sm:text-4xl">{t('profile')}</h1>

      {loadError ? (
        <p className="mt-6 text-sm text-red-700">{t('profileLoadError')}</p>
      ) : (
        <div className="mt-8 max-w-xl">
          <form className="flex flex-col gap-4" onSubmit={(event) => void onSaveName(event)}>
            <p className="text-sm text-green-800">
              {t('email')}
              <span className="mt-1 block text-base">{email}</span>
            </p>
            <label className="block text-sm text-green-800">
              {t('firstName')}
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                required
                value={firstName}
                className={fieldClass}
                onChange={(event) => {
                  setNameSaved(false)
                  setFirstName(event.target.value)
                }}
              />
            </label>
            <label className="block text-sm text-green-800">
              {t('lastName')}
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                required
                value={lastName}
                className={fieldClass}
                onChange={(event) => {
                  setNameSaved(false)
                  setLastName(event.target.value)
                }}
              />
            </label>
            {nameError ? <p className="text-sm text-red-700">{nameError}</p> : null}
            {nameSaved ? <p className="text-sm text-green-800">{t('profileSaved')}</p> : null}
            {passwordSaved ? <p className="text-sm text-green-800">{t('passwordUpdated')}</p> : null}
            <div className="flex items-center justify-between gap-2">
              <Button type="button" variant="outline" onClick={openPasswordDialog}>
                {t('changePassword')}
              </Button>
              <Button type="submit" disabled={savingName}>
                {!savingName ? <ButtonIcon src={buttonIcons.check} /> : null}
                {savingName ? t('saving') : t('save')}
              </Button>
            </div>
          </form>

          <Dialog open={passwordOpen} onClose={closePasswordDialog} title={t('changePassword')}>
            <form className="flex flex-col gap-4" onSubmit={(event) => void onChangePassword(event)}>
              <label className="block text-sm text-green-800">
                {t('currentPassword')}
                <input
                  type="password"
                  name="currentPassword"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  className={fieldClass}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </label>
              <label className="block text-sm text-green-800">
                {t('newPassword')}
                <input
                  type="password"
                  name="newPassword"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  className={fieldClass}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>
              <label className="block text-sm text-green-800">
                {t('confirmPassword')}
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  className={fieldClass}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
              {passwordError ? <p className="text-sm text-red-700">{passwordError}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closePasswordDialog} disabled={savingPassword}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? t('saving') : t('changePassword')}
                </Button>
              </div>
            </form>
          </Dialog>
        </div>
      )}
    </main>
  )
}
