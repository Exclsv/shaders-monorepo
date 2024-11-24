import * as THREE from 'three'
import { setupScene } from './setup-scene'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'

const gui = new GUI()

const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

// Loaders
const gltfLoader = new GLTFLoader()

// * Renderer
const rendererParameters = {
  clearColor: '#1d1f2a',
}
renderer.setClearColor(rendererParameters.clearColor)

// * GUI
gui.addColor(rendererParameters, 'clearColor').onChange(() => {
  renderer.setClearColor(rendererParameters.clearColor)
})

// * Material
const materialParameters = {
  color: '#70c1ff',
}

gui.addColor(materialParameters, 'color').onChange(() => {
  material.uniforms.uColor.value.set(materialParameters.color)
})

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
  },

  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
})

// * Objects
// ^ Torus knot
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
  material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// ^ Sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material)
sphere.position.x = -3
scene.add(sphere)

// ^ Suzanne
let suzanne: THREE.Group | null = null
gltfLoader.load('./suzanne.glb', gltf => {
  suzanne = gltf.scene
  suzanne.traverse(child => {
    if (child instanceof THREE.Mesh) child.material = material
  })
  scene.add(suzanne)
})

// * Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // Update uniforms
  material.uniforms.uTime.value = elapsedTime

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
