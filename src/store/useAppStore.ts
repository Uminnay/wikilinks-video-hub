import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  created_at: string
}

interface AppState {
  // Datos principales
  activeModule: 'videos' | 'webs'
  videos: Video[]
  webLinks: WebLink[]
  actions: ActionItem[]
  
  // Configuraciones
  userProfile: { name: string }
  theme: 'dark' | 'light'
  largeTextMode: boolean
  categories: Category[]
  priorities: PriorityDef[]
  timeFilters: TimeFilter[]
  tags: Tag[]
  notionConfig: { apiKey?: string; databaseId?: string }
  
  // Acciones (CRUD)
  addVideo: (video: Omit<Video, 'id' | 'saved_at'>) => void
  updateVideo: (id: string, updates: Partial<Video>) => void
  deleteVideo: (id: string) => void
  
  addWebLink: (link: Omit<WebLink, 'id' | 'saved_at'>) => void
  updateWebLink: (id: string, updates: Partial<WebLink>) => void
  deleteWebLink: (id: string) => void
  
  addAction: (action: Omit<ActionItem, 'id' | 'created_at'>) => void
  updateAction: (id: string, updates: Partial<ActionItem>) => void
  deleteAction: (id: string) => void
  
  setActiveModule: (module: 'videos' | 'webs') => void
  updateUserProfile: (name: string) => void
  toggleTheme: () => void
  toggleLargeTextMode: () => void
  
  addCategory: (cat: Category) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  
  addPriority: (prio: PriorityDef) => void
  updatePriority: (id: string, updates: Partial<PriorityDef>) => void
  deletePriority: (id: string) => void
  
  addTimeFilter: (tf: TimeFilter) => void
  updateTimeFilter: (id: string, updates: Partial<TimeFilter>) => void
  deleteTimeFilter: (id: string) => void
  
  addTag: (tag: Tag) => void
  updateTag: (id: string, updates: Partial<Tag>) => void
  deleteTag: (id: string) => void
  updateNotionConfig: (config: { apiKey?: string; databaseId?: string }) => void
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

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
      
      addVideo: (videoData) => set((state) => ({
        videos: [{ ...videoData, id: crypto.randomUUID(), saved_at: new Date().toISOString() }, ...state.videos]
      })),
      
      updateVideo: (id, updates) => set((state) => ({
        videos: state.videos.map(v => v.id === id ? { ...v, ...updates } : v)
      })),
      
      deleteVideo: (id) => set((state) => ({
        videos: state.videos.filter(v => v.id !== id)
      })),
      
      addWebLink: (linkData) => set((state) => ({
        webLinks: [{ ...linkData, id: crypto.randomUUID(), saved_at: new Date().toISOString() }, ...state.webLinks]
      })),
      
      updateWebLink: (id, updates) => set((state) => ({
        webLinks: state.webLinks.map(w => w.id === id ? { ...w, ...updates } : w)
      })),
      
      deleteWebLink: (id) => set((state) => ({
        webLinks: state.webLinks.filter(w => w.id !== id)
      })),
      
      addAction: (actionData) => set((state) => ({
        actions: [{ ...actionData, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...state.actions]
      })),
      
      updateAction: (id, updates) => set((state) => ({
        actions: state.actions.map(a => a.id === id ? { ...a, ...updates } : a)
      })),
      
      deleteAction: (id) => set((state) => ({
        actions: state.actions.filter(a => a.id !== id)
      })),
      
      setActiveModule: (module) => set({ activeModule: module }),
      updateUserProfile: (name) => set({ userProfile: { name } }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      toggleLargeTextMode: () => set((state) => ({ largeTextMode: !state.largeTextMode })),
      
      addCategory: (cat) => set((state) => ({ categories: [...state.categories, cat] })),
      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),
      
      addPriority: (prio) => set((state) => ({ 
        priorities: [...state.priorities, prio].sort((a, b) => b.level - a.level)
      })),
      updatePriority: (id, updates) => set((state) => ({
        priorities: state.priorities.map(p => p.id === id ? { ...p, ...updates } : p).sort((a, b) => b.level - a.level)
      })),
      deletePriority: (id) => set((state) => ({
        priorities: state.priorities.filter(p => p.id !== id)
      })),
      
      addTimeFilter: (tf) => set((state) => ({ 
        timeFilters: [...state.timeFilters, tf].sort((a, b) => a.maxSeconds - b.maxSeconds)
      })),
      updateTimeFilter: (id, updates) => set((state) => ({
        timeFilters: state.timeFilters.map(t => t.id === id ? { ...t, ...updates } : t).sort((a, b) => a.maxSeconds - b.maxSeconds)
      })),
      deleteTimeFilter: (id) => set((state) => ({
        timeFilters: state.timeFilters.filter(t => t.id !== id)
      })),
      
      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
      updateTag: (id, updates) => set((state) => ({
        tags: state.tags.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTag: (id) => set((state) => ({
        tags: state.tags.filter(t => t.id !== id)
      })),
      updateNotionConfig: (config) => set((state) => ({
        notionConfig: { ...state.notionConfig, ...config }
      }))
    }),
    {
      name: 'wikilinks-storage',
    }
  )
)
