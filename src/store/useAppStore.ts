import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export type Category = { id: string; name: string; icon: string; colorHex: string }
export type PriorityDef = { id: string; label: string; colorHex: string; level: number }
export type TimeFilter = { id: string; label: string; maxSeconds: number }
export type Tag = { id: string; name: string; colorHex?: string }

export type Video = {
  id: string
  url: string
  youtube_video_id: string | null
  title: string
  channel_name: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  published_at: string | null
  category: string
  priority: string | null
  status: 'pending' | 'seen' | 'discarded' | 'notion_candidate'
  notion_status: 'none' | 'candidate' | 'prepared' | 'exported'
  notion_title?: string
  notion_category?: string
  notion_personal_note?: string
  notion_related_project?: string
  notion_date?: string
  personal_notes?: string
  ai_summary?: string
  saved_at: string
  tags?: string[]
}

export type WebLink = {
  id: string
  url: string
  title: string
  category: string
  priority: string | null
  status: 'pending' | 'seen' | 'discarded' | 'notion_candidate'
  notion_status: 'none' | 'candidate' | 'prepared' | 'exported'
  notion_title?: string
  notion_category?: string
  notion_personal_note?: string
  notion_related_project?: string
  notion_date?: string
  personal_notes?: string
  ai_summary?: string
  saved_at: string
  tags?: string[]
}

export type ActionItem = {
  id: string
  title: string
  status: 'pending' | 'completed'
  video_id?: string
  web_link_id?: string
  created_at: string
}

interface AppState {
  userId: string | null
  isInitialized: boolean
  activeModule: 'videos' | 'webs'
  
  videos: Video[]
  webLinks: WebLink[]
  actions: ActionItem[]
  
  userProfile: { name: string }
  theme: 'dark' | 'light'
  largeTextMode: boolean
  categories: Category[]
  priorities: PriorityDef[]
  timeFilters: TimeFilter[]
  tags: Tag[]
  notionConfig: { apiKey?: string; databaseId?: string }
  
  initializeStore: () => Promise<void>
  setActiveModule: (module: 'videos' | 'webs') => void
  
  addVideo: (video: Omit<Video, 'id' | 'saved_at'>) => Promise<void>
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>
  deleteVideo: (id: string) => Promise<void>
  
  addWebLink: (link: Omit<WebLink, 'id' | 'saved_at'>) => Promise<void>
  updateWebLink: (id: string, updates: Partial<WebLink>) => Promise<void>
  deleteWebLink: (id: string) => Promise<void>
  
  addAction: (action: Omit<ActionItem, 'id' | 'created_at'>) => Promise<void>
  updateAction: (id: string, updates: Partial<ActionItem>) => Promise<void>
  deleteAction: (id: string) => Promise<void>
  
  updateUserProfile: (name: string) => Promise<void>
  toggleTheme: () => Promise<void>
  toggleLargeTextMode: () => Promise<void>
  
  addCategory: (cat: Category) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  addPriority: (prio: PriorityDef) => Promise<void>
  updatePriority: (id: string, updates: Partial<PriorityDef>) => Promise<void>
  deletePriority: (id: string) => Promise<void>
  
  addTimeFilter: (tf: TimeFilter) => Promise<void>
  updateTimeFilter: (id: string, updates: Partial<TimeFilter>) => Promise<void>
  deleteTimeFilter: (id: string) => Promise<void>
  
  addTag: (tag: Tag) => Promise<void>
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>
  deleteTag: (id: string) => Promise<void>
  updateNotionConfig: (config: { apiKey?: string; databaseId?: string }) => Promise<void>
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'IA', name: 'IA', icon: 'memory', colorHex: '#7C5CFC' },
  { id: 'Productividad', name: 'Productividad', icon: 'bolt', colorHex: '#60A5FA' },
  { id: 'Marketing', name: 'Marketing', icon: 'trending_up', colorHex: '#F59E0B' },
  { id: 'Emprendimiento', name: 'Emprendimiento', icon: 'lightbulb', colorHex: '#F59E0B' },
  { id: 'Inversiones', name: 'Inversiones', icon: 'account_balance', colorHex: '#7C5CFC' },
  { id: 'MotoGP', name: 'MotoGP', icon: 'sports_motorsports', colorHex: '#FFFFFF' },
  { id: 'Podcasts', name: 'Podcasts', icon: 'podcasts', colorHex: '#9CA3AF' },
  { id: 'Otros', name: 'Otros', icon: 'folder', colorHex: '#9CA3AF' },
  { id: 'Sin clasificar', name: 'Sin clasificar', icon: 'folder_off', colorHex: '#9CA3AF' },
]

const DEFAULT_PRIORITIES: PriorityDef[] = [
  { id: 'high', label: 'Alta', colorHex: '#F59E0B', level: 3 },
  { id: 'medium', label: 'Media', colorHex: '#60A5FA', level: 2 },
  { id: 'low', label: 'Baja', colorHex: '#9CA3AF', level: 1 }
]

const DEFAULT_TIME_FILTERS: TimeFilter[] = [
  { id: '15m', label: '15 Min', maxSeconds: 900 },
  { id: '30m', label: '30 Min', maxSeconds: 1800 },
  { id: '1h', label: '1 H', maxSeconds: 3600 },
  { id: 'unlimited', label: 'Sin límite', maxSeconds: 9999999 }
]

export const useAppStore = create<AppState>((set, get) => ({
  userId: null,
  isInitialized: false,
  activeModule: 'videos',
  videos: [],
  webLinks: [],
  actions: [],
  userProfile: { name: 'Usuario' },
  theme: 'dark',
  largeTextMode: false,
  categories: DEFAULT_CATEGORIES,
  priorities: DEFAULT_PRIORITIES,
  timeFilters: DEFAULT_TIME_FILTERS,
  tags: [],
  notionConfig: {},

  initializeStore: async () => {
    if (get().isInitialized) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    set({ userId: user.id })

    const [settingsRes, videosRes, websRes, actionsRes] = await Promise.all([
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('videos').select('*').eq('user_id', user.id).order('saved_at', { ascending: false }),
      supabase.from('web_links').select('*').eq('user_id', user.id).order('saved_at', { ascending: false }),
      supabase.from('actions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    let settings = settingsRes.data
    if (!settings) {
      const { data: newSettings } = await supabase.from('user_settings').insert({
        user_id: user.id,
        categories: DEFAULT_CATEGORIES,
        priorities: DEFAULT_PRIORITIES,
        time_filters: DEFAULT_TIME_FILTERS
      }).select().single()
      settings = newSettings
    }

    set({
      isInitialized: true,
      videos: videosRes.data || [],
      webLinks: websRes.data || [],
      actions: actionsRes.data || [],
      theme: settings?.theme || 'dark',
      largeTextMode: settings?.large_text_mode || false,
      userProfile: settings?.user_profile || { name: 'Usuario' },
      categories: settings?.categories || DEFAULT_CATEGORIES,
      priorities: settings?.priorities || DEFAULT_PRIORITIES,
      timeFilters: settings?.time_filters || DEFAULT_TIME_FILTERS,
      tags: settings?.tags || [],
      notionConfig: settings?.notion_config || {}
    })
  },

  setActiveModule: (module) => set({ activeModule: module }),

  addVideo: async (videoData) => {
    const userId = get().userId
    if (!userId) return
    const { data } = await supabase.from('videos').insert({ ...videoData, user_id: userId }).select().single()
    if (data) set((state) => ({ videos: [data, ...state.videos] }))
  },
  
  updateVideo: async (id, updates) => {
    const userId = get().userId
    if (!userId) return
    const { error } = await supabase.from('videos').update(updates).eq('id', id).eq('user_id', userId)
    if (!error) {
      set((state) => ({ videos: state.videos.map(v => v.id === id ? { ...v, ...updates } : v) }))
    }
  },
  
  deleteVideo: async (id) => {
    const userId = get().userId
    if (!userId) return
    const { error } = await supabase.from('videos').delete().eq('id', id).eq('user_id', userId)
    if (!error) {
      set((state) => ({ videos: state.videos.filter(v => v.id !== id) }))
    }
  },

  addWebLink: async (linkData) => {
    const userId = get().userId
    if (!userId) return
    const { data } = await supabase.from('web_links').insert({ ...linkData, user_id: userId }).select().single()
    if (data) set((state) => ({ webLinks: [data, ...state.webLinks] }))
  },
  
  updateWebLink: async (id, updates) => {
    const userId = get().userId
    if (!userId) return
    const { error } = await supabase.from('web_links').update(updates).eq('id', id).eq('user_id', userId)
    if (!error) {
      set((state) => ({ webLinks: state.webLinks.map(w => w.id === id ? { ...w, ...updates } : w) }))
    }
  },
  
  deleteWebLink: async (id) => {
    const userId = get().userId
    if (!userId) return
    const { error } = await supabase.from('web_links').delete().eq('id', id).eq('user_id', userId)
    if (!error) {
      set((state) => ({ webLinks: state.webLinks.filter(w => w.id !== id) }))
    }
  },

  addAction: async (actionData) => {
    const userId = get().userId
    if (!userId) return
    const { data } = await supabase.from('actions').insert({ ...actionData, user_id: userId }).select().single()
    if (data) set((state) => ({ actions: [data, ...state.actions] }))
  },
  
  updateAction: async (id, updates) => {
    const userId = get().userId
    if (!userId) return
    const { error } = await supabase.from('actions').update(updates).eq('id', id).eq('user_id', userId)
    if (!error) {
      set((state) => ({ actions: state.actions.map(a => a.id === id ? { ...a, ...updates } : a) }))
    }
  },
  
  deleteAction: async (id) => {
    const userId = get().userId
    if (!userId) return
    const { error } = await supabase.from('actions').delete().eq('id', id).eq('user_id', userId)
    if (!error) {
      set((state) => ({ actions: state.actions.filter(a => a.id !== id) }))
    }
  },

  // Settings Sync Helpers
  updateUserProfile: async (name) => {
    const userId = get().userId
    if (!userId) return
    const newProfile = { name }
    const { error } = await supabase.from('user_settings').update({ user_profile: newProfile }).eq('user_id', userId)
    if (!error) set({ userProfile: newProfile })
  },

  toggleTheme: async () => {
    const userId = get().userId
    if (!userId) return
    const newTheme = get().theme === 'dark' ? 'light' : 'dark'
    const { error } = await supabase.from('user_settings').update({ theme: newTheme }).eq('user_id', userId)
    if (!error) set({ theme: newTheme })
  },

  toggleLargeTextMode: async () => {
    const userId = get().userId
    if (!userId) return
    const newMode = !get().largeTextMode
    const { error } = await supabase.from('user_settings').update({ large_text_mode: newMode }).eq('user_id', userId)
    if (!error) set({ largeTextMode: newMode })
  },

  addCategory: async (cat) => {
    const userId = get().userId
    if (!userId) return
    const newCategories = [...get().categories, cat]
    const { error } = await supabase.from('user_settings').update({ categories: newCategories }).eq('user_id', userId)
    if (!error) set({ categories: newCategories })
  },

  updateCategory: async (id, updates) => {
    const userId = get().userId
    if (!userId) return
    const newCategories = get().categories.map(c => c.id === id ? { ...c, ...updates } : c)
    const { error } = await supabase.from('user_settings').update({ categories: newCategories }).eq('user_id', userId)
    if (!error) set({ categories: newCategories })
  },

  deleteCategory: async (id) => {
    const userId = get().userId
    if (!userId) return
    const newCategories = get().categories.filter(c => c.id !== id)
    const { error } = await supabase.from('user_settings').update({ categories: newCategories }).eq('user_id', userId)
    if (!error) set({ categories: newCategories })
  },

  addPriority: async (prio) => {
    const userId = get().userId
    if (!userId) return
    const newPriorities = [...get().priorities, prio].sort((a, b) => b.level - a.level)
    const { error } = await supabase.from('user_settings').update({ priorities: newPriorities }).eq('user_id', userId)
    if (!error) set({ priorities: newPriorities })
  },

  updatePriority: async (id, updates) => {
    const userId = get().userId
    if (!userId) return
    const newPriorities = get().priorities.map(p => p.id === id ? { ...p, ...updates } : p).sort((a, b) => b.level - a.level)
    const { error } = await supabase.from('user_settings').update({ priorities: newPriorities }).eq('user_id', userId)
    if (!error) set({ priorities: newPriorities })
  },

  deletePriority: async (id) => {
    const userId = get().userId
    if (!userId) return
    const newPriorities = get().priorities.filter(p => p.id !== id)
    const { error } = await supabase.from('user_settings').update({ priorities: newPriorities }).eq('user_id', userId)
    if (!error) set({ priorities: newPriorities })
  },

  addTimeFilter: async (tf) => {
    const userId = get().userId
    if (!userId) return
    const newFilters = [...get().timeFilters, tf].sort((a, b) => a.maxSeconds - b.maxSeconds)
    const { error } = await supabase.from('user_settings').update({ time_filters: newFilters }).eq('user_id', userId)
    if (!error) set({ timeFilters: newFilters })
  },

  updateTimeFilter: async (id, updates) => {
    const userId = get().userId
    if (!userId) return
    const newFilters = get().timeFilters.map(t => t.id === id ? { ...t, ...updates } : t).sort((a, b) => a.maxSeconds - b.maxSeconds)
    const { error } = await supabase.from('user_settings').update({ time_filters: newFilters }).eq('user_id', userId)
    if (!error) set({ timeFilters: newFilters })
  },

  deleteTimeFilter: async (id) => {
    const userId = get().userId
    if (!userId) return
    const newFilters = get().timeFilters.filter(t => t.id !== id)
    const { error } = await supabase.from('user_settings').update({ time_filters: newFilters }).eq('user_id', userId)
    if (!error) set({ timeFilters: newFilters })
  },

  addTag: async (tag) => {
    const userId = get().userId
    if (!userId) return
    const newTags = [...get().tags, tag]
    const { error } = await supabase.from('user_settings').update({ tags: newTags }).eq('user_id', userId)
    if (!error) set({ tags: newTags })
  },

  updateTag: async (id, updates) => {
    const userId = get().userId
    if (!userId) return
    const newTags = get().tags.map(t => t.id === id ? { ...t, ...updates } : t)
    const { error } = await supabase.from('user_settings').update({ tags: newTags }).eq('user_id', userId)
    if (!error) set({ tags: newTags })
  },

  deleteTag: async (id) => {
    const userId = get().userId
    if (!userId) return
    const newTags = get().tags.filter(t => t.id !== id)
    const { error } = await supabase.from('user_settings').update({ tags: newTags }).eq('user_id', userId)
    if (!error) set({ tags: newTags })
  },

  updateNotionConfig: async (config) => {
    const userId = get().userId
    if (!userId) return
    const newConfig = { ...get().notionConfig, ...config }
    const { error } = await supabase.from('user_settings').update({ notion_config: newConfig }).eq('user_id', userId)
    if (!error) set({ notionConfig: newConfig })
  }
}))
