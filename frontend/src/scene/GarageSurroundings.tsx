import { useMemo } from 'react'
import { Box3, Euler, Vector3 } from 'three'

export type GarageSurroundingsProps = {
  box: Box3
}

const ROT_FLAT = new Euler(-Math.PI / 2, 0, 0)

export function GarageSurroundings({ box }: GarageSurroundingsProps) {
  const L = useMemo(() => {
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const min = box.min

    const floorY = min.y - 1.8
    const roomH = 14
    const ceilingY = floorY + roomH

    const platTop = min.y - 0.07
    const platCy = platTop - 0.09
    const platRadius = Math.max(size.x, size.z) * 0.74

    const halfW = 20        // left/right — symmetric around center.x
    const halfD = 20        // front/back — symmetric around center.z
    const roomDepth = halfD * 2
    const midZ = center.z
    const backZ = center.z - halfD    // exactly halfD behind center
    const frontZ = center.z + halfD   // exactly halfD in front of center
    const wallThick = 0.3
    const sideX = halfW + wallThick * 0.5

    const gridCount = 9
    const gridHalfW = halfW * 1.6
    const gridDepth = roomDepth * 0.85

    return {
      cx: center.x, cy: center.y, cz: center.z,
      floorY, roomH, ceilingY,
      platRadius, platTop, platCy,
      halfW, roomDepth, midZ, backZ, frontZ,
      wallThick, sideX,
      gridCount, gridHalfW, gridDepth,
      size,
    }
  }, [box])

  const gridX = Array.from({ length: L.gridCount }, (_, i) => {
    const t = i / (L.gridCount - 1) - 0.5
    return L.cx + t * L.gridHalfW * 2
  })

  const gridZ = Array.from({ length: L.gridCount }, (_, i) => {
    const t = i / (L.gridCount - 1) - 0.5
    return L.midZ + t * L.gridDepth
  })

  const wallMat = { color: '#2a2d34', roughness: 0.82, metalness: 0.16 }

  return (
    <group>

      {/* ── FLOOR ── */}
      <mesh rotation={ROT_FLAT} position={[L.cx, L.floorY, L.midZ]} receiveShadow castShadow={false}>
        <planeGeometry args={[L.halfW * 2 + 8, L.roomDepth + 10]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.05} metalness={0.92} />
      </mesh>
      <mesh rotation={ROT_FLAT} position={[L.cx, L.floorY + 0.005, L.midZ]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[L.halfW * 1.8, L.roomDepth + 4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.02} metalness={0.96} transparent opacity={0.4} depthWrite={false} />
      </mesh>

      {/* ── FLOOR GRID ── */}
      {gridX.map((x, i) => (
        <mesh key={`gz-${i}`} position={[x, L.floorY + 0.008, L.midZ]} castShadow={false} receiveShadow={false}>
          <boxGeometry args={[0.012, 0.003, L.gridDepth]} />
          <meshStandardMaterial color="#0a1020" emissive="#003868" emissiveIntensity={0.6} toneMapped={false} transparent opacity={0.65} depthWrite={false} />
        </mesh>
      ))}
      {gridZ.map((z, i) => (
        <mesh key={`gx-${i}`} position={[L.cx, L.floorY + 0.008, z]} castShadow={false} receiveShadow={false}>
          <boxGeometry args={[L.gridHalfW * 2, 0.003, 0.012]} />
          <meshStandardMaterial color="#0a1020" emissive="#003868" emissiveIntensity={0.6} toneMapped={false} transparent opacity={0.65} depthWrite={false} />
        </mesh>
      ))}

      {/* ── PLATFORM ── */}
      <mesh position={[L.cx, L.platCy, L.cz]} receiveShadow castShadow={false}>
        <cylinderGeometry args={[L.platRadius, L.platRadius * 1.03, 0.18, 128]} />
        <meshStandardMaterial color="#0e1520" roughness={0.14} metalness={0.94} />
      </mesh>
      <mesh position={[L.cx, L.platTop - 0.004, L.cz]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[L.platRadius * 1.04, L.platRadius * 1.07, 0.008, 128]} />
        <meshStandardMaterial color="#0a1622" roughness={0.3} metalness={0.88} />
      </mesh>
      <mesh position={[L.cx, L.platTop + 0.009, L.cz]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[L.platRadius * 1.055, L.platRadius * 1.035, 0.016, 128]} />
        <meshStandardMaterial color="#001828" emissive="#00e0ff" emissiveIntensity={5.0} roughness={0.15} metalness={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[L.cx, L.platTop + 0.005, L.cz]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[L.platRadius * 1.02, L.platRadius * 1.005, 0.009, 128]} />
        <meshStandardMaterial color="#001020" emissive="#0099cc" emissiveIntensity={2.0} roughness={0.28} metalness={0.85} toneMapped={false} />
      </mesh>
      <mesh position={[L.cx, L.platTop + 0.003, L.cz]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[L.platRadius * 0.92, L.platRadius * 0.92, 0.004, 128]} />
        <meshStandardMaterial color="#000c18" emissive="#004466" emissiveIntensity={0.7} transparent opacity={0.75} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* ══════════════════════════════════════════
          BACK WALL + accent strips
      ══════════════════════════════════════════ */}
      <mesh position={[L.cx, L.floorY + L.roomH * 0.5, L.backZ]} receiveShadow castShadow={false}>
        <boxGeometry args={[L.halfW * 2 + 1.5, L.roomH, L.wallThick]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {[-L.halfW * 0.3, -L.halfW * 0.1, L.halfW * 0.1, L.halfW * 0.3].map((ox, i) => (
        <mesh key={`bstrip-${i}`} position={[L.cx + ox, L.floorY + L.roomH * 0.5, L.backZ + L.wallThick + 0.01]} castShadow={false} receiveShadow={false}>
          <boxGeometry args={[0.05, L.roomH * 0.76, 0.04]} />
          <meshStandardMaterial color="#010408" emissive="#004488" emissiveIntensity={0.1} toneMapped={false} />
        </mesh>
      ))}

      {/* ══════════════════════════════════════════
          FRONT WALL + accent strips
      ══════════════════════════════════════════ */}
      <mesh position={[L.cx, L.floorY + L.roomH * 0.5, L.frontZ]} receiveShadow castShadow={false}>
        <boxGeometry args={[L.halfW * 2 + 1.5, L.roomH, L.wallThick]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {[-L.halfW * 0.3, -L.halfW * 0.1, L.halfW * 0.1, L.halfW * 0.3].map((ox, i) => (
        <mesh key={`fstrip-${i}`} position={[L.cx + ox, L.floorY + L.roomH * 0.5, L.frontZ - L.wallThick - 0.01]} castShadow={false} receiveShadow={false}>
          <boxGeometry args={[0.05, L.roomH * 0.76, 0.04]} />
          <meshStandardMaterial color="#010408" emissive="#004488" emissiveIntensity={0.1} toneMapped={false} />
        </mesh>
      ))}

      {/* ══════════════════════════════════════════
          SIDE WALLS + accent strips (same as back wall)
      ══════════════════════════════════════════ */}
      {([-1, 1] as const).map((side) => {
        const stripOffsets = [-L.roomDepth * 0.3, -L.roomDepth * 0.1, L.roomDepth * 0.1, L.roomDepth * 0.3]
        const stripX = L.cx + side * (L.sideX - L.wallThick * 0.5 - 0.025)
        return (
          <group key={`sw-${side}`}>
            {/* Wall panel */}
            <mesh position={[L.cx + side * L.sideX, L.floorY + L.roomH * 0.5, L.midZ]} receiveShadow castShadow={false}>
              <boxGeometry args={[L.wallThick, L.roomH, L.roomDepth + 2]} />
              <meshStandardMaterial {...wallMat} />
            </mesh>

            {/* Vertical accent strips — same as back wall */}
            {stripOffsets.map((oz, i) => (
              <mesh key={`sstrip-${i}`} position={[stripX, L.floorY + L.roomH * 0.5, L.midZ + oz]} castShadow={false} receiveShadow={false}>
                <boxGeometry args={[0.04, L.roomH * 0.76, 0.05]} />
                <meshStandardMaterial color="#010408" emissive="#004488" emissiveIntensity={0.1} toneMapped={false} />
              </mesh>
            ))}

            {/* Base trim */}
            <mesh position={[stripX, L.floorY + 0.05, L.midZ]} castShadow={false} receiveShadow={false}>
              <boxGeometry args={[0.03, 0.08, L.roomDepth * 0.86]} />
              <meshStandardMaterial color="#000810" emissive="#006699" emissiveIntensity={0.28} toneMapped={false} />
            </mesh>
          </group>
        )
      })}

      {/* ── CEILING ── */}
      <mesh position={[L.cx, L.ceilingY, L.midZ]} receiveShadow castShadow={false}>
        <boxGeometry args={[L.halfW * 2 + 1.5, 0.25, L.roomDepth + 2]} />
        <meshStandardMaterial color="#1e2128" roughness={0.92} metalness={0.08} />
      </mesh>

      {/* Ceiling light bars */}
      {[L.midZ + L.roomDepth * 0.07, L.midZ - L.roomDepth * 0.09, L.midZ - L.roomDepth * 0.23].map((z, i) => (
        <group key={`cb-${i}`}>
          <mesh position={[L.cx, L.ceilingY - 0.11, z]} castShadow={false} receiveShadow={false}>
            <boxGeometry args={[L.halfW * 1.5, 0.04, 0.25]} />
            <meshStandardMaterial color="#0a1828" emissive="#50aaff" emissiveIntensity={i === 0 ? 1.2 : 0.7} roughness={0.4} metalness={0.55} toneMapped={false} />
          </mesh>
          <mesh position={[L.cx, L.ceilingY - 0.065, z]} castShadow={false} receiveShadow={false}>
            <boxGeometry args={[L.halfW * 1.55, 0.055, 0.35]} />
            <meshStandardMaterial color="#060a12" roughness={0.9} metalness={0.3} />
          </mesh>
        </group>
      ))}

    </group>
  )
}