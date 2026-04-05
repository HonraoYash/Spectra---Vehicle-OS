import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import { Mesh } from 'three'
import { MODEL_URL } from './vehicleBindings'

function isMesh(o: object): o is Mesh {
  return (o as Mesh).isMesh === true
}

export function VehicleModel() {
  const { scene } = useGLTF(MODEL_URL)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    scene.traverse((obj) => {
      if (!isMesh(obj)) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      const matNames = mats.map((m) => ('name' in m ? String(m.name) : '(unnamed)'))
      console.log('[VehicleModel] mesh:', obj.name, 'materials:', matNames)
    })
  }, [scene])

  return <primitive object={scene} />
}

useGLTF.preload(MODEL_URL)
