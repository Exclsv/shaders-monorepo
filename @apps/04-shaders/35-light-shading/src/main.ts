import * as THREE from 'three'
import { setupScene } from './setup-scene'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const gui = new GUI()

// Canvas Setup
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

// Loaders
const gltfLoader = new GLTFLoader()

// * Materials
const materialParameters = {
  color: '#ffffff',
}
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
  },
})

gui.addColor(materialParameters, 'color').onChange(() => {
  material.uniforms.uColor.value.set(materialParameters.color)
})

// * Objects
// Torus knot
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
  material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material)
sphere.position.x = -3
scene.add(sphere)

// Suzanne
let suzanne: THREE.Group | null = null
gltfLoader.load('./suzanne.glb', glb => {
  suzanne = glb.scene
  suzanne.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.material = material
    }
  })
  scene.add(suzanne)
})

// Light helpers
const directionalLightHelper = new THREE.Mesh(
  new THREE.PlaneGeometry(),
  new THREE.MeshBasicMaterial()
)
directionalLightHelper.material.color.setRGB(0.1, 0.1, 1)
directionalLightHelper.material.side = THREE.DoubleSide
directionalLightHelper.position.set(0, 0, 3)
scene.add(directionalLightHelper)

// Point light helper
const pointLightHelper = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
)
pointLightHelper.material.color.setRGB(1, 0.1, 0.1)
pointLightHelper.position.set(0, 2.5, 0)
scene.add(pointLightHelper)

const pointLightHelper2 = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
)
pointLightHelper2.material.color.setRGB(0.1, 1.0, 0.5)
pointLightHelper2.position.set(2, 2, 2)
scene.add(pointLightHelper2)

// Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // Rotate objects
  if (suzanne) {
    suzanne.rotation.x = -elapsedTime * 0.1
    suzanne.rotation.y = elapsedTime * 0.2
  }

  sphere.rotation.x = -elapsedTime * 0.1
  sphere.rotation.y = elapsedTime * 0.2

  torusKnot.rotation.x = -elapsedTime * 0.1
  torusKnot.rotation.y = elapsedTime * 0.2

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
