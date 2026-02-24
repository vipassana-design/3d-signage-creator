'use client'

import React, { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Text3D, Center, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { useStore, MATERIAL_PROPERTIES } from '@/lib/store'

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'

// Scene reference for GLB export
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

function Wall() {
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const wallW = Math.max((width / 100) * 3, 6)
  const wallH = Math.max((height / 100) * 3, 4)

  return (
    <mesh position={[0, 0, -0.15]} receiveShadow>
      <planeGeometry args={[wallW, wallH]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.95} metalness={0} />
    </mesh>
  )
}

function Sign3D() {
  const text = useStore((s) => s.text)
  const material = useStore((s) => s.material)
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const depth = useStore((s) => s.depth)
  const svgData = useStore((s) => s.svgData)
  
  const matProps = MATERIAL_PROPERTIES[material]
  const groupRef = useRef<THREE.Group>(null)

  // Scale factors: width/height in cm, depth in mm
  const scaleX = width / 120   // normalize to default 120cm
  const scaleY = height / 45   // normalize to default 45cm
  const extrudeDepth = depth / 100 // mm to scene units (25mm -> 0.25)

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

  // SVG shapes
  const svgShapes = useMemo(() => {
    if (!svgData) return null
    const loader = new SVGLoader()
    const svgDoc = loader.parse(svgData)
    const allShapes: THREE.Shape[] = []

    svgDoc.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path)
      allShapes.push(...shapes)
    })

    return allShapes
  }, [svgData])

  if (svgData && svgShapes) {
    return (
      <Center>
        <group ref={groupRef} scale={[scaleX * 0.01, -scaleY * 0.01, 1]}>
          {svgShapes.map((shape, i) => (
            <mesh key={i} castShadow>
              <extrudeGeometry
                args={[
                  shape,
                  {
                    depth: extrudeDepth,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0.005,
                    bevelSegments: 3,
                  },
                ]}
              />
              {materialNode}
            </mesh>
          ))}
        </group>
      </Center>
    )
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
  const normalized = dayNight / 100
  const ambientIntensity = 0.15 + normalized * 0.4
  const directionalIntensity = 0.3 + normalized * 1.5
  const warmColor = useMemo(() => {
    return new THREE.Color().lerpColors(
      new THREE.Color('#1a1a3e'),
      new THREE.Color('#ffe8c0'),
      normalized
    )
  }, [normalized])

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
      <pointLight position={[-3, 2, 4]} intensity={0.3 * normalized} color="#7EA5BF" />
      <pointLight position={[3, -1, 3]} intensity={0.2} color="#4a6fa5" />
    </>
  )
}

function CameraController() {
  const controlsRef = useRef<any>(null)
  const cameraView = useStore((s) => s.cameraView)

  useEffect(() => {
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

export function ThreeScene() {
  const environment = useStore((s) => s.environment)

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [3, 2, 5], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={['#020a1e']} />
        <fog attach="fog" args={['#020a1e', 8, 20]} />

        <SceneCapture />
        <Lighting />
        <CameraController />
        <Wall />

        <Suspense fallback={null}>
          <Sign3D />
        </Suspense>

        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={4}
        />

        <Environment preset={environment === 'interior' ? 'apartment' : 'city'} />
      </Canvas>
    </div>
  )
}
