'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search as SearchIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'
import { useDebounce } from '@/hooks/use-debounce'

type SearchResult = {
  id: string
  title: string
  description: string
  entry_date: string
  type: 'journal' | 'plan'
}

export function SearchClient() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([])
        setHasSearched(false)
        setTotalPages(0)
        setPage(1)
        return
      }

      setIsSearching(true)
      setHasSearched(true)
      
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&page=${page}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results)
          setTotalPages(data.totalPages || 0)
        }
      } catch (error) {
        console.error('Search failed', error)
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery, page])

  function goToPage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search memories, plans, and tags..."
          className="pl-10 h-12 text-lg"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="space-y-4">
        {hasSearched && !isSearching && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No results found for "{query}"
          </div>
        )}

        {results.map((result) => (
          <Link 
            key={`${result.type}-${result.id}`} 
            href={result.type === 'journal' ? `/journal/${result.id}` : `/plans`}
          >
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="uppercase font-semibold text-primary">{result.type}</span>
                  <span>•</span>
                  <span>{format(new Date(result.entry_date), 'MMM d, yyyy')}</span>
                </div>
                <h3 className="font-semibold text-lg">{result.title}</h3>
                {result.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}