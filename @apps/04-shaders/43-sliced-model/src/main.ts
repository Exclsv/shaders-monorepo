import * as THREE from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import GUI from 'lil-gui'
import { setupScene } from './setup-scene'
// Shaders
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'

const gui = new GUI({ width: 320 })
const debugObject = {}

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
rgbeLoader.load('./aerodynamics_workshop.hdr', environmentMap => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping // Applied for hdr maps

  scene.background = environmentMap
  scene.backgroundBlurriness = 0.5
  scene.environment = environmentMap
  scene.environmentIntensity = 0.5
})

/**
 * Sliced model
 */
// Model
let model: THREE.Group | null = null
gltfLoader.load('gears.glb', gear => {
  model = gear.scene
  model.traverse(child => {
    if (child instanceof THREE.Mesh) {
      if (child.name === 'outerHull') {
        child.material = slicedMaterial
        child.customDepthMaterial = depthSlicedMaterial
      } else {
        child.material = material
      }
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(model)
})

// Patch Map
const patchMap = {
  // Can be named anything
  csm_Slice: {
    '#include <colorspace_fragment>': `
      #include <colorspace_fragment>

      if (!gl_FrontFacing) {
        gl_FragColor = vec4(0.75, 0.15, 0.3, 1.0);
      }
    `,
  },
}

// Material
const uniforms = {
  // & NOTE: Values in radians
  uSliceStart: { value: 1.75 },
  // Arc size that will be sliced(Bigger arc = bigger slice)
  uSliceArc: { value: 1.25 },
}
const material = new THREE.MeshStandardMaterial({
  metalness: 0.7,
  roughness: 0.25,
  color: '#cba32b',
})

const slicedMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,
  vertexShader,
  fragmentShader,
  patchMap,

  metalness: 0.5,
  roughness: 0.25,
  color: '#858080',
  uniforms,

  side: THREE.DoubleSide,
})
const depthSlicedMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader,
  fragmentShader,
  patchMap,

  depthPacking: THREE.RGBADepthPacking,
  uniforms,
})

// Material tweaks
gui
  .add(uniforms.uSliceStart, 'value', -Math.PI, Math.PI, 0.001)
  .name('Slice start')
gui.add(uniforms.uSliceArc, 'value', 0, Math.PI * 2, 0.001).name('Slice arc')

/**
 * Plane
 */
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: '#aaaaaa' })
)
plane.receiveShadow = true
plane.position.x = -4
plane.position.y = -3
plane.position.z = -4
plane.lookAt(new THREE.Vector3(0, 0, 0))
scene.add(plane)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.normalBias = 0.05 // Reduce shadow acne
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

// * Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // Update model
  if (model) {
    model.rotation.y = elapsedTime * 0.1
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
