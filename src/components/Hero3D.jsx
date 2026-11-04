import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, Lightformer, Line, Stars } from '@react-three/drei'

/* ------------------------------------------------------------------ *
 *  HANDSHAKE hero scene
 *  - two interlocking rings = the handshake
 *  - a golden-spiral sphere of glowing nodes = the community
 *  - lit edges = people who actually showed up for each other
 *  - camera drifts with the pointer (mouse parallax)
 * ------------------------------------------------------------------ */

const pointer = { x: 0, y: 0 }

function makeNodes(count) {
  const pts = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const th = golden * i
    pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(2.75))
  }
  return pts
}

function Rig() {
  const camera = useThree((s) => s.camera)
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 1.15, 2.4, d)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.75, 2.4, d)
    camera.lookAt(0, 0, 0)
  })
  return null
}

function Network({ offsetX }) {
  const group = useRef(null)
  const nodes = useMemo(() => makeNodes(34), [])
  const edges = useMemo(() => {
    const map = new Map()
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .forEach((o) => {
          const key = i < o.j ? `${i}:${o.j}` : `${o.j}:${i}`
          map.set(key, [i, o.j])
        })
    })
    return [...map.values()]
  }, [nodes])

  const pulses = useRef([])

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.1)
    if (group.current) {
      group.current.rotation.y += dt * 0.075
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, offsetX, 3, d)
    }
    const t = state.clock.elapsedTime
    pulses.current.forEach((m, i) => {
      if (m) {
        const s = 1 + Math.sin(t * 1.7 + i * 0.9) * 0.3
        m.scale.setScalar(s)
      }
    })
  })

  return (
    <group ref={group} position={[offsetX, 0, 0]}>
      {edges.map(([a, b], i) => (
        <Line
          key={`e${i}`}
          points={[nodes[a], nodes[b]]}
          color={i % 4 === 0 ? '#fbbf24' : '#2dd4bf'}
          lineWidth={1}
          transparent
          opacity={0.22}
        />
      ))}
      {nodes.map((p, i) => (
        <mesh
          key={`n${i}`}
          position={p}
          ref={(el) => {
            pulses.current[i] = el
          }}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial
            color={i % 5 === 0 ? '#fbbf24' : i % 3 === 0 ? '#7dd3fc' : '#5eead4'}
            toneMapped={false}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
      {/* outer shell = the community boundary */}
      <mesh>
        <icosahedronGeometry args={[3.35, 1]} />
        <meshBasicMaterial color="#2dd4bf" wireframe transparent opacity={0.055} />
      </mesh>
    </group>
  )
}

function HandshakeRings({ offsetX }) {
  const assembly = useRef(null)

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.1)
    const t = state.clock.elapsedTime
    if (assembly.current) {
      assembly.current.position.x = THREE.MathUtils.damp(assembly.current.position.x, offsetX, 3, d)
      assembly.current.rotation.y = t * 0.22
      assembly.current.rotation.x = Math.sin(t * 0.35) * 0.22
      assembly.current.rotation.z = Math.sin(t * 0.24) * 0.1
      assembly.current.position.y = Math.sin(t * 0.7) * 0.09
    }
  })

  return (
    <group ref={assembly} position={[offsetX, 0, 0]}>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.4}>
        {/* link A — lies flat (XZ) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.52, 0, 0]} castShadow>
          <torusGeometry args={[0.88, 0.135, 40, 140]} />
          <meshStandardMaterial
            color="#2dd4bf"
            metalness={0.82}
            roughness={0.16}
            emissive="#0f766e"
            emissiveIntensity={0.55}
          />
        </mesh>
        {/* link B — upright (XY), interlocked through link A */}
        <mesh position={[0.52, 0, 0]} castShadow>
          <torusGeometry args={[0.88, 0.135, 40, 140]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.82}
            roughness={0.16}
            emissive="#92400e"
            emissiveIntensity={0.55}
          />
        </mesh>
        {/* the clasped core */}
        <mesh>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color="#eafffb" toneMapped={false} />
        </mesh>
        <pointLight color="#5eead4" intensity={26} distance={9} />
      </Float>
    </group>
  )
}

function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 256
    const g = c.getContext('2d')
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.22, 'rgba(255,255,255,0.42)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])
}

function Glow({ offsetX }) {
  const tex = useGlowTexture()
  return (
    <group position={[offsetX, 0, -2.2]}>
      <sprite scale={[9, 9, 1]}>
        <spriteMaterial
          map={tex}
          color="#14b8a6"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite position={[1.1, 0.6, 0]} scale={[4.5, 4.5, 1]}>
        <spriteMaterial
          map={tex}
          color="#f59e0b"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  )
}

function Scene() {
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  // two-column layout → push the handshake into the right column, out of the headline
  const offsetX = size.width >= 1024 ? viewport.width * 0.2 : 0

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 6]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-6, -3, 4]} intensity={60} distance={26} color="#2dd4bf" />
      <pointLight position={[6, 4, -5]} intensity={45} distance={26} color="#fbbf24" />

      <Glow offsetX={offsetX} />
      <HandshakeRings offsetX={offsetX} />
      <Network offsetX={offsetX} />

      <Stars radius={70} depth={45} count={1400} factor={2.4} saturation={0.4} fade speed={0.7} />

      <Environment resolution={128}>
        <Lightformer intensity={5} color="#a5f3fc" position={[-4, 3, -5]} scale={[8, 8, 1]} />
        <Lightformer intensity={4} color="#fde68a" position={[5, -2, 4]} scale={[8, 8, 1]} />
        <Lightformer intensity={3} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
      </Environment>

      <Rig />
    </>
  )
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(560px circle at 62% 45%, rgba(45,212,191,.34), transparent 62%),' +
              'radial-gradient(460px circle at 74% 62%, rgba(251,191,36,.22), transparent 60%)',
          }}
        />
      )
    }
    return this.props.children
  }
}

export default function Hero3D() {
  const wrap = useRef(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // pause the render loop while the hero is off-screen (keeps laptops cool on stage)
  useEffect(() => {
    const el = wrap.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => setVisible(entries[0]?.isIntersecting ?? true), {
      threshold: 0.01,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <SceneBoundary>
        <Canvas
          frameloop={visible ? 'always' : 'never'}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 7.4], fov: 42 }}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </SceneBoundary>
      {/* keeps headline copy legible over the scene on small screens */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,7,14,.9), rgba(5,7,14,.78) 42%, rgba(5,7,14,.95))',
        }}
      />
      <div
        className="absolute inset-y-0 left-0 hidden lg:block"
        style={{
          width: '58%',
          background: 'linear-gradient(90deg, rgba(5,7,14,.94) 34%, rgba(5,7,14,.72) 62%, rgba(5,7,14,0) 100%)',
        }}
      />
      {/* melts the canvas into the page background — no hard scene edge */}
      <div
        className="absolute inset-x-0 bottom-0 h-44"
        style={{ background: 'linear-gradient(180deg, rgba(5,7,14,0), rgba(5,7,14,.8) 62%, #05070e 100%)' }}
      />
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{ background: 'linear-gradient(180deg, #05070e, rgba(5,7,14,.75) 45%, rgba(5,7,14,0))' }}
      />
    </div>
  )
}
