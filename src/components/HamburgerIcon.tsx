type HamburgerIconProps = {
  className?: string
}

export function HamburgerIcon({ className = 'h-[26px] w-[41px]' }: HamburgerIconProps) {
  return (
    <img
      src="/Hamburger%20icon.svg"
      alt=""
      className={className}
      width={41}
      height={26}
    />
  )
}
