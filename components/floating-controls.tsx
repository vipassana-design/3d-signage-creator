'use client'

import { useStore, type CameraView } from '@/lib/store'
import {
  Sun,
  Moon,
  RotateCcw,
  Eye,
  PanelLeft,
  Maximize,
  ArrowUp,
  Home,
  Trees,
  Smartphone,
} from 'lucide-react'
import { useState } from 'react'

export function FloatingControls({ onOpenAR }: { onOpenAR: () => void }) {
  const store = useStore()

  return (
    <>
      {/* Day/Night Slider - Left side vertical */}
      <DayNightSlider />

      {/* Bottom Controls */}
      <BottomControls onOpenAR={onOpenAR} />
    </>
  )
}

function DayNightSlider() {
  const dayNight = useStore((s) => s.dayNight)
  const setDayNight = useStore((s) => s.setDayNight)

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
      <div className="glass-panel rounded-xl p-3 flex flex-col items-center gap-4">
        {/* Sun icon */}
        <Sun className="size-5 text-accent-light opacity-70" />

        {/* Vertical slider */}
        <div className="relative h-40 w-6 flex items-center justify-center">
          <div className="absolute h-full w-1 bg-white/10 rounded-full" />
          <div
            className="absolute bottom-0 w-1 bg-accent-light rounded-full transition-all"
            style={{ height: `${dayNight}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={dayNight}
            onChange={(e) => setDayNight(Number(e.target.value))}
            className="absolute h-full w-6 opacity-0 cursor-pointer"
            style={{
              writingMode: 'vertical-lr',
              direction: 'rtl',
            }}
          />
          {/* Thumb indicator */}
          <div
            className="absolute left-1/2 -translate-x-1/2 size-4 rounded-full bg-accent-light border-2 border-midnight-900 shadow-[0_0_10px_rgba(126,165,191,0.5)] pointer-events-none transition-all"
            style={{ bottom: `calc(${dayNight}% - 8px)` }}
          />
        </div>

        {/* Moon icon */}
        <Moon className="size-5 text-accent-light opacity-70" />
      </div>
    </div>
  )
}

function BottomControls({ onOpenAR }: { onOpenAR: () => void }) {
  const store = useStore()

  const cameraViews: { id: CameraView; label: string; icon: React.ReactNode }[] = [
    { id: 'perspective', label: 'Perspectiva', icon: <Eye className="size-3.5" /> },
    { id: 'lateral', label: 'Lateral', icon: <PanelLeft className="size-3.5" /> },
    { id: 'front', label: 'Frente', icon: <Maximize className="size-3.5" /> },
    { id: 'top', label: 'Superior', icon: <ArrowUp className="size-3.5" /> },
  ]

  const environments: { id: 'interior' | 'exterior'; label: string; icon: React.ReactNode }[] = [
    { id: 'interior', label: 'Interior', icon: <Home className="size-3.5" /> },
    { id: 'exterior', label: 'Exterior', icon: <Trees className="size-3.5" /> },
  ]

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4" style={{ marginLeft: '-200px' }}>
      {/* VER EN RA button */}
      <button
        onClick={onOpenAR}
        className="flex items-center gap-2 h-10 px-5 rounded-lg bg-accent-light text-midnight-900 font-bold text-xs uppercase tracking-wider hover:bg-white hover:shadow-[0_0_20px_rgba(126,165,191,0.4)] transition-all"
      >
        <Smartphone className="size-4" />
        Ver en RA
      </button>

      {/* Camera Views */}
      <div className="glass-panel rounded-lg flex items-center overflow-hidden">
        {cameraViews.map((v) => (
          <button
            key={v.id}
            onClick={() => store.setCameraView(v.id)}
            className={`flex items-center gap-2 h-10 px-4 text-xs font-bold uppercase tracking-wider transition-all ${
              store.cameraView === v.id
                ? 'bg-accent-light/20 text-accent-light'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* Environment Toggle */}
      <div className="glass-panel rounded-lg flex items-center overflow-hidden">
        {environments.map((env) => (
          <button
            key={env.id}
            onClick={() => store.setEnvironment(env.id)}
            className={`flex items-center gap-2 h-10 px-4 text-xs font-bold uppercase tracking-wider transition-all ${
              store.environment === env.id
                ? 'bg-accent-light/20 text-accent-light'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            {env.icon}
            {env.label}
          </button>
        ))}
      </div>

      {/* Reset View */}
      <button
        onClick={() => store.setCameraView('perspective')}
        className="glass-panel rounded-lg flex items-center gap-2 h-10 px-4 text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-all"
      >
        <RotateCcw className="size-3.5" />
        Reset View
      </button>
    </div>
  )
}
