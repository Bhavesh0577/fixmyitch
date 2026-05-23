'use client'

import { useChat } from '@ai-sdk/react'
import { Bot, CheckCircle2, Lightbulb, Send, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import { extractScore, inferCategory, inferTags, shortTitle } from '@/lib/ideas'

const starterIdeas = [
  'Local shops need a simpler way to manage WhatsApp orders, payments, and delivery updates.',
  'Students need an AI planner that recovers when they miss study days instead of making them restart.',
  'Indie founders need app-store review mining that turns complaints into validated SaaS ideas.',
]

const categories = ['AI & Automation', 'B2B SaaS', 'Consumer Apps', 'Education', 'Fintech', 'Healthcare', 'Local India']

export function IdeaChat() {
  const { messages, sendMessage, status } = useChat()
  const [input, setInput] = useState('')
  const [audience, setAudience] = useState('')
  const [category, setCategory] = useState('AI & Automation')
  const [lastSubmittedIdea, setLastSubmittedIdea] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [chatMessage, setChatMessage] = useState('')

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const idea = input.trim()
    if (!idea) return

    const enrichedPrompt = [
      `Idea: ${idea}`,
      `Preferred category: ${category}`,
      audience.trim() ? `Target audience: ${audience.trim()}` : 'Target audience: infer the best early adopter segment',
      'Please evaluate this as a marketplace-ready startup idea and include practical next steps.',
    ].join('\n')

    setLastSubmittedIdea(idea)
    setSaveMessage('')
    setChatMessage('')
    sendMessage({ text: enrichedPrompt }).catch((error: unknown) => {
      console.error('Chat error:', error)
      setChatMessage('Sign in before using the AI research engine so the Perplexity key stays protected.')
    })
    setInput('')
  }

  const handleSaveIdea = async () => {
    setSaving(true)
    setSaveMessage('')

    const supabase = createClient()
    const lastEvaluation = getMessageText(messages.filter((message) => message.role === 'assistant').pop())
    const originalIdea =
      lastSubmittedIdea || getMessageText(messages.filter((message) => message.role === 'user').shift()) || 'Untitled idea'

    const inferredCategory = category || inferCategory(`${originalIdea} ${lastEvaluation}`)
    const payload = {
      title: shortTitle(originalIdea),
      description: originalIdea,
      evaluation: lastEvaluation,
      score: extractScore(lastEvaluation, 'Overall score') ?? extractScore(lastEvaluation) ?? null,
      uniqueness_score: extractScore(lastEvaluation, 'Uniqueness score') ?? null,
      demand_score: extractScore(lastEvaluation, 'Demand signal') ?? null,
      difficulty_score: extractScore(lastEvaluation, 'Build difficulty') ?? null,
      category: inferredCategory,
      audience: audience.trim() || null,
      stage: extractStage(lastEvaluation),
      monetization: extractMonetization(lastEvaluation),
      tags: inferTags(`${originalIdea} ${lastEvaluation}`, inferredCategory),
    }

    const { error } = await supabase.from('ideas').insert([payload])

    if (error) {
      const fallback = await supabase.from('ideas').insert([
        {
          title: payload.title,
          description: payload.description,
          evaluation: payload.evaluation,
          score: payload.score,
        },
      ])

      if (fallback.error) {
        console.error('Error saving idea:', fallback.error)
        setSaveMessage('Run database.sql in Supabase first so the marketplace table exists.')
      } else {
        setSaveMessage('Saved with the basic schema. Run database.sql later to unlock filters and richer cards.')
      }
    } else {
      setSaveMessage('Idea published to the marketplace.')
    }

    setSaving(false)
  }

  const hasIdeaEvaluation = messages.some((message) => message.role === 'assistant')

  return (
    <Card className="h-[720px] rounded-lg border-zinc-200 bg-white shadow-sm">
      <CardHeader className="border-b border-zinc-100 px-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 rounded-full border-emerald-200 bg-emerald-50 text-emerald-800">
              <Sparkles className="size-3" />
              Perplexity research
            </Badge>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-950">
              <Lightbulb className="size-5 text-amber-500" />
              Shape an itch into a startup brief
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[390px] w-full p-4">
          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="space-y-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Start with a painful, specific problem.</p>
                <div className="grid gap-2">
                  {starterIdeas.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => setInput(starter)}
                      className="rounded-lg border border-zinc-200 bg-white p-3 text-left text-sm leading-5 text-zinc-600 transition-colors hover:border-sky-300 hover:text-zinc-950"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <div key={message.id} className="flex gap-3 border-b border-zinc-100 pb-4 text-sm">
                <div className="mt-1 flex-shrink-0">
                  {message.role === 'user' ? (
                    <User className="size-4 text-zinc-500" />
                  ) : (
                    <Bot className="size-4 text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1 leading-relaxed">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ children }) => <h2 className="mt-4 mb-2 text-sm font-semibold text-zinc-950">{children}</h2>,
                        p: ({ children }) => <p className="mb-2 text-zinc-700">{children}</p>,
                        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-zinc-700">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-zinc-700">{children}</ol>,
                        li: ({ children }) => <li className="marker:text-zinc-400">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-zinc-950">{children}</strong>,
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noreferrer" className="text-sky-700 underline underline-offset-2">
                            {children}
                          </a>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.85em] text-zinc-900">{children}</code>
                        ),
                      }}
                    >
                      {getMessageText(message)}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap text-zinc-600">{getMessageText(message)}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Bot className="size-4 animate-pulse text-emerald-600" />
                Researching competitors, demand, and MVP path...
              </div>
            ) : null}
            {chatMessage ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{chatMessage}</div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-zinc-100 bg-white p-4">
        {hasIdeaEvaluation && !isLoading ? (
          <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="mb-2 flex items-start gap-2 text-sm text-emerald-950">
              <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0" />
              <span>Publish this brief so other builders can discover, compare, and improve it.</span>
            </div>
            <Button
              variant="outline"
              onClick={handleSaveIdea}
              disabled={saving}
              className="w-full border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"
            >
              {saving ? 'Publishing...' : 'Add to Marketplace'}
            </Button>
            {saveMessage ? <p className="mt-2 text-xs text-emerald-800">{saveMessage}</p> : null}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
            <div className="flex gap-2 overflow-x-auto sm:col-span-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    category === item
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-sky-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <Input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder="Audience, e.g. Shopify sellers"
              className="h-9 sm:col-span-2"
            />
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Describe the itch, who has it, and what solution you imagine..."
              className="min-h-20 flex-1 resize-none"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="h-auto self-stretch px-3">
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  )
}

function getMessageText(message: any) {
  return message?.content || message?.parts?.filter((part: any) => part.type === 'text').map((part: any) => part.text).join('') || ''
}

function extractStage(evaluation: string) {
  if (/ready|validate|pilot/i.test(evaluation)) return 'Ready to validate'
  if (/niche|wedge|specific|sharper/i.test(evaluation)) return 'Needs sharper wedge'
  return 'Explore first'
}

function extractMonetization(evaluation: string) {
  const match = evaluation.match(/(?:monetization|revenue|pricing)[^:\n]*:\s*([^\n]+)/i)
  return match?.[1]?.trim() || 'Freemium, subscription, credits, or service-led validation'
}
