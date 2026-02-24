'use client'

import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Text3D,
  Center,
  Environment,
  OrbitControls,
  ContactShadows,
} from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { useStore, MATERIAL_PROPERTIES, type MaterialType, type CameraView } from '@/lib/store'

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'

// Scene ref for GLB export
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

// Camera controller for preset views
function CameraController() {
  const { camera } = useThree()
  const cameraView = useStore((s) => s.cameraView)

  useEffect(() => {
    const positions: Record<CameraView, [number, number, number]> = {
      perspective: [0, 0.3, 3],
      lateral: [3, 0, 0],
      frente: [0, 0, 3],
      superior: [0, 3, 0],
    }
    const pos = positions[cameraView]
    camera.position.set(pos[0], pos[1], pos[2])
    camera.lookAt(0, 0, 0)
  }, [cameraView, camera])

  return null
}

// SVG Component
function SVGComponent({ svgContent }: { svgContent: string | null }) {
  const meshes = useMemo(() => {
    if (!svgContent) return []
    const loader = new SVGLoader()
    const svgData = loader.parse(svgContent)
    const group: JSX.Element[] = []

    svgData.paths.forEach((path, i) => {
      const shapes = SVGLoader.createShapes(path)
      shapes.forEach((shape, j) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 0.02,
          bevelEnabled: false,
        })
        geometry.center()
        group.push(
          <mesh key={`${i}-${j}`} geometry={geometry} scale={0.002}>
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
          </mesh>
        )
      })
    })

    return group
  }, [svgContent])

  if (meshes.length === 0) return null

  return <group position={[0, 0, 0.06]}>{meshes}</group>
}

// Main sign with text and materials
function Sign3D() {
  const meshRef = useRef<THREE.Mesh>(null)
  const text = useStore((s) => s.text)
  const material = useStore((s) => s.material)
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const svgContent = useStore((s) => s.svgContent)
  const depth3D = useStore((s) => s.depth3D)

  const extrudeDepth = depth3D / 100

  const materialProps = MATERIAL_PROPERTIES[material]

  const displayText = text.trim() || 'BAWERK'

  return (
    <group>
      {/* Wall backdrop */}
      <mesh position={[0, 0, -0.3]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[width / 100 + 0.1, height / 100 + 0.1, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 3D Text */}
      <Center>
        <Text3D
          ref={meshRef}
          font={FONT_URL}
          size={0.35}
          height={extrudeDepth}
          bevelEnabled
          bevelThickness={0.008}
          bevelSize={0.005}
          bevelSegments={3}
          curveSegments={16}
          letterSpacing={0.05}
          castShadow
          receiveShadow
        >
          {displayText}
          {material === 'ceramica' ? (
            <meshPhysicalMaterial
              color={materialProps.color}
              metalness={materialProps.metalness}
              roughness={materialProps.roughness}
              clearcoat={materialProps.clearcoat || 0}
              clearcoatRoughness={0.1}
            />
          ) : (
            <meshStandardMaterial
              color={materialProps.color}
              metalness={materialProps.metalness}
              roughness={materialProps.roughness}
            />
          )}
        </Text3D>
      </Center>

      {/* SVG overlay */}
      {svgContent && <SVGComponent svgContent={svgContent} />}
    </group>
  )
}

// Lighting
function Lights() {
  const dayNight = useStore((s) => s.dayNight)
  const intensity = dayNight / 100

  return (
    <>
      <ambientLight intensity={0.3 + intensity * 0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5 + intensity * 1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, 5]} intensity={0.3 + intensity * 0.3} />
    </>
  )
}

// Main scene component
export function ThreeScene() {
  const environment = useStore((s) => s.environment)

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
          <CameraController />
          <Lights />
          <Sign3D />
          <Environment preset={environment === 'interior' ? 'city' : 'night'} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={10}
          />
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
