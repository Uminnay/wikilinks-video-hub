"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"
import { signOut } from "@/app/login/actions"
import { createClient } from "@/lib/supabase/client"

const PRESET_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', 
  '#007AFF', '#5856D6', '#FF2D55', '#7C5CFC', '#9CA3AF'
]

function ColorPicker({ value, onChange, usedColors = [] }: { value: string, onChange: (v: string) => void, usedColors?: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map(color => {
        const isUsed = usedColors.includes(color) && color !== value
        return (
          <button
            key={color}
            type="button"
            disabled={isUsed}
            onClick={() => onChange(color)}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${value === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-low scale-110' : ''} ${isUsed ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}`}
            style={{ backgroundColor: color }}
            title={isUsed ? 'Color ya en uso' : ''}
          >
            {value === color && <span className="material-symbols-outlined text-[12px] text-white font-bold drop-shadow">check</span>}
          </button>
        )
      })}
    </div>
  )
}

const PRESET_ICONS = [
  'folder', 'folder_open', 'star', 'bolt', 'lightbulb', 'memory', 
  'trending_up', 'account_balance', 'sports_motorsports', 'podcasts',
  'school', 'work', 'home', 'favorite', 'build', 'code', 'book',
  'music_note', 'movie', 'sports_esports', 'fitness_center', 'flight',
  'article', 'chat', 'public', 'rocket_launch'
]

function IconPicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 flex items-center gap-2 hover:border-primary transition-colors focus:outline-none focus:border-primary"
      >
        <span className="material-symbols-outlined text-[18px] text-onSurface-muted">{value}</span>
        <span className="flex-1 text-left text-xs text-onSurface-muted">{value}</span>
        <span className="material-symbols-outlined text-[16px] text-onSurface-muted">expand_more</span>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-12 left-0 bg-surface-low border border-surface-high rounded-xl p-3 grid grid-cols-5 gap-2 shadow-xl z-50 w-64 max-h-48 overflow-y-auto no-scrollbar">
            {PRESET_ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => { onChange(icon); setIsOpen(false); }}
                className={`w-9 h-9 rounded flex items-center justify-center transition-colors ${value === icon ? 'bg-primary text-white' : 'hover:bg-surface-high text-onSurface'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function SettingsView() {
  const { 
    userProfile, updateUserProfile,
    categories, addCategory, updateCategory, deleteCategory,
    priorities, addPriority, updatePriority, deletePriority,
    timeFilters, addTimeFilter, updateTimeFilter, deleteTimeFilter,
    tags, addTag, updateTag, deleteTag,
    videos, actions
  } = useAppStore()

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'categories' | 'priorities' | 'times' | 'tags'>('profile')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDraftName(useAppStore.getState().userProfile.name)
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
    }
    fetchUser()
  }, [])

  // Modals state
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'folder', colorHex: PRESET_COLORS[0] })

  const [showAddPriority, setShowAddPriority] = useState(false)
  const [newPriority, setNewPriority] = useState({ label: '', colorHex: PRESET_COLORS[1], level: 0 })

  const [showAddTime, setShowAddTime] = useState(false)
  const [newTime, setNewTime] = useState({ label: '', maxSeconds: 600 })

  const [showAddTag, setShowAddTag] = useState(false)
  const [newTag, setNewTag] = useState({ name: '', colorHex: PRESET_COLORS[0] })

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>

  const handleSaveCategory = () => {
    if (!newCategory.name.trim()) return
    addCategory({ id: crypto.randomUUID(), ...newCategory })
    setShowAddCategory(false)
    setNewCategory({ name: '', icon: 'folder', colorHex: PRESET_COLORS[0] })
  }

  const handleSavePriority = () => {
    if (!newPriority.label.trim()) return
    addPriority({ id: crypto.randomUUID(), ...newPriority })
    setShowAddPriority(false)
    setNewPriority({ label: '', colorHex: PRESET_COLORS[1], level: 0 })
  }

  const handleSaveTime = () => {
    if (!newTime.label.trim()) return
    addTimeFilter({ id: crypto.randomUUID(), ...newTime })
    setShowAddTime(false)
    setNewTime({ label: '', maxSeconds: 600 })
  }

  const handleSaveTag = () => {
    if (!newTag.name.trim()) return
    addTag({ id: crypto.randomUUID(), ...newTag })
    setShowAddTag(false)
    setNewTag({ name: '', colorHex: PRESET_COLORS[0] })
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        <button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'bg-surface-high text-onSurface-muted'}`}>Perfil & Datos</button>
        <button onClick={() => setActiveTab('categories')} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors ${activeTab === 'categories' ? 'bg-primary text-white' : 'bg-surface-high text-onSurface-muted'}`}>Categorías</button>
        <button onClick={() => setActiveTab('priorities')} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors ${activeTab === 'priorities' ? 'bg-primary text-white' : 'bg-surface-high text-onSurface-muted'}`}>Prioridades</button>
        <button onClick={() => setActiveTab('times')} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors ${activeTab === 'times' ? 'bg-primary text-white' : 'bg-surface-high text-onSurface-muted'}`}>Tiempos</button>
        <button onClick={() => setActiveTab('tags')} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors ${activeTab === 'tags' ? 'bg-primary text-white' : 'bg-surface-high text-onSurface-muted'}`}>Etiquetas</button>
      </div>

      {activeTab === 'profile' && (
        <section className="space-y-6">
          <div className="bg-surface-low rounded-xl p-4 border border-surface-high space-y-3">
            <h2 className="text-sm font-semibold text-onSurface">Perfil</h2>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted mb-1.5">Nombre</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={draftName} 
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Tu nombre..."
                  className="flex-1 bg-background border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                />
                <button 
                  onClick={() => updateUserProfile(draftName)}
                  disabled={draftName === userProfile.name}
                  className={`px-3 py-2 rounded-lg text-[10px] uppercase font-bold flex items-center justify-center transition-colors ${draftName !== userProfile.name ? 'bg-primary text-white hover:brightness-110 cursor-pointer' : 'bg-surface-high text-primary cursor-default'}`}
                >
                  {draftName !== userProfile.name ? 'Guardar' : 'Guardado'}
                </button>
              </div>
              <p className="text-[10px] text-onSurface-muted mt-2 italic">Haz clic en Guardar para actualizar tu nombre.</p>
            </div>
            
            {userEmail && (
              <div className="pt-2">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted mb-1.5">Cuenta</label>
                <div className="flex items-center gap-2 text-onSurface text-xs bg-background border border-surface-high rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined text-[16px] text-onSurface-muted">mail</span>
                  {userEmail}
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface-low rounded-xl p-4 border border-surface-high space-y-3">
            <h2 className="text-sm font-semibold text-error">Sesión</h2>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Cerrar Sesión
            </button>
          </div>

          <div className="bg-surface-low rounded-xl p-4 border border-surface-high space-y-3">
            <h2 className="text-sm font-semibold text-onSurface">Estadísticas Locales</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3 text-center border border-surface-high">
                <span className="block text-2xl font-bold text-primary">{videos.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-onSurface-muted">Vídeos</span>
              </div>
              <div className="bg-background rounded-lg p-3 text-center border border-surface-high">
                <span className="block text-2xl font-bold text-primary">{actions.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-onSurface-muted">Acciones</span>
              </div>
            </div>
            <p className="text-[11px] text-onSurface-muted text-center pt-2">Tus datos se guardan de forma segura en tu navegador y no requieren conexión.</p>
          </div>
        </section>
      )}

      {activeTab === 'categories' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-onSurface">Mis Categorías</h2>
            <button onClick={() => setShowAddCategory(true)} className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[14px]">add</span> Añadir
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-surface-low rounded-xl p-4 border border-surface-high flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-high flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ color: cat.colorHex }}>
                    <span className="material-symbols-outlined text-[24px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{cat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2 pt-1">
                    <input type="text" value={cat.name} onChange={(e) => updateCategory(cat.id, { name: e.target.value })} className="w-full bg-transparent text-sm font-semibold text-onSurface focus:outline-none truncate" />
                    <div className="w-40">
                      <IconPicker value={cat.icon} onChange={(c) => updateCategory(cat.id, { icon: c })} />
                    </div>
                  </div>
                  <button onClick={() => deleteCategory(cat.id)} className="w-8 h-8 rounded-full hover:bg-error/10 text-onSurface-muted hover:text-error transition-colors flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
                <div className="pl-13 pt-2 border-t border-surface-high/50">
                  <ColorPicker 
                    value={cat.colorHex} 
                    onChange={(c) => updateCategory(cat.id, { colorHex: c })} 
                    usedColors={categories.map(c => c.colorHex)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'priorities' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-onSurface">Niveles de Prioridad</h2>
            <button onClick={() => setShowAddPriority(true)} className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[14px]">add</span> Añadir
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {priorities.map(prio => (
              <div key={prio.id} className="bg-surface-low rounded-xl p-4 border border-surface-high flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: prio.colorHex }}></div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <input type="text" value={prio.label} onChange={(e) => updatePriority(prio.id, { label: e.target.value })} className="flex-1 min-w-0 bg-transparent text-sm font-medium text-onSurface focus:outline-none truncate" />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-onSurface-muted">Peso:</span>
                      <input type="number" value={prio.level} onChange={(e) => updatePriority(prio.id, { level: Number(e.target.value) })} className="w-12 bg-background border border-surface-high text-xs rounded px-2 py-1 text-onSurface-muted focus:outline-none text-center" />
                    </div>
                  </div>
                  <button onClick={() => deletePriority(prio.id)} className="w-8 h-8 rounded-full hover:bg-error/10 text-onSurface-muted hover:text-error transition-colors flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
                <div className="pl-6 pt-2 border-t border-surface-high/50">
                  <ColorPicker 
                    value={prio.colorHex} 
                    onChange={(c) => updatePriority(prio.id, { colorHex: c })} 
                    usedColors={priorities.map(p => p.colorHex)} 
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-onSurface-muted mt-2">Los vídeos se ordenarán primero por aquellos con una prioridad de mayor "Peso".</p>
        </section>
      )}

      {activeTab === 'times' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-onSurface">Filtros de Tiempo</h2>
            <button onClick={() => setShowAddTime(true)} className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[14px]">add</span> Añadir
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {timeFilters.map(tf => (
              <div key={tf.id} className="bg-surface-low rounded-xl p-3 border border-surface-high flex items-center gap-3">
                <span className="material-symbols-outlined text-onSurface-muted flex-shrink-0">timer</span>
                <div className="flex-1 space-y-2">
                  <input type="text" value={tf.label} onChange={(e) => updateTimeFilter(tf.id, { label: e.target.value })} className="w-full bg-transparent text-sm font-medium text-onSurface focus:outline-none" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-onSurface-muted">Max Segundos:</span>
                    <input type="number" value={tf.maxSeconds} onChange={(e) => updateTimeFilter(tf.id, { maxSeconds: Number(e.target.value) })} className="w-24 bg-background border border-surface-high text-xs rounded px-2 py-1 text-onSurface-muted focus:outline-none" />
                  </div>
                </div>
                <button onClick={() => deleteTimeFilter(tf.id)} className="w-8 h-8 rounded-full hover:bg-error/10 text-onSurface-muted hover:text-error transition-colors flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'tags' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-onSurface">Mis Etiquetas</h2>
            <button onClick={() => setShowAddTag(true)} className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[14px]">add</span> Añadir
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {tags.map(tag => (
              <div key={tag.id} className="bg-surface-low rounded-xl p-4 border border-surface-high flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-onSurface-muted text-lg">#</span>
                  <input type="text" value={tag.name} onChange={(e) => updateTag(tag.id, { name: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })} className="w-full bg-transparent text-sm font-semibold text-onSurface focus:outline-none" />
                </div>
                <button onClick={() => deleteTag(tag.id)} className="w-8 h-8 rounded-full hover:bg-error/10 text-onSurface-muted hover:text-error transition-colors flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-center text-xs text-onSurface-muted py-6">No has creado ninguna etiqueta todavía. Úsalas para organizar aún mejor tus vídeos.</p>
            )}
          </div>
        </section>
      )}

      {/* --- MODALS --- */}
      
      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-low border border-surface-high rounded-2xl p-5 w-full max-w-xs space-y-5 shadow-xl">
            <h3 className="text-lg font-bold text-onSurface">Nueva Categoría</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Nombre</label>
                <input 
                  type="text" 
                  value={newCategory.name} 
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Ej. IA, Podcast..."
                  className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Icono</label>
                <IconPicker 
                  value={newCategory.icon} 
                  onChange={(c) => setNewCategory({ ...newCategory, icon: c })} 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Color</label>
                <ColorPicker 
                  value={newCategory.colorHex} 
                  onChange={(c) => setNewCategory({ ...newCategory, colorHex: c })} 
                  usedColors={categories.map(c => c.colorHex)} 
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button onClick={() => setShowAddCategory(false)} className="px-4 py-2 text-xs font-medium text-onSurface-muted hover:text-onSurface transition-colors">Cancelar</button>
              <button onClick={handleSaveCategory} disabled={!newCategory.name.trim() || !newCategory.colorHex} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:brightness-110 disabled:opacity-50 transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Priority Modal */}
      {showAddPriority && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-low border border-surface-high rounded-2xl p-5 w-full max-w-xs space-y-5 shadow-xl">
            <h3 className="text-lg font-bold text-onSurface">Nueva Prioridad</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Etiqueta</label>
                <input 
                  type="text" 
                  value={newPriority.label} 
                  onChange={(e) => setNewPriority({ ...newPriority, label: e.target.value })}
                  placeholder="Ej. Urgente"
                  className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Peso (orden)</label>
                <input 
                  type="number" 
                  value={newPriority.level} 
                  onChange={(e) => setNewPriority({ ...newPriority, level: Number(e.target.value) })}
                  className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Color</label>
                <ColorPicker 
                  value={newPriority.colorHex} 
                  onChange={(c) => setNewPriority({ ...newPriority, colorHex: c })} 
                  usedColors={priorities.map(p => p.colorHex)} 
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button onClick={() => setShowAddPriority(false)} className="px-4 py-2 text-xs font-medium text-onSurface-muted hover:text-onSurface transition-colors">Cancelar</button>
              <button onClick={handleSavePriority} disabled={!newPriority.label.trim() || !newPriority.colorHex} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:brightness-110 disabled:opacity-50 transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Time Modal */}
      {showAddTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-low border border-surface-high rounded-2xl p-5 w-full max-w-xs space-y-5 shadow-xl">
            <h3 className="text-lg font-bold text-onSurface">Nuevo Filtro de Tiempo</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Etiqueta</label>
                <input 
                  type="text" 
                  value={newTime.label} 
                  onChange={(e) => setNewTime({ ...newTime, label: e.target.value })}
                  placeholder="Ej. 10 Minutos"
                  className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Max. Segundos</label>
                <input 
                  type="number" 
                  value={newTime.maxSeconds} 
                  onChange={(e) => setNewTime({ ...newTime, maxSeconds: Number(e.target.value) })}
                  className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button onClick={() => setShowAddTime(false)} className="px-4 py-2 text-xs font-medium text-onSurface-muted hover:text-onSurface transition-colors">Cancelar</button>
              <button onClick={handleSaveTime} disabled={!newTime.label.trim()} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:brightness-110 disabled:opacity-50 transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tag Modal */}
      {showAddTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-low border border-surface-high rounded-2xl p-5 w-full max-w-xs space-y-5 shadow-xl">
            <h3 className="text-lg font-bold text-onSurface">Nueva Etiqueta</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Nombre</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onSurface-muted text-[16px]">tag</span>
                  <input 
                    type="text" 
                    value={newTag.name} 
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
                    placeholder="Ej. tutorial"
                    className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    autoFocus
                  />
                </div>
                <p className="text-[9px] text-onSurface-muted">Solo letras, números, guiones y barras bajas.</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button onClick={() => setShowAddTag(false)} className="px-4 py-2 text-xs font-medium text-onSurface-muted hover:text-onSurface transition-colors">Cancelar</button>
              <button onClick={handleSaveTag} disabled={!newTag.name.trim()} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:brightness-110 disabled:opacity-50 transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
