import { BuilderWorkspace } from '@/components/BuilderWorkspace'
import { LandingPage } from '@/components/LandingPage'
import { normalizeIdea, type IdeaRecord } from '@/lib/ideas'
import { createClient } from '@/utils/supabase/server'

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
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const props = {
    ideas: marketplaceIdeas,
    totalIdeas,
    strongIdeas,
    avgDemand,
    errorMessage,
  }

  return user ? <BuilderWorkspace {...props} /> : <LandingPage {...props} />
}
