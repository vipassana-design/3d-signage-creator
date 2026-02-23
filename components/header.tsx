'use client'

import { useStore } from '@/lib/store'
import { Box, Save, RotateCcw, FolderOpen, Compass } from 'lucide-react'

export function Header() {
  const reset = useStore((s) => s.reset)

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-white/5 px-8 py-4 bg-midnight-900/90 backdrop-blur-md z-50 absolute top-0 w-full shadow-lg">
      <div className="flex items-center gap-4 text-foreground">
        <div className="size-10 flex items-center justify-center text-accent-light bg-secondary/50 rounded-lg border border-white/5 shadow-[0_0_15px_rgba(126,165,191,0.1)]">
          <Box className="size-5" />
        </div>
        <div>
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-wide">
            BAWERK<span className="font-light text-accent-light">STUDIO</span>
          </h2>
          <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
            Professional Signage
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-3">
          <button className="flex items-center justify-center rounded-md h-9 px-4 bg-secondary/40 border border-white/5 text-muted-foreground text-xs font-bold hover:bg-accent-light hover:text-midnight-900 transition-all uppercase tracking-wider gap-2">
            <Compass className="size-3.5" />
            Explorar Disenos
          </button>
          <button className="flex items-center justify-center rounded-md h-9 px-4 bg-secondary/40 border border-white/5 text-muted-foreground text-xs font-bold hover:bg-accent-light hover:text-midnight-900 transition-all uppercase tracking-wider gap-2">
            <FolderOpen className="size-3.5" />
            Mis Proyectos
          </button>
          <button
            onClick={reset}
            className="flex items-center justify-center rounded-md h-9 px-4 bg-secondary/40 border border-white/5 text-muted-foreground text-xs font-bold hover:bg-accent-light hover:text-midnight-900 transition-all uppercase tracking-wider gap-2"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button className="flex items-center justify-center rounded-md h-9 px-4 bg-accent-light text-midnight-900 text-xs font-bold hover:bg-white hover:shadow-[0_0_15px_rgba(126,165,191,0.4)] transition-all gap-2 uppercase tracking-wider">
            <Save className="size-3.5" />
            Guardar
          </button>
        </div>

        <div className="flex items-center gap-3 border-l border-white/10 pl-6 h-8">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-foreground">Matias</span>
            <span className="text-[9px] text-muted-foreground uppercase">Perfil</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-midnight-700 to-midnight-800 border border-white/20 flex items-center justify-center shadow-lg text-xs font-bold text-accent-light">
            MA
          </div>
        </div>
      </div>
    </header>
  )
}
