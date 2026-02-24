'use client'

import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Text3D, Center, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { useStore, MATERIAL_PROPERTIES } from '@/lib/store'

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'

// Scene ref for GLB export
let _sceneRef: THREE.Scene | null = null

export function getSceneRef() {
  return _sceneRef
}

function SceneCapture() {
  const { scene } = useThree()
  
  React.useEffect(() => {
    _sceneRef = scene
    return () => {
      _sceneRef = null
    }
  }, [scene])
  
  return null
}

function Wall() {
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const environment = useStore((s) => s.environment)
  const wallW = Math.max((width / 100) * 3, 6)
  const wallH = Math.max((height / 100) * 3, 4)
  const isInterior = environment === 'interior'

  return (
    <mesh position={[0, 0, -0.15]} receiveShadow>
      <planeGeometry args={[wallW, wallH]} />
      <meshStandardMaterial 
        color={isInterior ? '#1a2236' : '#2c3e50'} 
        roughness={isInterior ? 0.95 : 0.85} 
        metalness={0} 
      />
    </mesh>
  )
}

function BackPanel() {
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const w = width / 100
  const h = height / 100

  return (
    <mesh position={[0, 0, -0.01]}>
      <boxGeometry args={[w * 1.15, h * 1.4, 0.02]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.2} roughness={0.8} />
    </mesh>
  )
}

function SvgSign() {
  const svgData = useStore((s) => s.svgData)
  const material = useStore((s) => s.material)
  const depth = useStore((s) => s.depth)
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  
  const matProps = MATERIAL_PROPERTIES[material]
  const groupRef = useRef<THREE.Group>(null)

  const geometries = useMemo(() => {
    if (!svgData) return []
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

    return { scale: s, offset: center }
  }, [geometries, width, height])

  const materialNode = useMemo(() => {
    const props: any = {
      color: matProps.color,
      metalness: matProps.metalness,
      roughness: matProps.roughness,
    }

    if (material === 'ceramica') {
      return (
        <meshPhysicalMaterial
          {...props}
          clearcoat={matProps.clearcoat || 0}
          clearcoatRoughness={0.1}
        />
      )
    }
    return <meshStandardMaterial {...props} />
  }, [material, matProps])

  if (!svgData || geometries.length === 0) return null

  return (
    <group ref={groupRef} scale={[scale, -scale, scale]} position={[0, 0, 0.02]}>
      <group position={[-offset.x, -offset.y, -offset.z]}>
        {geometries.map((geo, i) => (
          <mesh key={i} geometry={geo} castShadow>
            {materialNode}
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Sign3D() {
  const text = useStore((s) => s.text)
  const svgData = useStore((s) => s.svgData)
  const material = useStore((s) => s.material)
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const depth = useStore((s) => s.depth)
  
  const matProps = MATERIAL_PROPERTIES[material]
  const groupRef = useRef<THREE.Group>(null)

  // Scale factors: width/height in cm, depth in mm
  const scaleX = width / 120
  const scaleY = height / 40
  const extrudeDepth = depth / 100

  const materialNode = useMemo(() => {
    const props: any = {
      color: matProps.color,
      metalness: matProps.metalness,
      roughness: matProps.roughness,
    }

    if (material === 'ceramica') {
      return (
        <meshPhysicalMaterial
          {...props}
          clearcoat={matProps.clearcoat || 0}
          clearcoatRoughness={0.1}
        />
      )
    }
    return <meshStandardMaterial {...props} />
  }, [material, matProps])

  const displayText = text || 'BAWERK'

  // Show SVG if available, otherwise show text
  if (svgData) {
    return <SvgSign />
  }

  return (
    <Center>
      <group ref={groupRef} scale={[scaleX, scaleY, 1]}>
        <Text3D
          font={FONT_URL}
          size={0.5}
          height={extrudeDepth}
          bevelEnabled
          bevelThickness={0.01}
          bevelSize={0.005}
          bevelOffset={0}
          bevelSegments={3}
          curveSegments={12}
          castShadow
        >
          {displayText}
          {materialNode}
        </Text3D>
      </group>
    </Center>
  )
}

function Lighting() {
  const dayNight = useStore((s) => s.dayNight)
  const normalizedDayNight = dayNight / 100
  const ambientIntensity = 0.15 + normalizedDayNight * 0.4
  const directionalIntensity = 0.3 + normalizedDayNight * 1.5
  
  const warmColor = useMemo(() => {
    return new THREE.Color().lerpColors(
      new THREE.Color('#1a1a3e'),
      new THREE.Color('#ffe8c0'),
      normalizedDayNight
    )
  }, [normalizedDayNight])

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={warmColor} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={directionalIntensity}
        color={warmColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 2, 4]} intensity={0.3 * normalizedDayNight} color="#7EA5BF" />
      <pointLight position={[3, -1, 3]} intensity={0.2} color="#4a6fa5" />
    </>
  )
}

function CameraController() {
  const controlsRef = useRef<any>(null)
  const cameraView = useStore((s) => s.cameraView)

  React.useEffect(() => {
    if (!controlsRef.current) return
    const controls = controlsRef.current

    switch (cameraView) {
      case 'front':
        controls.object.position.set(0, 0, 5)
        controls.target.set(0, 0, 0)
        break
      case 'lateral':
        controls.object.position.set(5, 0, 0)
        controls.target.set(0, 0, 0)
        break
      case 'top':
        controls.object.position.set(0, 5, 0.1)
        controls.target.set(0, 0, 0)
        break
      default:
        controls.object.position.set(3, 2, 5)
        controls.target.set(0, 0, 0)
        break
    }
    controls.update()
  }, [cameraView])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={15}
    />
  )
}

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

function FloorGrid() {
  return (
    <group position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[20, 40, '#293656', '#0d1b2a']} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

function Scene3DContent() {
  const environment = useStore((s) => s.environment)
  const dayNight = useStore((s) => s.dayNight)
  const envPreset = dayNight > 50 ? 'city' : 'night'

  return (
    <>
      <color attach="background" args={['#020a1e']} />
      <fog attach="fog" args={['#020a1e', 8, 20]} />

      <Lighting />
      <CameraController />
      <Wall />
      <BackPanel />

      <Suspense fallback={null}>
        <SceneCapture />
        <Sign3D />
      </Suspense>

      <WallMountIndicator />
      <FloorGrid />
      
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />

      <Environment preset={envPreset} background={false} />
    </>
  )
}

export function CanvasWrapper() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [3, 2, 5], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Scene3DContent />
      </Canvas>
    </div>
  )
}

export { CanvasWrapper }
export default CanvasWrapper
