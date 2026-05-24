import Link from 'next/link'
import { ArrowRight, BadgeCheck, BrainCircuit, Compass, DatabaseZap, Layers3, Search, Sparkles, Users } from 'lucide-react'
import type { ComponentType } from 'react'

import { BentoCard, BentoGrid } from '@/components/aceternity/bento-grid'
import { Spotlight } from '@/components/aceternity/spotlight'
import { MarketplaceExplorer } from '@/components/MarketplaceExplorer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MarketplaceIdea } from '@/lib/ideas'

type LandingPageProps = {
  ideas: MarketplaceIdea[]
  totalIdeas: number
  strongIdeas: number
  avgDemand: number
  errorMessage?: string
}

const builderSteps = [
  ['Describe the itch', 'Write the pain point in the messy words real customers would use.'],
  ['Research the market', 'Perplexity checks substitutes, competitors, demand clues, and risks.'],
  ['Publish the brief', 'Turn good findings into a searchable opportunity for builders.'],
]

export function LandingPage({ ideas, totalIdeas, strongIdeas, avgDemand, errorMessage }: LandingPageProps) {
  return (
    <main className="flex-1 bg-[#f7f7f4]">
      <section className="relative isolate overflow-hidden">
        <Spotlight />
        <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl flex-col px-4 pb-10 pt-12 text-white sm:px-6 lg:pt-16">
          <div className="max-w-4xl">
            <Badge className="mb-5 rounded-full border-white/15 bg-white/10 text-white hover:bg-white/10">
              <Sparkles className="size-3" />
              AI idea marketplace by Mandira
            </Badge>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Discover startup ideas people actually want solved.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              Fix My Itch turns raw problems into market briefs with competitors, scores, MVP wedges, audience clarity,
              and monetization paths, then lets the best ideas live in one searchable market.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 bg-white text-zinc-950 hover:bg-zinc-100">
                <Link href="/login">
                  Start building
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10">
                <a href="#market">Explore ideas</a>
              </Button>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur md:grid-cols-[1.1fr_0.9fr_0.9fr]">
              <HeroPanel title="Rural super-app" score="7/10" copy="Compare local commerce, payments, delivery, and trust signals before writing code." />
              <HeroMetric label="Ideas indexed" value={totalIdeas.toString()} icon={DatabaseZap} />
              <HeroMetric label="Avg demand" value={`${avgDemand}/10`} icon={Compass} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6">
          <ProofItem icon={BrainCircuit} value={`${strongIdeas}`} label="high-signal ideas ready to validate" />
          <ProofItem icon={Search} value="10x" label="faster research briefs for first-pass validation" />
          <ProofItem icon={Users} value="public" label="marketplace for founders, students, and operators" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium text-sky-700">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">From random thought to buildable brief.</h2>
        </div>
        <BentoGrid>
          {builderSteps.map(([title, copy], index) => (
            <BentoCard key={title}>
              <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
            </BentoCard>
          ))}
          <BentoCard className="md:col-span-2">
            <Layers3 className="mb-5 size-10 text-sky-700" />
            <h3 className="text-lg font-semibold text-zinc-950">Built for many idea styles</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Local India problems, SaaS gaps, student tools, AI automation, creator workflows, fintech utilities, and
              healthcare operations can all be scored in the same marketplace.
            </p>
          </BentoCard>
          <BentoCard>
            <BadgeCheck className="mb-5 size-10 text-emerald-700" />
            <h3 className="text-lg font-semibold text-zinc-950">Protected research engine</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Sign in before using the Perplexity-powered analysis so API usage stays protected.
            </p>
          </BentoCard>
        </BentoGrid>
      </section>

      <section id="market" className="border-t border-zinc-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <MarketplaceExplorer ideas={ideas} errorMessage={errorMessage} compact />
        </div>
      </section>

      <section className="bg-zinc-950 px-4 py-12 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-sky-300">Ready when your next itch appears</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Sign in and turn it into a market brief.</h2>
          </div>
          <Button asChild size="lg" className="h-11 bg-white text-zinc-950 hover:bg-zinc-100">
            <Link href="/login">
              Open builder workspace
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function HeroPanel({ title, score, copy }: { title: string; score: string; copy: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-200">Featured brief</span>
        <span className="font-mono text-sm text-emerald-300">{score}</span>
      </div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{copy}</p>
    </div>
  )
}

function HeroMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <Icon className="mb-5 size-5 text-sky-300" />
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  )
}

function ProofItem({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-lg font-semibold text-zinc-950">{value}</p>
        <p className="text-sm text-zinc-500">{label}</p>
      </div>
    </div>
  )
}
