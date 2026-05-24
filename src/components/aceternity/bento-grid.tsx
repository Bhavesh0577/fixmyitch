import { cn } from '@/lib/utils'

export function BentoGrid({ className, children }: React.ComponentProps<'div'>) {
  return <div className={cn('grid gap-4 md:grid-cols-3', className)}>{children}</div>
}

export function BentoCard({ className, children }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-950/5',
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="absolute -right-16 -top-16 size-36 rounded-full bg-sky-100/50 blur-2xl transition-transform group-hover:scale-125" />
      <div className="relative">{children}</div>
    </div>
  )
}
