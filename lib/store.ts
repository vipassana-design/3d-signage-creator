import { create } from 'zustand'

export type MaterialType = 'aluminio' | 'wpc' | 'ceramica' | 'metales'
export type CameraView = 'perspective' | 'lateral' | 'front' | 'top'
export type EnvironmentType = 'interior' | 'exterior'

export interface SignConfig {
  text: string
  svgData: string | null
  svgFileName: string | null
  material: MaterialType
  width: number
  height: number
  depth: number
  quantity: number
  dayNight: number // 0 = night, 100 = day
  cameraView: CameraView
  environment: EnvironmentType
  linkDimensions: boolean
}

interface StoreState extends SignConfig {
  setText: (text: string) => void
  setSvgData: (data: string | null, fileName: string | null) => void
  setMaterial: (material: MaterialType) => void
  setWidth: (width: number) => void
  setHeight: (height: number) => void
  setDepth: (depth: number) => void
  setQuantity: (quantity: number) => void
  setDayNight: (value: number) => void
  setCameraView: (view: CameraView) => void
  setEnvironment: (env: EnvironmentType) => void
  setLinkDimensions: (linked: boolean) => void
  reset: () => void
}

const defaultState: SignConfig = {
  text: 'BAWERK',
  svgData: null,
  svgFileName: null,
  material: 'aluminio',
  width: 120,
  height: 45,
  depth: 25,
  quantity: 1,
  dayNight: 65,
  cameraView: 'perspective',
  environment: 'interior',
  linkDimensions: false,
}

export const useStore = create<StoreState>((set, get) => ({
  ...defaultState,
  setText: (text) => set({ text }),
  setSvgData: (data, fileName) => set({ svgData: data, svgFileName: fileName }),
  setMaterial: (material) => set({ material }),
  setWidth: (width) => {
    const state = get()
    if (state.linkDimensions) {
      const ratio = state.height / state.width
      set({ width, height: Math.round(width * ratio) })
    } else {
      set({ width })
    }
  },
  setHeight: (height) => {
    const state = get()
    if (state.linkDimensions) {
      const ratio = state.width / state.height
      set({ height, width: Math.round(height * ratio) })
    } else {
      set({ height })
    }
  },
  setDepth: (depth) => set({ depth }),
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  setDayNight: (value) => set({ dayNight: value }),
  setCameraView: (view) => set({ cameraView: view }),
  setEnvironment: (env) => set({ environment: env }),
  setLinkDimensions: (linked) => set({ linkDimensions: linked }),
  reset: () => set(defaultState),
}))

// Material properties for 3D rendering
export const MATERIAL_PROPERTIES: Record<
  MaterialType,
  { color: string; metalness: number; roughness: number; clearcoat?: number }
> = {
  aluminio: { color: '#d4d4d4', metalness: 0.9, roughness: 0.15 },
  wpc: { color: '#8b7355', metalness: 0.1, roughness: 0.8 },
  ceramica: { color: '#e8f4f8', metalness: 0.2, roughness: 0.1, clearcoat: 0.8 },
  metales: { color: '#b8b8b8', metalness: 1.0, roughness: 0.2 },
}

// Pricing logic
export const MATERIAL_PRICES: Record<MaterialType, { perCm2: number; name: string }> = {
  aluminio: { perCm2: 0.45, name: 'Aluminio' },
  wpc: { perCm2: 0.30, name: 'WPC' },
  ceramica: { perCm2: 0.65, name: 'Ceramica' },
  metales: { perCm2: 0.55, name: 'Metales' },
}

export function calculatePricing(config: SignConfig) {
  const area = config.width * config.height
  const materialInfo = MATERIAL_PRICES[config.material]
  const materialCost = area * materialInfo.perCm2
  const sizeCost = (config.width + config.height) * 5 + config.depth * 8
  const quantityCost = materialCost * 0.15 * config.quantity
  const subtotal = (materialCost + sizeCost + quantityCost) * config.quantity
  const discount = config.quantity >= 5 ? subtotal * 0.1 : config.quantity >= 3 ? subtotal * 0.05 : 0
  const total = subtotal - discount

  return {
    materialCost: Math.round(materialCost * 100) / 100,
    sizeCost: Math.round(sizeCost * 100) / 100,
    quantityCost: Math.round(quantityCost * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}
