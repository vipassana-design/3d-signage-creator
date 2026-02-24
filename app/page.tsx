'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/header'
import { ConfigSidebar } from '@/components/config-sidebar'
import { FloatingControls } from '@/components/floating-controls'
import { ARModal } from '@/components/ar-modal'

const CanvasWrapper = dynamic(() => import('@/components/canvas-wrapper'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-midnight-900">
      <div className="text-accent-light text-sm font-mono">Cargando escena 3D...</div>
    </div>
  ),
})

export default function Page() {
  const [arOpen, setArOpen] = useState(false)
  const [glbBlobUrl, setGlbBlobUrl] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const handleExportGLB = useCallback(async () => {
    setExporting(true)
    try {
      const [{ GLTFExporter }, { getSceneRef }] = await Promise.all([
        import('three/examples/jsm/exporters/GLTFExporter.js'),
        import('@/components/three-scene'),
      ])

      const scene = getSceneRef()
      if (!scene) {
        console.error('Scene not available for export')
        setExporting(false)
        return
      }

      const exporter = new GLTFExporter()
      const gltf = await new Promise<ArrayBuffer>((resolve, reject) => {
        exporter.parse(
          scene,
          (result) => resolve(result as ArrayBuffer),
          (error) => reject(error),
          { binary: true }
        )
      })

      const blob = new Blob([gltf], { type: 'model/gltf-binary' })
      const url = URL.createObjectURL(blob)
      setGlbBlobUrl(url)
    } catch (err) {
      console.error('GLB export failed:', err)
    } finally {
      setExporting(false)
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative">
      {/* Header */}
      <Header />

      {/* 3D Viewport */}
      <div className="absolute inset-0 pt-[65px] pr-[400px]">
        {/* Background gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-background to-midnight-900" />

        {/* 3D Canvas */}
        <CanvasWrapper />

        {/* Floating Controls */}
        <FloatingControls onOpenAR={() => setArOpen(true)} />

        {/* WALL MOUNTED label */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
          <div className="glass-panel rounded-full px-4 py-1.5 flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Wall Mounted
            </span>
          </div>
        </div>
      </div>

      {/* Config Sidebar */}
      <ConfigSidebar />

      {/* AR Modal */}
      <ARModal
        open={arOpen}
        onClose={() => {
          setArOpen(false)
          if (glbBlobUrl) {
            URL.revokeObjectURL(glbBlobUrl)
            setGlbBlobUrl(null)
          }
        }}
        glbBlobUrl={glbBlobUrl}
        onExport={handleExportGLB}
        exporting={exporting}
      />
    </div>
  )
}
