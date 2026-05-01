"use client"

export default function AddFirstVideoBtn() {
  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent('open-add-video'))
  }

  return (
    <button 
      onClick={handleOpen} 
      className="text-sm font-medium text-primary mt-2 hover:underline active:opacity-70 transition-all"
    >
      ¡Añade el primero!
    </button>
  )
}
