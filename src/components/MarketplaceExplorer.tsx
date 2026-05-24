'use client'

import Link from 'next/link'
import { ArrowUpRight, Flame, Search, SlidersHorizontal, Sparkles, Target } from 'lucide-react'
import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ideaCategories, type MarketplaceIdea } from '@/lib/ideas'

type MarketplaceExplorerProps = {
  ideas: MarketplaceIdea[]
  errorMessage?: string
  compact?: boolean
}

const sortOptions = [
  { value: 'hot', label: 'Hot signals' },
  { value: 'score', label: 'Best overall' },
  { value: 'unique', label: 'Most unique' },
  { value: 'new', label: 'Newest' },
]

function scoreTone(score: number) {
  if (score >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (score >= 6) return 'text-sky-700 bg-sky-50 border-sky-200'
  return 'text-amber-700 bg-amber-50 border-amber-200'
}

export function MarketplaceExplorer({ ideas, errorMessage, compact = false }: MarketplaceExplorerProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('hot')

  const filteredIdeas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return ideas
      .filter((idea) => {
        const matchesCategory = category === 'All' || idea.category === category
        const matchesQuery =
          !normalizedQuery ||
          [idea.title, idea.description, idea.evaluation, idea.audience, idea.category, ...idea.tags]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)

        return matchesCategory && matchesQuery
      })
      .sort((a, b) => {
        if (sort === 'score') return b.score - a.score
        if (sort === 'unique') return b.uniquenessScore - a.uniquenessScore
        if (sort === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

        const hotA = a.score * 1.8 + a.demandScore + a.uniquenessScore - a.difficultyScore * 0.4
        const hotB = b.score * 1.8 + b.demandScore + b.uniquenessScore - b.difficultyScore * 0.4
        return hotB - hotA
      })
  }, [category, ideas, query, sort])

  const topIdea = filteredIdeas[0]

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">Live idea market</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Browse what people want built</h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px] lg:w-[520px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ideas, markets, pain points..."
              className="h-9 pl-8"
            />
          </label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9">
              <SlidersHorizontal className="size-4 text-zinc-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {ideaCategories.map((item) => (
          <Button
            key={item}
            type="button"
            variant={category === item ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(item)}
            className="rounded-full"
          >
            {item}
          </Button>
        ))}
      </div>

      {topIdea && !compact ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Link href={`/ideas/${topIdea.id}`} className="block">
            <Card className="h-full rounded-lg border-0 bg-zinc-950 text-white ring-0 transition-transform hover:-translate-y-0.5">
              <CardHeader className="gap-3 px-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="rounded-full bg-white/10 text-white hover:bg-white/10">
                    <Flame className="size-3" />
                    Featured signal
                  </Badge>
                  <ArrowUpRight className="size-5 text-zinc-300" />
                </div>
                <CardTitle className="text-xl font-semibold leading-tight">{topIdea.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-5">
                <p className="line-clamp-3 text-sm leading-6 text-zinc-300">{topIdea.description}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Overall', topIdea.score],
                    ['Demand', topIdea.demandScore],
                    ['Unique', topIdea.uniquenessScore],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs text-zinc-400">{label}</p>
                      <p className="mt-1 text-xl font-semibold">{value}/10</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <SignalTile icon={Target} label="Validated angle" value={topIdea.stage} />
            <SignalTile icon={Sparkles} label="Best audience" value={topIdea.audience} />
            <SignalTile icon={Flame} label="Revenue path" value={topIdea.monetization} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(compact ? filteredIdeas.slice(0, 6) : filteredIdeas).map((idea) => (
          <Link key={idea.id} href={`/ideas/${idea.id}`} className="block">
            <Card className="h-full rounded-lg border-zinc-200 bg-white shadow-none transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm">
              <CardHeader className="gap-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className="rounded-full text-zinc-600">
                    {idea.category}
                  </Badge>
                  <span className={cn('rounded-full border px-2 py-1 text-xs font-semibold', scoreTone(idea.score))}>
                    {idea.score}/10
                  </span>
                </div>
                <CardTitle className="line-clamp-2 text-base font-semibold leading-snug text-zinc-950">
                  {idea.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <p className="line-clamp-3 text-sm leading-6 text-zinc-600">{idea.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <MiniMetric label="Demand" value={idea.demandScore} />
                  <MiniMetric label="Unique" value={idea.uniquenessScore} />
                  <MiniMetric label="Ease" value={11 - idea.difficultyScore} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {idea.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
          <p className="font-medium text-zinc-900">No matching ideas yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Try a broader search, switch category, or publish the first idea in this lane.
          </p>
          {errorMessage ? <p className="mt-4 text-xs text-red-500">Database note: {errorMessage}</p> : null}
        </div>
      ) : null}
    </section>
  )
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-2">
      <p className="text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-zinc-950">{value}/10</p>
    </div>
  )
}

function SignalTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
        <Icon className="size-4" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-medium text-zinc-950">{value}</p>
    </div>
  )
}
