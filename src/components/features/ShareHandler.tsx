"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"

export default function ShareHandler() {
  const setActiveModule = useAppStore(state => state.setActiveModule)

  useEffect(() => {
    // Check if there is a pending share URL in sessionStorage
    const pendingShareUrl = sessionStorage.getItem('pending_share_url')
    if (pendingShareUrl) {
      // Clean it up immediately so it only triggers once
      sessionStorage.removeItem('pending_share_url')

      const isVideo = pendingShareUrl.includes('youtube.com') || pendingShareUrl.includes('youtu.be')
      
      if (isVideo) {
        setActiveModule('videos')
        window.dispatchEvent(new CustomEvent('open-add-video', { detail: { url: pendingShareUrl } }))
      } else {
        setActiveModule('webs')
        window.dispatchEvent(new CustomEvent('open-add-web', { detail: { url: pendingShareUrl } }))
      }
    }
  }, [setActiveModule])

  return null
}
