import * as THREE from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import GUI from 'lil-gui'
import CustomShaderMaterial, {
  CSMProxy,
} from 'three-custom-shader-material/vanilla'
import { setupScene } from './setup-scene'
// Shaders
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

const gui = new GUI({ width: 320 })

// Loaders
const rgbeLoader = new RGBELoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Scene
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

/**
 * Environment map
 */
rgbeLoader.load('./urban_alley_01_1k.hdr', environmentMap => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = environmentMap
  scene.environment = environmentMap
})

// Debug
const debugObject = {
  colorA: '#ff0095',
  colorB: '#00ffe1',
}

/**
 * Wobble
 */
const uniforms = {
  uTime: new THREE.Uniform(0),

  // Base
  uPositionFrequency: new THREE.Uniform(0.5),
  uTimeFrequency: new THREE.Uniform(0.4),
  uStrength: new THREE.Uniform(0.3),

  // Warp
  uWarpPositionFrequency: new THREE.Uniform(0.38),
  uWarpTimeFrequency: new THREE.Uniform(0.12),
  uWarpStrength: new THREE.Uniform(1.7),

  // Colors
  uColorA: new THREE.Uniform(new THREE.Color(debugObject.colorA)),
  uColorB: new THREE.Uniform(new THREE.Color(debugObject.colorB)),
}
// Material
const material = new CustomShaderMaterial({
  // CSM
  baseMaterial: THREE.MeshPhysicalMaterial,
  vertexShader,
  fragmentShader,
  uniforms,

  // MeshPhysicalMaterial
  metalness: 0,
  roughness: 0.5,
  color: '#ffffff',
  transmission: 0,
  ior: 1.5,
  thickness: 1.5,
  transparent: true,
  wireframe: false,
}) as CSMProxy<typeof THREE.MeshPhysicalMaterial>

const depthMaterial = new CustomShaderMaterial({
  // CSM
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader,
  uniforms,

  /*
  The depthPacking is an algorithm used by Three.js to encode the depth in all 4 channels
  instead of a grayscale depth, which improves the precision.
*/
  depthPacking: THREE.RGBADepthPacking,
})

// Tweaks
gui
  .add(uniforms.uPositionFrequency, 'value', 0, 2, 0.001)
  .name('Position frequency')
gui.add(uniforms.uTimeFrequency, 'value', 0, 2, 0.001).name('Time frequency')
gui.add(uniforms.uStrength, 'value', 0, 2, 0.001).name('Strength')

gui.add(uniforms.uWarpPositionFrequency, 'value', 0, 2, 0.001).name('Warp position frequency')
gui.add(uniforms.uWarpTimeFrequency, 'value', 0, 2, 0.001).name('Warp time frequency')
gui.add(uniforms.uWarpStrength, 'value', 0, 2, 0.001).name('Warp strength')

gui.addColor(debugObject, 'colorA').onChange(() => {
  uniforms.uColorA.value.set(debugObject.colorA)
}).name('Color A')
gui.addColor(debugObject, 'colorB').onChange(() => {
  uniforms.uColorB.value.set(debugObject.colorB)
}).name('Color B')

gui.add(material, 'metalness', 0, 1, 0.001).name('Metalness')
gui.add(material, 'roughness', 0, 1, 0.001).name('Roughness')
gui.add(material, 'transmission', 0, 1, 0.001).name('Transmission')
gui.add(material, 'ior', 0, 10, 0.001).name('IOR')
gui.add(material, 'thickness', 0, 10, 0.001).name('Thickness')

// Model
gltfLoader.load('suzanne.glb', suzanne => {
  suzanne.scene.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.material = material
      child.customDepthMaterial = depthMaterial
      child.receiveShadow = true
      child.castShadow = true
    }
  })

  scene.add(suzanne.scene)
})

// Geometry
let geometry: THREE.BufferGeometry = new THREE.IcosahedronGeometry(2.5, 100)
geometry = mergeVertices(geometry)
geometry.computeTangents()
console.log(geometry.attributes)

// Mesh
const wobble = new THREE.Mesh(geometry, material)
// Fix the shadow by using a custom depth material
wobble.customDepthMaterial = depthMaterial
wobble.receiveShadow = true
wobble.castShadow = true
// ! Uncomment to see the geometry
wobble.visible = false
scene.add(wobble)

/**
 * Plane
 */
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15, 15),
  new THREE.MeshStandardMaterial()
)
plane.receiveShadow = true
plane.rotation.y = Math.PI
plane.position.y -= 5
plane.position.z = 5
scene.add(plane)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, -2.25)
scene.add(directionalLight)

// * Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
