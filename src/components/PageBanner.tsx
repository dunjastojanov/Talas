export function PageBanner({
  title,
  subtitle,
  src = '/home/banner.png',
}: {
  title: string
  subtitle?: string
  src?: string
}) {
  return (
    <div>
      <div className="relative flex min-h-[20.6vw] items-center justify-center">
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
        />
        <div className="relative z-10 flex w-[70%] max-w-3xl flex-col items-center px-4 py-[4%] text-center">
          <h1 className="font-display text-[clamp(1.25rem,3.4vw,3.25rem)] leading-tight text-blue-800">
            {title}
          </h1>
          {subtitle ? (
            <p className="hidden text-md leading-snug text-blue-800 sm:text-base sm:leading-relaxed lg:mt-3 lg:block">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {subtitle ? (
        <p className="public-page-x pt-6 text-left text-base leading-relaxed text-blue-800 lg:hidden">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
