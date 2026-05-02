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
    const sharedUrl = searchParams.get('url') || searchParams.get('text')
    
    if (sharedUrl && sharedUrl.includes('http')) {
      // Extract just the URL part if there's text around it
      const urlMatch = sharedUrl.match(/https?:\/\/[^\s]+/)
      const finalUrl = urlMatch ? urlMatch[0] : sharedUrl

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
  }, [searchParams, router, setActiveModule])

  return null
}
