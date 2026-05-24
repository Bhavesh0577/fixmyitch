import { cn } from '@/lib/utils'

export function Spotlight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        '[background:radial-gradient(circle_at_20%_12%,rgba(56,189,248,0.24),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(16,185,129,0.2),transparent_26%),linear-gradient(180deg,#050505_0%,#0b0b0c_72%,#f7f7f4_72%)]',
        className
      )}
    >
      <div className="absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.03] blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:58px_58px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
    </div>
  )
}
