import { Activity, BrainCircuit, Compass, DatabaseZap } from 'lucide-react'
import type { ComponentType } from 'react'

import { IdeaChat } from '@/components/IdeaChat'
import { MarketplaceExplorer } from '@/components/MarketplaceExplorer'
import { Badge } from '@/components/ui/badge'
import type { MarketplaceIdea } from '@/lib/ideas'

type BuilderWorkspaceProps = {
  ideas: MarketplaceIdea[]
  totalIdeas: number
  strongIdeas: number
  avgDemand: number
  errorMessage?: string
}

export function BuilderWorkspace({ ideas, totalIdeas, strongIdeas, avgDemand, errorMessage }: BuilderWorkspaceProps) {
  return (
    <main className="flex-1 bg-[#f7f7f4]">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <Badge variant="outline" className="w-fit rounded-full border-sky-200 bg-sky-50 text-sky-800">
                  <Activity className="size-3" />
                  Builder workspace
                </Badge>

                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                    Turn today&apos;s itch into a market-ready startup brief.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-zinc-600">
                    Use the research console to score ideas, then publish the strongest ones into your marketplace for
                    founders and makers to discover.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Ideas indexed" value={totalIdeas.toString()} icon={DatabaseZap} tone="sky" />
                <StatCard label="Strong signals" value={strongIdeas.toString()} icon={BrainCircuit} tone="emerald" />
                <StatCard label="Avg demand" value={`${avgDemand}/10`} icon={Compass} tone="amber" />
              </div>
            </div>

            <IdeaChat />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <MarketplaceExplorer ideas={ideas} errorMessage={errorMessage} />
      </section>
    </main>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  tone: 'sky' | 'emerald' | 'amber'
}) {
  const toneClass = {
    sky: 'bg-sky-50 text-sky-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone]

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className={`mb-3 flex size-8 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon className="size-4" />
      </div>
      <p className="text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  )
}
