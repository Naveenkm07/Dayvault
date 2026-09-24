import { SearchClient } from '@/components/search/search-client'

export default function SearchPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">Find your past memories and plans.</p>
      </div>
      <SearchClient />
    </div>
  )
}
