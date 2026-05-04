"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"

export default function ShareHandler() {
  const setActiveModule = useAppStore(state => state.setActiveModule)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check if the URL has shared content parameters
    if (sharedUrl) {
      // Extract just the URL part if there's text around it
      const urlMatch = sharedUrl.match(/https?:\/\/[^\s]+/)
      let finalUrl = urlMatch ? urlMatch[0] : sharedUrl

      // Special handling for Google Share redirects
      if (finalUrl.includes('share.google') && finalUrl.includes('?url=')) {
        try {
          const urlObj = new URL(finalUrl)
          const extractedUrl = urlObj.searchParams.get('url')
          if (extractedUrl) finalUrl = extractedUrl
        } catch (e) {
          console.error('Failed to parse share.google URL', e)
        }
      }

      if (finalUrl.includes('http')) {
        const isVideo = finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')
        
        if (isVideo) {
          setActiveModule('videos')
          window.dispatchEvent(new CustomEvent('open-add-video', { detail: { url: finalUrl } }))
        } else {
          setActiveModule('webs')
          window.dispatchEvent(new CustomEvent('open-add-web', { detail: { url: finalUrl } }))
        }

        // Remove the share parameters from the URL so it doesn't trigger again on refresh
        router.replace('/', { scroll: false })
      }
    }
  }, [searchParams, router, setActiveModule])

  return null
}
