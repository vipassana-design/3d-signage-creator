'use client'

import dynamic from 'next/dynamic'

const SignScene = dynamic(
  () => import('@/components/sign-scene').then((mod) => ({ default: mod.SignScene })),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-midnight-900">
        <div className="text-accent-light text-sm font-mono">Cargando escena 3D...</div>
      </div>
    )
  }
)

export function CanvasWrapper() {
  return <SignScene />
}
