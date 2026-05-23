'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/utils/supabase/client';

export function IdeaChat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  const isLoading = status === 'streaming' || status === 'submitted';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input }).catch((err: any) => {
      console.error('Chat error:', err);
    });
    setInput('');
  };
  
  const handleSaveIdea = async () => {
    setSaving(true);
    const supabase = createClient();
    
    const extractText = (m: any) => m?.content || (m?.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || "");
    
    // We get the last assistant message as the idea evaluation
    const lastEvaluation = extractText(messages.filter(m => m.role === 'assistant').pop());
    const originalIdea = extractText(messages.filter(m => m.role === 'user').shift()) || "Untitled Idea";
    
    const { error } = await supabase.from('ideas').insert([
       { title: originalIdea.substring(0, 50) + '...', description: originalIdea, evaluation: lastEvaluation }
    ]);
    
    if (error) {
      console.error("Error saving idea:", error);
      alert("Run database.sql in Supabase first so the ideas table exists.");
    } else {
      alert("Idea saved to marketplace!");
    }
    setSaving(false);
  };

  const getMessageText = (message: any) => {
    return message?.content || message?.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || '';
  };

  const hasIdeaEvaluation = messages.some((message) => message.role === 'assistant');

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto shadow-sm border-gray-200">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-xl font-medium">
          <Lightbulb className="w-5 h-5 text-gray-700" />
          Discuss & Evaluate your Idea
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full w-full p-4">
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 my-auto mt-20 text-sm">
                Describe your idea to check uniqueness and market fit.
              </div>
            )}
            
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-3 text-sm border-b pb-4 ${message.role === 'assistant' ? 'text-gray-800' : 'text-gray-600'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm leading-relaxed">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ children }) => <h2 className="mt-4 mb-2 text-base font-semibold text-gray-900">{children}</h2>,
                        p: ({ children }) => <p className="mb-2 text-gray-700">{children}</p>,
                        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-gray-700">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-gray-700">{children}</ol>,
                        li: ({ children }) => <li className="marker:text-gray-500">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noreferrer" className="text-emerald-700 underline underline-offset-2">
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-gray-200 pl-3 italic text-gray-600">{children}</blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em] text-gray-900">{children}</code>
                        ),
                      }}
                    >
                      {getMessageText(message)}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-600">{getMessageText(message)}</div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 text-sm text-gray-500 items-center">
                <Bot className="w-4 h-4 animate-pulse" />
                Analyzing idea...
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t flex flex-col gap-3">
        {hasIdeaEvaluation && !isLoading && (
          <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
            <p className="text-xs text-emerald-900 mb-2">
              Got your evaluation. Publish this idea to the marketplace to save it and make it visible.
            </p>
            <Button 
              variant="outline" 
              onClick={handleSaveIdea} 
              disabled={saving}
              className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              {saving ? 'Saving...' : 'Add to Marketplace'}
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input 
            value={input} 
            onChange={handleInputChange} 
            placeholder="I want to build an app for..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
