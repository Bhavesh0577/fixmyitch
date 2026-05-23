import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { IdeaChat } from '@/components/IdeaChat'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createClient()

  let ideas: any[] | null = null;
  let error: any = null;
  try {
    const res = await supabase.from('ideas').select().order('created_at', { ascending: false }).limit(20)
    ideas = res.data;
    error = res.error;
  } catch (err: any) {
    error = { message: err.message || "Network error fetching ideas" };
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-medium tracking-tight mb-2">Have an Idea?</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Describe your idea. Our AI will check existing web sources to score your idea's uniqueness and provide market feedback.
          </p>
        </div>
        <IdeaChat />
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-medium tracking-tight mb-2">Ideas Marketplace</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Explore recently analyzed concepts. Unique solutions stand out.
          </p>
        </div>
        
        <div className="grid gap-4">
          {ideas && ideas.length > 0 ? ideas.map((idea) => (
            <Link key={idea.id} href={`/ideas/${idea.id}`} className="block">
              <Card className="shadow-none border-gray-200 bg-white hover:border-emerald-300 transition-colors cursor-pointer h-full">
                <CardHeader className="py-4 px-5 pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-medium">{idea.title}</CardTitle>
                    {idea.score && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {idea.score}/10
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {idea.description}
                  </p>
                  <div className="bg-gray-50 rounded p-3 text-xs text-gray-500 line-clamp-3">
                    {idea.evaluation}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center flex flex-col items-center justify-center bg-gray-50/50">
              <p className="text-gray-500 text-sm">No ideas published yet, or there's a connection issue.</p>
              <p className="text-gray-400 text-xs mt-1">Be the first to share one!</p>
              {error && <p className="text-red-400 text-xs mt-4">Database note: {error.message}</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
