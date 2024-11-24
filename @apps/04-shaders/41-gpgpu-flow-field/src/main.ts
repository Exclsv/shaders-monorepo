import * as THREE from 'three'
import { setupScene } from './setup-scene'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import {
  GPUComputationRenderer,
  Variable,
} from 'three/addons/misc/GPUComputationRenderer.js'
import GUI from 'lil-gui'
// Shaders
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'
import gpgpuParticlesShader from './shaders/gpgpu/particles.frag'

const gui = new GUI({ width: 320 })
const debugObject = {
  clearColor: '#29191f',
}

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Scene
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })
renderer.setClearColor(debugObject.clearColor)
const pixelRatio = renderer.getPixelRatio()

/*
 *Load model
 */
const gltf = await gltfLoader.loadAsync('./model.glb')

/*
 * Geometry
 */
interface BaseGeometry {
  // instance: InstanceType<typeof THREE.BufferGeometry>
  instance: THREE.BufferGeometry
  count: number // number of vertices
}
const baseGeometry = {} as BaseGeometry
// baseGeometry.instance = new THREE.SphereGeometry(3)
if (gltf.scene.children[0] instanceof THREE.Mesh) {
  baseGeometry.instance = gltf.scene.children[0].geometry
}
baseGeometry.count = baseGeometry.instance.attributes.position.count

/*
 *GPGPU
 */
interface GPGPU {
  size: number
  computation: GPUComputationRenderer
  particlesVariable: Variable
  debug: THREE.Mesh
}

// ^ Setup
const gpgpu = {} as GPGPU
gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count))
gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer)

// ^ Base particles
const baseParticlesTexture = gpgpu.computation.createTexture()

for (let i = 0; i < baseGeometry.count; i++) {
  const i3 = i * 3
  const i4 = i * 4

  /*
  - Fill texture with geometry data. Initially all 0s
  - Using position as color
*/
  baseParticlesTexture.image.data[i4] =
    baseGeometry.instance.attributes.position.array[i3] // R
  baseParticlesTexture.image.data[i4 + 1] =
    baseGeometry.instance.attributes.position.array[i3 + 1] // G
  baseParticlesTexture.image.data[i4 + 2] =
    baseGeometry.instance.attributes.position.array[i3 + 2] // B
  baseParticlesTexture.image.data[i4 + 3] = Math.random() // Alpha
}

// ^ Particles variable
/*
  ! We need the data to persist between frames
  We are going to use output texture and send it again as 'uParticles' and reapply the shader
  GPUComputationRenderer automatically handles the loop between frames - using 2 FBOs
  ? NOTE: FBOs are Frame Buffer Objects and they are can't be read and written to at the same time

  baseParticlesTexture will be injected into the gpgpuParticlesShader as uParticles (sampler2D)
*/
gpgpu.particlesVariable = gpgpu.computation.addVariable(
  'uParticles', // name
  gpgpuParticlesShader, // shader
  baseParticlesTexture // initial texture value
)

// Set dependencies
gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
  gpgpu.particlesVariable,
])

// ^ Uniform
gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0)
gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0)
gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
  baseParticlesTexture
)
gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence =
  new THREE.Uniform(0.5)
gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength =
  new THREE.Uniform(2)
gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency =
  new THREE.Uniform(0.5)

// Initialize
gpgpu.computation.init()
gpgpu.computation.compute()

// ^ Debug
gpgpu.debug = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial(
    // ^ WEBGLRenderTarget is a wrapper around a FBO texture
    {
      map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
        .texture,
    }
  )
)
gpgpu.debug.position.x = 3
gpgpu.debug.visible = false
// scene.add(gpgpu.debug) // Can be not added to the scene (Still works)

/*
 * Particles
 */
interface Particles {
  material: THREE.ShaderMaterial
  // points: InstanceType<typeof THREE.Points>
  points: THREE.Points
  geometry: THREE.BufferGeometry
}
const particles = {} as Particles

// ^ Geometry
const particlesUvArray = new Float32Array(baseGeometry.count * 2)
const sizesArray = new Float32Array(baseGeometry.count)

for (let y = 0; y < gpgpu.size; y++) {
  for (let x = 0; x < gpgpu.size; x++) {
    const i = y * gpgpu.size + x
    const i2 = i * 2

    // ^ Particles UV (From 0 to 1). +0.5 to center the UVs
    const uvX = (x + 0.5) / gpgpu.size
    const uvY = (y + 0.5) / gpgpu.size

    particlesUvArray[i2] = uvX
    particlesUvArray[i2 + 1] = uvY

    // ^ Random size
    sizesArray[i] = Math.random()
  }
}

particles.geometry = new THREE.BufferGeometry()
particles.geometry.setDrawRange(0, baseGeometry.count)
particles.geometry.setAttribute(
  'aParticlesUv',
  new THREE.Float32BufferAttribute(particlesUvArray, 2)
)
particles.geometry.setAttribute(
  'aSize',
  new THREE.Float32BufferAttribute(sizesArray, 1)
)
particles.geometry.setAttribute(
  'aColor',
  baseGeometry.instance.attributes.color
)

// ^ Material
particles.material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uSize: new THREE.Uniform(0.07),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio
      )
    ),
    uParticlesTexture: new THREE.Uniform(
      gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
    ),
  },
})

// ^ Points
// particles.points = new THREE.Points(baseGeometry.instance, particles.material)
particles.points = new THREE.Points(particles.geometry, particles.material)
scene.add(particles.points)

// Tweaks
gui.addColor(debugObject, 'clearColor').onChange(() => {
  renderer.setClearColor(debugObject.clearColor)
})
gui
  .add(particles.material.uniforms.uSize, 'value')
  .min(0)
  .max(0.3)
  .step(0.001)
  .name('uSize')

// Uniform Tweaks
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uFlowFieldInfluence')
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value')
  .min(0)
  .max(10)
  .step(0.01)
  .name('uFlowFieldStrength')
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uFlowFieldFrequency')

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  // Update particles material resolution
  particles.material?.uniforms.uResolution.value.set(
    window.innerWidth * pixelRatio,
    window.innerHeight * pixelRatio
  )

  renderer.setSize(window.innerWidth, window.innerHeight)
})

// * Animation
const clock = new THREE.Clock()
let previousTime = 0
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Update GPGPU
  gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime
  gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime
  gpgpu.computation.compute()

  // Update particles geometry - Get the latest texture after swap
  particles.material.uniforms.uParticlesTexture.value =
    gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
