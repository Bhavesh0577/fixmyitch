export type IdeaRecord = {
  id: string
  title: string
  description: string
  evaluation?: string | null
  score?: number | null
  uniqueness_score?: number | null
  demand_score?: number | null
  difficulty_score?: number | null
  category?: string | null
  audience?: string | null
  stage?: string | null
  monetization?: string | null
  tags?: string[] | null
  created_at?: string | null
}

export type MarketplaceIdea = {
  id: string
  title: string
  description: string
  evaluation: string
  score: number
  uniquenessScore: number
  demandScore: number
  difficultyScore: number
  category: string
  audience: string
  stage: string
  monetization: string
  tags: string[]
  createdAt: string
}

const categoryKeywords: Array<[string, string[]]> = [
  ['AI & Automation', ['ai', 'agent', 'automation', 'workflow', 'prompt', 'chatbot']],
  ['B2B SaaS', ['saas', 'business', 'team', 'crm', 'sales', 'operations', 'erp']],
  ['Consumer Apps', ['habit', 'friend', 'family', 'personal', 'dating', 'social']],
  ['Education', ['student', 'learn', 'course', 'school', 'college', 'teacher']],
  ['Fintech', ['payment', 'invoice', 'money', 'finance', 'bank', 'tax', 'expense']],
  ['Healthcare', ['health', 'doctor', 'patient', 'clinic', 'fitness', 'mental']],
  ['Local India', ['india', 'kirana', 'local', 'shop', 'vendor', 'small business']],
  ['Creator Economy', ['creator', 'youtube', 'newsletter', 'content', 'influencer']],
]

export const ideaCategories = [
  'All',
  'AI & Automation',
  'B2B SaaS',
  'Consumer Apps',
  'Education',
  'Fintech',
  'Healthcare',
  'Local India',
  'Creator Economy',
  'Other',
]

export function clampScore(value: unknown, fallback = 6) {
  const score = Number(value)
  if (!Number.isFinite(score)) return fallback
  return Math.max(1, Math.min(10, Math.round(score)))
}

export function extractScore(text?: string | null, label?: string) {
  if (!text) return null

  const escapedLabel = label?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = escapedLabel
    ? [
        new RegExp(`${escapedLabel}[^0-9]{0,40}(\\d+(?:\\.\\d+)?)\\s*\\/\\s*10`, 'i'),
        new RegExp(`${escapedLabel}[^0-9]{0,40}(\\d+(?:\\.\\d+)?)`, 'i'),
      ]
    : [/(\d+(?:\.\d+)?)\s*\/\s*10/i]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return clampScore(match[1])
  }

  return null
}

export function inferCategory(text: string) {
  const normalized = text.toLowerCase()
  const match = categoryKeywords.find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword))
  )

  return match?.[0] ?? 'Other'
}

export function inferTags(text: string, category: string) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4)

  const unique = Array.from(new Set(words)).slice(0, 4)
  return Array.from(new Set([category, ...unique])).slice(0, 5)
}

export function normalizeIdea(raw: IdeaRecord): MarketplaceIdea {
  const evaluation = raw.evaluation ?? ''
  const combinedText = `${raw.title} ${raw.description} ${evaluation}`
  const category = raw.category || inferCategory(combinedText)
  const score = clampScore(raw.score ?? extractScore(evaluation, 'Overall score') ?? extractScore(evaluation))
  const uniquenessScore = clampScore(
    raw.uniqueness_score ?? extractScore(evaluation, 'Uniqueness score') ?? score
  )
  const demandScore = clampScore(raw.demand_score ?? extractScore(evaluation, 'Demand signal') ?? score)
  const difficultyScore = clampScore(raw.difficulty_score ?? extractScore(evaluation, 'Build difficulty') ?? 5)

  return {
    id: raw.id,
    title: raw.title || 'Untitled idea',
    description: raw.description || 'No description added yet.',
    evaluation,
    score,
    uniquenessScore,
    demandScore,
    difficultyScore,
    category,
    audience: raw.audience || 'Early-stage builders',
    stage: raw.stage || (score >= 8 ? 'Ready to validate' : score >= 6 ? 'Needs sharper wedge' : 'Explore first'),
    monetization: raw.monetization || 'Subscription, usage-based pricing, or service-led validation',
    tags: raw.tags?.length ? raw.tags : inferTags(combinedText, category),
    createdAt: raw.created_at || new Date().toISOString(),
  }
}

export function shortTitle(value: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'Untitled idea'
  return cleaned.length > 72 ? `${cleaned.slice(0, 69)}...` : cleaned
}
