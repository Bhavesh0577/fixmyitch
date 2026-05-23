import { Activity, BrainCircuit, Compass, DatabaseZap } from 'lucide-react'
import type { ComponentType } from 'react'

import { IdeaChat } from '@/components/IdeaChat'
import { MarketplaceExplorer } from '@/components/MarketplaceExplorer'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/utils/supabase/server'
import { normalizeIdea, type IdeaRecord } from '@/lib/ideas'

const fallbackIdeas: IdeaRecord[] = [
  {
    id: 'seed-local-ops',
    title: 'WhatsApp-first operations desk for small local service businesses',
    description:
      'Owners collect bookings, payments, staff availability, and customer complaints across calls and WhatsApp. A lightweight desk could turn every message into jobs, reminders, receipts, and follow-ups without forcing them into a heavy ERP.',
    evaluation:
      '## Similar products\n- Housecall Pro and Jobber solve this for mature service businesses.\n- Many India-first shops still run through WhatsApp and paper.\n\n## Uniqueness score\n- 8 / 10 because the wedge is mobile-first local operations, not full ERP.\n\n## Overall score\n- 8 / 10\n\n## Demand signal\n- 8 / 10\n\n## Build difficulty\n- 5 / 10\n\n## Market-ready suggestions\n- Start with plumbers, appliance repair, or salons.\n- Build WhatsApp intake, calendar, payment link, and follow-up reminders first.',
    score: 8,
    uniqueness_score: 8,
    demand_score: 8,
    difficulty_score: 5,
    category: 'Local India',
    audience: 'Small service business owners',
    stage: 'Ready to validate',
    monetization: 'Monthly per shop plus payment/link usage',
    tags: ['Local India', 'WhatsApp', 'operations', 'payments'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-ai-review',
    title: 'Review miner that turns angry app-store reviews into product briefs',
    description:
      'Builders waste days guessing what to build. This tool clusters reviews from Shopify, Chrome Web Store, G2, Reddit, and Product Hunt into pain points, buyer urgency, competitor gaps, and MVP specs.',
    evaluation:
      '## Similar products\n- IdeaRadar, DemandDrop, and IdeaPicker scan public signals.\n\n## Uniqueness score\n- 7 / 10 if it focuses on app marketplace reviews and exact build briefs.\n\n## Overall score\n- 8 / 10\n\n## Demand signal\n- 9 / 10\n\n## Build difficulty\n- 6 / 10\n\n## Market-ready suggestions\n- Start with one ecosystem like Shopify apps.\n- Show source quotes, frequency, and willingness-to-pay clues.',
    score: 8,
    uniqueness_score: 7,
    demand_score: 9,
    difficulty_score: 6,
    category: 'AI & Automation',
    audience: 'Indie hackers and product teams',
    stage: 'Ready to validate',
    monetization: 'Credits for research reports',
    tags: ['AI & Automation', 'reviews', 'research', 'SaaS'],
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: 'seed-student',
    title: 'Outcome-based study planner for students who keep restarting',
    description:
      'Students often make beautiful timetables but lose momentum after two missed days. The app rebuilds plans around deadlines, energy, weak topics, and tiny daily wins instead of rigid calendars.',
    evaluation:
      '## Similar products\n- Notion templates, Todoist, and study timer apps cover planning pieces.\n\n## Uniqueness score\n- 6 / 10 unless it gets strong personalization and accountability.\n\n## Overall score\n- 7 / 10\n\n## Demand signal\n- 7 / 10\n\n## Build difficulty\n- 4 / 10\n\n## Market-ready suggestions\n- Pick one exam segment first.\n- Add streak recovery, topic diagnosis, and parent/mentor reports later.',
    score: 7,
    uniqueness_score: 6,
    demand_score: 7,
    difficulty_score: 4,
    category: 'Education',
    audience: 'Exam-prep students',
    stage: 'Needs sharper wedge',
    monetization: 'Freemium plus coaching add-ons',
    tags: ['Education', 'planning', 'exams', 'habits'],
    created_at: new Date(Date.now() - 172_800_000).toISOString(),
  },
]

export default async function Page() {
  const supabase = await createClient()

  let ideas: IdeaRecord[] = []
  let errorMessage = ''

  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60)

    if (error) {
      errorMessage = error.message
    } else {
      ideas = data ?? []
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Network error fetching ideas'
  }

  const marketplaceIdeas = (ideas.length ? ideas : fallbackIdeas).map(normalizeIdea)
  const totalIdeas = marketplaceIdeas.length
  const strongIdeas = marketplaceIdeas.filter((idea) => idea.score >= 8).length
  const avgDemand = Math.round(
    marketplaceIdeas.reduce((total, idea) => total + idea.demandScore, 0) / Math.max(totalIdeas, 1)
  )

  return (
    <main className="flex-1 bg-[#f7f7f4]">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-6 lg:py-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <Badge variant="outline" className="w-fit rounded-full border-sky-200 bg-sky-50 text-sky-800">
                <Activity className="size-3" />
                Idea market for builders
              </Badge>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                  Find painful problems, shape better startup ideas, and publish the ones worth building.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-zinc-600">
                  Describe an itch in plain language. Perplexity-powered research turns it into a market brief with
                  alternatives, scores, MVP moves, risks, and monetization paths. The best ideas become a searchable
                  marketplace for founders, students, and makers.
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
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <MarketplaceExplorer ideas={marketplaceIdeas} errorMessage={errorMessage} />
      </div>
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
