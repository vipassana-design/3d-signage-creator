'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Download, Smartphone, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface ARModalProps {
  open: boolean
  onClose: () => void
  glbBlobUrl: string | null
  onExport: () => Promise<void>
  exporting: boolean
}

export function ARModal({ open, onClose, glbBlobUrl, onExport, exporting }: ARModalProps) {
  const [arUrl, setArUrl] = useState<string | null>(null)

  useEffect(() => {
    if (glbBlobUrl) {
      // For desktop, we generate a QR code pointing to an AR viewer
      // In production this would be a hosted URL; here we use the blob for download
      setArUrl(glbBlobUrl)
    }
  }, [glbBlobUrl])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center gap-6">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-accent-light/10 flex items-center justify-center">
              <Smartphone className="size-5 text-accent-light" />
            </div>
            <div>
              <h3 className="text-foreground font-bold text-lg">Ver en Realidad Aumentada</h3>
              <p className="text-muted-foreground text-xs">Escanea el QR o descarga el modelo 3D</p>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Export / QR */}
          {!glbBlobUrl ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-muted-foreground text-sm text-center">
                Primero, exporta tu cartel como modelo 3D para poder visualizarlo en RA.
              </p>
              <button
                onClick={onExport}
                disabled={exporting}
                className="flex items-center gap-2 h-12 px-6 rounded-lg bg-accent-light text-midnight-900 font-bold text-sm uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="size-4" />
                {exporting ? 'Exportando...' : 'Exportar Modelo 3D (.glb)'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG
                  value={arUrl || 'https://bawerkstudio.com'}
                  size={180}
                  level="M"
                  fgColor="#020a1e"
                  bgColor="#ffffff"
                />
              </div>

              <p className="text-muted-foreground text-xs text-center max-w-[280px]">
                Escanea este codigo QR desde tu dispositivo movil para ver el cartel en tu espacio con Realidad Aumentada.
              </p>

              {/* Download button */}
              <a
                href={glbBlobUrl}
                download="bawerk-sign.glb"
                className="flex items-center gap-2 h-10 px-5 rounded-lg bg-secondary/60 border border-white/10 text-foreground font-bold text-xs uppercase tracking-wider hover:bg-accent-light hover:text-midnight-900 transition-all"
              >
                <Download className="size-4" />
                Descargar .GLB
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
