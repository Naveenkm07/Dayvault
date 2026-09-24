'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      setIsUploading(true)
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { error: uploadError } = await supabase.storage
        .from('journal_photos')
        .upload(`${user.user.id}/${filePath}`, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('journal_photos')
        .getPublicUrl(`${user.user.id}/${filePath}`)

      onChange([...value, publicUrl])
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Make sure the storage bucket is configured.')
    } finally {
      setIsUploading(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  function onRemove(urlToRemove: string) {
    onChange(value.filter(url => url !== urlToRemove))
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, i) => (
            <div key={i} className="relative rounded-md overflow-hidden aspect-video border group">
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => onRemove(url)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Image 
                src={url} 
                alt="Journal photo" 
                fill 
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      <div>
        <Button 
          type="button" 
          variant="outline" 
          disabled={isUploading}
          className="relative overflow-hidden"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4 mr-2" />
              Add Photo
            </>
          )}
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            accept="image/*"
            onChange={onUpload}
            disabled={isUploading}
          />
        </Button>
      </div>
    </div>
  )
}
