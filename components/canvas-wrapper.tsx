'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'

// Cargamos la escena SIN SSR de forma ultra-estricta
const SceneContent = dynamic(
  () => import('./three-scene').then((mod) => mod.ThreeScene),
  { ssr: false }
)

export default function CanvasWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#020a1e]">
        <div className="text-[#7EA5BF] font-mono">Iniciando motor 3D...</div>
      </div>
    )
  }

  return (
    <Suspense fallback={null}>
      <SceneContent />
    </Suspense>
  )
}