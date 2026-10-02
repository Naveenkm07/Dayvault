'use client'

import { useState, useEffect } from 'react'
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

      const storagePath = `${user.user.id}/${filePath}`

      const { error: uploadError } = await supabase.storage
        .from('journal_photos')
        .upload(storagePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Store storage path instead of public URL
      onChange([...value, storagePath])
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

  function onRemove(storagePathToRemove: string) {
    onChange(value.filter(path => path !== storagePathToRemove))
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((storagePath, i) => (
            <div key={i} className="relative rounded-md overflow-hidden aspect-video border group">
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => onRemove(storagePath)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <SignedImage storagePath={storagePath} alt="Journal photo" />
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

// Client component to fetch and display signed URL for a storage path
function SignedImage({ storagePath, alt }: { storagePath: string; alt: string }) {
  const [src, setSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    supabase.storage
      .from('journal_photos')
      .createSignedUrl(storagePath, 60 * 60)
      .then(({ data }) => {
        if (mounted && data?.signedUrl) {
          setSrc(data.signedUrl)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
    return () => { mounted = false }
  }, [storagePath, supabase])

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Image 
      src={src || '/file.svg'} 
      alt={alt} 
      fill 
      className="object-cover"
    />
  )
}