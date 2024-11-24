import * as THREE from 'three'
import { setupScene } from './setup-scene'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'

const gui = new GUI()

// Loaders
const gltfLoader = new GLTFLoader()

// Scene
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

// Renderer
const rendererParameters = {
  clearColor: '#26132f',
}
renderer.setClearColor(rendererParameters.clearColor)
gui.addColor(rendererParameters, 'clearColor').onChange(() => {
  renderer.setClearColor(rendererParameters.clearColor)
})

/**
 * Material
 */
const materialParameters = {
  color: '#ff794d',
  shadowColor: '#8e19b8',
  lightColor: '#e5ffe0',
}

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        window.innerWidth * renderer.getPixelRatio(),
        window.innerHeight * renderer.getPixelRatio()
      )
    ),
    uShadowRepetition: new THREE.Uniform(100),
    uShadowColor: new THREE.Uniform(
      new THREE.Color(materialParameters.shadowColor)
    ),
    uShadowLow: new THREE.Uniform(-0.8),
    uShadowHigh: new THREE.Uniform(1.5),

    uLightRepetition: new THREE.Uniform(130),
    uLightColor: new THREE.Uniform(
      new THREE.Color(materialParameters.lightColor)
    ),
    uLightLow: new THREE.Uniform(0.5),
    uLightHigh: new THREE.Uniform(1.5),
  },
})

// * GUI
gui.addColor(materialParameters, 'color').onChange(() => {
  material.uniforms.uColor.value.set(materialParameters.color)
})

const shadowGUI = gui.addFolder('Shadow')
shadowGUI.add(material.uniforms.uShadowRepetition, 'value').min(1).max(300).step(1)
shadowGUI.addColor(materialParameters, 'shadowColor').onChange(() => {
  material.uniforms.uShadowColor.value.set(materialParameters.shadowColor)
})
shadowGUI.add(material.uniforms.uShadowLow, 'value').min(-2).max(2).step(0.1)
shadowGUI.add(material.uniforms.uShadowHigh, 'value').min(-2).max(2).step(0.1)

const lightGUI = gui.addFolder('Light')
lightGUI.add(material.uniforms.uLightRepetition, 'value').min(1).max(300).step(1)
lightGUI.addColor(materialParameters, 'lightColor').onChange(() => {
  material.uniforms.uLightColor.value.set(materialParameters.lightColor)
})
lightGUI.add(material.uniforms.uLightLow, 'value').min(-2).max(2).step(0.1)
lightGUI.add(material.uniforms.uLightHigh, 'value').min(-2).max(2).step(0.1)

/**
 * Objects
 */
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
gltfLoader.load('./suzanne.glb', gltf => {
  suzanne = gltf.scene
  suzanne.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.material = material
    }
  })
  scene.add(suzanne)
})

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
