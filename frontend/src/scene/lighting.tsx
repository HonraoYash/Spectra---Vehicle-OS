import { Environment } from '@react-three/drei'

/**
 * Key / fill / rim-style setup with HDR-style fill from drei's Environment preset,
 * plus ACES-friendly scene background (Canvas sets tone mapping).
 */
export function StageLighting() {
  return (
    <>
      <color attach="background" args={['#060a14']} />
      <fog attach="fog" args={['#060a14', 14, 52]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#b8d8ff', '#0a0a18', 0.55]} position={[0, 1, 0]} />
      <directionalLight position={[6.5, 10, 7]} intensity={1.2} color="#fff8f0" />
      <directionalLight position={[-5.5, 4, -5]} intensity={0.42} color="#88b8ff" />
      <pointLight position={[0, 3.5, 6]} intensity={0.55} color="#00c8ff" distance={24} decay={2} />
      <Environment preset="city" environmentIntensity={0.9} />
    </>
  )
}
