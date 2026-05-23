import Link from 'next/link'
import { ArrowLeft, BadgeIndianRupee, Gauge, Lightbulb, Target, Users } from 'lucide-react'
import type { ComponentType } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { normalizeIdea, type IdeaRecord } from '@/lib/ideas'

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  if (!id) return <IdeaNotFound message="The idea link is missing an id." />

  const { data } = await supabase.from('ideas').select('*').eq('id', id).maybeSingle()

  if (!data) {
    return <IdeaNotFound message="This idea may not have been saved to the marketplace yet, or it was removed." />
  }

  const idea = normalizeIdea(data as IdeaRecord)

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Marketplace
          </Link>
        </Button>

        <article className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 lg:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full bg-sky-50 text-sky-800">
                {idea.category}
              </Badge>
              <Badge variant="outline" className="rounded-full text-zinc-500">
                {new Date(idea.createdAt).toLocaleDateString()}
              </Badge>
              {idea.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 lg:text-4xl">{idea.title}</h1>
            <p className="mt-5 whitespace-pre-wrap text-base leading-7 text-zinc-600">{idea.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <BriefTile icon={Users} label="Best audience" value={idea.audience} />
              <BriefTile icon={Target} label="Validation stage" value={idea.stage} />
              <BriefTile icon={BadgeIndianRupee} label="Revenue path" value={idea.monetization} />
            </div>

            <div className="mt-8 border-t border-zinc-100 pt-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-zinc-950">
                <Lightbulb className="size-5 text-amber-500" />
                AI market brief
              </h2>
              <div className="whitespace-pre-wrap rounded-lg border border-emerald-100 bg-emerald-50/70 p-5 text-sm leading-7 text-emerald-950">
                {idea.evaluation || 'No evaluation saved yet.'}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white">
              <p className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
                <Gauge className="size-4" />
                Builder scorecard
              </p>
              <div className="space-y-4">
                <ScoreRow label="Overall" value={idea.score} />
                <ScoreRow label="Demand" value={idea.demandScore} />
                <ScoreRow label="Uniqueness" value={idea.uniquenessScore} />
                <ScoreRow label="Build difficulty" value={idea.difficultyScore} inverse />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-semibold text-zinc-950">How to use this idea</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-zinc-600">
                <li>Interview five people from the audience segment.</li>
                <li>Confirm the current workaround and cost of the pain.</li>
                <li>Build only the MVP wedge that removes the first painful step.</li>
                <li>Publish learning back into the marketplace.</li>
              </ol>
            </div>
          </aside>
        </article>
      </div>
    </main>
  )
}

function IdeaNotFound({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-3xl font-semibold text-zinc-950">Idea not found</h1>
          <p className="mt-3 text-zinc-600">{message}</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to marketplace</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

function BriefTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <Icon className="mb-3 size-5 text-sky-700" />
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium leading-5 text-zinc-950">{value}</p>
    </div>
  )
}

function ScoreRow({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  const width = `${Math.max(10, Math.min(100, value * 10))}%`
  const tone = inverse ? 'bg-amber-400' : value >= 8 ? 'bg-emerald-400' : value >= 6 ? 'bg-sky-400' : 'bg-amber-400'

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-semibold">{value}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone}`} style={{ width }} />
      </div>
    </div>
  )
}
