'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'

interface TagsManagerProps {
  entryId?: string
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagsManager({ entryId, selectedTags, onTagsChange }: TagsManagerProps) {
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string | null }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClient()
  const { userId } = useAuth()

  const fetchTags = useCallback(async () => {
    if (!userId) return
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  async function handleCreateTag() {
    if (!newTagName.trim() || !userId) return
    setIsCreating(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: userId,
          name: newTagName.trim(),
          color: newTagColor,
        })
        .select()
        .single()

      if (error) throw error

      setTags(prev => [...prev, data])
      setNewTagName('')
      toast.success('Tag created')
    } catch (error) {
      console.error('Failed to create tag:', error)
      toast.error('Failed to create tag')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleTagToggle(tagId: string) {
    if (!entryId || !userId) return

    const isSelected = selectedTags.includes(tagId)
    try {
      const supabase = createClient()
      if (isSelected) {
        const { error } = await supabase
          .from('entry_tags')
          .delete()
          .eq('entry_id', entryId)
          .eq('tag_id', tagId)
        if (error) throw error
        
        onTagsChange(selectedTags.filter(t => t !== tagId))
      } else {
        const { error } = await supabase
          .from('entry_tags')
          .insert({ entry_id: entryId, tag_id: tagId })
        if (error) throw error
        
        onTagsChange([...selectedTags, tagId])
      }
    } catch (error) {
      console.error('Failed to toggle tag:', error)
      toast.error('Failed to update tag')
    }
  }

  if (isLoading) {
    return <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading tags...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleTagToggle(tag.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTags.includes(tag.id)
                ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            style={{ borderColor: tag.color || 'transparent' }}
          >
            {tag.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />}
            {tag.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <Input
          type="text"
          value={newTagName}
          onChange={e => setNewTagName(e.target.value)}
          placeholder="New tag name..."
          className="flex-1 max-w-xs"
          onKeyDown={e => e.key === 'Enter' && handleCreateTag()}
        />
        <Input
          type="color"
          value={newTagColor}
          onChange={e => setNewTagColor(e.target.value)}
          className="w-10 h-10 p-0 cursor-pointer"
        />
        <Button 
          onClick={handleCreateTag} 
          disabled={isCreating || !newTagName.trim() || !userId}
          size="sm"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}