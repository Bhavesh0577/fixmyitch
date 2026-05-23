import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Badge } from '@/components/ui/badge'

export default async function IdeaPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const supabase = await createClient()
  const resolvedParams = await params
  const ideaId = resolvedParams?.id

  if (!ideaId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <h1 className="text-3xl font-semibold mb-3 text-gray-900">Idea not found</h1>
          <p className="text-gray-600 mb-6">The idea link is missing an id.</p>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
            Back to marketplace
          </a>
        </div>
      </div>
    )
  }

  const { data: idea } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', ideaId)
    .maybeSingle()

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <h1 className="text-3xl font-semibold mb-3 text-gray-900">Idea not found</h1>
          <p className="text-gray-600 mb-6">This idea may not have been saved to the marketplace yet, or it was removed.</p>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
            Back to marketplace
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="text-gray-500">{new Date(idea.created_at).toLocaleDateString()}</Badge>
            </div>

            <h1 className="text-3xl font-semibold mb-4 text-gray-900">{idea.title}</h1>

            <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
              {idea.description}
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg min-w-[120px]">
            <span className="text-sm text-gray-500 mb-2">Uniqueness</span>
            <span className="text-3xl font-bold text-emerald-600">{idea.score ? `${idea.score}/10` : 'TBD'}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 mt-4">
          <h3 className="text-lg font-medium mb-3">AI Evaluation (Perplexity)</h3>
          <div className="bg-emerald-50 rounded-lg p-5 text-emerald-900 text-sm leading-relaxed whitespace-pre-wrap">
            {idea.evaluation}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-8">
          <span className="text-sm text-gray-500">Submitted by Anonymous</span>
        </div>
      </div>
    </div>
  )
}
