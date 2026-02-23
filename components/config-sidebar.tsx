'use client'

import { useStore, calculatePricing, MATERIAL_PRICES, type MaterialType } from '@/lib/store'
import { Upload, Link, Unlink, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Check } from 'lucide-react'
import { useRef, useState, useCallback } from 'react'

const MATERIALS: { id: MaterialType; label: string; gradient: string }[] = [
  { id: 'aluminio', label: 'Aluminio', gradient: 'from-slate-300 via-slate-200 to-slate-400' },
  { id: 'wpc', label: 'WPC', gradient: 'from-amber-800 via-amber-700 to-amber-900' },
  { id: 'ceramica', label: 'Ceramica', gradient: 'from-white via-gray-100 to-gray-200' },
  { id: 'metales', label: 'Metales', gradient: 'from-gray-500 via-gray-400 to-gray-600' },
]

export function ConfigSidebar() {
  const store = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [materialsPage, setMaterialsPage] = useState(0)
  const pricing = calculatePricing(store)

  const handleSvgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.name.endsWith('.svg')) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const result = evt.target?.result as string
      store.setSvgData(result, file.name)
    }
    reader.readAsText(file)
  }, [store])

  return (
    <aside className="absolute right-0 top-0 bottom-0 w-[400px] glass-sidebar flex flex-col h-full overflow-y-auto z-40 pt-20">
      <div className="p-8 flex flex-col gap-8">
        {/* Configuration Title */}
        <div className="flex flex-col gap-4">
          <h3 className="text-accent-light text-[10px] font-bold uppercase tracking-[0.2em] font-mono mb-1">
            Configuracion
          </h3>

          {/* Text Input */}
          <div className="relative group">
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block ml-1">
              Contenido del Cartel
            </label>
            <div className="relative">
              <input
                type="text"
                value={store.text}
                onChange={(e) => store.setText(e.target.value)}
                className="w-full bg-midnight-900/50 border border-white/10 rounded-lg p-4 text-foreground focus:border-accent-light focus:ring-1 focus:ring-accent-light focus:shadow-[0_0_20px_rgba(126,165,191,0.1)] outline-none font-bold text-xl tracking-tight placeholder-gray-600 transition-all"
                placeholder="BAWERK"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-light/50 text-xs font-mono">
                TEXT
              </span>
            </div>
          </div>

          {/* SVG Upload */}
          <div
            className="relative group cursor-pointer mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-full h-16 border border-dashed border-white/20 rounded-lg flex items-center justify-center gap-3 hover:border-accent-light hover:bg-accent-light/5 transition-all">
              <Upload className="size-5 text-accent-light group-hover:scale-110 transition-transform" />
              <span className="text-xs text-muted-foreground font-mono">
                {store.svgFileName || 'Subir archivo vector (SVG)'}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              className="hidden"
              onChange={handleSvgUpload}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Materials */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <h3 className="text-accent-light text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
              Materiales
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setMaterialsPage(Math.max(0, materialsPage - 1))}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => setMaterialsPage(Math.min(1, materialsPage + 1))}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {MATERIALS.slice(materialsPage * 3, materialsPage * 3 + 3).map((mat) => {
              const isActive = store.material === mat.id
              return (
                <button
                  key={mat.id}
                  onClick={() => store.setMaterial(mat.id)}
                  className={`group relative flex flex-col gap-3 rounded-xl p-1 -m-1 transition-all ${
                    isActive ? 'active-material' : ''
                  }`}
                >
                  <div
                    className={`w-full aspect-square rounded-lg bg-gradient-to-br ${mat.gradient} shadow-xl relative overflow-hidden ${
                      !isActive ? 'group-hover:scale-105' : ''
                    } transition-transform border border-white/10`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-accent-light/20 mix-blend-overlay" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wide text-center transition-colors ${
                      isActive ? 'text-accent-light font-bold' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    {mat.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-accent-light text-midnight-900 rounded-full p-0.5 shadow-lg z-10 scale-75">
                      <Check className="size-3.5 font-bold" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Dimensions */}
        <div className="flex flex-col gap-6">
          <h3 className="text-accent-light text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
            Dimensiones
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] text-muted-foreground font-mono">ANCHO (CM)</label>
              <input
                type="number"
                value={store.width}
                onChange={(e) => store.setWidth(Number(e.target.value))}
                className="w-full bg-midnight-900/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground font-mono focus:border-accent-light focus:ring-0 outline-none text-center"
                min={10}
                max={500}
              />
            </div>
            <div className="flex items-end pb-2">
              <button
                onClick={() => store.setLinkDimensions(!store.linkDimensions)}
                className="text-muted-foreground hover:text-accent-light transition-colors"
                title="Vincular proporciones"
              >
                {store.linkDimensions ? <Link className="size-4" /> : <Unlink className="size-4" />}
              </button>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] text-muted-foreground font-mono">ALTO (CM)</label>
              <input
                type="number"
                value={store.height}
                onChange={(e) => store.setHeight(Number(e.target.value))}
                className="w-full bg-midnight-900/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground font-mono focus:border-accent-light focus:ring-0 outline-none text-center"
                min={10}
                max={300}
              />
            </div>
          </div>

          {/* Depth Slider */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-muted-foreground font-mono">PROFUNDIDAD 3D</span>
              <span className="text-xs text-accent-light font-mono">{store.depth} mm</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={store.depth}
              onChange={(e) => store.setDepth(Number(e.target.value))}
              className="w-full h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-3 pt-2">
            <span className="text-[10px] text-muted-foreground font-mono">CANTIDAD DE UNIDADES</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => store.setQuantity(store.quantity - 1)}
                className="size-9 rounded bg-midnight-900/50 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent-light transition-all"
              >
                <Minus className="size-4" />
              </button>
              <input
                type="number"
                value={store.quantity}
                onChange={(e) => store.setQuantity(Number(e.target.value))}
                className="w-20 bg-midnight-900/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground font-mono focus:border-accent-light focus:ring-0 outline-none text-center"
                min={1}
              />
              <button
                onClick={() => store.setQuantity(store.quantity + 1)}
                className="size-9 rounded bg-midnight-900/50 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent-light transition-all"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-auto pt-6">
          <div className="bg-midnight-800 text-foreground p-6 rounded-t-lg relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent-light/20" />
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4 border-dashed">
              <span className="font-bold text-lg tracking-tight text-foreground">RESUMEN</span>
              <span className="text-xs font-mono text-muted-foreground">
                #REQ-{Math.floor(1000 + Math.random() * 9000)}
              </span>
            </div>

            <div className="flex flex-col gap-3 mb-6 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Costo Material ({MATERIAL_PRICES[store.material].name})
                </span>
                <span className="font-bold text-foreground">
                  ${pricing.materialCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo Tamano</span>
                <span className="font-bold text-foreground">
                  ${pricing.sizeCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Costo Cantidad (x{store.quantity})
                </span>
                <span className="font-bold text-foreground">
                  ${pricing.quantityCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-accent-light/70 mt-1">
                  <span>Descuento Volumen</span>
                  <span>
                    -${pricing.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 flex items-end justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Total Estimado
                </span>
                <span className="text-xs text-muted-foreground">MXN Incl. IVA</span>
              </div>
              <span className="text-3xl font-bold tracking-tight text-foreground">
                ${Math.floor(pricing.total).toLocaleString()}
                <span className="text-lg align-top text-muted-foreground">
                  .{(pricing.total % 1).toFixed(2).split('.')[1]}
                </span>
              </span>
            </div>

            <button className="w-full h-12 bg-accent-light text-midnight-900 font-bold rounded flex items-center justify-center gap-3 transition-all hover:bg-white hover:text-midnight-900 group shadow-lg shadow-accent-light/10">
              <ShoppingBag className="size-5 group-hover:animate-bounce" />
              COMPLETAR ORDEN
            </button>
          </div>
          <div className="h-3 w-full receipt-cut opacity-50" />
        </div>
      </div>
    </aside>
  )
}
