import * as THREE from 'three'

export const updateAllMaterials = (scene: THREE.Scene) => {
  scene.traverse(child => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 1
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}