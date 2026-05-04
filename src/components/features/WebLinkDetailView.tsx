"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"

export default function WebLinkDetailView({ webId }: { webId: string }) {
  const allWebs = useAppStore(state => state.webLinks)
  const categories = useAppStore(state => state.categories)
  const priorities = useAppStore(state => state.priorities)
  const tags = useAppStore(state => state.tags)
  const updateWebStore = useAppStore(state => state.updateWebLink)

  const allActions = useAppStore(state => state.actions)
  const addAction = useAppStore(state => state.addAction)
  const updateAction = useAppStore(state => state.updateAction)
  const deleteAction = useAppStore(state => state.deleteAction)
  
  const [mounted, setMounted] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [newActionTitle, setNewActionTitle] = useState("")
  const [showCompletedActions, setShowCompletedActions] = useState(false)
  
  // Custom dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  
  const webLink = allWebs.find(w => w.id === webId)
  const [noteContent, setNoteContent] = useState("")

  useEffect(() => {
    setMounted(true)
    if (webLink) {
      setNoteContent(webLink.personal_notes || "")
    }
  }, [webLink])

  if (!mounted) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  if (!webLink) {
    return <div className="text-center py-10 text-onSurface-muted">Enlace web no encontrado</div>
  }

  const updateWebLink = (updates: any) => {
    updateWebStore(webId, updates)
  }

  const handlePriorityChange = (priorityId: string) => {
    updateWebLink({ priority: webLink.priority === priorityId ? null : priorityId })
  }

  const handleSaveNote = () => {
    updateWebLink({ personal_notes: noteContent })
    setIsEditingNote(false)
  }

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActionTitle.trim()) return
    addAction({
      title: newActionTitle.trim(),
      status: 'pending',
      web_link_id: webId
    })
    setNewActionTitle("")
  }

  const handleToggleAction = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'
    updateAction(id, { status: newStatus })
  }

  let domain = ""
  try {
    domain = new URL(webLink.url).hostname.replace('www.', '')
  } catch (e) {
    domain = webLink.url
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Metadata */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight leading-snug text-onSurface">{webLink.title}</h1>
        {webLink.saved_at && (
           <p className="text-xs text-onSurface-muted">
             Guardado el {new Date(webLink.saved_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
           </p>
        )}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Category Selector */}
        <div className="bg-surface-low rounded-xl p-3 border border-surface-high relative">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted mb-1.5">Categoría</label>
          <div 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full bg-transparent text-sm text-primary font-medium focus:outline-none cursor-pointer flex items-center justify-between"
          >
            <span className="truncate pr-2">{categories.find(c => c.id === webLink.category)?.name || 'Seleccionar'}</span>
            <span className="material-symbols-outlined text-onSurface-muted pointer-events-none text-[20px]">expand_more</span>
          </div>
          
          {isCategoryOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)}></div>
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-low border border-surface-high rounded-xl py-2 shadow-xl z-50 max-h-48 overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { updateWebLink({ category: cat.id }); setIsCategoryOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-surface-high ${webLink.category === cat.id ? 'text-primary font-medium' : 'text-onSurface'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status Badge */}
        <div className="bg-surface-low rounded-xl p-3 border border-surface-high relative flex flex-col justify-center">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted mb-1.5">Estado</label>
          <div 
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className={`w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer flex items-center justify-between ${
              webLink.status === 'pending' ? 'text-priority-high' : 
              webLink.status === 'seen' ? 'text-onSurface-muted' : 
              webLink.status === 'notion_candidate' ? 'text-status-notion' : 'text-error'
            }`}
          >
            <span>
              {webLink.status === 'pending' ? 'Pendiente' : 
               webLink.status === 'seen' ? 'Visto' : 
               webLink.status === 'discarded' ? 'Descartado' : 'Notion'}
            </span>
            <span className="material-symbols-outlined text-onSurface-muted pointer-events-none text-[20px]">expand_more</span>
          </div>
          
          {isStatusOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)}></div>
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-low border border-surface-high rounded-xl py-2 shadow-xl z-50">
                <button onClick={() => { updateWebLink({ status: 'pending' }); setIsStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-onSurface hover:bg-surface-high transition-colors">Pendiente</button>
                <button onClick={() => { updateWebLink({ status: 'seen' }); setIsStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-onSurface hover:bg-surface-high transition-colors">Visto</button>
                <button onClick={() => { updateWebLink({ status: 'discarded' }); setIsStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-onSurface hover:bg-surface-high transition-colors">Descartado</button>
                <button onClick={() => { updateWebLink({ status: 'notion_candidate' }); setIsStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-onSurface hover:bg-surface-high transition-colors">Notion</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Priority Selector */}
      <div className="space-y-2">
        <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Prioridad</label>
        <div className="grid grid-cols-3 gap-2">
          {priorities.map(p => (
            <button 
              key={p.id}
              onClick={() => handlePriorityChange(p.id)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors border ${
                webLink.priority === p.id
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-high border-surface-high hover:bg-surface-low'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.colorHex }}></div>
              <span className={`text-sm ${webLink.priority === p.id ? 'text-primary font-medium' : 'text-onSurface-muted'}`}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Selector */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Etiquetas</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
              const isSelected = webLink.tags?.includes(tag.id)
              return (
                <button 
                  key={tag.id}
                  onClick={() => {
                    const currentTags = webLink.tags || []
                    const newTags = isSelected 
                      ? currentTags.filter(id => id !== tag.id)
                      : [...currentTags, tag.id]
                    updateWebLink({ tags: newTags })
                  }}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-all border ${
                    isSelected
                      ? 'bg-primary/20 text-primary border-primary/40' 
                      : 'bg-surface-high/50 text-onSurface-muted border-surface-high hover:bg-surface-high'
                  }`}
                >
                  #{tag.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* URL */}
      <div className="space-y-2">
        <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">URL del Enlace</label>
        <div className="flex items-center gap-2 bg-surface-low border border-surface-high rounded-xl px-3 py-2.5">
          <span className="material-symbols-outlined text-[16px] text-onSurface-muted flex-shrink-0">link</span>
          <span className="flex-1 text-xs text-onSurface-muted truncate">{webLink.url}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(webLink.url); }}
            className="flex-shrink-0 text-primary hover:brightness-110 transition-all"
            title="Copiar URL"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>
        </div>
      </div>

      {/* Acciones vinculadas */}
      <div className="space-y-3">
        <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
          Acciones
        </label>
        
        <div className="flex flex-col gap-2">
          {(() => {
            const webActions = allActions.filter(a => a.web_link_id === webId)
            const pendingActions = webActions.filter(a => a.status === 'pending')
            const completedActions = webActions.filter(a => a.status === 'completed')
            
            return (
              <>
                {/* Acciones pendientes */}
                {pendingActions.map(action => (
                  <div key={action.id} className="bg-surface-low rounded-xl p-3 border border-surface-high group hover:border-primary/30 flex items-start gap-3 transition-colors">
                    <button 
                      onClick={() => handleToggleAction(action.id, action.status)}
                      className="w-6 h-6 rounded-full border-2 border-surface-high group-hover:border-primary flex items-center justify-center mt-0.5 transition-colors"
                    >
                      <div className="w-3 h-3 rounded-full bg-primary opacity-0 transition-opacity"></div>
                    </button>
                    <p className="text-sm flex-1 min-w-0 text-onSurface">{action.title}</p>
                  </div>
                ))}

                {/* Formulario nueva acción */}
                <form onSubmit={handleAddAction} className="flex gap-2 mt-1">
                  <input 
                    type="text"
                    value={newActionTitle}
                    onChange={(e) => setNewActionTitle(e.target.value)}
                    placeholder="Añadir acción..."
                    className="flex-1 bg-surface-low border border-surface-high text-onSurface text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!newActionTitle.trim()}
                    className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_4px_12px_rgba(124,92,252,0.3)]"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </form>

                {/* Acciones completadas */}
                {completedActions.length > 0 && (
                  <div className="mt-2">
                    <button 
                      onClick={() => setShowCompletedActions(!showCompletedActions)}
                      className="flex items-center gap-2 text-xs font-medium text-onSurface-muted hover:text-onSurface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {showCompletedActions ? 'expand_less' : 'expand_more'}
                      </span>
                      Acciones realizadas ({completedActions.length})
                    </button>
                    
                    {showCompletedActions && (
                      <div className="flex flex-col gap-2 mt-3 pl-2 border-l-2 border-surface-high">
                        {completedActions.map(action => (
                          <div key={action.id} className="group flex items-start gap-3">
                            <button 
                              onClick={() => handleToggleAction(action.id, action.status)}
                              className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center mt-0.5"
                            >
                              <span className="material-symbols-outlined text-[12px] text-white">check</span>
                            </button>
                            <p className="text-sm text-onSurface-muted line-through flex-1">{action.title}</p>
                            <button 
                              onClick={() => deleteAction(action.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-error/70 hover:text-error p-1"
                              title="Eliminar acción"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>

      {/* Personal Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Notas Personales</label>
          {!isEditingNote && (
            <button onClick={() => setIsEditingNote(true)} className="text-primary text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Editar
            </button>
          )}
        </div>
        
        {isEditingNote ? (
          <div className="space-y-2">
            <textarea 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Añade una nota personal o resumen..."
              className="w-full bg-surface-low border border-surface-high text-onSurface text-sm rounded-lg p-3 min-h-[120px] focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setIsEditingNote(false); setNoteContent(webLink.personal_notes || ""); }}
                className="px-4 py-2 text-xs font-medium text-onSurface-muted hover:text-onSurface"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveNote}
                className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:brightness-110"
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingNote(true)}
            className={`w-full bg-surface-low border border-surface-high rounded-lg p-3 min-h-[80px] text-sm cursor-text ${!webLink.personal_notes ? 'text-onSurface-muted italic' : 'text-onSurface whitespace-pre-wrap'}`}
          >
            {webLink.personal_notes || "Añade una nota personal..."}
          </div>
        )}
      </div>

      {/* Main Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <a 
          href={webLink.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl bg-surface-high text-primary border border-surface-high hover:border-primary/50 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          Visitar Web
        </a>
        
        <div className="grid grid-cols-2 gap-2">
          {webLink.status !== 'seen' && (
            <button 
              onClick={() => updateWebLink({ status: 'seen' })}
              className="py-3 rounded-xl bg-surface-low border border-surface-high hover:bg-surface-high text-sm font-medium text-onSurface transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Marcar visto
            </button>
          )}
          
          {webLink.notion_status !== 'candidate' && (
            <button 
              onClick={() => updateWebLink({ notion_status: 'candidate' })}
              className="py-3 rounded-xl bg-status-notion/10 border border-status-notion/20 hover:bg-status-notion/20 text-sm font-medium text-status-notion transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.459 4.208c.739 0 1.258.125 1.705.41l.161.104 12.015 8.76V5.419c0-.853-.33-1.211-.965-1.211h-.311V3h5.452v1.208h-.311c-.636 0-.965.358-.965 1.211v15.582c0 .284-.131.547-.361.713-.23.165-.526.212-.796.126l-.168-.063L5.451 11.233V18.58c0 .284-.131.547-.361.713s-.526.212-.796.126l-.168-.063L5.451 11.233V18.58c0 .853.33 1.211.965 1.211h.311V21H1.275v-1.208h.311c.636 0 .965-.358.965-1.211V5.419c0-.853-.33-1.211-.965-1.211h-.311V3h3.184z"/>
              </svg>
              Candidato Notion
            </button>
          )}

          {webLink.status !== 'discarded' && (
            <button 
              onClick={() => updateWebLink({ status: 'discarded' })}
              className={`py-3 rounded-xl bg-error/10 border border-error/20 hover:bg-error/20 text-sm font-medium text-error transition-colors flex items-center justify-center gap-2 ${webLink.status === 'seen' || webLink.notion_status === 'candidate' ? 'col-span-2' : ''}`}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Descartar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
