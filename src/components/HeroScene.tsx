import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Particles({ count }: { count: number }) {
  const pos = useRef(new Float32Array(Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 12)))
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" array={pos.current} count={count} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.5} />
    </points>
  )
}

function Composition({ calm, small }: { calm: boolean; small: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const core = useRef<THREE.Mesh>(null!), wire = useRef<THREE.Mesh>(null!), r1 = useRef<THREE.Mesh>(null!), r2 = useRef<THREE.Mesh>(null!)
  const { size } = useThree()
  const desk = size.width > 860
  useFrame((s, dt) => {
    if (!calm) { core.current.rotation.y += dt * 0.25; wire.current.rotation.y -= dt * 0.15; r1.current.rotation.z += dt * 0.3; r2.current.rotation.x += dt * 0.2 }
    const g = group.current
    g.rotation.x += (s.pointer.y * -0.6 - g.rotation.x) * 0.05
    g.rotation.y += (s.pointer.x * 0.8 - g.rotation.y) * 0.03
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, desk ? 1 : 0.7, 3, dt)) // scale-in on load
  })
  return (
    <group ref={group} position={[desk ? 2.4 : 0, desk ? 0 : -1.6, 0]} scale={0.01}>
      <mesh ref={core}><icosahedronGeometry args={[1.2, 1]} /><meshStandardMaterial color="#1b1b22" metalness={0.95} roughness={0.2} /></mesh>
      <mesh ref={wire}><icosahedronGeometry args={[1.55, 1]} /><meshBasicMaterial color="#22D3EE" wireframe transparent opacity={0.25} /></mesh>
      <mesh ref={r1} rotation={[1.2, 0, 0]}><torusGeometry args={[2.2, 0.05, 12, 80]} /><meshStandardMaterial color="#8B5CF6" metalness={0.6} roughness={0.25} /></mesh>
      <mesh ref={r2} rotation={[0, 1.1, 0]}><torusGeometry args={[2.8, 0.03, 12, 80]} /><meshStandardMaterial color="#22D3EE" metalness={0.5} roughness={0.3} /></mesh>
      <Particles count={small ? 60 : 160} />
    </group>
  )
}

export default function HeroScene({ active, calm }: { active: boolean; calm: boolean }) {
  const small = window.innerWidth < 860
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, small ? 1.25 : 1.75]} camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: !small, alpha: true }}>
      <ambientLight intensity={0.3} />
      <pointLight color="#8B5CF6" intensity={60} position={[-4, 3, 4]} />
      <pointLight color="#22D3EE" intensity={60} position={[4, -3, 3]} />
      <Composition calm={calm} small={small} />
    </Canvas>
  )
}