'use client'

import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Text3D,
  Center,
  Environment,
  OrbitControls,
  Loader,
  ContactShadows,
} from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { useStore, type MaterialType, type CameraView } from '@/lib/store'

// --- PBR Material Config ---
const MATERIAL_CONFIG: Record<
  MaterialType,
  {
    Component: 'meshStandardMaterial' | 'meshPhysicalMaterial'
    props: Record<string, unknown>
  }
> = {
  aluminio: {
    Component: 'meshStandardMaterial',
    props: { metalness: 0.7, roughness: 0.3, color: '#C0C0C0' },
  },
  wpc: {
    Component: 'meshStandardMaterial',
    props: { metalness: 0, roughness: 0.9, color: '#8B5A2B' },
  },
  ceramica: {
    Component: 'meshPhysicalMaterial',
    props: {
      metalness: 0,
      roughness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      color: '#FFFFFF',
    },
  },
  metales: {
    Component: 'meshStandardMaterial',
    props: { metalness: 1.0, roughness: 0.4, color: '#A9A9A9' },
  },
}

function SignMaterial({ material }: { material: MaterialType }) {
  const config = MATERIAL_CONFIG[material]
  if (config.Component === 'meshPhysicalMaterial') {
    return <meshPhysicalMaterial {...(config.props as any)} />
  }
  return <meshStandardMaterial {...(config.props as any)} />
}

// --- SVG Geometry from uploaded file ---
function SvgSign({
  svgData,
  material,
  depth,
  width,
  height,
}: {
  svgData: string
  material: MaterialType
  depth: number
  width: number
  height: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const geometries = useMemo(() => {
    const loader = new SVGLoader()
    const data = loader.parse(svgData)
    const shapes: THREE.ExtrudeGeometry[] = []
    data.paths.forEach((path) => {
      const pathShapes = SVGLoader.createShapes(path)
      pathShapes.forEach((shape) => {
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: depth / 100,
          bevelEnabled: true,
          bevelThickness: 0.01,
          bevelSize: 0.01,
          bevelSegments: 2,
        })
        shapes.push(geo)
      })
    })
    return shapes
  }, [svgData, depth])

  // Calculate bounding box to center and scale
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3()
    geometries.forEach((geo) => {
      geo.computeBoundingBox()
      if (geo.boundingBox) box.union(geo.boundingBox)
    })
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)

    const targetWidth = width / 100
    const targetHeight = height / 100
    const scaleX = targetWidth / (size.x || 1)
    const scaleY = targetHeight / (size.y || 1)
    const s = Math.min(scaleX, scaleY) * 0.8

    return {
      scale: s,
      offset: center,
    }
  }, [geometries, width, height])

  return (
    <group ref={groupRef} scale={[scale, -scale, scale]} position={[0, 0, 0.02]}>
      <group position={[-offset.x, -offset.y, -offset.z]}>
        {geometries.map((geo, i) => (
          <mesh key={i} geometry={geo}>
            <SignMaterial material={material} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// --- Text3D sign ---
function TextSign({
  text,
  material,
  depth,
  width,
}: {
  text: string
  material: MaterialType
  depth: number
  width: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const extrudeDepth = depth / 100

  // Scale the text to fit the target width
  const targetWidth = width / 100

  return (
    <Center position={[0, 0, extrudeDepth / 2 + 0.02]}>
      <Text3D
        ref={meshRef}
        font="/fonts/Geist_Bold.json"
        size={0.35}
        height={extrudeDepth}
        bevelEnabled
        bevelThickness={0.008}
        bevelSize={0.005}
        bevelSegments={3}
        curveSegments={16}
        letterSpacing={0.05}
      >
        {text || 'BAWERK'}
        <SignMaterial material={material} />
      </Text3D>
    </Center>
  )
}

// --- Back panel (wall mount plate) ---
function BackPanel({
  width,
  height,
  material,
}: {
  width: number
  height: number
  material: MaterialType
}) {
  const w = width / 100
  const h = height / 100

  return (
    <mesh position={[0, 0, -0.01]}>
      <boxGeometry args={[w * 1.15, h * 1.4, 0.02]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.2} roughness={0.8} />
    </mesh>
  )
}

// --- Wall surface ---
function Wall({ environment }: { environment: 'interior' | 'exterior' }) {
  const isInterior = environment === 'interior'
  return (
    <mesh position={[0, 0, -0.15]} receiveShadow>
      <planeGeometry args={[12, 8]} />
      <meshStandardMaterial
        color={isInterior ? '#1a2236' : '#2c3e50'}
        roughness={isInterior ? 0.95 : 0.85}
        metalness={0.0}
      />
    </mesh>
  )
}

// --- Lighting controlled by day/night slider ---
function SceneLighting({ dayNight }: { dayNight: number }) {
  const intensity = dayNight / 100
  const ambientIntensity = 0.15 + intensity * 0.85
  const directionalIntensity = 0.3 + intensity * 1.7
  const warmth = new THREE.Color().lerpColors(
    new THREE.Color('#1a1a3e'),
    new THREE.Color('#ffffff'),
    intensity
  )

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={warmth} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={directionalIntensity}
        color={warmth}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[-3, 2, 4]}
        intensity={intensity * 0.5}
        color="#7EA5BF"
      />
      {/* Backlight for depth */}
      <pointLight
        position={[0, 0, -2]}
        intensity={0.2 + intensity * 0.3}
        color="#4a6fa5"
      />
    </>
  )
}

// --- Camera controller for preset views ---
function CameraController({ view }: { view: CameraView }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    const positions: Record<CameraView, [number, number, number]> = {
      perspective: [0, 0.3, 3],
      lateral: [3, 0, 0],
      front: [0, 0, 3],
      top: [0, 3, 0.01],
    }

    const pos = positions[view]
    camera.position.set(pos[0], pos[1], pos[2])
    camera.lookAt(0, 0, 0)
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [view, camera])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={1}
      maxDistance={10}
      maxPolarAngle={Math.PI / 1.5}
    />
  )
}

// --- Floor grid for visual effect ---
function FloorGrid() {
  return (
    <group position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[20, 40, '#293656', '#0d1b2a']} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

// --- Wall mount indicator ---
function WallMountIndicator() {
  return (
    <group position={[0.8, 0.55, 0]}>
      <mesh>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

// --- Main inner scene ---
function InnerScene() {
  const text = useStore((s) => s.text)
  const svgData = useStore((s) => s.svgData)
  const material = useStore((s) => s.material)
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const depth = useStore((s) => s.depth)
  const dayNight = useStore((s) => s.dayNight)
  const cameraView = useStore((s) => s.cameraView)
  const environment = useStore((s) => s.environment)

  const envPreset = dayNight > 50 ? 'city' : 'night'

  return (
    <>
      <SceneLighting dayNight={dayNight} />
      <Environment preset={envPreset} background={false} />
      <CameraController view={cameraView} />

      {/* Wall */}
      <Wall environment={environment} />

      {/* Back panel */}
      <BackPanel width={width} height={height} material={material} />

      {/* Sign content */}
      {svgData ? (
        <SvgSign
          svgData={svgData}
          material={material}
          depth={depth}
          width={width}
          height={height}
        />
      ) : (
        <TextSign text={text} material={material} depth={depth} width={width} />
      )}

      {/* Wall mount indicator */}
      <WallMountIndicator />

      {/* Floor grid for depth */}
      <FloorGrid />

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
    </>
  )
}

// --- Scene reference for GLB export ---
let _sceneRef: THREE.Scene | null = null

export function getSceneRef() {
  return _sceneRef
}

function SceneCapture() {
  const { scene } = useThree()
  useEffect(() => {
    _sceneRef = scene
    return () => {
      _sceneRef = null
    }
  }, [scene])
  return null
}

// --- Exported component ---
export function SignScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [0, 0.3, 3], fov: 50, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneCapture />
          <InnerScene />
        </Suspense>
      </Canvas>
      <Loader
        containerStyles={{ background: 'rgba(2, 10, 30, 0.9)' }}
        barStyles={{ background: '#7EA5BF' }}
        dataStyles={{ color: '#7EA5BF' }}
      />
    </div>
  )
}
