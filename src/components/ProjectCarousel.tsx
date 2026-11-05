import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { contentImageUrl } from '../lib/contentImages'
import type { PublicProjectListRow } from '../lib/loadPublicProjects'
import { projectTitle } from '../lib/projects'
import { routeHref } from '../routes'

const projectLinkClass =
  'inline-flex h-12 items-center justify-center rounded-[10px] border-[3px] border-white px-6 text-lg text-white hover:bg-white/10'
const arrowButtonClass =
  'relative z-20 shrink-0 cursor-pointer transition-transform duration-200 hover:scale-110 disabled:cursor-default disabled:opacity-40 disabled:hover:scale-100'

function mod(value: number, count: number) {
  return ((value % count) + count) % count
}

function motionClass(slot: number, shift: number) {
  if (shift === 1) {
    if (slot === -1) return 'project-move-l-enter'
    if (slot === 0) return 'project-move-l-exit'
    if (slot === -2) return 'project-move-l-side-in'
    return 'project-move-l-side-out'
  }
  if (shift === -1) {
    if (slot === 1) return 'project-move-r-enter'
    if (slot === 0) return 'project-move-r-exit'
    if (slot === 2) return 'project-move-r-side-in'
    return 'project-move-r-side-out'
  }
  return ''
}

function coverPose(slot: number): { transform: string; opacity: number; zIndex: number } {
  if (slot === 0) {
    return { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)', opacity: 1, zIndex: 2 }
  }
  const direction = slot < 0 ? -1 : 1
  const distance = Math.abs(slot)
  const shift = distance === 1 ? 58 : 108
  return {
    transform: `translate(calc(-50% + ${direction * shift}%), -50%) rotate(${direction * 12}deg) scale(0.5)`,
    opacity: distance === 1 ? 0.5 : 0,
    zIndex: distance === 1 ? 1 : 0,
  }
}

type ProjectCarouselProps = {
  projects: PublicProjectListRow[]
  className?: string
}

export function ProjectCarousel({ projects, className = '' }: ProjectCarouselProps) {
  const { t } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const [settled, setSettled] = useState(0)
  const [shown, setShown] = useState(0)
  const [shift, setShift] = useState(0)
  const [incoming, setIncoming] = useState<-1 | 0 | 1>(0)
  const [moveId, setMoveId] = useState(0)
  const animatingRef = useRef(false)
  const pendingRef = useRef<-1 | 0 | 1>(0)
  const settledRef = useRef(0)
  const shownRef = useRef(0)
  const finishRef = useRef(() => {})
  const touchStartXRef = useRef<number | null>(null)

  const count = projects.length

  finishRef.current = () => {
    if (!animatingRef.current) return
    animatingRef.current = false
    const pending = pendingRef.current
    pendingRef.current = 0
    settledRef.current = shownRef.current
    setIncoming(0)
    setShift(0)
    setSettled(shownRef.current)
    if (pending) window.setTimeout(() => go(pending), 40)
  }

  useEffect(() => {
    if (moveId === 0) return
    const timeout = window.setTimeout(() => finishRef.current(), 800)
    return () => window.clearTimeout(timeout)
  }, [moveId])

  const SWIPE_THRESHOLD_PX = 40

  function handleTouchStart(event: TouchEvent) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  function handleTouchEnd(event: TouchEvent) {
    const startX = touchStartXRef.current
    touchStartXRef.current = null
    if (startX == null || count < 2) return
    const endX = event.changedTouches[0]?.clientX
    if (endX == null) return
    const delta = endX - startX
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    go(delta < 0 ? 1 : -1)
  }

  function go(direction: -1 | 1) {
    if (count < 2) return
    if (animatingRef.current) {
      pendingRef.current = direction
      return
    }
    const nextShown = mod(settledRef.current + direction, count)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shownRef.current = nextShown
      settledRef.current = nextShown
      setShown(nextShown)
      setSettled(nextShown)
      return
    }
    shownRef.current = nextShown
    animatingRef.current = true
    setShown(nextShown)
    setIncoming(direction)
    setShift(direction === 1 ? -1 : 1)
    setMoveId((value) => value + 1)
  }

  if (count === 0) return null

  const project = projects[mod(shown, count)]
  const title = projectTitle(project, language)
  const canSwitch = count > 1
  const slots = [-1, 0, 1]
  if (incoming === 1) slots.push(2)
  if (incoming === -1) slots.push(-2)

  return (
    <div className={`flex flex-col items-center ${className}`.trim()}>
      <div className="flex items-center justify-center lg:gap-[clamp(10rem,20vw,16rem)]">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={!canSwitch}
          aria-label={t('homeProjectsPrev')}
          className={`hidden lg:block ${arrowButtonClass}`}
        >
          <img src="/home/arrow-left.svg" alt="" className="h-10 w-auto sm:h-14 lg:h-[72px]" />
        </button>

        <div
          className="relative aspect-[16/10] w-[78vw] max-w-[608px] touch-pan-y lg:h-[clamp(240px,32vw,380px)] lg:w-auto lg:max-w-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {slots.map((slot) => {
            const projectIndex = mod(settled + slot, count)
            const cover = projects[projectIndex]
            if (!cover?.cover_image_path) return null
            const pose = coverPose(slot)
            const end = coverPose(slot + shift)
            const isCurrent = slot + shift === 0
            const motion = motionClass(slot, shift)
            return (
              <img
                key={`${projectIndex}:${slot}`}
                src={contentImageUrl(cover.cover_image_path)}
                alt={isCurrent ? projectTitle(cover, language) : ''}
                aria-hidden={!isCurrent}
                draggable={false}
                className={`pointer-events-none absolute top-1/2 left-1/2 h-full w-full rounded-3xl object-cover ${motion}`}
                style={{ ...pose, zIndex: end.zIndex }}
                onAnimationEnd={(event) => {
                  if (event.animationName !== 'project-move-l-enter' && event.animationName !== 'project-move-r-enter') return
                  finishRef.current()
                }}
              />
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={!canSwitch}
          aria-label={t('homeProjectsNext')}
          className={`hidden lg:block ${arrowButtonClass}`}
        >
          <img
            src="/home/arrow-right.svg"
            alt=""
            className="h-10 w-auto -scale-x-100 sm:h-14 lg:h-[72px]"
          />
        </button>
      </div>

      <div key={project.id} className="project-caption-in flex flex-col items-center">
        <h3 className="mt-4 max-w-[90vw] text-center font-display text-xl leading-tight text-white sm:text-3xl lg:max-w-[62vw]">
          {title}
        </h3>
        <Link to={routeHref(language, `projects/${project.slug}`)} className={`mt-4 ${projectLinkClass}`}>
          {t('learnMore')}
        </Link>
      </div>
    </div>
  )
}
